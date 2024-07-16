'use server';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token.value, secret) as { id: number; email: string };

    await prisma.user.delete({
      where: { id: decoded.id },
    });

    // Clear cookies after account deletion
    const response = NextResponse.json({ message: 'Account deleted successfully' });
    response.cookies.set('token', '', { maxAge: -1 });
    response.cookies.set('refreshToken', '', { maxAge: -1 });

    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
