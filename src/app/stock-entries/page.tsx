"use client";

import { useEffect, useState } from "react";
import { NavLayout } from "@/components/StatusBadge";
import { DataTable, FormField, Input, Button, Modal, Select } from "@/components/ui";

type Material = { id: number; name: string; category: string; unit: string };
type EntryItem = {
  id: number;
  materialId: number;
  quantity: number;
  remark: string;
  material: Material;
};
type StockEntry = {
  id: number;
  operator: string;
  remark: string;
  createdAt: string;
  items: EntryItem[];
};

export default function StockEntriesPage() {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({ operator: "", remark: "" });
  const [formItems, setFormItems] = useState<
    { materialId: number; quantity: number; remark: string }[]
  >([{ materialId: 0, quantity: 1, remark: "" }]);

  const load = async () => {
    const [eRes, mRes] = await Promise.all([
      fetch("/api/stock-entries"),
      fetch("/api/materials"),
    ]);
    setEntries(await eRes.json());
    setMaterials(await mRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const items = formItems.filter((it) => it.materialId > 0);
    if (!form.operator || items.length === 0) return;
    await fetch("/api/stock-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    setForm({ operator: "", remark: "" });
    setFormItems([{ materialId: 0, quantity: 1, remark: "" }]);
    setShowCreate(false);
    load();
  };

  const addFormItem = () =>
    setFormItems([...formItems, { materialId: 0, quantity: 1, remark: "" }]);

  const removeFormItem = (idx: number) => {
    if (formItems.length <= 1) return;
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const updateFormItem = (
    idx: number,
    field: string,
    value: string | number
  ) => {
    const next = [...formItems];
    (next[idx] as Record<string, string | number>)[field] = value;
    setFormItems(next);
  };

  const columns = [
    { key: "id", label: "编号" },
    { key: "operator", label: "经办人" },
    {
      key: "items",
      label: "入库物资",
      render: (row: Record<string, unknown>) => {
        const items = row.items as EntryItem[];
        return items
          .map((it) => `${it.material.name}×${it.quantity}${it.material.unit}`)
          .join("、");
      },
    },
    { key: "remark", label: "备注" },
    {
      key: "createdAt",
      label: "入库时间",
      render: (row: Record<string, unknown>) =>
        new Date(row.createdAt as string).toLocaleString("zh-CN"),
    },
  ];

  return (
    <NavLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-900">入库登记</h2>
        <Button onClick={() => setShowCreate(true)}>新建入库</Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable columns={columns} data={entries as unknown as Record<string, unknown>[]} />
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="新建入库登记"
      >
        <div className="flex flex-col gap-4">
          <FormField label="经办人">
            <Input
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value })}
              placeholder="如：释常净"
            />
          </FormField>
          <FormField label="备注">
            <Input
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              placeholder="选填"
            />
          </FormField>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                入库物资
              </span>
              <Button variant="secondary" onClick={addFormItem}>
                + 添加
              </Button>
            </div>
            {formItems.map((it, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <Select
                    value={String(it.materialId)}
                    onChange={(e) =>
                      updateFormItem(idx, "materialId", Number(e.target.value))
                    }
                    options={[
                      { value: "0", label: "选择物资" },
                      ...materials.map((m) => ({
                        value: String(m.id),
                        label: `${m.name}（${m.category}/${m.unit}）`,
                      })),
                    ]}
                  />
                </div>
                <Input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) =>
                    updateFormItem(idx, "quantity", Number(e.target.value))
                  }
                  className="w-20"
                />
                <Input
                  value={it.remark}
                  onChange={(e) =>
                    updateFormItem(idx, "remark", e.target.value)
                  }
                  placeholder="备注"
                  className="w-28"
                />
                <Button
                  variant="danger"
                  onClick={() => removeFormItem(idx)}
                  className="text-xs px-2"
                >
                  删
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              取消
            </Button>
            <Button onClick={handleCreate}>确认入库</Button>
          </div>
        </div>
      </Modal>
    </NavLayout>
  );
}
