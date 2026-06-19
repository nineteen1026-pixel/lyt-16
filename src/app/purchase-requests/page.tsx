"use client";

import { useEffect, useState } from "react";
import { NavLayout, StatusBadge } from "@/components/StatusBadge";
import { DataTable, FormField, Input, Button, Modal, Select } from "@/components/ui";

type Material = { id: number; name: string; category: string; unit: string };
type RequestItem = {
  id: number;
  materialId: number;
  quantity: number;
  remark: string;
  material: Material;
};
type PurchaseRequest = {
  id: number;
  title: string;
  applicant: string;
  status: string;
  remark: string;
  createdAt: string;
  items: RequestItem[];
};

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<PurchaseRequest | null>(null);

  const [form, setForm] = useState({
    title: "",
    applicant: "",
    remark: "",
  });
  const [formItems, setFormItems] = useState<
    { materialId: number; quantity: number; remark: string }[]
  >([{ materialId: 0, quantity: 1, remark: "" }]);

  const load = async () => {
    const [rRes, mRes] = await Promise.all([
      fetch("/api/purchase-requests"),
      fetch("/api/materials"),
    ]);
    setRequests(await rRes.json());
    setMaterials(await mRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const items = formItems.filter((it) => it.materialId > 0);
    if (!form.title || !form.applicant || items.length === 0) return;
    await fetch("/api/purchase-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });
    setForm({ title: "", applicant: "", remark: "" });
    setFormItems([{ materialId: 0, quantity: 1, remark: "" }]);
    setShowCreate(false);
    load();
  };

  const handleStatus = async (id: number, status: string) => {
    await fetch(`/api/purchase-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setShowDetail(null);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此申请？")) return;
    await fetch(`/api/purchase-requests/${id}`, { method: "DELETE" });
    setShowDetail(null);
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
    { key: "title", label: "申请标题" },
    { key: "applicant", label: "申请人" },
    {
      key: "status",
      label: "状态",
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={row.status as string} />
      ),
    },
    {
      key: "itemCount",
      label: "物资数",
      render: (row: Record<string, unknown>) =>
        (row.items as unknown[])?.length || 0,
    },
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
            setShowDetail(row as unknown as PurchaseRequest)
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
        <h2 className="text-xl font-bold text-amber-900">采购申请</h2>
        <Button onClick={() => setShowCreate(true)}>新建申请</Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <DataTable columns={columns} data={requests as unknown as Record<string, unknown>[]} />
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="新建采购申请"
      >
        <div className="flex flex-col gap-4">
          <FormField label="申请标题">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="如：腊八节供品采购"
            />
          </FormField>
          <FormField label="申请人">
            <Input
              value={form.applicant}
              onChange={(e) =>
                setForm({ ...form, applicant: e.target.value })
              }
              placeholder="如：释明心"
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
                采购物资
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
            <Button onClick={handleCreate}>提交申请</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="申请详情"
      >
        {showDetail && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">标题：</span>
                {showDetail.title}
              </div>
              <div>
                <span className="text-gray-500">申请人：</span>
                {showDetail.applicant}
              </div>
              <div>
                <span className="text-gray-500">状态：</span>
                <StatusBadge status={showDetail.status} />
              </div>
              <div>
                <span className="text-gray-500">创建时间：</span>
                {new Date(showDetail.createdAt).toLocaleString("zh-CN")}
              </div>
              {showDetail.remark && (
                <div className="col-span-2">
                  <span className="text-gray-500">备注：</span>
                  {showDetail.remark}
                </div>
              )}
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="px-3 py-1.5 text-left">物资</th>
                  <th className="px-3 py-1.5 text-left">数量</th>
                  <th className="px-3 py-1.5 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                {showDetail.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-3 py-1.5">
                      {item.material.name}（{item.material.unit}）
                    </td>
                    <td className="px-3 py-1.5">{item.quantity}</td>
                    <td className="px-3 py-1.5">{item.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 pt-4 border-t">
              {showDetail.status === "pending" && (
                <>
                  <Button onClick={() => handleStatus(showDetail.id, "approved")}>
                    审批通过
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleStatus(showDetail.id, "rejected")}
                  >
                    驳回
                  </Button>
                </>
              )}
              {showDetail.status === "approved" && (
                <Button
                  onClick={() => handleStatus(showDetail.id, "completed")}
                >
                  标记完成
                </Button>
              )}
              <div className="flex-1" />
              <Button
                variant="danger"
                onClick={() => handleDelete(showDetail.id)}
              >
                删除
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </NavLayout>
  );
}
