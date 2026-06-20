import { NavLayout } from "@/components/StatusBadge";

export default function HomePage() {
  return (
    <NavLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-2">寺院管理系统</h2>
        <p className="text-gray-500">管理寺院法会排期、物资采购、入库登记与库存查询</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <a
          href="/dharma-assemblies"
          className="block p-6 bg-white rounded-lg border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">🕉️</div>
          <h3 className="text-lg font-bold text-amber-900 mb-1">法会排期</h3>
          <p className="text-sm text-gray-500">登记法会信息，自动校验殿堂时段冲突</p>
        </a>
        <a
          href="/purchase-requests"
          className="block p-6 bg-white rounded-lg border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📋</div>
          <h3 className="text-lg font-bold text-amber-900 mb-1">采购申请</h3>
          <p className="text-sm text-gray-500">提交采购申请，跟踪审批状态</p>
        </a>
        <a
          href="/stock-entries"
          className="block p-6 bg-white rounded-lg border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📦</div>
          <h3 className="text-lg font-bold text-amber-900 mb-1">入库登记</h3>
          <p className="text-sm text-gray-500">登记物资入库，自动更新库存</p>
        </a>
        <a
          href="/stocks"
          className="block p-6 bg-white rounded-lg border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-bold text-amber-900 mb-1">库存查询</h3>
          <p className="text-sm text-gray-500">查看当前物资库存与分类统计</p>
        </a>
      </div>
    </NavLayout>
  );
}
