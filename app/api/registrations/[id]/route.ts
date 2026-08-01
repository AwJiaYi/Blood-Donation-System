import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: '缺少预约 ID' }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            title: true,
            dateTime: true,
            location: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json({ error: '找不到该预约信息' }, { status: 404 });
    }

    return NextResponse.json(registration, { status: 200 });
  } catch (err: unknown) {
    console.error('[Get Registration Error]:', err);
    return NextResponse.json(
      { error: '服务器错误，无法获取预约信息' },
      { status: 500 }
    );
  }
}
