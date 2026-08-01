import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// 公开接口：处理普通用户的活动报名提交
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, name, email, phone, notes } = body;

    // 基础的服务端验证
    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: '缺少必要字段：活动ID、姓名和邮箱为必填项' }, 
        { status: 400 }
      );
    }

    // 检查关联的活动是否存在
    const eventExists = await prisma.event.findUnique({
      where: { id: eventId }
    });
    if (!eventExists) {
      return NextResponse.json(
        { error: '填写的活动不存在或已被下架' }, 
        { status: 404 }
      );
    }

    // 生成唯一的管理令牌
    const token = crypto.randomBytes(16).toString('hex');

    // 将报名数据持久化写入 Prisma 数据库
    const newRegistration = await prisma.registration.create({
      data: {
        eventId,
        name,
        email,
        phone: phone || null,
        notes: notes || null,
        status: 'PENDING'
      }
    });

    console.log(`[User Action] 用户 ${name} 成功报名活动 ${eventId}，生成记录 ID: ${newRegistration.id}`);

    // 返回成功状态及生成的唯一凭证 ID
    return NextResponse.json({ 
      success: true, 
      id: newRegistration.id,
      editToken: token
    }, { status: 201 });

  } catch (err: any) {
    console.error('[Public Registration POST Error]:', err);
    return NextResponse.json(
      { error: '提交报名失败，请稍后重试' }, 
      { status: 500 }
    );
  }
}