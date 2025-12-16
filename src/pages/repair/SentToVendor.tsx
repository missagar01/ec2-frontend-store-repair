import { useEffect, useMemo, useState } from "react";
import { Filter, Loader2, Search, Send } from "lucide-react";
import { toast } from "sonner";

import RepairPageShell from "./RepairPageShell";
import { repairApi } from "../../services";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

type RepairTask = {
  task_no?: string;
  machine_name?: string;
  serial_no?: string;
  doer_name?: string;
  given_by?: string;
  department?: string;
  machine_part_name?: string;
  priority?: string;
  vendor_name?: string;
  transporter_name_1?: string;
  transportation_charges?: number | string | null;
  weighment_slip?: string | null;
  transporting_image_with_machine?: string | null;
  lead_time_to_deliver?: number | string | null;
  payment_type?: string;
  how_much?: number | string | null;
  task_start_date?: string;
  actual_1?: string | null;
};

type FormState = {
  vendorName: string;
  transporterName: string;
  transportationCharges: string;
  weighmentSlip: string;
  transportingImage: File | null;
  leadTimeToDeliver: string;
  paymentType: string;
  advancePayment: string;
};

export default function SentToVendor() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [tasks, setTasks] = useState<RepairTask[]>([]);
  const [pendingTasks, setPendingTasks] = useState<RepairTask[]>([]);
  const [historyTasks, setHistoryTasks] = useState<RepairTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loaderSubmit, setLoaderSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RepairTask | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<FormState>({
    vendorName: "",
    transporterName: "",
    transportationCharges: "",
    weighmentSlip: "",
    transportingImage: null,
    leadTimeToDeliver: "",
    paymentType: "",
    advancePayment: "",
  });

  const filteredTasks = useMemo(() => {
    const name = (user?.user_name || user?.name || "").toLowerCase();
    const q = searchTerm.trim().toLowerCase();
    return tasks
      .filter(
        (task) =>
          user?.role === "admin" ||
          (task.doer_name || "").toLowerCase() === name ||
          (task.given_by || "").toLowerCase() === name
      )
      .filter((task) => {
        if (!q) return true;
        return (
          (task.task_no || "").toLowerCase().includes(q) ||
          (task.machine_name || "").toLowerCase().includes(q) ||
          (task.vendor_name || "").toLowerCase().includes(q)
        );
      });
  }, [tasks, user, searchTerm]);

  useEffect(() => {
    setPendingTasks(filteredTasks.filter((t) => !t.actual_1));
    setHistoryTasks(filteredTasks.filter((t) => t.actual_1));
  }, [filteredTasks]);

  const fetchAllTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await repairApi.getSentToVendorAll();
      const payload = (res as any)?.tasks ?? (res as any)?.data ?? res;
      const list = Array.isArray(payload) ? payload : [];
      setTasks(list);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load sent-to-vendor tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const handleSentClick = (task: RepairTask) => {
    setSelectedTask(task);
    setFormData((prev) => ({
      ...prev,
      vendorName: task.vendor_name || "",
      transporterName: task.transporter_name_1 || "",
      transportationCharges: task.transportation_charges?.toString() || "",
      weighmentSlip: task.weighment_slip || "",
      transportingImage: null,
      leadTimeToDeliver: task.lead_time_to_deliver?.toString() || "",
      paymentType: task.payment_type || "",
      advancePayment: task.how_much?.toString() || "",
    }));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask?.task_no) return;

    try {
      setLoaderSubmit(true);
      const fd = new FormData();
      fd.append("vendorName", formData.vendorName);
      fd.append("transporterName", formData.transporterName);
      fd.append("transportationCharges", formData.transportationCharges);
      fd.append("weighmentSlip", formData.weighmentSlip);
      fd.append("leadTimeToDeliver", formData.leadTimeToDeliver);
      fd.append("paymentType", formData.paymentType);
      if (formData.paymentType === "Advance") {
        fd.append("howMuch", formData.advancePayment);
      } else {
        fd.append("howMuch", "");
      }
      if (formData.transportingImage) {
        fd.append("transportingImage", formData.transportingImage);
      }

      const result = await repairApi.updateSentToVendor(selectedTask.task_no, fd);
      if (!(result as any)?.success) {
        throw new Error("Update failed");
      }

      toast.success("Task updated successfully");
      setIsModalOpen(false);
      await fetchAllTasks();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong while submitting");
    } finally {
      setLoaderSubmit(false);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <RepairPageShell
      icon={<Send size={48} className="text-blue-600" />}
      heading="Sent to Vendor"
      subtext="Send repair items to vendors and track history"
    >
      <div className="px-4 md:px-6 lg:px-8">
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
              Pending ({pendingTasks.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              History ({historyTasks.length})
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
                className="pl-10"
              />
            </div>
            <Button variant="secondary" size="sm" disabled>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {activeTab === "pending" && (
          <div className="relative w-full">
            <div className="overflow-x-auto max-h-[calc(100vh-350px)] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                  <TableRow>
                    <TableHead className="bg-white">Action</TableHead>
                    <TableHead className="bg-white">Task Number</TableHead>
                    <TableHead className="bg-white">Planned Date</TableHead>
                    <TableHead className="bg-white">Machine Name</TableHead>
                    <TableHead className="bg-white">Serial No</TableHead>
                    <TableHead className="bg-white">Indenter</TableHead>
                    <TableHead className="bg-white">Department</TableHead>
                    <TableHead className="bg-white">Part Name</TableHead>
                    <TableHead className="bg-white">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTasks && pendingTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading tasks...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : pendingTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-slate-500">
                        No pending tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingTasks.map((task) => (
                      <TableRow key={task.task_no}>
                        <TableCell>
                          <Button size="sm" onClick={() => handleSentClick(task)} className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-sm">
                            <Send className="w-3 h-3 mr-1" />
                            Sent
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">{task.task_no}</TableCell>
                        <TableCell>
                          {task.task_start_date
                            ? new Date(task.task_start_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{task.machine_name}</TableCell>
                        <TableCell>{task.serial_no}</TableCell>
                        <TableCell>{task.doer_name}</TableCell>
                        <TableCell>{task.department}</TableCell>
                        <TableCell>{task.machine_part_name}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="relative w-full">
            <div className="overflow-x-auto max-h-[calc(100vh-350px)] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                  <TableRow>
                    <TableHead className="bg-white">Task Number</TableHead>
                    <TableHead className="bg-white">Planned Date</TableHead>
                    <TableHead className="bg-white">Serial No</TableHead>
                    <TableHead className="bg-white">Machine Name</TableHead>
                    <TableHead className="bg-white">Indenter</TableHead>
                    <TableHead className="bg-white">Part Name</TableHead>
                    <TableHead className="bg-white">Vendor Name</TableHead>
                    <TableHead className="bg-white">Lead Time</TableHead>
                    <TableHead className="bg-white">Transporter</TableHead>
                    <TableHead className="bg-white">Transportation Charges</TableHead>
                    <TableHead className="bg-white">Weighment Slip</TableHead>
                    <TableHead className="bg-white">Transporting Image</TableHead>
                    <TableHead className="bg-white">Payment Type</TableHead>
                    <TableHead className="bg-white">How Much</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {loadingTasks && historyTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-6 text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading tasks...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : historyTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-6 text-slate-500">
                      No history tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  historyTasks.map((task) => (
                    <TableRow key={task.task_no}>
                      <TableCell className="font-medium text-blue-600">{task.task_no}</TableCell>
                      <TableCell>
                        {task.task_start_date
                          ? new Date(task.task_start_date).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{task.serial_no}</TableCell>
                      <TableCell>{task.machine_name}</TableCell>
                      <TableCell>{task.doer_name}</TableCell>
                      <TableCell>{task.machine_part_name}</TableCell>
                      <TableCell>{task.vendor_name}</TableCell>
                      <TableCell>{task.lead_time_to_deliver}</TableCell>
                      <TableCell>{task.transporter_name_1}</TableCell>
                      <TableCell>{task.transportation_charges}</TableCell>
                      <TableCell>{task.weighment_slip}</TableCell>
                      <TableCell>
                        {task.transporting_image_with_machine ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              window.open(task.transporting_image_with_machine as string, "_blank")
                            }
                          >
                            View
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{task.payment_type}</TableCell>
                      <TableCell>{task.how_much}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </div>
        )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Send Machine to Vendor</DialogTitle>
              <DialogDescription>
                Enter vendor and transportation details for sending the machine
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repair Task Number (Read-only)
                </label>
                <Input
                  type="text"
                  value={selectedTask?.task_no || ""}
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
                  value={selectedTask?.machine_name || ""}
                  readOnly
                  className="bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name *
                </label>
                <Input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, vendorName: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transporter Name
                </label>
                <Input
                  type="text"
                  value={formData.transporterName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, transporterName: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transportation Charges
                </label>
                <Input
                  type="number"
                  value={formData.transportationCharges}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      transportationCharges: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weighment Slip
                </label>
                <Input
                  type="text"
                  value={formData.weighmentSlip}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, weighmentSlip: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lead Time To Deliver (In Days)
              </label>
              <Input
                type="number"
                value={formData.leadTimeToDeliver}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, leadTimeToDeliver: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporting Image With Machine
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    transportingImage: e.target.files ? e.target.files[0] : null,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type *
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, paymentType: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Payment Type</option>
                <option value="Advance">Advance</option>
                <option value="Full">Full</option>
                <option value="Warrenty/Garentie">Warrenty/Garentie</option>
              </select>
            </div>

            {formData.paymentType === "Advance" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Payment Amount *
                </label>
                <Input
                  type="number"
                  value={formData.advancePayment}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, advancePayment: e.target.value }))
                  }
                  required
                />
              </div>
            )}

            <DialogFooter className="pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-sm">
                {loaderSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ✓ Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </RepairPageShell>
  );
}
