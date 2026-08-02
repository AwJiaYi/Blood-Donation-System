import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // 检查用户登录状态
    const user = getUserFromRequest(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: '请先登录账号' }, { status: 401 });
    }

    const body = await req.json();
    const { id, editToken } = body || {};

    if (!id || !editToken) {
      return NextResponse.json({ error: '缺少 Registration ID 或 Edit Token' }, { status: 400 });
    }

    // 查找该条报名记录
    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) {
      return NextResponse.json({ error: '未找到该预约记录' }, { status: 404 });
    }

    // 校验 Token 凭证是否匹配
    if (reg.token !== editToken) {
      return NextResponse.json({ error: '凭证无效，绑定失败' }, { status: 403 });
    }

    // 更新 userId，将访客记录绑定到当前用户
    const updated = await prisma.registration.update({
      where: { id },
      data: { userId: user.id },
    });

    return NextResponse.json({ message: '绑定成功！', registration: updated });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || '服务器错误' }, { status: 500 });
  }
}