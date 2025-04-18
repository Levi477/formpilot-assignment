// pages/api/auth/[...nextauth].ts
import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/ib/prisma';
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
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name ?? '',
            image: user.image,
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
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
