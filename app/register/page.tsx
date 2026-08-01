"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type EventItem = {
  id: string;
  title: string;
  dateTime: string;
  location?: string | null;
  capacity?: number | null;
  durationMinutes?: number | null;
  remainingCapacity?: number | null;
};

export default function Register() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [remaining, setRemaining] = useState<number | null | undefined>(undefined);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [manageUrl, setManageUrl] = useState<string>("");

  // 1. 表单字段定义
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("无法获取活动列表");
        const body = await res.json();
        setEvents(body.items ?? []);
      } catch (err) {
        console.error("加载活动失败:", err);
      } finally {
        setLoadingEvents(false);
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setRemaining(undefined);
      return;
    }
    const ev = events.find((e) => e.id === selectedEventId);
    if (!ev) {
      setRemaining(undefined);
      return;
    }
    setRemaining(ev.remainingCapacity ?? null);
  }, [selectedEventId, events]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (remaining === 0) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          name,
          email,
          phone,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "报名失败，请稍后重试");
      }

      // 生成带有 id 和 editToken 的管理链接
      if (data.id && data.editToken) {
        const url = `${window.location.origin}/register/manage?id=${data.id}&token=${data.editToken}`;
        setManageUrl(url);
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8">
      <main className="container mx-auto px-4 max-w-3xl">
        {!submitted ? (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6 text-center">
              献血在线预约登记
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 活动选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择献血活动 *
                </label>
                {loadingEvents ? (
                  <div className="text-sm text-gray-500 py-2">加载活动列表中...</div>
                ) : (
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500 border"
                  >
                    <option value="">-- 请选择活动 --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} — {new Date(ev.dateTime).toLocaleString()}
                        {ev.durationMinutes ? ` (${ev.durationMinutes}分钟)` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {selectedEventId && remaining !== undefined && (
                  <p className="text-sm mt-1.5 font-medium text-gray-700">
                    剩余名额：
                    {remaining === null ? (
                      <span className="text-green-600">不限额</span>
                    ) : remaining > 0 ? (
                      <span className="text-green-600">{remaining} 人</span>
                    ) : (
                      <span className="text-red-600">名额已满</span>
                    )}
                  </p>
                )}
              </div>

              {/* 个人基本信息 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 / Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm border"
                  placeholder="请输入您的姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  电子邮箱 / Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm border"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  联系电话 / Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm border"
                  placeholder="012-3456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注 / Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm border"
                  placeholder="如：第一次献血、特定血型等（可选）"
                />
              </div>

              {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

              <div className="flex items-center justify-between pt-4">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-red-600 underline"
                >
                  返回首页
                </Link>
                <button
                  type="submit"
                  disabled={submitting || remaining === 0}
                  className={`bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition-colors ${
                    remaining === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {remaining === 0
                    ? "名额已满"
                    : submitting
                    ? "提交中..."
                    : "立即提交报名"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 提交成功页面 */
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-2">预约成功！</h1>
            <p className="text-gray-600 mb-6">
              感谢您的无私奉献！请妥善保存下方专属管理链接，您可用它随时修改或取消预约。
            </p>

            {manageUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  您的专属管理/凭证链接：
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={manageUrl}
                    className="w-full text-xs bg-white border border-gray-300 rounded p-2 text-gray-700 select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(manageUrl);
                      alert("专属链接已复制到剪贴板！");
                    }}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded whitespace-nowrap"
                  >
                    复制链接
                  </button>
                </div>
              </div>
            )}

            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-md shadow-md"
            >
              返回首页
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}