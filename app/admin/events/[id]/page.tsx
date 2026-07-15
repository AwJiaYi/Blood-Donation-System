"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Registration = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
};

type EventDetail = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  dateTime: string;
  capacity?: number | null;
  registrations?: Registration[];
};

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { credentials: 'include' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('加载事件失败');
      const data = await res.json();
      setEvent(data);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(regId: string, status: string) {
    if (!confirm(`确认将报名 ${status}？`)) return;
    setActionLoading(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('更新失败');
      await load();
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteRegistration(regId: string) {
    if (!confirm('确认删除该报名？')) return;
    setActionLoading(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('删除失败');
      await load();
    } catch (err: any) {
      alert(err.message || '删除失败');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-red-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        {loading ? (
          <div>加载中…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !event ? (
          <div>未找到事件</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-2">{event.title}</h1>
            <div className="text-sm text-gray-600 mb-4">{new Date(event.dateTime).toLocaleString()}</div>
            <div className="mb-4 text-gray-700">{event.description}</div>
            <div className="mb-6">
              <span className="font-medium">地点: </span>{event.location || '-'}
              <span className="ml-4 font-medium">容量: </span>{event.capacity ?? '-'}
            </div>

            <h2 className="text-xl font-semibold mb-3">报名列表</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-gray-500">姓名</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-500">邮箱</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-500">电话</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-500">状态</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {event.registrations && event.registrations.length > 0 ? (
                    event.registrations.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2 text-sm">{r.name}</td>
                        <td className="px-4 py-2 text-sm">{r.email}</td>
                        <td className="px-4 py-2 text-sm">{r.phone || '-'}</td>
                        <td className="px-4 py-2 text-sm">{r.status}</td>
                        <td className="px-4 py-2 text-sm">
                          <div className="flex gap-2">
                            {r.status !== 'approved' && (
                              <button disabled={actionLoading === r.id} onClick={() => updateStatus(r.id, 'approved')} className="px-2 py-1 bg-green-500 text-white rounded text-sm">批准</button>
                            )}
                            {r.status !== 'rejected' && (
                              <button disabled={actionLoading === r.id} onClick={() => updateStatus(r.id, 'rejected')} className="px-2 py-1 bg-yellow-400 rounded text-sm">拒绝</button>
                            )}
                            <button disabled={actionLoading === r.id} onClick={() => deleteRegistration(r.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">删除</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-sm" colSpan={5}>暂无报名</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
