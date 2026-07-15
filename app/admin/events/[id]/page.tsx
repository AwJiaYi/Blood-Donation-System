"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Registration = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string; // PENDING, APPROVED, REJECTED
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
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

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

  // 🎯 优化前端计算：使用 useMemo 提高大规模数据下的实时过滤和检索性能
  const filteredRegistrations = useMemo(() => {
    if (!event?.registrations) return [];
    return event.registrations.filter((r) => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        r.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [event?.registrations, searchTerm, statusFilter]);

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
        credentials: 'include' 
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
      return <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-medium text-xs">已批准</span>;
    }
    if (upperStatus === 'REJECTED') {
      return <span className="px-2 py-1 rounded bg-red-100 text-red-800 font-medium text-xs">已拒绝</span>;
    }
    return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium text-xs">待审批</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
            <div className="border-b pb-4 mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-4">
                  <span>📅 {new Date(event.dateTime).toLocaleString()}</span>
                  <span>📍 {event.location || '未定地点'}</span>
                  <span>👥 容量: {event.capacity ?? '无限制'}</span>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm whitespace-pre-line">
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

            {/* 🎯 搜索与筛选控制栏 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">搜索姓名或邮箱</label>
                <input
                  type="text"
                  placeholder="输入关键字进行过滤..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                />
              </div>
              <div className="sm:w-48">
                <label className="block text-xs font-medium text-gray-500 mb-1">状态筛选</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                >
                  <option value="ALL">全部 (All)</option>
                  <option value="PENDING">待审批 (Pending)</option>
                  <option value="APPROVED">已批准 (Approved)</option>
                  <option value="REJECTED">已拒绝 (Rejected)</option>
                </select>
              </div>
            </div>

            {/* 报名列表区块 */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                👥 报名人员名单 
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  已加载 {event.registrations?.length || 0} 人
                </span>
              </h2>
              {searchTerm || statusFilter !== 'ALL' ? (
                <span className="text-xs text-gray-500">
                  当前筛选出 <strong className="text-red-600">{filteredRegistrations.length}</strong> 人
                </span>
              ) : null}
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
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium">{r.name}</td>
                          <td className="px-4 py-3 text-gray-500">{r.email}</td>
                          <td className="px-4 py-3 text-gray-500">{r.phone || '-'}</td>
                          <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              {currentStatus !== 'APPROVED' && (
                                <button 
                                  disabled={actionLoading === r.id} 
                                  onClick={() => updateStatus(r.id, 'APPROVED')} 
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition disabled:opacity-50"
                                >
                                  批准
                                </button>
                              )}
                              {currentStatus !== 'REJECTED' && (
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