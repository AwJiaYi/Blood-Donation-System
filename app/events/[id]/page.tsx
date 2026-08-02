"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type EventDetail = {
  id: string;
  title: string;
  dateTime: string;
  location?: string | null;
  capacity?: number | null;
  durationMinutes?: number | null;
  remainingCapacity?: number | null;
  isExpired?: boolean;
};

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (!res.ok) throw new Error("无法加载活动详情");
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setError(err.message || "请求失败");
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-16 text-slate-500">详情加载中...</div>;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-600 mb-4 font-medium">{error || "活动不存在"}</p>
        <Link href="/events" className="text-sm underline text-slate-600">
          ← 返回活动列表
        </Link>
      </div>
    );
  }

  const isFull = event.remainingCapacity === 0;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-100 p-6 sm:p-8">
        <Link
          href="/events"
          className="inline-block text-xs font-semibold text-slate-400 hover:text-slate-600 mb-6"
        >
          ← 返回活动列表
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
          {event.title}
        </h1>

        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm text-slate-700">
          <div>
            <span className="font-semibold text-slate-900">📅 活动时间：</span>
            {new Date(event.dateTime).toLocaleString()}
            {event.durationMinutes && ` (${event.durationMinutes} 分钟)`}
          </div>
          <div>
            <span className="font-semibold text-slate-900">📍 举行地点：</span>
            {event.location || "详见现场安排"}
          </div>
          <div>
            <span className="font-semibold text-slate-900">📊 名额状态：</span>
            {event.remainingCapacity === null ? (
              <span className="text-emerald-600 font-semibold">不限名额</span>
            ) : isFull ? (
              <span className="text-red-600 font-semibold">名额已满</span>
            ) : (
              <span className="text-emerald-600 font-semibold">
                剩余 {event.remainingCapacity} 人
              </span>
            )}
          </div>
        </div>

        {/* 报名按键区域 */}
        <div className="space-y-3 pt-2">
          {event.isExpired ? (
            <button
              disabled
              className="w-full bg-slate-200 text-slate-400 py-3 rounded-xl font-bold cursor-not-allowed"
            >
              活动已结束
            </button>
          ) : (
            <Link
              href={`/register?eventId=${event.id}`}
              className={`block text-center w-full py-3.5 rounded-xl font-bold transition shadow-md ${
                isFull
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {isFull ? "名额已满" : "立即在线报名 ➔"}
            </Link>
          )}

          {!session && (
            <p className="text-center text-xs text-slate-400 pt-1">
              💡 建议先{" "}
              <Link href="/login" className="text-red-600 underline">
                登录账号
              </Link>
              ，报名时可自动填充个人资料并同步至个人仪表盘。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}