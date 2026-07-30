'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ACCOUNTS_ENABLED } from '@/lib/features';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      basePath="/aopdf/api/auth"
      session={ACCOUNTS_ENABLED ? undefined : null}
      refetchOnWindowFocus={ACCOUNTS_ENABLED}
    >
      {children}
    </SessionProvider>
  );
}
