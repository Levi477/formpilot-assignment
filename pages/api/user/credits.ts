// pages/api/user/credits.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/ib/prisma';
import { log } from '@/ib/logger';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    log('FETCH_CREDITS', { user: session.user.email, credits: user.credits });
    res.status(200).json({ credits: user.credits });
  } catch (err) {
    log('DB_ERROR_FETCH_CREDITS', err);
    res.status(500).json({ error: 'Database error' });
  }
}
