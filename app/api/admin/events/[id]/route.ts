import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // 根据你的实际相对路径调整
import { requireAdminOrThrow } from '../../../../../lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>; // 🎯 Next.js 15 中 params 是一个 Promise
};

export async function GET(req: Request, { params }: RouteParams) {
  try {
    // 1. 权限校验
    requireAdminOrThrow(req);

    // 2. 🎯 异步等待解包 params
    const { id } = await params;
    console.log('[API GET] 正在获取活动详情，ID 为:', id);

    if (!id) {
      return NextResponse.json({ error: '缺少活动 ID' }, { status: 400 });
    }

    // 3. 查数据库并连带查出报名名单
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          orderBy: { createdAt: 'desc' }, // 让新报名的排在前面
        },
      },
    });

    if (!event) {
      console.warn(`[API GET] 未找到 ID 为 ${id} 的活动`);
      return NextResponse.json({ error: '活动不存在' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (err: any) {
    console.error('[API GET] 获取活动详情失败:', err);
    const status = err?.status || 500;
    return NextResponse.json(
      { error: err.message || '服务器内部错误' }, 
      { status }
    );
  }
}