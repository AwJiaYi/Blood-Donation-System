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
      const d = new Date(event.dateTime);
      const off = d.getTimezoneOffset();
      const local = new Date(d.getTime() - off * 60 * 1000);
      return local.toISOString().slice(0, 16);
    }
    return "";
  });
  const [capacity, setCapacity] = useState<number | "">(event?.capacity ?? "");
  const [durationMinutes, setDurationMinutes] = useState<number>(event?.durationMinutes ?? 60);
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
    setDurationMinutes(event?.durationMinutes ?? 60);
  }, [event]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title || !dateTime) {
      setError("标题和时间为必选项");
      return;
    }

    const selectedDt = new Date(dateTime);
    if (isNaN(selectedDt.getTime())) {
      setError("时间格式不正确");
      return;
    }

    const now = new Date();
    if (selectedDt.getTime() < now.getTime()) {
      setError("活动开始时间不能早于当前系统时间");
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
        durationMinutes: Number(durationMinutes ?? 60),
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

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "保存失败");
      }

      onSaved?.();
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {event ? "编辑活动" : "新建活动"}
      </h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">时间</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">地点</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">容量（最大报名人数）</label>
          <input
            value={capacity as any}
            onChange={(e) =>
              setCapacity(e.target.value === "" ? "" : Number(e.target.value))
            }
            type="number"
            min={0}
            placeholder="留空表示不限额"
            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">持续时长（分钟）</label>
          <input
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            type="number"
            min={1}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
          />
          <p className="text-xs text-gray-500 mt-1">默认 60 分钟</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">描述</label>
          <textarea
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 border"
          />
        </div>

        {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

        <div className="flex items-center gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </form>
  );
}