// pages/api/auth/[...nextauth].ts
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
  callbacks: {
    async signIn({ user }) {
      const existingUser = await prisma.user.findFirst({
        where: { email: user.email! },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name ?? '',
            apiKey: randomUUID(),
            credits: 4,
            rechargeCount: 0,
          },
        });
      }

      return true;
    },
    async session({ session }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user?.email ?? '' },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.apiKey = dbUser.apiKey;
        session.user.credits = dbUser.credits;

        // Add api_url based on environment or known base URL
        const baseUrl = process.env.NEXTAUTH_URL;
        session.user.apiUrl = `${baseUrl}/api/use?apiKey=${dbUser.apiKey}`;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
