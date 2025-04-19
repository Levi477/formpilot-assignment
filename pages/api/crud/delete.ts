import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export default async function deleteHandler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = parseInt(req.query.id);


  try {
    // Priority 1: Use session if available (for logged-in users)
    const session = await getServerSession(req, res, authOptions);
    let user;

    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    } else {
      // Priority 2: Use API Key for external clients
      const apiKey = req.query.apiKey || req.headers['x-api-key'];
      if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

      user = await prisma.user.findFirst({
        where: { apiKey: apiKey as string },
      });

      if (!user) return res.status(403).json({ error: 'Invalid API key' });
    }

    //if (!user || user.credits <= 0) {
    //  return res.status(402).json({ error: 'Out of credits' });
    //}

    // Ensure the item belongs to the user before deletion
    const data = await prisma.data.findFirst({
      where: { id },
    });

    if (!data || data.userEmail !== user.email) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    // Delete the data
    await prisma.data.deleteMany({ where: { id, userEmail: user.email } });

    // Optionally decrement credits here if desired
    await prisma.user.update({
      where: { email: user.email },
      data: { credits: { decrement: 1 } },
    });

    log('DATA_DELETED', { user: user.email, id });
    res.status(200).json({ status: 'Deleted successfully' });

  } catch (err) {
    log('DB_ERROR_DELETE', err);
    res.status(500).json({ error: 'Database error' });
  }
}
