import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log} from '@/ib/logger';
import { prisma } from '@/ib/prisma';


export async function deleteHandler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.body;
  try {
    await prisma.data.deleteMany({ where: { id, userEmail: session.user.email } });
    log('DATA_DELETED', { user: session.user.email, id });
    res.status(200).json({ status: 'Deleted successfully' });
  } catch (err) {
    log('DB_ERROR_DELETE', err);
    res.status(500).json({ error: 'Database error' });
  }
}

