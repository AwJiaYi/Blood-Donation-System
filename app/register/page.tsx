"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

function RegisterForm() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const defaultEventId = searchParams.get("eventId") || "";

  // 基础表单状态
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bloodType: "A",
    eventId: defaultEventId,
  });

  const [events, setEvents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    registrationId?: string;
    editToken?: string;
  } | null>(null);

  // 1. 加载可用活动列表
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.items ?? []);
        }
      } catch (err) {
        console.error("加载活动列表失败:", err);
      }
    }
    fetchEvents();
  }, []);

  // 2. 如果用户已登录，自动填充姓名和邮箱
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: "预约成功！",
          registrationId: data.registration?.id || data.id,
          editToken: data.editToken || data.registration?.editToken,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "报名失败，请稍后重试",
        });
      }
    } catch (err) {
      setResult({ success: false, message: "网络错误，请稍后重试" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">🩸 在线献血预约</h1>
          <Link href="/events" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
            ← 活动列表
          </Link>
        </div>

        {/* 登录状态提示条 */}
        {status === "authenticated" ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg p-3 mb-6 flex items-center justify-between">
            <span>✅ 已登录账号：<strong>{session.user?.email}</strong>（资料已自动预填）</span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mb-6 flex items-center justify-between">
            <span>💡 当前为<strong>访客身份</strong>。建议先登录以同步预约到个人仪表盘。</span>
            <Link href="/login" className="font-bold underline ml-2 shrink-0">
              去登录
            </Link>
          </div>
        )}

        {result?.success ? (
          /* 报名成功结果卡片 */
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
            <div className="text-3xl">🎉</div>
            <h2 className="text-xl font-bold text-emerald-900">{result.message}</h2>
            <p className="text-xs text-slate-600">请保存好您的预约凭证信息：</p>
            
            <div className="bg-white p-4 rounded-lg border border-emerald-100 text-left space-y-2 text-xs font-mono">
              <div><span className="text-slate-400">Registration ID:</span> <br/><strong className="text-slate-800 select-all">{result.registrationId}</strong></div>
              {result.editToken && (
                <div><span className="text-slate-400">Edit Token:</span> <br/><strong className="text-slate-800 select-all">{result.editToken}</strong></div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                href="/user/dashboard"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg text-sm transition"
              >
                前往个人仪表盘
              </Link>
              <button
                onClick={() => setResult(null)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-lg text-sm transition"
              >
                继续预约
              </button>
            </div>
          </div>
        ) : (
          /* 表单区域 */
          <form onSubmit={handleSubmit} className="space-y-4">
            {result?.success === false && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                ⚠️ {result.message}
              </div>
            )}

            {/* 活动选择 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                选择献血活动 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">-- 请选择活动 --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({new Date(ev.dateTime).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* 姓名 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入您的真实姓名"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                电子邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@domain.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* 电话 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                联系电话
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号码"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* 血型 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                血型
              </label>
              <select
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="A">A 型</option>
                <option value="B">B 型</option>
                <option value="AB">AB 型</option>
                <option value="O">O 型</option>
                <option value="UNKNOWN">不确定</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? "提交中..." : "确认提交预约"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">页面加载中...</div>}>
      <RegisterForm />
    </Suspense>
  );
}