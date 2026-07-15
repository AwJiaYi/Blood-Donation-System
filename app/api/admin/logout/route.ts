import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Clear the token cookie
    const cookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax` + (process.env.NODE_ENV === 'production' ? '; Secure' : '');
    const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (err: any) {
    console.error(err);
    return new NextResponse(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
