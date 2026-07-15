import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { requireAdminOrThrow } from '../../../../lib/auth';

export async function GET(req: Request) {
  try {
    requireAdminOrThrow(req);
    const events = await prisma.event.findMany({ orderBy: { dateTime: 'desc' } });
    return NextResponse.json({ items: events });
  } catch (err: any) {
    const status = err?.status || 401;
    return new NextResponse(JSON.stringify({ error: err.message || 'Unauthorized' }), { status });
  }
}

export async function POST(req: Request) {
  try {
    requireAdminOrThrow(req);
    const body = await req.json();
    const { title, description, location, dateTime, capacity } = body || {};
    if (!title || !dateTime) {
      return new NextResponse(JSON.stringify({ error: 'title and dateTime are required' }), { status: 400 });
    }

    const ev = await prisma.event.create({
      data: {
        title,
        description: description ?? null,
        location: location ?? null,
        dateTime: new Date(dateTime),
        capacity: capacity ?? null,
      },
    });

    return NextResponse.json(ev, { status: 201 });
  } catch (err: any) {
    console.error(err);
    const status = err?.status || 500;
    return new NextResponse(JSON.stringify({ error: err.message || 'Server error' }), { status });
  }
}
