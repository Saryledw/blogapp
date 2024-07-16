'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();

  // Clear cookies
  cookieStore.set('token', '', { maxAge: -1, path: '/' });
  cookieStore.set('refreshToken', '', { maxAge: -1, path: '/' });

  return NextResponse.json({ message: 'Logged out' });
}
