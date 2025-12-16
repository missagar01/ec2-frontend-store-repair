import { useEffect, useMemo, useState } from "react";
import { FileText, CheckCircle, DollarSign, BarChart3 } from "lucide-react";
import { toast } from "sonner";

import { repairApi } from "../../services";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

type DeptStatus = { department: string; count: number };
type PaymentEntry = { type: string; amount: number };
type VendorCost = { vendor: string; cost: number };
type DashboardData = {
  tasks: unknown[];
  pendingCount: number;
  completedCount: number;
  totalRepairCost: number;
  departmentStatus: DeptStatus[];
  paymentTypeDistribution: PaymentEntry[];
  vendorWiseCosts: VendorCost[];
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: typeof FileText;
  color: string;
}) => (
  <Card className="bg-white shadow-sm border border-gray-100">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const MetricCardSkeleton = () => (
  <Card className="bg-white shadow-sm border border-gray-100">
    <CardContent className="p-6 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </CardContent>
  </Card>
);

const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
);

export default function RepairDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const maxDept = useMemo(
    () => Math.max(...(data?.departmentStatus?.map((d) => d.count) || [1])),
    [data]
  );
  const maxVendor = useMemo(
    () => Math.max(...(data?.vendorWiseCosts?.map((v) => v.cost) || [1])),
    [data]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await repairApi.getDashboardMetrics();
        const payload = (res as any)?.data ?? res;
        setData({
          tasks: payload?.tasks || [],
          pendingCount: payload?.pendingCount || 0,
          completedCount: payload?.completedCount || 0,
          totalRepairCost: payload?.totalRepairCost || 0,
          departmentStatus: payload?.departmentStatus || [],
          paymentTypeDistribution: payload?.paymentTypeDistribution || [],
          vendorWiseCosts: payload?.vendorWiseCosts || [],
        });
      } catch (err) {
        console.error("Failed to load dashboard", err);
        toast.error("Unable to fetch dashboard data right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Indents"
              value={data?.tasks.length || 0}
              icon={FileText}
              color="bg-blue-500"
            />
            <MetricCard
              title="Repairs Completed"
              value={data?.completedCount || 0}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <MetricCard
              title="Total Repair Cost"
              value={`₹${Number(data?.totalRepairCost || 0).toLocaleString()}`}
              icon={DollarSign}
              color="bg-orange-500"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle>Repair Status by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={5} />
            ) : (
              <div className="space-y-3">
                {data?.departmentStatus?.map((dept) => (
                  <div key={dept.department} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(dept.count / maxDept) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {dept.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle>Payment Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton rows={4} />
            ) : (
              <div className="space-y-3">
                {data?.paymentTypeDistribution?.map((p) => (
                  <div key={p.type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{p.type}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{Number(p.amount || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle>Vendor-Wise Repair Costs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton rows={5} />
          ) : (
            <div className="space-y-3">
              {data?.vendorWiseCosts?.map((v) => (
                <div key={v.vendor} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 truncate">{v.vendor}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(v.cost / maxVendor) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      ₹{Number(v.cost || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle>Task Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ListSkeleton rows={2} />
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Pending</span>
                <span className="ml-auto font-semibold">{data?.pendingCount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Completed</span>
                <span className="ml-auto font-semibold">{data?.completedCount || 0}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




