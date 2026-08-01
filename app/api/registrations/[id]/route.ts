// app/api/registrations/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type RegistrationRecord = {
  editToken?: string | null;
  token?: string | null;
  [key: string]: unknown;
};

function extractTokenFromReq(req: Request) {
  try {
    const url = new URL(req.url);
    const qToken = url.searchParams.get("token");
    if (qToken) return qToken;

    const h = req.headers;
    const headerToken = h.get("x-registration-token") || h.get("x-token");
    if (headerToken) return headerToken;

    const auth = h.get("authorization") || h.get("Authorization");
    if (auth?.toLowerCase().startsWith("bearer ")) {
      return auth.slice(7).trim();
    }

    return null;
  } catch {
    return null;
  }
}

/** 校验请求凭证是否与数据库 Registration 匹配 */
function assertRegistrationCredential(reg: RegistrationRecord, requestToken: string) {
  const stored = reg.editToken || reg.token;
  if (!stored) {
    return { ok: false as const, status: 403, error: "此预约未配置 token，无法通过凭证访问" };
  }
  if (stored !== requestToken) {
    return { ok: false as const, status: 403, error: "凭证无效" };
  }
  return { ok: true as const };
}

/** 响应中移除 token / editToken，避免泄露凭证 */
function omitToken<T extends RegistrationRecord>(reg: T) {
  const { editToken: _omit1, token: _omit2, ...safe } = reg;
  return safe;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "缺少预约 ID" }, { status: 400 });

    const requestToken = extractTokenFromReq(req);
    if (!requestToken) {
      return NextResponse.json({ error: "缺少 token" }, { status: 401 });
    }

    const reg = await prisma.registration.findUnique({
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

    if (!reg) {
      return NextResponse.json({ error: "预约不存在" }, { status: 404 });
    }

    const auth = assertRegistrationCredential(reg, requestToken);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    return NextResponse.json(omitToken(reg));
  } catch (err: unknown) {
    console.error("[registrations GET] error:", err);
    const message = err instanceof Error ? err.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "缺少预约 ID" }, { status: 400 });

    const requestToken = extractTokenFromReq(req);
    if (!requestToken) {
      return NextResponse.json({ error: "缺少 token" }, { status: 401 });
    }

    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) return NextResponse.json({ error: "预约不存在" }, { status: 404 });

    const auth = assertRegistrationCredential(reg, requestToken);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const curStatus = (reg.status || "").toLowerCase();
    if (curStatus !== "pending") {
      return NextResponse.json({ error: "当前状态无法取消预约" }, { status: 400 });
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(omitToken(updated));
  } catch (err: unknown) {
    console.error("[registrations DELETE] error:", err);
    const message = err instanceof Error ? err.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "缺少预约 ID" }, { status: 400 });

    const requestToken = extractTokenFromReq(req);
    if (!requestToken) {
      return NextResponse.json({ error: "缺少 token" }, { status: 401 });
    }

    const reg = await prisma.registration.findUnique({ where: { id } });
    if (!reg) return NextResponse.json({ error: "预约不存在" }, { status: 404 });

    const auth = assertRegistrationCredential(reg, requestToken);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const action = (body?.action || "").toString().toLowerCase();

    if (action === "cancel") {
      const curStatus = (reg.status || "").toLowerCase();
      if (curStatus !== "pending") {
        return NextResponse.json({ error: "当前状态无法取消预约" }, { status: 400 });
      }
      const updated = await prisma.registration.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json(omitToken(updated));
    }

    return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
  } catch (err: unknown) {
    console.error("[registrations PATCH] error:", err);
    const message = err instanceof Error ? err.message : "服务器错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}