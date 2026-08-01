"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Registration = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string; // PENDING, APPROVED, REJECTED, CANCELLED
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
  const rawParams = useParams();
  const id = rawParams?.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // 🎯 筛选与搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, CANCELLED
  const [showCancelled, setShowCancelled] = useState(false); // 控制是否在默认列表中混入已取消的记录

  useEffect(() => {
    if (id) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { credentials: 'include' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '加载事件失败');
      }
      const data = await res.json();
      setEvent(data);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }

  // 辅助判断是否已取消
  const isCancelled = (status: string) => status?.toUpperCase() === 'CANCELLED';

  // 🎯 统计各类状态的人数
  const stats = useMemo(() => {
    const list = event?.registrations || [];
    const approved = list.filter((r) => r.status.toUpperCase() === 'APPROVED').length;
    const pending = list.filter((r) => r.status.toUpperCase() === 'PENDING').length;
    const rejected = list.filter((r) => r.status.toUpperCase() === 'REJECTED').length;
    const cancelled = list.filter((r) => isCancelled(r.status)).length;
    const activeTotal = approved + pending; // 有效预约占用数

    return { approved, pending, rejected, cancelled, activeTotal };
  }, [event?.registrations]);

  // 🎯 优化前端计算：使用 useMemo 过滤数据
  const filteredRegistrations = useMemo(() => {
    if (!event?.registrations) return [];
    return event.registrations.filter((r) => {
      const statusUpper = r.status.toUpperCase();
      
      // 如果没有勾选显示取消记录，且当前筛选不是明确看 CANCELLED 时，默认隐去 CANCELLED 记录
      if (!showCancelled && isCancelled(statusUpper) && statusFilter !== 'CANCELLED') {
        return false;
      }

      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        statusUpper === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [event?.registrations, searchTerm, statusFilter, showCancelled]);

  async function updateStatus(regId: string, status: 'APPROVED' | 'REJECTED') {
    const statusText = status === 'APPROVED' ? '批准' : '拒绝';
    if (!confirm(`确认将报名状态更改为【${statusText}】？`)) return;

    setActionLoading(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '更新失败');
      }

      // 局部刷新，前端零闪烁
      setEvent((prev) => {
        if (!prev || !prev.registrations) return prev;
        return {
          ...prev,
          registrations: prev.registrations.map((r) =>
            r.id === regId ? { ...r, status } : r
          ),
        };
      });
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteRegistration(regId: string) {
    if (!confirm('确认彻底删除该报名记录吗？此操作无法撤销。')) return;
    setActionLoading(regId);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '删除失败');
      }

      setEvent((prev) => {
        if (!prev || !prev.registrations) return prev;
        return {
          ...prev,
          registrations: prev.registrations.filter((r) => r.id !== regId),
        };
      });
    } catch (err: any) {
      alert(err.message || '删除失败');
    } finally {
      setActionLoading(null);
    }
  }

  async function exportCsv() {
    if (!confirm('确认导出当前筛选出的报名数据为 CSV 吗？')) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/events/${id}/export`, { credentials: 'include' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '导出失败');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-${id}-registrations.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || '导出失败');
    } finally {
      setExporting(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'APPROVED') {
      return <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-medium text-xs">已批准</span>;
    }
    if (upperStatus === 'REJECTED') {
      return <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-medium text-xs">已拒绝</span>;
    }
    if (upperStatus === 'CANCELLED') {
      return <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 font-medium text-xs">已取消</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-medium text-xs">待审批</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => router.push('/admin/events')}
          className="mb-4 text-sm text-gray-500 hover:text-red-600 transition flex items-center gap-1"
        >
          ← 返回活动列表
        </button>

        {loading ? (
          <div className="py-12 text-center text-gray-500">加载中…</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 font-medium">{error}</div>
        ) : !event ? (
          <div className="py-12 text-center text-gray-500">未找到事件</div>
        ) : (
          <>
            {/* 活动头部看板 */}
            <div className="border-b pb-6 mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-4">
                  <span>📅 {new Date(event.dateTime).toLocaleString()}</span>
                  <span>📍 {event.location || '未定地点'}</span>
                  <span>👥 总容量: {event.capacity ?? '无限制'}</span>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm whitespace-pre-line border border-gray-100">
                  {event.description || '暂无详细描述'}
                </p>
              </div>

              <button
                onClick={exportCsv}
                disabled={exporting}
                className="self-start px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded shadow-sm text-sm font-medium transition duration-200"
              >
                {exporting ? '正在导出...' : '📥 导出报名 CSV'}
              </button>
            </div>

            {/* 📊 数据统计卡片 (Stats Overview) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-center">
                <span className="text-xs text-green-700 font-medium block">已批准 (Approved)</span>
                <span className="text-xl font-bold text-green-800">{stats.approved}</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-center">
                <span className="text-xs text-yellow-700 font-medium block">待审批 (Pending)</span>
                <span className="text-xl font-bold text-yellow-800">{stats.pending}</span>
              </div>
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-center">
                <span className="text-xs text-red-700 font-medium block">已拒绝 (Rejected)</span>
                <span className="text-xl font-bold text-red-800">{stats.rejected}</span>
              </div>
              <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg text-center">
                <span className="text-xs text-gray-600 font-medium block">已取消 (Cancelled)</span>
                <span className="text-xl font-bold text-gray-700">{stats.cancelled}</span>
              </div>
            </div>

            {/* 🎯 搜索与筛选控制栏 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">搜索姓名或邮箱</label>
                  <input
                    type="text"
                    placeholder="输入关键字进行过滤..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                  />
                </div>
                <div className="sm:w-48">
                  <label className="block text-xs font-medium text-gray-500 mb-1">状态筛选</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                  >
                    <option value="ALL">全部状态 (All Active)</option>
                    <option value="PENDING">待审批 (Pending)</option>
                    <option value="APPROVED">已批准 (Approved)</option>
                    <option value="REJECTED">已拒绝 (Rejected)</option>
                    <option value="CANCELLED">已取消 (Cancelled)</option>
                  </select>
                </div>
              </div>

              {/* 开关：包含取消的记录 */}
              <div className="flex items-center justify-end pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={showCancelled}
                    onChange={(e) => setShowCancelled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  包含已取消的报名记录 ({stats.cancelled})
                </label>
              </div>
            </div>

            {/* 报名列表区块 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                👥 报名人员名单
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  共 {event.registrations?.length || 0} 条记录
                </span>
              </h2>
              <span className="text-xs text-gray-500">
                当前列表显示 <strong className="text-red-600">{filteredRegistrations.length}</strong> 人
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">姓名</th>
                    <th className="px-4 py-3">邮箱</th>
                    <th className="px-4 py-3">电话</th>
                    <th className="px-4 py-3">状态</th>
                    <th className="px-4 py-3 text-right">后台操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((r) => {
                      const currentStatus = r.status.toUpperCase();
                      const cancelled = isCancelled(currentStatus);

                      return (
                        <tr
                          key={r.id}
                          className={
                            cancelled
                              ? "bg-gray-50/70 opacity-60 transition-colors"
                              : "hover:bg-gray-50 transition-colors"
                          }
                        >
                          {/* 已取消的用户添加中划线与灰字样式 */}
                          <td className={`px-4 py-3 font-medium ${cancelled ? "line-through text-gray-400" : ""}`}>
                            {r.name}
                          </td>
                          <td className={`px-4 py-3 ${cancelled ? "line-through text-gray-400" : "text-gray-500"}`}>
                            {r.email}
                          </td>
                          <td className={`px-4 py-3 ${cancelled ? "text-gray-300" : "text-gray-500"}`}>
                            {r.phone || '-'}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              {!cancelled && currentStatus !== 'APPROVED' && (
                                <button
                                  disabled={actionLoading === r.id}
                                  onClick={() => updateStatus(r.id, 'APPROVED')}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition disabled:opacity-50"
                                >
                                  批准
                                </button>
                              )}
                              {!cancelled && currentStatus !== 'REJECTED' && (
                                <button
                                  disabled={actionLoading === r.id}
                                  onClick={() => updateStatus(r.id, 'REJECTED')}
                                  className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs transition disabled:opacity-50"
                                >
                                  拒绝
                                </button>
                              )}
                              <button
                                disabled={actionLoading === r.id}
                                onClick={() => deleteRegistration(r.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition disabled:opacity-50"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-400" colSpan={5}>
                        没有找到匹配过滤条件的报名人员数据
                      </td>
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