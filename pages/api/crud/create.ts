import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { log } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export default async function createHandler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('[CREATE] Incoming request:', req.method, req.url);

  if (req.method !== 'POST') {
    console.warn('[CREATE] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { value, txhash } = req.body;
  console.log('[CREATE] Body data received:', { value, txhash });

  try {
    // Try to get session
    const session = await getServerSession(req, res, authOptions);
    let user;

    if (session?.user?.email) {
      console.log('[CREATE] Authenticated session:', session.user.email);

      user = await prisma.user.findFirst({
        where: { email: session.user.email },
      });

      console.log('[CREATE] User found by session:', user?.email);
    } else {
      // Use API key
      const apiKey = req.query.apiKey || req.headers['x-api-key'];
      console.log('[CREATE] Using API key:', apiKey);

      if (!apiKey) {
        console.warn('[CREATE] Missing API key');
        return res.status(401).json({ error: 'Missing API key' });
      }

      user = await prisma.user.findFirst({
        where: { apiKey: apiKey as string },
      });

      if (!user) {
        console.warn('[CREATE] Invalid API key');
        return res.status(403).json({ error: 'Invalid API key' });
      }

      console.log('[CREATE] User found by API key:', user.email);
    }

    // Check credits
    if (!user || user.credits <= 0) {
      console.warn('[CREATE] User not found or out of credits:', user?.email);
      return res.status(402).json({ error: 'Out of credits' });
    }

    // Create new data
    const data = await prisma.data.create({
      data: {
        userEmail: user.email,
        value,
        txhash,
      },
    });

    console.log('[CREATE] Data created:', data.id);

    // Decrement credit
    await prisma.user.update({
      where: { email: user.email },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    console.log('[CREATE] Credits decremented for:', user.email);

    log('DATA_CREATED', { user: user.email, id: data.id });
    return res.status(201).json({ id: data.id });

  } catch (err) {
    console.error('[CREATE] Unexpected error:', err);
    log('DB_ERROR_CREATE', err);
    return res.status(500).json({ error: 'Database error' });
  }
}
