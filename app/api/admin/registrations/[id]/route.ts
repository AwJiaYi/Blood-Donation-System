import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { requireAdminOrThrow } from '../../../../../lib/auth';

type RouteParams = {
  // 🎯 明确声明 params 是一个 Promise 包装的对象
  params: Promise<{ id: string }>;
};

// 1. 审批更新报名状态 (PUT)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    // 权限校验
    requireAdminOrThrow(req);
    
    // 🎯 规范 1：严格执行 await 解包，防止 Next.js 15 运行时报错
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    console.log('[API PUT] 正在更新报名记录 ID:', id);

    if (!id) {
      return NextResponse.json({ error: '缺少报名记录 ID' }, { status: 400 });
    }

    const body = await req.json();
    console.log('[API PUT] 接收到的请求体:', body);

    let { status } = body || {};
    if (!status) {
      return NextResponse.json({ error: '状态字段必填' }, { status: 400 });
    }

    // 自动兼容大小写：统一转换为大写以匹配 Prisma 模型的枚举（PENDING, APPROVED, REJECTED）
    const targetStatus = status.toUpperCase();

    // 执行 Prisma 更新
    const updated = await prisma.registration.update({
      where: { id },
      data: { status: targetStatus },
    });

    console.log('[API PUT] 更新成功:', updated);
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[API PUT] 发生错误:', err);
    const status = err?.status || 500;
    // 🎯 规范 2：Next.js 15 推荐使用 NextResponse.json 替代 new NextResponse(JSON.stringify(...))
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status });
  }
}

// 2. 彻底删除报名记录 (DELETE)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    requireAdminOrThrow(req);
    
    // 🎯 规范 1：严格执行 await 解包
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    console.log('[API DELETE] 正在删除报名记录 ID:', id);

    if (!id) {
      return NextResponse.json({ error: '缺少报名记录 ID' }, { status: 400 });
    }

    await prisma.registration.delete({
      where: { id },
    });

    console.log('[API DELETE] 删除成功');
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('[API DELETE] 发生错误:', err);
    const status = err?.status || 500;
    return NextResponse.json({ error: err.message || '服务器内部错误' }, { status });
  }
}