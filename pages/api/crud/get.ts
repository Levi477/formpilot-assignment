import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log} from '@/ib/logger';
import { prisma } from '@/ib/prisma';


// get.ts
export async function getHandler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  try {
    const data = await prisma.data.findFirst({ where: { id: parseInt(id), userEmail: session.user.email } });
    if (!data) return res.status(404).json({ error: 'Not found' });

    log('DATA_FETCHED', { user: session.user.email, id });
    res.status(200).json(data);
  } catch (err) {
    log('DB_ERROR_GET', err);
    res.status(500).json({ error: 'Database error' });
  }
}


