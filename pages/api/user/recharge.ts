// pages/api/user/recharge.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { rechargeCount: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.rechargeCount >= 1) {
      return res.status(403).json({ error: 'Recharge limit reached' });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        credits: { increment: 4 },
        rechargeCount: { increment: 1 },
      },
    });

    log('CREDITS_RECHARGED', { user: session.user.email });
    res.status(200).json({ status: 'Credits recharged successfully' });
  } catch (err) {
    log('DB_ERROR_RECHARGE', err);
    res.status(500).json({ error: 'Database error' });
  }
}
