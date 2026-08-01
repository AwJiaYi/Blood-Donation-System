import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

/** 公开接口：处理普通用户的活动报名提交 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, name, email, phone, notes } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: '缺少必要字段：活动ID、姓名和邮箱为必填项' },
        { status: 400 }
      );
    }

    const eventExists = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!eventExists) {
      return NextResponse.json(
        { error: '填写的活动不存在或已被下架' },
        { status: 404 }
      );
    }

    const generatedToken = crypto.randomBytes(16).toString('hex');

    const newRegistration = await prisma.registration.create({
      data: {
        eventId,
        name,
        email,
        phone: phone || null,
        notes: notes || null,
        status: 'PENDING',
        token: generatedToken,
      },
    });

    console.log(
      `[User Action] 用户 ${name} 成功报名活动 ${eventId}，生成记录 ID: ${newRegistration.id}`
    );

    return NextResponse.json(
      {
        success: true,
        id: newRegistration.id,
        token: generatedToken,
        editToken: generatedToken,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[Public Registration POST Error]:', err);
    return NextResponse.json(
      { error: '提交报名失败，请稍后重试' },
      { status: 500 }
    );
  }
}
