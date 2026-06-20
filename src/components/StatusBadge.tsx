"use client";

import { ReactNode } from "react";

type StatusType = "pending" | "approved" | "rejected" | "completed";

const statusMap: Record<StatusType, { label: string; cls: string }> = {
  pending: { label: "待审批", cls: "bg-yellow-100 text-yellow-800" },
  approved: { label: "已审批", cls: "bg-blue-100 text-blue-800" },
  rejected: { label: "已驳回", cls: "bg-red-100 text-red-800" },
  completed: { label: "已完成", cls: "bg-green-100 text-green-800" },
};

export function StatusBadge({ status }: { status: string }) {
  const info = statusMap[status as StatusType] || {
    label: status,
    cls: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${info.cls}`}
    >
      {info.label}
    </span>
  );
}

export function NavLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-amber-800 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-6">
          <h1 className="text-xl font-bold tracking-wide">寺院管理系统</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/" className="hover:underline underline-offset-4">
              首页
            </a>
            <a
              href="/dharma-assemblies"
              className="hover:underline underline-offset-4"
            >
              法会排期
            </a>
            <a
              href="/purchase-requests"
              className="hover:underline underline-offset-4"
            >
              采购申请
            </a>
            <a
              href="/stock-entries"
              className="hover:underline underline-offset-4"
            >
              入库登记
            </a>
            <a
              href="/stocks"
              className="hover:underline underline-offset-4"
            >
              库存查询
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
