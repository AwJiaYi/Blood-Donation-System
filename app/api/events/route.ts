import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const events = await prisma.event.findMany({ orderBy: { dateTime: 'asc' } });
    if (events.length === 0) return NextResponse.json({ items: [] });

    const eventIds = events.map((e) => e.id);

    // 统计非 CANCELLED 状态的报名人数
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

    const now = Date.now();
    const items = events.map((ev) => {
      const activeRegistrations = countMap.get(ev.id) ?? 0;
      const duration = ev.durationMinutes ?? 60; // 默认 60 分钟
      
      // 判断活动是否已结束/过期
      const end = new Date(ev.dateTime);
      end.setMinutes(end.getMinutes() + duration);
      const expired = end.getTime() <= now;

      // 计算剩余可用名额
      const remainingCapacity =
        ev.capacity == null ? null : Math.max(0, ev.capacity - activeRegistrations);

      return {
        ...ev,
        activeRegistrations,
        remainingCapacity,
        expired,
      };
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}