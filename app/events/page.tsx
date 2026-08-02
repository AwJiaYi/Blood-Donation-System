"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type EventItem = {
  id: string;
  title: string;
  dateTime: string;
  location?: string | null;
  capacity?: number | null;
  durationMinutes?: number | null;
  remainingCapacity?: number | null;
};

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.items ?? []);
        }
      } catch (err) {
        console.error("加载活动失败:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* 顶栏栏目 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              🩸 献血活动列表
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              选择适合您的活动时间与地点，献出一份爱心
            </p>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">
                  👋 你好，{session.user?.name}
                </span>
                <Link
                  href="/user/dashboard"
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-2 rounded-lg transition"
                >
                  个人中心
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>

        {/* 活动列表 */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">正在加载最新活动...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
            近期暂无发布的献血活动。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => {
              const isFull = ev.remainingCapacity === 0;

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-xl font-bold text-slate-800 line-clamp-1">
                        {ev.title}
                      </h2>
                      {isFull ? (
                        <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium shrink-0">
                          名额已满
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium shrink-0">
                          可报名
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600 mb-6">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(ev.dateTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{ev.location || "地点另行通知"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>
                          剩余名额：
                          {ev.remainingCapacity === null ? (
                            <strong className="text-emerald-600">不限额</strong>
                          ) : (
                            <strong className={isFull ? "text-red-600" : "text-emerald-600"}>
                              {ev.remainingCapacity} 人
                            </strong>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/events/${ev.id}`}
                      className="text-sm font-semibold text-red-600 hover:text-red-700 underline"
                    >
                      查看活动详情 ➔
                    </Link>

                    <Link
                      href={`/register?eventId=${ev.id}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        isFull
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none"
                          : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                      }`}
                    >
                      {isFull ? "已满额" : "立即报名"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}