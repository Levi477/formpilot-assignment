import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  callbacks: {
    async signIn({ user }) {
      console.log('[NextAuth] 🔑 signIn triggered');
      console.log('[NextAuth] user:', user);

      const existingUser = await prisma.user.findFirst({
        where: { email: user.email! },
      });

      if (!existingUser) {
        console.log('[NextAuth] Creating new user in DB');
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name ?? '',
            apiKey: randomUUID(),
            credits: 4,
            rechargeCount: 0,
          },
        });
      } else {
        console.log('[NextAuth] User already exists:', existingUser.email);
      }

      return true;
    },

    async session({ session }) {
      console.log('[NextAuth] 🧠 session callback triggered');
      console.log('[NextAuth] session before db lookup:', session);

      const dbUser = await prisma.user.findUnique({
        where: { email: session.user?.email ?? '' },
      });

      if (dbUser) {
        console.log('[NextAuth] Found user in DB:', dbUser.email);
        session.user.id = dbUser.id;
        session.user.apiKey = dbUser.apiKey;
        session.user.credits = dbUser.credits;

        const baseUrl = process.env.NEXTAUTH_URL;
        session.user.apiUrl = `${baseUrl}/api/use?apiKey=${dbUser.apiKey}`;
      } else {
        console.warn('[NextAuth] ⚠️ No user found in DB for session');
      }

      console.log('[NextAuth] session after mutation:', session);
      return session;
    },
  },

  debug: true, // Enable verbose NextAuth debug logs in server console

  // Strongly recommended in production
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
