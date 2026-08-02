import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // 1. 获取当前登录用户的 Session
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { eventId, name, email, phone, bloodType, notes, token } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 2. 获取活动信息
    const ev = await prisma.event.findUnique({ where: { id: eventId } });
    if (!ev) {
      return NextResponse.json({ error: '活动不存在' }, { status: 404 });
    }

    // 3. 检查活动是否已经过期/结束
    const duration = ev.durationMinutes ?? 60;
    const end = new Date(ev.dateTime);
    end.setMinutes(end.getMinutes() + duration);
    if (end.getTime() <= Date.now()) {
      return NextResponse.json({ error: '活动已结束，无法报名' }, { status: 400 });
    }

    // 4. 容量校验 (防止超卖)
    if (ev.capacity != null) {
      const activeCount = await prisma.registration.count({
        where: {
          eventId,
          NOT: { status: { in: ['CANCELLED', 'cancelled'] } },
        },
      });

      if (activeCount >= ev.capacity) {
        return NextResponse.json({ error: '名额已满，无法报名' }, { status: 400 });
      }
    }

    // 5. 获取当前登录用户的 ID（如果已登录，则自动绑定）
    const userId = session?.user ? (session.user as any).id : null;

    // 6. 创建报名记录
    const finalToken = token || crypto.randomUUID();

    const reg = await prisma.registration.create({
      data: {
        eventId,
        name,
        email,
        phone: phone ?? null,
        notes: notes ?? null,
        token: finalToken,
        userId, // 👈 核心：自动把当前用户的 ID 写入数据库关联
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: '预约成功！',
      registration: reg,
      id: reg.id,
      editToken: reg.token,
    }, { status: 201 });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || '服务器错误' }, { status: 500 });
  }
}