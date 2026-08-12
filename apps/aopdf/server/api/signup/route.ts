export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  ACCOUNTS_CONFIGURED,
  COMMERCIAL_CONFIGURATION,
  unavailableResponse,
} from '@/lib/server-features';

export async function POST(request: NextRequest) {
  if (!ACCOUNTS_CONFIGURED) return unavailableResponse('accounts');
  try {
    const body = await request.json() as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || password.length > 128) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if (COMMERCIAL_CONFIGURATION.state !== 'ready') return unavailableResponse('accounts');
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name: name || null,
        memberships: {
          create: {
            role: 'OWNER',
            workspace: {
              create: {
                displayName: name || 'Personal workspace',
                subscription: {
                  create: {
                    planCode: COMMERCIAL_CONFIGURATION.defaultPlanCode,
                    state: 'INACTIVE',
                  },
                },
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
