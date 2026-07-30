export const ACCOUNTS_ENABLED =
  process.env.NEXT_PUBLIC_AOPDF_ACCOUNTS_ENABLED === 'true';

export const BILLING_ENABLED =
  ACCOUNTS_ENABLED &&
  process.env.NEXT_PUBLIC_AOPDF_BILLING_ENABLED === 'true';
