"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EventForm from "./EventForm";
import { useLanguage } from "@/context/LanguageContext"; // 👈 1. 导入 Hook
import LanguageSwitcher from "@/components/LanguageSwitcher"; // 👈 2. 导入切换按钮

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  dateTime: string;
  capacity?: number | null;
  activeRegistrations?: number;
  remainingCapacity?: number | null;
};

export default function AdminEventsPage() {
  const { t } = useLanguage(); // 👈 3. 获取字典 t
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
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err: any) {
      setError(err.message || t.adminEvents.loadFailed);
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
    if (!confirm(t.adminEvents.confirmDelete)) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error(t.adminEvents.deleteFailed);
      await load();
    } catch (err: any) {
      alert(err.message || t.adminEvents.deleteFailed);
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
          <h1 className="text-2xl font-bold text-red-600">{t.adminEvents.pageTitle}</h1>
          
          <div className="flex items-center gap-3">
            {/* 🌐 语言切换按钮 */}
            <LanguageSwitcher />

            <Link href="/" className="text-sm text-gray-600 hover:underline">
              {t.adminEvents.backHome}
            </Link>
            
            <button
              onClick={openCreate}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              {t.adminEvents.createBtn}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600">{t.adminEvents.loading}</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminEvents.table.title}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminEvents.table.time}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminEvents.table.location}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminEvents.table.capacity}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminEvents.table.remaining}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.adminEvents.table.actions}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(e.dateTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.location || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.capacity ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {e.remainingCapacity == null ? t.adminEvents.table.unlimited : e.remainingCapacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(e)} className="px-3 py-1 bg-yellow-400 rounded text-sm hover:bg-yellow-500 transition">
                          {t.adminEvents.table.edit}
                        </button>
                        <button onClick={() => handleDelete(e.id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition">
                          {t.adminEvents.table.delete}
                        </button>
                        <Link href={`/admin/events/${e.id}`} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition">
                          {t.adminEvents.table.details}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      {t.adminEvents.table.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
              <EventForm event={editing} onSaved={onSaved} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}