import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma';
import { signToken } from '../../../../lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return new NextResponse(JSON.stringify({ error: 'Email and password required' }), { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return new NextResponse(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const token = signToken({ userId: admin.id, role: admin.role }, '4h');

    const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${4 * 60 * 60}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    const res = new NextResponse(JSON.stringify({ token }), { status: 200 });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (err: any) {
    console.error(err);
    return new NextResponse(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
