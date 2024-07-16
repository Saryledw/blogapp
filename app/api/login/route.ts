'use server';

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const { loginField, password } = body as {
      loginField: string;
      password: string;
    };

		const normalizedLoginField = loginField.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginField },
          { normalizedUserName: normalizedLoginField }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Пользователя не существует' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Неверный пароль' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET as string;

    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '1h' } // Access token expires in 1 hour
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: '7d' } // Refresh token expires in 7 days
    );

    const isProduction = process.env.NODE_ENV === 'production';

    // Set tokens in HTTP-only and secure cookies
		const response = NextResponse.json({
      message: 'Login successful',
      userName: user.userName,
      profilePictureUrl: user.profilePictureUrl,
			createdAt: user.createdAt // Include these details in the response
    }, { status: 200 });


    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProduction, // Only set secure flag in production
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60 // 1 hour
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
