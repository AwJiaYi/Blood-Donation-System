"use server";

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // 获取所有活动（按时间排序）
    const events = await prisma.event.findMany({ orderBy: { dateTime: 'asc' } });

    // 为每个活动计算 activeRegistrations（排除 status 为 'cancelled' 的报名）
    const eventsWithRemaining = await Promise.all(events.map(async (ev) => {
      const activeRegistrations = await prisma.registration.count({
        where: {
          eventId: ev.id,
          NOT: { status: 'cancelled' },
        },
      });

      let remainingCapacity: number | null = null;
      if (ev.capacity === null || ev.capacity === undefined) {
        remainingCapacity = null; // 表示不限额
      } else {
        remainingCapacity = Math.max(0, ev.capacity - activeRegistrations);
      }

      return {
        ...ev,
        remainingCapacity,
        activeRegistrations,
      };
    }));

    return NextResponse.json({ items: eventsWithRemaining });
  } catch (err: any) {
    console.error('[public events GET] failed', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
