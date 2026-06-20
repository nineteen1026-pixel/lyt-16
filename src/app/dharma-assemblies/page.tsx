"use client";

import { useEffect, useState } from "react";
import { NavLayout } from "@/components/StatusBadge";
import { DataTable, FormField, Input, Button, Modal, Select } from "@/components/ui";

type DharmaAssembly = {
  id: number;
  name: string;
  type: string;
  master: string;
  startTime: string;
  endTime: string;
  hall: string;
  remark: string;
  createdAt: string;
};

type Conflict = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  master: string;
};

const HALL_OPTIONS = [
  { value: "大雄宝殿", label: "大雄宝殿" },
  { value: "天王殿", label: "天王殿" },
  { value: "观音殿", label: "观音殿" },
  { value: "地藏殿", label: "地藏殿" },
  { value: "药师殿", label: "药师殿" },
  { value: "藏经阁", label: "藏经阁" },
  { value: "法堂", label: "法堂" },
  { value: "禅堂", label: "禅堂" },
];

const TYPE_OPTIONS = [
  { value: "祈福法会", label: "祈福法会" },
  { value: "超度法会", label: "超度法会" },
  { value: "皈依仪式", label: "皈依仪式" },
  { value: "授戒仪式", label: "授戒仪式" },
  { value: "讲经说法", label: "讲经说法" },
  { value: "水陆法会", label: "水陆法会" },
  { value: "焰口法会", label: "焰口法会" },
  { value: "其他", label: "其他" },
];

export default function DharmaAssembliesPage() {
  const [assemblies, setAssemblies] = useState<DharmaAssembly[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [hallFilter, setHallFilter] = useState("all");
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflict, setShowConflict] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: TYPE_OPTIONS[0].value,
    master: "",
    startTime: "",
    endTime: "",
    hall: HALL_OPTIONS[0].value,
    remark: "",
  });

  const load = async () => {
    const res = await fetch("/api/dharma-assemblies");
    setAssemblies(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const halls = ["all", ...HALL_OPTIONS.map((h) => h.value)];

  const filtered =
    hallFilter === "all"
      ? assemblies
      : assemblies.filter((a) => a.hall === hallFilter);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTimeRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const sameDay = s.toDateString() === e.toDateString();
    if (sameDay) {
      return `${s.toLocaleDateString("zh-CN")} ${s.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${e.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return `${formatDateTime(start)} ~ ${formatDateTime(end)}`;
  };

  const handleCreate = async () => {
    setErrorMsg("");
    if (!form.name || !form.master || !form.startTime || !form.endTime) {
      setErrorMsg("请填写所有必填项");
      return;
    }
    const res = await fetch("/api/dharma-assemblies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.status === 409) {
      const data = await res.json();
      setConflicts(data.conflicts || []);
      setShowConflict(true);
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error || "提交失败");
      return;
    }
    setForm({
      name: "",
      type: TYPE_OPTIONS[0].value,
      master: "",
      startTime: "",
      endTime: "",
      hall: HALL_OPTIONS[0].value,
      remark: "",
    });
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此法会排期？")) return;
    await fetch(`/api/dharma-assemblies/${id}`, { method: "DELETE" });
    load();
  };

  const columns = [
    { key: "id", label: "编号" },
    { key: "name", label: "法会名称" },
    { key: "type", label: "类型" },
    { key: "master", label: "主法法师" },
    {
      key: "time",
      label: "起止时间",
      render: (row: Record<string, unknown>) =>
        formatDateTimeRange(row.startTime as string, row.endTime as string),
    },
    { key: "hall", label: "举办殿堂" },
    {
      key: "actions",
      label: "操作",
      render: (row: Record<string, unknown>) => (
        <Button
          variant="danger"
          onClick={() => handleDelete(row.id as number)}
          className="text-xs px-2 py-0.5"
        >
          删除
        </Button>
      ),
    },
  ];

  const now = new Date();
  const upcoming = assemblies.filter(
    (a) => new Date(a.endTime) >= now
  ).length;
  const todayCount = assemblies.filter((a) => {
    const s = new Date(a.startTime);
    const e = new Date(a.endTime);
    const today = new Date();
    return (
      s.toDateString() === today.toDateString() ||
      e.toDateString() === today.toDateString() ||
      (s < today && e > today)
    );
  }).length;

  return (
    <NavLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-900">法会排期</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">殿堂筛选：</span>
          <select
            value={hallFilter}
            onChange={(e) => setHallFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {halls.map((h) => (
              <option key={h} value={h}>
                {h === "all" ? "全部殿堂" : h}
              </option>
            ))}
          </select>
          <Button onClick={() => setShowCreate(true)}>新建排期</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-800">{assemblies.length}</div>
          <div className="text-xs text-gray-500 mt-1">排期总数</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-800">{upcoming}</div>
          <div className="text-xs text-gray-500 mt-1">即将举行</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-red-600">{todayCount}</div>
          <div className="text-xs text-gray-500 mt-1">今日法会</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-800">
            {halls.length - 1}
          </div>
          <div className="text-xs text-gray-500 mt-1">殿堂数量</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
        />
      </div>

      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setErrorMsg("");
        }}
        title="新建法会排期"
      >
        <div className="flex flex-col gap-4">
          <FormField label="法会名称 *">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：浴佛节祈福法会"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="法会类型 *">
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="举办殿堂 *">
              <Select
                value={form.hall}
                onChange={(e) => setForm({ ...form, hall: e.target.value })}
                options={HALL_OPTIONS}
              />
            </FormField>
          </div>
          <FormField label="主法法师 *">
            <Input
              value={form.master}
              onChange={(e) => setForm({ ...form, master: e.target.value })}
              placeholder="如：释明心法师"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="开始时间 *">
              <Input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </FormField>
            <FormField label="结束时间 *">
              <Input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="备注">
            <Input
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              placeholder="选填"
            />
          </FormField>

          {errorMsg && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreate(false);
                setErrorMsg("");
              }}
            >
              取消
            </Button>
            <Button onClick={handleCreate}>提交排期</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showConflict}
        onClose={() => setShowConflict(false)}
        title="时段冲突"
      >
        <div className="flex flex-col gap-4">
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            <div className="font-medium">该殿堂在所选时段已被占用，详情如下：</div>
          </div>
          <div className="space-y-3">
            {conflicts.map((c) => (
              <div
                key={c.id}
                className="border border-amber-200 rounded p-3 bg-amber-50/50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-amber-900">{c.name}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>主法法师：{c.master}</div>
                  <div>占用时段：{formatDateTimeRange(c.startTime, c.endTime)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            请调整时间或更换其他殿堂后再提交。
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowConflict(false)}>我知道了</Button>
          </div>
        </div>
      </Modal>
    </NavLayout>
  );
}
