'use server';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const cookieStore = cookies();

  try {
    const refreshToken = cookieStore.get('refreshToken');

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh token not found' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET as string;
		const payload = jwt.verify(refreshToken.value, secret) as { id: number; email: string }; // Adjusted type

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { userName: true, profilePictureUrl: true, createdAt: true },
    });

		if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    // Invalidate the old refresh token by removing it from the client's cookies
    cookieStore.set('refreshToken', '', { maxAge: -1 });

    // Issue a new access token
    const newToken = jwt.sign(
      { id: payload.id, email: payload.email },
      secret,
      { expiresIn: '1h' }
    );

    // Issue a new refresh token
    const newRefreshToken = jwt.sign(
      { id: payload.id, email: payload.email },
      secret,
      { expiresIn: '7d' } // Refresh token expiration time, e.g., 7 days
    );

		const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({user}, { status: 200 });
    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60 // 1 hour
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
  }
}
