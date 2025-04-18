import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log} from '@/ib/logger';
import { prisma } from '@/ib/prisma';


// update.ts
export async function updateHandler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { id, value } = req.body;
  try {
    await prisma.data.updateMany({
      where: { id, userEmail: session.user.email },
      data: { value },
    });
    log('DATA_UPDATED', { user: session.user.email, id });
    res.status(200).json({ status: 'Updated successfully' });
  } catch (err) {
    log('DB_ERROR_UPDATE', err);
    res.status(500).json({ error: 'Database error' });
  }
}


