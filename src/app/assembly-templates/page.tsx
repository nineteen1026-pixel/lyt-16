"use client";

import { useEffect, useState } from "react";
import { NavLayout } from "@/components/StatusBadge";
import { DataTable, FormField, Input, Button, Modal, Select } from "@/components/ui";

type Material = { id: number; name: string; category: string; unit: string };

type TemplateItem = {
  id: number;
  templateId: number;
  materialId: number;
  quantity: number;
  remark: string;
  material: Material;
};

type AssemblyTemplate = {
  id: number;
  type: string;
  name: string;
  remark: string;
  createdAt: string;
  items: TemplateItem[];
};

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

export default function AssemblyTemplatesPage() {
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<AssemblyTemplate | null>(null);

  const [form, setForm] = useState({
    type: TYPE_OPTIONS[0].value,
    name: "",
    remark: "",
  });

  const [formItems, setFormItems] = useState<
    { materialId: number; quantity: number; remark: string }[]
  >([{ materialId: 0, quantity: 1, remark: "" }]);

  const load = async () => {
    const [tRes, mRes] = await Promise.all([
      fetch("/api/assembly-templates"),
      fetch("/api/materials"),
    ]);
    setTemplates(await tRes.json());
    setMaterials(await mRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const items = formItems.filter((it) => it.materialId > 0);
    if (!form.type || !form.name || items.length === 0) return;
    const res = await fetch("/api/assembly-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "创建失败");
      return;
    }
    setForm({ type: TYPE_OPTIONS[0].value, name: "", remark: "" });
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
    { key: "type", label: "法会类型" },
    { key: "name", label: "模板名称" },
    {
      key: "itemCount",
      label: "物资数",
      render: (row: Record<string, unknown>) =>
        (row.items as unknown[])?.length || 0,
    },
    { key: "remark", label: "备注" },
    {
      key: "createdAt",
      label: "创建时间",
      render: (row: Record<string, unknown>) =>
        new Date(row.createdAt as string).toLocaleDateString("zh-CN"),
    },
    {
      key: "actions",
      label: "操作",
      render: (row: Record<string, unknown>) => (
        <Button
          variant="secondary"
          onClick={() =>
            setShowDetail(row as unknown as AssemblyTemplate)
          }
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <NavLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-900">法会类型物资模板</h2>
        <Button onClick={() => setShowCreate(true)}>新建模板</Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable columns={columns} data={templates as unknown as Record<string, unknown>[]} />
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="新建法会物资模板"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="法会类型 *">
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="模板名称 *">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如：祈福法会物资清单"
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

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                预设物资
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
                        label: `${m.name}（${m.category}）`,
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
            <Button onClick={handleCreate}>保存模板</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="模板详情"
      >
        {showDetail && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">法会类型：</span>
                {showDetail.type}
              </div>
              <div>
                <span className="text-gray-500">模板名称：</span>
                {showDetail.name}
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">备注：</span>
                {showDetail.remark || "-"}
              </div>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="px-3 py-1.5 text-left">物资名称</th>
                  <th className="px-3 py-1.5 text-left">分类</th>
                  <th className="px-3 py-1.5 text-left">数量</th>
                  <th className="px-3 py-1.5 text-left">单位</th>
                  <th className="px-3 py-1.5 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                {showDetail.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-3 py-1.5">{item.material.name}</td>
                    <td className="px-3 py-1.5">{item.material.category}</td>
                    <td className="px-3 py-1.5">{item.quantity}</td>
                    <td className="px-3 py-1.5">{item.material.unit}</td>
                    <td className="px-3 py-1.5">{item.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowDetail(null)}>关闭</Button>
            </div>
          </div>
        )}
      </Modal>
    </NavLayout>
  );
}
