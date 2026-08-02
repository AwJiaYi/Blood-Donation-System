"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterAccountPage() {
  const router = useRouter();
  
  // 表单状态
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [code, setCode] = useState("");
  
  // 页面阶段控制：step 1 = 填写注册信息, step 2 = 输入 6 位验证码
  const [step, setStep] = useState<1 | 2>(1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // 1. 第一步：提交注册信息并发送邮件验证码
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "注册失败");
      }

      setInfoMsg("验证码已成功发送到您的邮箱，请查收！");
      setStep(2); // 切换到输入验证码界面
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 第二步：提交 6 位验证码完成激活
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "验证失败");
      }

      // 验证成功，带参数跳转到登录页
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
          {step === 1 ? "创建新账号" : "输入邮箱验证码"}
        </h1>
        <p className="text-xs text-center text-slate-500 mb-6">
          {step === 1
            ? "注册后可轻松管理和同步您的所有预约凭证"
            : `验证码已发送至 ${formData.email}`}
        </p>

        {/* 提示与错误信息 */}
        {infoMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg mb-4">
            📩 {infoMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* 阶段 1：填写基本资料 */}
        {step === 1 && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">姓名 / 昵称</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：张三"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">电子邮箱</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">密码</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="至少 6 位数字或字母"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "正在发送验证码..." : "发送邮箱验证码"}
            </button>
          </form>
        )}

        {/* 阶段 2：输入 6 位验证码 */}
        {step === 2 && (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">6 位数验证码</label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="例如：123456"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "正在验证..." : "确认并完成注册"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setInfoMsg("");
              }}
              className="w-full text-xs text-slate-500 hover:underline text-center block pt-2"
            >
              ← 返回修改注册资料
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-500 mt-6">
          已有账号？{" "}
          <Link href="/login" className="text-red-600 hover:underline font-semibold">
            直接登录
          </Link>
        </p>
      </div>
    </div>
  );
}