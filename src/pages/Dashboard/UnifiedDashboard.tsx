// Unified Dashboard - Shows both Repair and Store dashboards
import { useEffect, useState } from "react";
import { repairApi, storeApi } from "../../services";
import { FileText, CheckCircle, DollarSign, ClipboardList, Truck, PackageCheck, Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function UnifiedDashboard() {
  const [repairData, setRepairData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [repairResponse, storeResponse] = await Promise.all([
          repairApi.getDashboardMetrics().catch(err => {
            return { success: false, error: err };
          }),
          storeApi.getStoreIndentDashboard().catch(err => {
            return { success: false, error: err };
          }),
        ]);

        if (repairResponse?.success && repairResponse?.data) {
          setRepairData(repairResponse.data);
        }

        if (storeResponse?.success && storeResponse?.data) {
          setStoreData(storeResponse.data);
        }

        // If both fail, show error
        if (!repairResponse?.success && !storeResponse?.success) {
          setError("Unable to fetch dashboard data. Please check backend connection.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Unified Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of Repair and Store Management Systems
        </p>
      </div>

      {/* Repair System Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          🔧 Repair Management System
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {repairData?.tasks?.length || 0}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {repairData?.pendingCount || 0}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {repairData?.completedCount || 0}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    ₹{repairData?.totalRepairCost?.toLocaleString() || 0}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Repair Charts */}
        {repairData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Repair Status by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repairData.departmentStatus?.map((dept: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dept.department}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(dept.count / Math.max(...(repairData.departmentStatus || []).map((d: any) => d.count))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8">{dept.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repairData.paymentTypeDistribution?.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{payment.type}</span>
                      <span className="text-sm font-semibold">
                        ₹{Number(payment.amount || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Store System Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          📦 Store Management System
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Indents</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {storeData?.totalIndents || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {storeData?.totalIndentedQuantity?.toLocaleString() || 0}
                  </p>
                </div>
                <ClipboardList className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Purchases</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {storeData?.totalPurchaseOrders || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {storeData?.totalPurchasedQuantity?.toLocaleString() || 0}
                  </p>
                </div>
                <Truck className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Issued</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {storeData?.totalIssuedQuantity?.toLocaleString() || 0}
                  </p>
                </div>
                <PackageCheck className="h-10 w-10 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Stock</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {storeData?.outOfStockCount || 0}
                  </p>
                </div>
                <Warehouse className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Charts */}
        {storeData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Purchased Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {storeData.topPurchasedItems?.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{item.itemName}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{item.orderCount} orders</p>
                        <p className="text-xs text-gray-500">Qty: {item.totalOrderQty?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {storeData.topVendors?.slice(0, 5).map((vendor: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{vendor.vendorName}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{vendor.uniquePoCount} POs</p>
                        <p className="text-xs text-gray-500">Items: {vendor.totalItems?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
