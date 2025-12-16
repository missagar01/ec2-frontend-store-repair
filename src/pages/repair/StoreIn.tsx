import { useEffect, useState, useMemo } from "react";
import { Search, Filter, Package, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { repairApi } from "../../services";
import RepairPageShell from "./RepairPageShell";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../components/ui/dialog";
import { Checkbox } from "../../components/ui/checkbox";

interface StoreInTask {
  id?: number;
  taskNo?: string;
  serialNo?: string;
  machineName?: string;
  machinePartName?: string;
  doerName?: string;
  vendorName?: string;
  planned_3?: string;
  actual_3?: string;
  receivedQuantity?: string;
  billMatch?: string;
  billImage?: string;
  billNo?: string;
  toBePaidAmount?: number;
  totalBillAmount?: number;
  productImage?: string;
  paymentType?: string;
  howMuch?: number;
  leadTimeToDeliverDays?: string;
}

export default function StoreIn() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<StoreInTask | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allTasks, setAllTasks] = useState<StoreInTask[]>([]);
  const [formData, setFormData] = useState({
    receivedQuantity: "",
    billMatch: false,
    productImage: null as File | null,
    billNo: "",
  });

  // Fetch all tasks
  const fetchAllTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await repairApi.getStoreInAll();
      if (res?.success && Array.isArray(res.tasks)) {
        setAllTasks(res.tasks as StoreInTask[]);
      } else {
        setAllTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Error fetching tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Filter tasks based on planned_3 and actual_3
  const pendingTasks = useMemo(
    () =>
      allTasks.filter(
        (task) => task.planned_3 && !task.actual_3
      ),
    [allTasks]
  );

  const historyTasks = useMemo(
    () =>
      allTasks.filter(
        (task) => task.planned_3 && task.actual_3
      ),
    [allTasks]
  );

  // Filter by user role and search term
  const filteredPendingTasks = useMemo(
    () =>
      pendingTasks
        .filter(
          (task) =>
            user?.role === "admin" ||
            (task.doerName || "").toLowerCase() ===
              (user?.user_name || "").toLowerCase()
        )
        .filter(
          (task) =>
            (task.taskNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.machineName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.serialNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.vendorName || "").toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [pendingTasks, user, searchTerm]
  );

  const filteredHistoryTasks = useMemo(
    () =>
      historyTasks
        .filter(
          (task) =>
            user?.role === "admin" ||
            (task.doerName || "").toLowerCase() ===
              (user?.user_name || "").toLowerCase()
        )
        .filter(
          (task) =>
            (task.taskNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.machineName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.serialNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.vendorName || "").toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [historyTasks, user, searchTerm]
  );

  const handleMaterialClick = (task: StoreInTask) => {
    setSelectedTask(task);
    setFormData({
      receivedQuantity: task.receivedQuantity || "",
      billMatch: task.billMatch === "Yes",
      productImage: null,
      billNo: task.billNo || "",
    });
    setIsModalOpen(true);
  };

  const uploadProductToS3 = async (file: File): Promise<string> => {
    try {
      const res = await repairApi.uploadProductImage(file);
      if (res?.success && res.url) {
        return res.url;
      }
      toast.error("Image upload failed");
      return "";
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTask?.taskNo) {
      toast.error("Task number missing");
      return;
    }

    try {
      setSubmitLoading(true);

      let uploadedImageUrl = "";

      if (formData.productImage) {
        uploadedImageUrl = await uploadProductToS3(formData.productImage);
      }

      const body = {
        actual_3: new Date().toISOString(),
        receivedQuantity: formData.receivedQuantity,
        billMatch: formData.billMatch ? "Yes" : "No",
        billImage: uploadedImageUrl,
        billNo: formData.billNo,
        productImage: uploadedImageUrl,
      };

      const result = await repairApi.updateStoreIn(selectedTask.taskNo, body);

      if (result?.success) {
        toast.success("Task updated successfully");
        setIsModalOpen(false);
        await fetchAllTasks();
      } else {
        toast.error("Failed to update task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting form");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount || isNaN(Number(amount))) return "-";
    return `₹${Number(amount).toLocaleString()}`;
  };

  return (
    <RepairPageShell
      icon={<Package size={48} className="text-slate-600" />}
      heading="Store In"
      subtext="Materials returned to the repair warehouse"
    >
      <div className="space-y-6 px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending ({filteredPendingTasks.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                History ({filteredHistoryTasks.length})
              </button>
            </nav>
          </div>

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2"
                />
              </div>
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchAllTasks}
                disabled={loadingTasks}
              >
                {loadingTasks ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          {activeTab === "pending" && (
            <div className="relative w-full">
              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
              ) : filteredPendingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">No pending tasks found</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[calc(100vh-350px)] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                      <TableRow>
                        <TableHead className="bg-white">Action</TableHead>
                        <TableHead className="bg-white">Task Number</TableHead>
                        <TableHead className="bg-white">Machine Name</TableHead>
                        <TableHead className="bg-white">Serial No</TableHead>
                        <TableHead className="bg-white">Planned Date</TableHead>
                        <TableHead className="bg-white">Indenter</TableHead>
                        <TableHead className="bg-white">Vendor Name</TableHead>
                        <TableHead className="bg-white">Lead Time</TableHead>
                        <TableHead className="bg-white">Payment Type</TableHead>
                        <TableHead className="bg-white">Transporter Amount</TableHead>
                        <TableHead className="bg-white sticky right-0 z-20">Bill Image</TableHead>
                        <TableHead className="bg-white">Bill No</TableHead>
                        <TableHead className="bg-white">Total Bill Amount</TableHead>
                        <TableHead className="bg-white">To Be Paid</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPendingTasks.map((task) => (
                      <TableRow key={task.id || task.taskNo}>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleMaterialClick(task)}
                            className="flex items-center bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-sm"
                          >
                            <Package className="w-3 h-3 mr-1" />
                            Material
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {task.taskNo || "-"}
                        </TableCell>
                        <TableCell>{task.machineName || "-"}</TableCell>
                        <TableCell>{task.serialNo || "-"}</TableCell>
                        <TableCell>
                          {task.planned_3
                            ? new Date(task.planned_3).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{task.doerName || "-"}</TableCell>
                        <TableCell>{task.vendorName || "-"}</TableCell>
                        <TableCell>{task.leadTimeToDeliverDays || "-"}</TableCell>
                        <TableCell>{task.paymentType || "-"}</TableCell>
                        <TableCell>{task.howMuch || "-"}</TableCell>
                        <TableCell className="sticky right-0 z-10 bg-white">
                          {task.billImage ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => window.open(task.billImage, "_blank")}
                            >
                              View
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{task.billNo || "-"}</TableCell>
                        <TableCell>{formatCurrency(task.totalBillAmount)}</TableCell>
                        <TableCell>{formatCurrency(task.toBePaidAmount)}</TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="relative w-full">
              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading tasks...</p>
                </div>
              ) : filteredHistoryTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-500">No history tasks found</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[calc(100vh-350px)] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                      <TableRow>
                        <TableHead className="bg-white">Task Number</TableHead>
                        <TableHead className="bg-white">Machine Name</TableHead>
                        <TableHead className="bg-white">Serial No</TableHead>
                        <TableHead className="bg-white">Part Name</TableHead>
                        <TableHead className="bg-white">Vendor Name</TableHead>
                        <TableHead className="bg-white">Received Quantity</TableHead>
                        <TableHead className="bg-white sticky right-0 z-20">Bill Image</TableHead>
                        <TableHead className="bg-white">Bill Amount</TableHead>
                        <TableHead className="bg-white">To Be Paid</TableHead>
                        <TableHead className="bg-white">Bill Match</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistoryTasks.map((task) => (
                      <TableRow key={task.id || task.taskNo}>
                        <TableCell className="font-medium text-blue-600">
                          {task.taskNo || "-"}
                        </TableCell>
                        <TableCell>{task.machineName || "-"}</TableCell>
                        <TableCell>{task.serialNo || "-"}</TableCell>
                        <TableCell>{task.machinePartName || "-"}</TableCell>
                        <TableCell>{task.vendorName || "-"}</TableCell>
                        <TableCell>{task.receivedQuantity || "-"}</TableCell>
                        <TableCell className="sticky right-0 z-10 bg-white">
                          {task.billImage ? (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => window.open(task.billImage, "_blank")}
                            >
                              View
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(task.totalBillAmount)}</TableCell>
                        <TableCell>{formatCurrency(task.toBePaidAmount)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              task.billMatch === "Yes"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {task.billMatch === "Yes" ? "Matched" : "Not Matched"}
                          </span>
                        </TableCell>
                      </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Store In Material</DialogTitle>
              <DialogDescription>
                Update store in details for the selected material
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repair Task Number (Read-only)
                  </label>
                  <Input
                    type="text"
                    value={selectedTask?.taskNo || ""}
                    readOnly
                    className="bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Machine Name (Read-only)
                  </label>
                  <Input
                    type="text"
                    value={selectedTask?.machineName || ""}
                    readOnly
                    className="bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name (Read-only)
                  </label>
                  <Input
                    type="text"
                    value={selectedTask?.vendorName || ""}
                    readOnly
                    className="bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Received *
                  </label>
                  <select
                    value={formData.receivedQuantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        receivedQuantity: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Product Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      productImage: e.target.files?.[0] || null,
                    }))
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <Checkbox
                    checked={formData.billMatch}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        billMatch: Boolean(checked),
                      }))
                    }
                  />
                  <span className="ml-2 text-sm text-gray-700">Bill Match</span>
                </label>
              </div>

              <DialogFooter className="pt-6 border-t border-gray-200">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" variant="default" disabled={submitLoading} className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-sm">
                  {submitLoading && <Loader2Icon className="animate-spin mr-2" />}
                  ✓ Submit
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RepairPageShell>
  );
}
