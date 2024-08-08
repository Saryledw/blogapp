'use server';

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.json();
  
  const { userName, profilePictureUrl } = body;
  
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token.value, secret) as { id: number; email: string };

		const normalizedUserName = userName ? userName.toLowerCase() : undefined;

		if (normalizedUserName) {
      const existingUser = await prisma.user.findUnique({
        where: { normalizedUserName },
        select: { id: true },
      });

      // If the username is taken and belongs to a different user, return an error
      if (existingUser && existingUser.id !== decoded.id) {
        return NextResponse.json({ message: 'Имя пользователя уже занято' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        userName: userName || undefined,
				normalizedUserName: normalizedUserName || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
