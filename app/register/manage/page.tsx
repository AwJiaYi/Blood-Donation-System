// app/register/manage/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type RegistrationEvent = {
  title: string;
  dateTime: string;
  location: string | null;
};

type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  event: RegistrationEvent | null;
};

function statusDisplay(status?: string) {
  const key = (status || "pending").toLowerCase();
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "待审核", className: "bg-amber-100 text-amber-800" },
    approved: { label: "已通过", className: "bg-green-100 text-green-800" },
    rejected: { label: "已拒绝", className: "bg-red-100 text-red-800" },
    cancelled: { label: "已取消", className: "bg-red-100 text-red-800" },
  };
  return map[key] ?? { label: status || "待审核", className: "bg-gray-100 text-gray-700" };
}

function ManageContent() {
  const searchParams = useSearchParams();
  const regId = searchParams.get("id");
  const tokenParam = searchParams.get("token");

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingCancel, setProcessingCancel] = useState(false);

  useEffect(() => {
    if (!regId) {
      setLoadError("缺少预约 ID，请检查链接是否完整");
      setLoading(false);
      return;
    }

    const id = regId.trim();
    if (!id) {
      setLoadError("缺少预约 ID，请检查链接是否完整");
      setLoading(false);
      return;
    }

    if (!tokenParam?.trim()) {
      setLoadError("缺少访问凭证 token，请使用报名成功后提供的完整管理链接");
      setLoading(false);
      return;
    }

    const accessToken = tokenParam.trim();
    let cancelled = false;

    async function fetchRegistration() {
      try {
        setLoading(true);
        setLoadError(null);
        const tokenQuery = `?token=${encodeURIComponent(accessToken)}`;
        const res = await fetch(`/api/registrations/${encodeURIComponent(id)}${tokenQuery}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "无法加载预约信息");
        }
        if (!cancelled) {
          setRegistration(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "获取预约失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRegistration();
    return () => {
      cancelled = true;
    };
  }, [regId, tokenParam]);

  const qrCodeUrl = useMemo(() => {
    if (!regId) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(regId)}`;
  }, [regId]);

  const status = statusDisplay(registration?.status);

  const canCancel = (registration?.status || "").toLowerCase() === "pending";

  async function handleCancel() {
    if (!registration?.id || !tokenParam?.trim()) return;
    const ok = window.confirm("确定要取消此预约吗？取消后将无法恢复。");
    if (!ok) return;

    setProcessingCancel(true);
    setActionError(null);
    try {
      const id = registration.id;
      const tokenQuery = `?token=${encodeURIComponent(tokenParam.trim())}`;
      const res = await fetch(`/api/registrations/${encodeURIComponent(id)}${tokenQuery}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "取消预约失败");
      }
      setRegistration((r) => (r ? { ...r, status: "CANCELLED" } : r));
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "取消预约失败");
    } finally {
      setProcessingCancel(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center text-gray-600 font-medium">正在加载预约凭证…</div>
      </div>
    );
  }

  if (loadError || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-red-100">
          <div className="text-red-600 font-semibold mb-2">无法显示凭证</div>
          <p className="text-sm text-gray-600 mb-6">{loadError || "预约不存在"}</p>
          <Link href="/register" className="text-sm text-red-600 hover:underline">
            返回报名页
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = (registration.status || "").toLowerCase() === "cancelled";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-10 px-4">
      <main className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center border border-red-50">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">您的献血预约凭证</h1>
          <p className="text-gray-500 text-sm mb-6">出示此页面即可进行现场签到核验</p>

          <div className="bg-gradient-to-b from-red-50 to-white border-2 border-dashed border-red-200 rounded-xl p-6 mb-6 text-left">
            <div className="text-xs font-semibold text-red-500 tracking-wider uppercase mb-1 text-center">
              {registration.event?.title || "献血预约凭证"}
            </div>

            {!isCancelled && qrCodeUrl && (
              <div className="flex justify-center my-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="预约核验二维码" className="w-44 h-44" />
                </div>
              </div>
            )}

            <div className="bg-white py-2 px-4 rounded-md shadow-inner border border-gray-200 mb-4 text-center">
              <div className="text-xs text-gray-400">REGISTRATION ID</div>
              <div className="text-lg md:text-xl font-mono font-bold text-red-600 tracking-wide break-all select-all">
                {regId}
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700 border-t border-red-100 pt-4">
              <div>
                <dt className="font-semibold text-gray-800">预约姓名</dt>
                <dd>{registration.name}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800">联系电话</dt>
                <dd>{registration.phone || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-gray-800">电子邮箱</dt>
                <dd className="break-all">{registration.email}</dd>
              </div>
              {registration.event?.dateTime && (
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-gray-800">活动时间</dt>
                  <dd>{new Date(registration.event.dateTime).toLocaleString()}</dd>
                </div>
              )}
              {registration.event?.location && (
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-gray-800">地点</dt>
                  <dd>{registration.event.location}</dd>
                </div>
              )}
              <div className="sm:col-span-2 flex items-center gap-2">
                <dt className="font-semibold text-gray-800">状态</dt>
                <dd>
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${status.className}`}>
                    {status.label}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-md shadow transition text-sm"
            >
              保存凭证 / 打印
            </button>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-md hover:bg-gray-50 transition text-sm"
            >
              返回首页
            </Link>
          </div>

          {canCancel && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={processingCancel}
                className="w-full bg-gray-50 hover:bg-gray-100 text-red-600 border border-red-200 font-semibold py-2 px-4 rounded-md transition text-sm disabled:opacity-60"
              >
                {processingCancel ? "取消中…" : "取消预约"}
              </button>
            </div>
          )}

          {isCancelled && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-100">
                已取消
              </div>
            </div>
          )}

          {actionError && <div className="mt-3 text-sm text-red-600">{actionError}</div>}
        </div>
      </main>
    </div>
  );
}

export default function ManageRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="text-gray-600">加载中…</div>
        </div>
      }
    >
      <ManageContent />
    </Suspense>
  );
}
