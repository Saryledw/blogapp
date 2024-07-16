'use server';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const cookieStore = cookies();

  try {
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Token not found' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET as string;
		const decoded = jwt.verify(token.value, secret) as { id: number; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { userName: true, profilePictureUrl: true, createdAt: true },
    });

		if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
