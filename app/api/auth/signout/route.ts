import { NextResponse } from 'next/server';
import { signOut } from '@/services/auth';

export async function POST() {
  try {
    await signOut();
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}