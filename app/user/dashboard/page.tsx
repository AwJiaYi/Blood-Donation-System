"use client";

import React, { useState } from 'react';

export default function BindRegistrationForm({ onBound }: { onBound?: () => void }) {
  const [id, setId] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/user/registrations/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, editToken: token }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || '绑定失败');

      setMsg({ text: '🎉 成功将访客预约绑定至当前账号！', isError: false });
      setId('');
      setToken('');
      onBound?.();
    } catch (err: any) {
      setMsg({ text: err.message || '绑定失败', isError: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">🔗 绑定历史访客报名</h3>
      <p className="text-xs text-gray-500 mb-4">
        如果您之前在未登录状态下提交过报名，可以输入 Registration ID 和凭证 Token 将其关联到此账号。
      </p>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="输入 Registration ID"
          required
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="输入 Edit Token"
          required
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? '绑定中…' : '立即绑定'}
        </button>
      </form>

      {msg && (
        <div className={`mt-3 text-xs ${msg.isError ? 'text-red-600' : 'text-green-600'}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}