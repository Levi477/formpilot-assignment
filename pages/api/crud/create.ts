// Unified Prisma CRUD Handlers

// create.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log} from '@/ib/logger';
import { prisma } from '@/ib/prisma';

export async function createHandler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { value, txhash } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.credits <= 0) return res.status(403).json({ error: 'Out of credits' });

    const data = await prisma.data.create({
      data: { userEmail: session.user.email, value, txhash },
    });

    await prisma.user.update({
      where: { email: session.user.email },
      data: { credits: { decrement: 1 } },
    });

    log('DATA_CREATED', { user: session.user.email, id: data.id });
    res.status(201).json({ id: data.id });
  } catch (err) {
    log('DB_ERROR_CREATE', err);
    res.status(500).json({ error: 'Database error' });
  }
}

// delete.ts

