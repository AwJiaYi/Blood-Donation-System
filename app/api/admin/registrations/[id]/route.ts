import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { requireAdminOrThrow } from '../../../../../lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminOrThrow(req);
    const { id } = params;
    const body = await req.json();
    const { status } = body || {};
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
    }
    const updated = await prisma.registration.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    const status = err?.status || 500;
    return new NextResponse(JSON.stringify({ error: err.message || 'Server error' }), { status });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminOrThrow(req);
    const { id } = params;
    await prisma.registration.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error(err);
    const status = err?.status || 500;
    return new NextResponse(JSON.stringify({ error: err.message || 'Server error' }), { status });
  }
}
