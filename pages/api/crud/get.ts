import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export default async function getHandler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id  = parseInt(req.query.id);

  try {
    let user;

    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    } else {
      const apiKey = req.query.apiKey || req.headers['x-api-key'];
      if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

      user = await prisma.user.findFirst({  // 👈 fix here if `apiKey` is not unique
        where: { apiKey: apiKey as string },
      });

      if (!user) return res.status(403).json({ error: 'Invalid API key' });
    }

    //if (!user || user.credits <= 0) {
    //  return res.status(402).json({ error: 'Out of credits' });
    //}

    let data;

    if (id) {
      data = await prisma.data.findFirst({
        where: {
          id: parseInt(id as string),
          userEmail: user.email,
        },
      });
      if (!data) return res.status(404).json({ error: 'Not found' });
    } else {
      data = await prisma.data.findMany({
        where: {
          userEmail: user.email,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    log('DATA_FETCHED', { user: user.email, id: id || 'ALL' });
    res.status(200).json(data);

  } catch (err) {
    log('DB_ERROR_GET', err);
    res.status(500).json({ error: 'Database error' });
  }
}
