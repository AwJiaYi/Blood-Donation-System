import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 公开接口：获取所有活动列表，供普通用户浏览/选择
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { dateTime: 'asc' }, // 按时间先后排序
    });
    return NextResponse.json(events);
  } catch (err: any) {
    console.error('[Public Events GET Error]:', err);
    return NextResponse.json(
      { error: '无法获取活动列表' }, 
      { status: 500 }
    );
  }
}