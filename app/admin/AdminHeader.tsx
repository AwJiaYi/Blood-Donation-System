"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminHeader() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (!confirm('确定要登出吗？')) return;
    setLoggingOut(true);
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      // Regardless of response, redirect to login
      window.location.href = '/admin/login';
    } catch (err) {
      console.error(err);
      window.location.href = '/admin/login';
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/events" className="text-lg font-semibold text-red-600">管理后台</Link>
            <nav className="hidden md:flex gap-3">
              <Link href="/admin/events" className="text-sm text-gray-700 hover:underline">活动管理</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="px-3 py-1 bg-gray-100 rounded text-sm">
              {loggingOut ? '登出中…' : '登出'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
