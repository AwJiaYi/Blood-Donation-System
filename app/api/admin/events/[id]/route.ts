import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminOrThrow } from '@/lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// 1. 获取单个活动详情 (GET) — 包含剩余名额计算
export async function GET(req: Request, { params }: RouteParams) {
  try {
    requireAdminOrThrow(req);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '缺少活动 ID' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: '找不到该活动' }, { status: 404 });
    }

    // 计算活跃报名数 (排除 cancelled)
    const activeRegistrations = await prisma.registration.count({
      where: {
        eventId: id,
        NOT: { status: 'cancelled' },
      },
    });

    const remainingCapacity =
      event.capacity === null || event.capacity === undefined
        ? null
        : Math.max(0, event.capacity - activeRegistrations);

    return NextResponse.json({
      ...event,
      activeRegistrations,
      remainingCapacity,
    });
  } catch (err: any) {
    console.error('[Admin Event GET Single Error]:', err);
    const status = err?.status || 500;
    return NextResponse.json({ error: err.message || '加载事件数据失败' }, { status });
  }
}

// 2. 更新活动 (PUT) — 校验日期不早于当前时间，更新 durationMinutes
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    requireAdminOrThrow(req);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '缺少活动 ID' }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, location, dateTime, capacity, durationMinutes } = body || {};

    if (!title || !dateTime) {
      return NextResponse.json({ error: '标题与活动时间为必填项' }, { status: 400 });
    }

    const dt = new Date(dateTime);
    if (isNaN(dt.getTime())) {
      return NextResponse.json({ error: '时间格式不正确' }, { status: 400 });
    }

    // 不允许将活动时间改成早于当前时间
    const now = new Date();
    if (dt.getTime() < now.getTime()) {
      return NextResponse.json({ error: '活动开始时间不能早于当前系统时间' }, { status: 400 });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        description: description ?? null,
        location: location ?? null,
        dateTime: dt,
        capacity: capacity ?? null,
        durationMinutes: typeof durationMinutes === 'number' ? durationMinutes : 60,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[API PUT] 更新活动失败:', err);
    const status = err?.status || 500;
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status });
  }
}

// 3. 删除活动 (DELETE)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    requireAdminOrThrow(req);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '缺少活动 ID' }, { status: 400 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: '活动成功删除' });
  } catch (err: any) {
    console.error('[Admin Event DELETE Error]:', err);
    const status = err?.status || 500;
    return NextResponse.json({ error: err.message || '删除活动失败' }, { status });
  }
}