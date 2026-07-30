export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ACCOUNTS_CONFIGURED, unavailableResponse } from '@/lib/server-features';

export async function POST(request: NextRequest) {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user?.hashedPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return NextResponse.json({ id: user.id, email: user.email, name: user?.name });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
