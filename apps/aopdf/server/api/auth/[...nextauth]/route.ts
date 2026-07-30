import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { ACCOUNTS_CONFIGURED, unavailableResponse } from '@/lib/server-features';

const handler = ACCOUNTS_CONFIGURED
  ? NextAuth(authOptions)
  : () => unavailableResponse('accounts');
export { handler as GET, handler as POST };
