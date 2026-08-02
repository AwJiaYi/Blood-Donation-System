import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminOrThrow } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  try {
    // 验证管理员身份
    await requireAdminOrThrow(req);

    const { id } = await params;
    if (!id) return NextResponse.json({ error: '缺少报名记录 ID' }, { status: 400 });

    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) return NextResponse.json({ error: '未找到该预约记录' }, { status: 404 });

    // 防止重复核销
    if (reg.attendedAt) {
      return NextResponse.json(
        { error: '该二维码已完成核销，请勿重复核销！', attendedAt: reg.attendedAt },
        { status: 400 }
      );
    }

    // 更新核销状态与核销时间
    const updated = await prisma.registration.update({
      where: { id },
      data: {
        attendedAt: new Date(),
        status: 'ATTENDED', // 更新状态为已签到/已核销
      },
    });

    return NextResponse.json({
      message: '核销成功！',
      registration: updated,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || '服务器错误' }, { status: 500 });
  }
}