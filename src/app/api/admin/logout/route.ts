import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const cookie = serialize('admin_token', '', { maxAge: -1, path: '/' });
  return new NextResponse(JSON.stringify({ success: true }), {
    headers: { 'Set-Cookie': cookie },
  });
}