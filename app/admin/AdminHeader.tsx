"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from "@/context/LanguageContext"; // 👈 1. 引入 Hook
import LanguageSwitcher from "@/components/LanguageSwitcher"; // 👈 2. 引入切换按钮组件

export default function AAdminHeader() {
  const [loggingOut, setLoggingOut] = useState(false);
  const { t } = useLanguage(); // 👈 3. 获取字典 t

  async function handleLogout() {
    // 使用字典里的弹窗确认文字
    if (!confirm(t.admin.confirmLogout)) return;
    
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
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
            {/* 使用 t.admin.title 替换 "管理后台" */}
            <Link href="/admin/events" className="text-lg font-semibold text-red-600">
              {t.admin.title}
            </Link>
            
            <nav className="hidden md:flex gap-3">
              {/* 使用 t.admin.events 替换 "活动管理" */}
              <Link href="/admin/events" className="text-sm text-gray-700 hover:underline">
                {t.admin.events}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* 🌐 4. 放置语言切换按钮 */}
            <LanguageSwitcher />

            <button onClick={handleLogout} className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 transition">
              {/* 动态显示登出状态 */}
              {loggingOut ? t.admin.loggingOut : t.admin.logout}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}