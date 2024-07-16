'use server';

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userName, email, password, profilePictureUrl } = req.body as {
      userName: string;
      email: string;
      password: string;
      profilePictureUrl?: string;
    };

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = await prisma.user.create({
        data: {
          userName,
          email,
          password: hashedPassword,
          profilePictureUrl,
        },
				select: {
					userName: true,
					email: true,
					profilePictureUrl: true,
					// Explicitly exclude password by not listing it here
				},
      });

      res.status(201).json({ user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error creating user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}