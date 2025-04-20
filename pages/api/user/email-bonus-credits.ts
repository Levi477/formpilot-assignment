
import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma'; // Adjust this import based on your actual setup

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get the user
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add 4 additional credits
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        credits: user.credits + 4,
      },
    });

    return res.status(200).json({ 
      status: 'Email received. 4 credits added!',
      credits: updatedUser.credits
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to add bonus credits' });
  }
}
