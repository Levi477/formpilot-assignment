import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export default async function updateHandler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { value } = req.body;
  console.log(value);
  const id = parseInt(req.query.id);
  try {
    let user;

    // Priority 1: Check session
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email) {
      user = await prisma.user.findFirst({ where: { email: session.user.email } });
    } else {
      // Priority 2: Fallback to API key
      const apiKey = req.headers['x-api-key'] || req.query.apiKey;
      if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

      user = await prisma.user.findFirst({ where: { apiKey: apiKey as string } });
      if (!user) return res.status(403).json({ error: 'Invalid API key' });
    }

    if (!user || user.credits <= 0) {
      return res.status(402).json({ error: 'Out of credits' });
    }

    await prisma.data.update({
      where: { id, userEmail: user.email },
      data: { value },
    });

    log('DATA_UPDATED', { user: user.email, id });
    res.status(200).json({ status: 'Updated successfully' });
  } catch (err) {
    log('DB_ERROR_UPDATE', err);
    res.status(500).json({ error: 'Database error' });
  }
}
