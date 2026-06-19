"use client";

import { useEffect, useState } from "react";
import { NavLayout } from "@/components/StatusBadge";
import { DataTable } from "@/components/ui";

type Material = { id: number; name: string; category: string; unit: string };
type Stock = {
  id: number;
  materialId: number;
  quantity: number;
  updatedAt: string;
  material: Material;
};

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const load = async () => {
    const res = await fetch("/api/stocks");
    setStocks(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  const categories = ["all", ...Array.from(new Set(stocks.map((s) => s.material.category)))];

  const filtered =
    categoryFilter === "all"
      ? stocks
      : stocks.filter((s) => s.material.category === categoryFilter);

  const totalKinds = filtered.length;
  const lowStock = filtered.filter((s) => s.quantity < 10).length;

  const columns = [
    { key: "id", label: "编号" },
    { key: "name", label: "物资名称", render: (row: Record<string, unknown>) => (row.material as Material).name },
    { key: "category", label: "分类", render: (row: Record<string, unknown>) => (row.material as Material).category },
    { key: "unit", label: "单位", render: (row: Record<string, unknown>) => (row.material as Material).unit },
    {
      key: "quantity",
      label: "库存数量",
      render: (row: Record<string, unknown>) => {
        const q = row.quantity as number;
        return (
          <span className={q < 10 ? "text-red-600 font-semibold" : ""}>
            {q}
          </span>
        );
      },
    },
    {
      key: "updatedAt",
      label: "更新时间",
      render: (row: Record<string, unknown>) =>
        new Date(row.updatedAt as string).toLocaleDateString("zh-CN"),
    },
  ];

  return (
    <NavLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-900">库存查询</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">分类筛选：</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "全部" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-800">{totalKinds}</div>
          <div className="text-xs text-gray-500 mt-1">物资种类</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-800">
            {filtered.reduce((sum, s) => sum + s.quantity, 0).toFixed(0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">库存总量</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-red-600">{lowStock}</div>
          <div className="text-xs text-gray-500 mt-1">低库存预警</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-amber-800">
            {categories.length - 1}
          </div>
          <div className="text-xs text-gray-500 mt-1">物资分类</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable columns={columns} data={filtered as unknown as Record<string, unknown>[]} />
      </div>
    </NavLayout>
  );
}
