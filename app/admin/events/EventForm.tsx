"use client";

import React, { useEffect, useState } from "react";

type Props = {
  event: any | null;
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function EventForm({ event, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [location, setLocation] = useState(event?.location ?? "");
  const [dateTime, setDateTime] = useState(() => {
    if (event?.dateTime) {
      // convert ISO to input-friendly datetime-local (YYYY-MM-DDTHH:mm)
      const d = new Date(event.dateTime);
      const off = d.getTimezoneOffset();
      const local = new Date(d.getTime() - off * 60 * 1000);
      return local.toISOString().slice(0, 16);
    }
    return "";
  });
  const [capacity, setCapacity] = useState<number | "">(event?.capacity ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(event?.title ?? "");
    setDescription(event?.description ?? "");
    setLocation(event?.location ?? "");
    if (event?.dateTime) {
      const d = new Date(event.dateTime);
      const off = d.getTimezoneOffset();
      const local = new Date(d.getTime() - off * 60 * 1000);
      setDateTime(local.toISOString().slice(0, 16));
    } else {
      setDateTime("");
    }
    setCapacity(event?.capacity ?? "");
  }, [event]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title || !dateTime) {
      setError("标题和时间为必填项");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        location,
        dateTime: new Date(dateTime).toISOString(),
        capacity: capacity === "" ? null : Number(capacity),
      };

      let res: Response;
      if (event?.id) {
        res = await fetch(`/api/admin/events/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      }

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) throw new Error("保存失败");

      onSaved?.();
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{event ? '编辑活动' : '新建活动'}</h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">标题</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">时间</label>
          <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">地点</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">容量</label>
          <input value={capacity as any} onChange={(e) => setCapacity(e.target.value === '' ? '' : Number(e.target.value))} type="number" min={0} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">描述</label>
          <textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex items-center gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">取消</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">{loading ? '保存中…' : '保存'}</button>
        </div>
      </div>
    </form>
  );
}
