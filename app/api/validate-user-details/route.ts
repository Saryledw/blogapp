// validateUserDetails.ts
'use server';

import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const body = await request.json();

    const { userName, email } = body as {
      userName: string;
      email: string;
    };

    const normalizedUserName = userName.toLowerCase();

    try {
        const existingUserByUserName = await prisma.user.findUnique({
            where: {
                normalizedUserName: normalizedUserName,
            },
            select: {
                userName: true,
            },
        });

        if (existingUserByUserName) {
            return NextResponse.json({ message: 'Имя пользователя уже занято' }, { status: 400 });
        }

        const existingUserByEmail = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                email: true,
            },
        });

        if (existingUserByEmail) {
            return NextResponse.json({ message: 'Email уже используется' }, { status: 400 });
        }

        return NextResponse.json({ message: 'User details are valid' }, { status: 200 });
    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
