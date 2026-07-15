import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { requireAdminOrThrow } from '../../../../../lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminOrThrow(req);
    const { id } = params;
    const ev = await prisma.event.findUnique({ where: { id }, include: { registrations: true } });
    if (!ev) return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 });
    return NextResponse.json(ev);
  } catch (err: any) {
    const status = err?.status || 401;
    return new NextResponse(JSON.stringify({ error: err.message || 'Unauthorized' }), { status });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminOrThrow(req);
    const { id } = params;
    const body = await req.json();
    const { title, description, location, dateTime, capacity } = body || {};

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        description: description ?? null,
        location: location ?? null,
        dateTime: dateTime ? new Date(dateTime) : undefined,
        capacity: capacity ?? undefined,
      },
    });

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
    await prisma.event.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error(err);
    const status = err?.status || 500;
    return new NextResponse(JSON.stringify({ error: err.message || 'Server error' }), { status });
  }
}
