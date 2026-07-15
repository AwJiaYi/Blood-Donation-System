"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EventForm from "./EventForm";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  dateTime: string;
  capacity?: number | null;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", { credentials: "include" });
      if (res.status === 401) {
        // Not logged in, redirect to login
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err: any) {
      setError(err.message || "加载事件失败");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(ev: EventItem) {
    setEditing(ev);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除该活动？")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("删除失败");
      await load();
    } catch (err: any) {
      alert(err.message || "删除失败");
    }
  }

  async function onSaved() {
    setShowForm(false);
    setEditing(null);
    await load();
  }

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-red-600">活动管理</h1>
          <div className="space-x-2">
            <Link href="/" className="text-sm text-gray-600 hover:underline">
              返回首页
            </Link>
            <button
              onClick={openCreate}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              新建活动
            </button>
          </div>
        </div>

        {loading ? (
          <div>加载中…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">地点</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">容量</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{e.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(e.dateTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.location || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{e.capacity ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(e)} className="px-3 py-1 bg-yellow-400 rounded text-sm">编辑</button>
                        <button onClick={() => handleDelete(e.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">删除</button>
                        <Link href={`/admin/events/${e.id}`} className="px-3 py-1 bg-gray-200 rounded text-sm">详情</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
              <EventForm event={editing} onSaved={onSaved} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
