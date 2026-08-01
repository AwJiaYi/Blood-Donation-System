import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { requireAdminOrThrow } from '../../../../lib/auth';

export async function GET(req: Request) {
  try {
    await requireAdminOrThrow(req);

    // 1. 拉取所有活动
    const events = await prisma.event.findMany({ orderBy: { dateTime: 'desc' } });
    const eventIds = events.map((e) => e.id);

    if (eventIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // 2. 使用 groupBy 聚合统计每个活动的有效报名数（排除 CANCELLED）
    const counts = await prisma.registration.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        NOT: { status: { in: ['CANCELLED', 'cancelled'] } },
      },
      _count: { eventId: true },
    });

    const countMap = new Map<string, number>();
    counts.forEach((c) => countMap.set(c.eventId, c._count.eventId));

    // 3. 合并并计算 remainingCapacity
    const items = events.map((ev) => {
      const activeRegistrations = countMap.get(ev.id) ?? 0;
      const remainingCapacity = ev.capacity == null ? null : Math.max(0, ev.capacity - activeRegistrations);
      return {
        ...ev,
        activeRegistrations,
        remainingCapacity,
      };
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('[admin events GET] error', err);
    const status = err?.status || 401;
    return new NextResponse(JSON.stringify({ error: err.message || 'Unauthorized' }), { status });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminOrThrow(req);
    const body = await req.json();
    const { title, description, location, dateTime, capacity, durationMinutes } = body || {};
    if (!title || !dateTime) {
      return new NextResponse(JSON.stringify({ error: 'title and dateTime are required' }), { status: 400 });
    }

    const dt = new Date(dateTime);
    if (isNaN(dt.getTime())) {
      return new NextResponse(JSON.stringify({ error: 'dateTime is invalid' }), { status: 400 });
    }

    const now = new Date();
    if (dt.getTime() < now.getTime()) {
      return new NextResponse(JSON.stringify({ error: '活动开始时间不能早于当前时间' }), { status: 400 });
    }

    const ev = await prisma.event.create({
      data: {
        title,
        description: description ?? null,
        location: location ?? null,
        dateTime: dt,
        capacity: capacity ?? null,
        durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : 60,
      },
    });

    return NextResponse.json(ev, { status: 201 });
  } catch (err: any) {
    console.error(err);
    const status = err?.status || 500;
    return new NextResponse(JSON.stringify({ error: err.message || 'Server error' }), { status });
  }
}
