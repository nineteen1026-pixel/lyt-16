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
  capacity: number;
  registrationDeadline: string | null;
  remark: string;
  createdAt: string;
  _count: {
    registrations: number;
  };
};

type Registration = {
  id: number;
  assemblyId: number;
  name: string;
  phone: string;
  createdAt: string;
};

type Conflict = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  master: string;
  hall: string;
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
  const [toast, setToast] = useState("");

  const [showRegister, setShowRegister] = useState(false);
  const [currentAssembly, setCurrentAssembly] = useState<DharmaAssembly | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [showRegistrations, setShowRegistrations] = useState(false);
  const [viewRegistrations, setViewRegistrations] = useState<Registration[]>([]);
  const [viewAssemblyName, setViewAssemblyName] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: TYPE_OPTIONS[0].value,
    master: "",
    startTime: "",
    endTime: "",
    hall: HALL_OPTIONS[0].value,
    capacity: "",
    registrationDeadline: "",
    remark: "",
  });

  const load = async () => {
    try {
      const res = await fetch("/api/dharma-assemblies");
      if (!res.ok) throw new Error();
      setAssemblies(await res.json());
    } catch {
      setToast("加载列表失败，请刷新重试");
      setTimeout(() => setToast(""), 3000);
    }
  };

  useEffect(() => {
    queueMicrotask(load);
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(() => {
        fetch("/api/dharma-assemblies")
          .then((res) => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then((data) => setAssemblies(data))
          .catch(() => {});
      }, 5000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        load();
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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

  const getRegistrationStatus = (a: DharmaAssembly) => {
    const now = new Date();
    if (a.registrationDeadline && new Date(a.registrationDeadline) < now) {
      return { text: "已截止", color: "text-gray-500 bg-gray-100", canRegister: false };
    }
    if (a.capacity > 0 && a._count.registrations >= a.capacity) {
      return { text: "已报满", color: "text-red-600 bg-red-50", canRegister: false };
    }
    if (a.capacity === 0 && !a.registrationDeadline) {
      return { text: "未开放", color: "text-gray-500 bg-gray-100", canRegister: false };
    }
    return { text: "报名中", color: "text-green-600 bg-green-50", canRegister: true };
  };

  const handleCreate = async () => {
    setErrorMsg("");
    if (!form.name || !form.master || !form.startTime || !form.endTime) {
      setErrorMsg("请填写所有必填项");
      return;
    }
    if (form.capacity && (Number(form.capacity) < 0 || !Number.isInteger(Number(form.capacity)))) {
      setErrorMsg("开放名额必须是非负整数");
      return;
    }
    const payload = { ...form };
    if (!form.capacity) {
      (payload as Partial<typeof form>).capacity = undefined;
    } else {
      (payload as typeof form).capacity = String(Number(form.capacity));
    }
    if (!form.registrationDeadline) {
      (payload as Partial<typeof form>).registrationDeadline = undefined;
    }
    const res = await fetch("/api/dharma-assemblies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
      capacity: "",
      registrationDeadline: "",
      remark: "",
    });
    setShowCreate(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此法会排期？")) return;
    try {
      const res = await fetch(`/api/dharma-assemblies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      load();
    } catch {
      setToast("删除失败，请重试");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const openRegisterModal = async (assembly: DharmaAssembly) => {
    setCurrentAssembly(assembly);
    setRegisterName("");
    setRegisterPhone("");
    setRegisterError("");
    const res = await fetch(`/api/dharma-assemblies/${assembly.id}/registrations`);
    if (res.ok) {
      const data = await res.json();
      setRegistrations(data.registrations || []);
    }
    setShowRegister(true);
  };

  const handleRegister = async () => {
    setRegisterError("");
    if (!currentAssembly) return;
    if (!registerName.trim() || !registerPhone.trim()) {
      setRegisterError("请填写姓名和联系方式");
      return;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(registerPhone.trim())) {
      setRegisterError("请输入正确的手机号码");
      return;
    }
    const res = await fetch(`/api/dharma-assemblies/${currentAssembly.id}/registrations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: registerName, phone: registerPhone }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setRegisterError(data.error || "报名失败");
      return;
    }
    const result = await res.json();

    setCurrentAssembly((prev) =>
      prev
        ? {
            ...prev,
            _count: { registrations: result.currentCount },
          }
        : prev
    );

    setRegistrations((prev) => [...prev, result.registration]);

    setAssemblies((prev) =>
      prev.map((a) =>
        a.id === currentAssembly.id
          ? { ...a, _count: { registrations: result.currentCount } }
          : a
      )
    );

    setRegisterName("");
    setRegisterPhone("");
    setToast("报名成功");
    setTimeout(() => setToast(""), 3000);
  };

  const handleDeleteRegistration = async (regId: number) => {
    if (!confirm("确定取消此报名？")) return;
    try {
      const res = await fetch(`/api/registrations/${regId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast("已取消报名");
      setTimeout(() => setToast(""), 3000);
      load();
      if (currentAssembly) {
        const listRes = await fetch(`/api/dharma-assemblies/${currentAssembly.id}/registrations`);
        if (listRes.ok) {
          const data = await listRes.json();
          setRegistrations(data.registrations || []);
        }
      }
      if (viewRegistrations.length > 0) {
        setViewRegistrations((prev) => prev.filter((r) => r.id !== regId));
      }
    } catch {
      setToast("删除报名失败，请重试");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const openViewRegistrations = async (assembly: DharmaAssembly) => {
    setViewAssemblyName(assembly.name);
    const res = await fetch(`/api/dharma-assemblies/${assembly.id}/registrations`);
    if (res.ok) {
      const data = await res.json();
      setViewRegistrations(data.registrations || []);
    }
    setShowRegistrations(true);
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
      key: "registration",
      label: "报名情况",
      render: (row: Record<string, unknown>) => {
        const a = row as unknown as DharmaAssembly;
        const status = getRegistrationStatus(a);
        const count = a._count.registrations;
        const cap = a.capacity;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>
                {status.text}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {cap > 0 ? (
                <span>
                  已报名 <span className="font-medium text-amber-800">{count}</span> / {cap} 人
                </span>
              ) : count > 0 ? (
                <span>
                  已报名 <span className="font-medium text-amber-800">{count}</span> 人
                </span>
              ) : (
                <span>不限名额</span>
              )}
            </div>
            {a.registrationDeadline && (
              <div className="text-xs text-gray-500">
                截止：{formatDateTime(a.registrationDeadline)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "操作",
      render: (row: Record<string, unknown>) => {
        const a = row as unknown as DharmaAssembly;
        const status = getRegistrationStatus(a);
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1">
              <Button
                variant="primary"
                onClick={() => openRegisterModal(a)}
                disabled={!status.canRegister}
                className="text-xs px-2 py-0.5"
              >
                {status.canRegister ? "信众报名" : "查看名单"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => openViewRegistrations(a)}
                className="text-xs px-2 py-0.5"
              >
                名单
              </Button>
            </div>
            <Button
              variant="danger"
              onClick={() => handleDelete(a.id)}
              className="text-xs px-2 py-0.5"
            >
              删除
            </Button>
          </div>
        );
      },
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
  const totalRegistrations = assemblies.reduce(
    (sum, a) => sum + a._count.registrations,
    0
  );
  const openForRegistration = assemblies.filter(
    (a) => getRegistrationStatus(a).canRegister
  ).length;

  const regColumns = [
    { key: "id", label: "编号" },
    { key: "name", label: "姓名" },
    { key: "phone", label: "联系方式" },
    {
      key: "createdAt",
      label: "报名时间",
      render: (row: Record<string, unknown>) =>
        formatDateTime(row.createdAt as string),
    },
  ];

  return (
    <NavLayout>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg animate-pulse">
          {toast}
        </div>
      )}
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
          <div className="text-2xl font-bold text-green-600">
            {openForRegistration}
          </div>
          <div className="text-xs text-gray-500 mt-1">报名中</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">累计报名人数</div>
          <div className="text-3xl font-bold text-amber-800">{totalRegistrations}</div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">殿堂数量</div>
          <div className="text-3xl font-bold text-amber-800">{halls.length - 1}</div>
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="开放名额（0为不限）">
              <Input
                type="number"
                min="0"
                step="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="如：100"
              />
            </FormField>
            <FormField label="报名截止时间">
              <Input
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
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
                  <div>举办殿堂：{c.hall}</div>
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

      <Modal
        open={showRegister}
        onClose={() => {
          setShowRegister(false);
          setCurrentAssembly(null);
          setRegisterError("");
        }}
        title={currentAssembly ? `${currentAssembly.name} - 信众报名` : "信众报名"}
      >
        <div className="flex flex-col gap-4">
          {currentAssembly && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-500">主法法师：</span>
                  <span className="font-medium text-amber-900">{currentAssembly.master}</span>
                </div>
                <div>
                  <span className="text-gray-500">时间：</span>
                  <span className="font-medium text-amber-900">
                    {formatDateTimeRange(currentAssembly.startTime, currentAssembly.endTime)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">殿堂：</span>
                  <span className="font-medium text-amber-900">{currentAssembly.hall}</span>
                </div>
                <div>
                  <span className="text-gray-500">报名情况：</span>
                  <span className="font-medium text-amber-900">
                    已报名 {currentAssembly._count.registrations}
                    {currentAssembly.capacity > 0 ? ` / ${currentAssembly.capacity}` : ""} 人
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentAssembly && getRegistrationStatus(currentAssembly).canRegister ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="姓名 *">
                  <Input
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="请输入姓名"
                  />
                </FormField>
                <FormField label="手机号 *">
                  <Input
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="请输入手机号"
                    maxLength={11}
                  />
                </FormField>
              </div>

              {registerError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {registerError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRegister(false);
                    setCurrentAssembly(null);
                    setRegisterError("");
                  }}
                >
                  关闭
                </Button>
                <Button onClick={handleRegister}>提交报名</Button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-4">
              当前法会不可报名（已截止/已报满/未开放）
            </div>
          )}

          {registrations.length > 0 && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-amber-900 mb-2">
                已报名名单（{registrations.length}人）
              </div>
              <div className="max-h-60 overflow-y-auto border rounded">
                <DataTable
                  columns={[
                    ...regColumns,
                    {
                      key: "actions",
                      label: "操作",
                      render: (row: Record<string, unknown>) => (
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteRegistration(row.id as number)}
                          className="text-xs px-2 py-0.5"
                        >
                          取消
                        </Button>
                      ),
                    },
                  ]}
                  data={registrations as unknown as Record<string, unknown>[]}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={showRegistrations}
        onClose={() => setShowRegistrations(false)}
        title={`${viewAssemblyName} - 报名名单`}
      >
        <div className="flex flex-col gap-4">
          {viewRegistrations.length > 0 ? (
            <>
              <div className="text-sm text-gray-500">
                共 <span className="font-medium text-amber-800">{viewRegistrations.length}</span> 人报名
              </div>
              <div className="max-h-96 overflow-y-auto border rounded">
                <DataTable
                  columns={[
                    ...regColumns,
                    {
                      key: "actions",
                      label: "操作",
                      render: (row: Record<string, unknown>) => (
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteRegistration(row.id as number)}
                          className="text-xs px-2 py-0.5"
                        >
                          取消报名
                        </Button>
                      ),
                    },
                  ]}
                  data={viewRegistrations as unknown as Record<string, unknown>[]}
                />
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">暂无报名记录</div>
          )}
          <div className="flex justify-end pt-2 border-t">
            <Button onClick={() => setShowRegistrations(false)}>关闭</Button>
          </div>
        </div>
      </Modal>
    </NavLayout>
  );
}
