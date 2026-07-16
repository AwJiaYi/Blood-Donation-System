import { NextResponse } from 'next/server';
// 🎯 使用 @/ 别名，一劳永逸，避免相对路径退错层级
import prisma from '@/lib/prisma';
import { requireAdminOrThrow } from '@/lib/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// 安全过滤/转义 CSV 中的特殊字符和逗号
function escapeCsvField(value: any) {
  if (value == null) return '';
  const s = String(value);
  const escaped = s.replace(/"/g, '""');
  if (/[",\n]/.test(s)) return `"${escaped}"`;
  return s;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    // 1. 验证管理员权限
    await requireAdminOrThrow(req);

    // 2. 异步获取路由中的 id
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    console.log("[CSV Export] 开始导出活动报名，活动 ID:", id);

    if (!id) {
      return NextResponse.json({ error: '缺少活动 ID' }, { status: 400 });
    }

    // 3. 执行 Prisma 数据查询
    const event = await prisma.event.findUnique({
      where: { id },
      include: { registrations: true },
    });

    if (!event) {
      return NextResponse.json({ error: '未找到该活动记录' }, { status: 404 });
    }

    // 4. 构建 CSV 头部与数据行
    const headers = ['Registration ID', 'Name', 'Email', 'Phone', 'Status', 'Notes', 'Created At'];
    const rows = event.registrations.map((r) => [
      r.id,
      r.name,
      r.email,
      r.phone ?? '',
      r.status,
      r.notes ?? '',
      r.createdAt.toISOString()
    ]);

    // 5. 前置写入 \uFEFF (UTF-8 BOM 头)，防止 Windows Excel 乱码
    const csvContent = '\uFEFF' + [headers.join(',')].concat(rows.map((row) => row.map(escapeCsvField).join(','))).join('\n');

    // 6. 设置响应头触发浏览器下载
    const filename = `event-${event.id}-registrations.csv`;
    const res = new NextResponse(csvContent, { status: 200 });
    res.headers.set('Content-Type', 'text/csv; charset=utf-8');
    res.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res;
  } catch (err: any) {
    console.error('[CSV Export Error]:', err);
    const status = err?.status || 500;
    return NextResponse.json(
      { error: err?.message || '服务器内部错误' }, 
      { status }
    );
  }
}