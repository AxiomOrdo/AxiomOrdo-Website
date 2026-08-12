import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { appPath } from '@/lib/paths';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;
        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: { workspaceId: true, role: true },
        });
        token.workspaceId = membership?.workspaceId;
        token.role = membership?.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).id = token.id;
        (session.user as any).workspaceId = token.workspaceId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: appPath('/auth/signin'),
    newUser: appPath('/dashboard'),
  },
};
