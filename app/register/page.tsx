"use client";

import { useEffect, useState, useRef } from "react";
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
  const [registrationId, setRegistrationId] = useState<string>("");
  
  const cardRef = useRef<HTMLDivElement>(null);

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

      // 获取并保存生成的 ID
      const regId = data.id || data.registrationId;
      setRegistrationId(regId);

      // 生成管理/凭证链接
      const token = data.editToken || "token";
      const url = `${window.location.origin}/register/manage?id=${regId}&token=${token}`;
      setManageUrl(url);

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 自动下载/保存凭证（通过触发打印/存为PDF）
  const handlePrintOrSave = () => {
    window.print();
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const qrCodeUrl = registrationId 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(registrationId)}` 
    : "";

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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
          /* 提交成功页面（现场出示凭证） */
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 text-center max-w-xl mx-auto border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">预约成功！</h1>
            <p className="text-gray-500 text-sm mb-6">
              请在现场出示下方二维码或预约凭证给管理员快速核验
            </p>

            {/* 可供核验的凭证卡片 */}
            <div ref={cardRef} className="bg-gradient-to-b from-red-50 to-white border-2 border-dashed border-red-200 rounded-xl p-6 mb-6">
              <div className="text-xs font-semibold text-red-500 tracking-wider uppercase mb-1">
                {selectedEvent?.title || "献血预约凭证"}
              </div>
              
              {/* 二维码区域 */}
              {qrCodeUrl && (
                <div className="flex justify-center my-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 inline-block">
                    {/* eslint-disable-next-html-link */}
                    <img src={qrCodeUrl} alt="Registration QR Code" className="w-44 h-44 mx-auto" />
                  </div>
                </div>
              )}

              {/* 高亮展示 Registration ID */}
              <div className="bg-white py-2 px-4 rounded-md shadow-inner border border-gray-200 mb-4 inline-block">
                <div className="text-xs text-gray-400">REGISTRATION ID</div>
                <div className="text-xl md:text-2xl font-mono font-bold text-red-600 tracking-wider select-all">
                  {registrationId}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-xs text-gray-600 border-t border-red-100 pt-3">
                <div><span className="font-semibold text-gray-700">预约姓名：</span>{name}</div>
                <div><span className="font-semibold text-gray-700">联系电话：</span>{phone}</div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">活动时间：</span>
                  {selectedEvent ? new Date(selectedEvent.dateTime).toLocaleString() : "-"}
                </div>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePrintOrSave}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-md shadow transition flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  保存凭证 / 存为PDF
                </button>

                {manageUrl && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(manageUrl);
                      alert("专属链接已复制到剪贴板！");
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-md shadow transition flex items-center justify-center gap-2 text-sm"
                  >
                    复制管理链接
                  </button>
                )}
              </div>

              <div>
                <Link
                  href="/"
                  className="inline-block text-sm text-gray-500 hover:text-red-600 underline py-1"
                >
                  返回首页
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}