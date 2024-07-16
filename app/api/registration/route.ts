'use server';

import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
		const body = await request.json();

    const { userName, email, password, profilePictureUrl } = body as {
      userName: string;
      email: string;
      password: string;
      profilePictureUrl?: string;
    };

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
		const normalizedUserName = userName.toLowerCase();

    try {
      const user = await prisma.user.create({
        data: {
          userName,
					normalizedUserName,
          email,
          password: hashedPassword,
          profilePictureUrl,
        },
				select: {
					userName: true,
					normalizedUserName: true,
					email: true,
					profilePictureUrl: true,
					// Explicitly exclude password by not listing it here
				},
      });

      return NextResponse.json(user);
    } catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				// Unique constraint violation
				if (error.code === 'P2002') {
					let message = 'An error occurred.';
					// Check the target field to determine the error message
					if (Array.isArray(error.meta?.target)) {
						if (error.meta.target.includes('normalizedUserName')) {
							message = 'Имя пользователя уже занято';
						} else if (error.meta.target.includes('email')) {
							message = 'Email уже используется';
						}
					}
					return NextResponse.json({ message }, { status: 400 });
				}
			}
      console.error('Registration error:', error);
      NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  
}