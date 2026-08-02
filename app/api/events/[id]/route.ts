import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    // 👈 Next.js 15+ / 16 要求必须使用 await 解析 params
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: '未找到该活动' }, { status: 404 });
    }

    // 计算已报名人数
    const activeCount = await prisma.registration.count({
      where: {
        eventId: id,
        NOT: { status: { in: ['CANCELLED', 'cancelled'] } },
      },
    });

    // 计算剩余名额与状态
    const remainingCapacity =
      event.capacity != null ? Math.max(0, event.capacity - activeCount) : null;

    const duration = event.durationMinutes ?? 60;
    const end = new Date(event.dateTime);
    end.setMinutes(end.getMinutes() + duration);
    const isExpired = end.getTime() <= Date.now();

    return NextResponse.json({
      ...event,
      activeCount,
      remainingCapacity,
      isExpired,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}