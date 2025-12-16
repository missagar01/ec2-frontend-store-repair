import { useEffect, useMemo, useState } from "react";
import { Package, Search, Filter, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

import RepairPageShell from "./RepairPageShell";
import { repairApi } from "../../services";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

type PaymentTask = {
  task_no?: string;
  serial_no?: string;
  machine_name?: string;
  vendor_name?: string;
  bill_no?: string;
  total_bill_amount?: number;
  payment_type?: string;
  to_be_paid_amount?: number;
  planned_4?: string;
  doerName?: string;
  lead_time_to_deliver?: string | number;
  how_much?: string | number;
  bill_image?: string;
};

type PaymentHistory = {
  payment_no?: string;
  repair_task_no?: string;
  serial_no?: string;
  machine_name?: string;
  vendor_name?: string;
  bill_no?: string;
  total_bill_amount?: number;
  payment_type?: string;
  to_be_paid_amount?: number;
  billMatch?: string;
};

type FormState = {
  total_bill_amount: string;
  payment_type: string;
  to_be_paid_amount: string;
};

export default function MakePayment() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [pending, setPending] = useState<PaymentTask[]>([]);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PaymentTask | null>(null);
  const [formData, setFormData] = useState<FormState>({
    total_bill_amount: "",
    payment_type: "",
    to_be_paid_amount: "",
  });
  const [search, setSearch] = useState("");

  const filteredPending = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter(
      (t) =>
        (t.task_no || "").toLowerCase().includes(q) ||
        (t.machine_name || "").toLowerCase().includes(q) ||
        (t.vendor_name || "").toLowerCase().includes(q)
    );
  }, [pending, search]);

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (t) =>
        (t.payment_no || "").toLowerCase().includes(q) ||
        (t.repair_task_no || "").toLowerCase().includes(q) ||
        (t.machine_name || "").toLowerCase().includes(q) ||
        (t.vendor_name || "").toLowerCase().includes(q)
    );
  }, [history, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingRes, historyRes] = await Promise.all([
        repairApi.getPendingPayments(),
        repairApi.getPaymentHistory(),
      ]);

      const pendingList = (pendingRes as any)?.data ?? (pendingRes as any)?.tasks ?? [];
      const historyList = (historyRes as any)?.data ?? (historyRes as any)?.payments ?? [];

      setPending(Array.isArray(pendingList) ? pendingList : []);
      setHistory(Array.isArray(historyList) ? historyList : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpen = (task: PaymentTask) => {
    setSelectedTask(task);
    setFormData({
      total_bill_amount: task.total_bill_amount?.toString() || "",
      payment_type: task.payment_type || "",
      to_be_paid_amount: task.to_be_paid_amount?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      setSubmitLoading(true);
      const payload = {
        time_stamp: new Date().toISOString(),
        payment_no: "",
        repair_task_no: selectedTask.task_no,
        serial_no: selectedTask.serial_no,
        machine_name: selectedTask.machine_name,
        vendor_name: selectedTask.vendor_name,
        bill_no: selectedTask.bill_no,
        total_bill_amount: selectedTask.total_bill_amount,
        payment_type: formData.payment_type,
        to_be_paid_amount: formData.to_be_paid_amount,
      };

      await repairApi.addPayment(payload);
      toast.success("Payment added successfully");
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Error submitting payment");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <RepairPageShell 
      icon={<CreditCard size={48} className="text-blue-600" />}
      heading="Repair Advance" 
      subtext="Approve and add payments for repairs"
    >
      <div className="px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-4 py-3">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending ({pending.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              History ({history.length})
            </button>
          </nav>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks/payments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="secondary" size="sm" disabled>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {activeTab === "pending" ? (
          <div className="relative w-full">
            <div className="overflow-x-auto">
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto min-w-[1200px]">
                <Table className="text-sm">
                  <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                    <TableRow>
                      <TableHead className="bg-white whitespace-nowrap">Action</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Task Number</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Machine Name</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Serial No</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Planned Date</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Indenter</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Vendor Name</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Lead Time</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Payment Type</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Transporter Amount</TableHead>
                      <TableHead className="bg-white whitespace-nowrap sticky right-0 z-20">Bill Image</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Bill No</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Total Bill Amount</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">To Be Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {loading && pending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-6 text-slate-500 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading tasks...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-6 text-slate-500 text-sm">
                        No pending payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPending.map((task) => (
                      <TableRow key={task.task_no}>
                        <TableCell className="whitespace-nowrap">
                          <Button size="sm" onClick={() => handleOpen(task)} className="flex items-center text-xs bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-sm">
                            <Package className="w-3 h-3 mr-1" />
                            Material
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-blue-600 text-sm whitespace-nowrap">{task.task_no}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.machine_name}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.serial_no}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.planned_4 ? new Date(task.planned_4).toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.doerName || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.vendor_name || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.lead_time_to_deliver || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.payment_type || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.how_much || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap sticky right-0 z-10 bg-white">
                          {task.bill_image && task.bill_image !== "-" ? (
                            <a
                              href={task.bill_image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.bill_no || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          ₹{task.total_bill_amount != null ? Number(task.total_bill_amount).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          ₹{task.to_be_paid_amount != null ? Number(task.to_be_paid_amount).toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            <div className="overflow-x-auto">
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto min-w-[1000px]">
                <Table className="text-sm">
                  <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                    <TableRow>
                      <TableHead className="bg-white whitespace-nowrap">Payment No.</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Repair Task No.</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Serial No</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Machine Name</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Vendor Name</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Bill No.</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Total Bill Amount</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Payment Type</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">To Be Paid Amount</TableHead>
                      <TableHead className="bg-white whitespace-nowrap">Bill Match</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {loading && history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-slate-500 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading payment history...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-slate-500 text-sm">
                        No payment history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((task, idx) => (
                      <TableRow key={`${task.payment_no}-${idx}`}>
                        <TableCell className="font-medium text-blue-600 text-sm whitespace-nowrap">{task.payment_no}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.repair_task_no}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.serial_no}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.machine_name}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.vendor_name || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.bill_no || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          ₹{task.total_bill_amount != null
                            ? Number(task.total_bill_amount).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{task.payment_type || "-"}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          ₹{task.to_be_paid_amount != null
                            ? Number(task.to_be_paid_amount).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
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
                    ))
                  )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Repair Advance Details</DialogTitle>
            <DialogDescription>
              Enter payment details for the selected repair task
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment No.</label>
                <Input value="PN-001" readOnly className="bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial No</label>
                <Input value={selectedTask?.serial_no || ""} readOnly className="bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill No.</label>
                <Input value={selectedTask?.bill_no || ""} readOnly className="bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repair Task Number</label>
                <Input value={selectedTask?.task_no || ""} readOnly className="bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Name</label>
                <Input value={selectedTask?.machine_name || ""} readOnly className="bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                <Input value={selectedTask?.vendor_name || ""} readOnly className="bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Bill Amount *</label>
                <Input
                  type="number"
                  value={selectedTask?.total_bill_amount ?? ""}
                  readOnly
                  className="bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type *</label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, payment_type: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Payment Type</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Be Paid Amount *</label>
                <Input
                  type="number"
                  value={formData.to_be_paid_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, to_be_paid_amount: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-sm">
                {submitLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                ✓ Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </RepairPageShell>
  );
}
