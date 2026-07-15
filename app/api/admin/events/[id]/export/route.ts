import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // 🎯 优雅指回根目录下的 lib
import { requireAdminOrThrow } from '@/lib/auth'; // 🎯 优雅指回根目录下的 lib

function escapeCsvField(value: any) {
  if (value == null) return '';
  const s = String(value);
  // escape double quotes by doubling them
  const escaped = s.replace(/"/g, '""');
  // wrap in double quotes if contains comma, newline, or double quote
  if (/[",\n]/.test(s)) return `"${escaped}"`;
  return s;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminOrThrow(req);
    const { id } = params;
    const event = await prisma.event.findUnique({ where: { id }, include: { registrations: true } });
    if (!event) return new NextResponse('Not found', { status: 404 });

    const headers = ['Registration ID', 'Name', 'Email', 'Phone', 'Status', 'Notes', 'Created At'];
    const rows = event.registrations.map((r) => [r.id, r.name, r.email, r.phone ?? '', r.status, r.notes ?? '', r.createdAt.toISOString()]);

    const csvLines = [headers.join(',')].concat(rows.map((row) => row.map(escapeCsvField).join(',')));
    const csv = csvLines.join('\n');

    const filename = `event-${event.id}-registrations.csv`;
    const res = new NextResponse(csv, { status: 200 });
    res.headers.set('Content-Type', 'text/csv; charset=utf-8');
    res.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    return res;
  } catch (err: any) {
    console.error(err);
    const status = err?.status || 500;
    return new NextResponse(JSON.stringify({ error: err?.message || 'Server error' }), { status });
  }
}
