import { useEffect, useMemo, useState } from "react";
import { Search, Filter, CheckCircle, Loader2 } from "lucide-react";
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

type RepairTask = {
  task_no: string;
  machine_name: string;
  planned_1?: string;
  planned_2?: string;
  actual_2?: string;
  serial_no?: string;
  doerName?: string;
  vendor_name?: string;
  transportation_charges?: string | number;
  lead_time_to_deliver_days?: string | number;
  payment_type?: string;
  how_much?: string | number;
  transporter_name_2?: string;
  bill_image?: string;
  total_bill_amount?: number;
  bill_no?: string;
  type_of_bill?: string;
  to_be_paid_amount?: number;
};

type FormState = {
  bill_image: File | null;
  bill_no: string;
  type_of_bill: string;
  total_bill_amount: string;
  payment_type?: string;
  to_be_paid_amount?: string | number;
  transporterName: string;
  transportationAmount: string;
};

const PAGE_SIZE = 25;

export default function CheckMachine() {
  const [pendingTasks, setPendingTasks] = useState<RepairTask[]>([]);
  const [historyTasks, setHistoryTasks] = useState<RepairTask[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<RepairTask | null>(null);
  const [formData, setFormData] = useState<FormState>({
    bill_image: null,
    bill_no: "",
    type_of_bill: "",
    total_bill_amount: "",
    transporterName: "",
    transportationAmount: "",
  });
  const [saving, setSaving] = useState(false);
  const [pagePending, setPagePending] = useState(1);
  const [pageHistory, setPageHistory] = useState(1);

  const filteredPending = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const data = pendingTasks;
    if (!q) return data;
    return data.filter(
      (t) =>
        t.task_no.toLowerCase().includes(q) ||
        (t.machine_name || "").toLowerCase().includes(q) ||
        (t.doerName || "").toLowerCase().includes(q)
    );
  }, [pendingTasks, searchText]);

  const filteredHistory = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const data = historyTasks;
    if (!q) return data;
    return data.filter(
      (t) =>
        t.task_no.toLowerCase().includes(q) ||
        (t.machine_name || "").toLowerCase().includes(q) ||
        (t.doerName || "").toLowerCase().includes(q)
    );
  }, [historyTasks, searchText]);

  const pagedPending = filteredPending.slice(
    (pagePending - 1) * PAGE_SIZE,
    pagePending * PAGE_SIZE
  );
  const pagedHistory = filteredHistory.slice(
    (pageHistory - 1) * PAGE_SIZE,
    pageHistory * PAGE_SIZE
  );

  const totalPendingPages = Math.max(1, Math.ceil(filteredPending.length / PAGE_SIZE));
  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingRes, historyRes] = await Promise.all([
        repairApi.getPendingCheck(),
        repairApi.getHistoryCheck(),
      ]);

      const pendingPayload = Array.isArray((pendingRes as any)?.data)
        ? (pendingRes as any).data
        : Array.isArray(pendingRes)
        ? (pendingRes as any)
        : [];
      const historyPayload = Array.isArray((historyRes as any)?.data)
        ? (historyRes as any).data
        : Array.isArray(historyRes)
        ? (historyRes as any)
        : [];

      setPendingTasks(pendingPayload as RepairTask[]);
      setHistoryTasks(historyPayload as RepairTask[]);
      setPagePending(1);
      setPageHistory(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load repair checks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const computedToBePaid = useMemo(() => {
    const total = Number(formData.total_bill_amount || 0);
    const advance = Number(selectedTask?.how_much || 0);
    if (!total) return "";
    if (selectedTask?.payment_type === "Advance") {
      return total - advance >= 0 ? total - advance : "";
    }
    return total;
  }, [formData.total_bill_amount, selectedTask]);

  const uploadBill = async (file: File) => {
    const res = await repairApi.uploadBill(file);
    if (res?.success && res.url) return res.url as string;
    toast.error("Bill upload failed");
    return "";
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    try {
      setSaving(true);
      let billImageUrl = "";
      if (formData.bill_image) {
        billImageUrl = await uploadBill(formData.bill_image);
        if (!billImageUrl) {
          setSaving(false);
          return;
        }
      }

      const payload = {
        transporterName: formData.transporterName,
        transportationAmount: formData.transportationAmount,
        billImage: billImageUrl,
        billNo: formData.bill_no,
        typeOfBill: formData.type_of_bill,
        totalBillAmount: Number(formData.total_bill_amount),
        toBePaidAmount: computedToBePaid || 0,
      };

      await repairApi.updateCheckTask(selectedTask.task_no, payload);
      toast.success("Task updated successfully");
      setIsModalOpen(false);
      setFormData({
        bill_image: null,
        bill_no: "",
        type_of_bill: "",
        total_bill_amount: "",
        transporterName: "",
        transportationAmount: "",
      });
      setSelectedTask(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Error submitting form");
    } finally {
      setSaving(false);
    }
  };

  const openModal = (task: RepairTask) => {
    setSelectedTask(task);
    setFormData((prev) => ({
      ...prev,
      payment_type: task.payment_type,
    }));
    setIsModalOpen(true);
  };

  return (
    <RepairPageShell
      icon={<CheckCircle size={48} className="text-emerald-600" />}
      heading="Check Machine"
      subtext="Repair material approvals and billing"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPagePending(1);
                setPageHistory(1);
              }}
              placeholder="Search tasks (task no / machine / indenter)..."
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant={activeTab === "pending" ? "default" : "outline"} onClick={() => setActiveTab("pending")}>
              Pending ({pendingTasks.length})
            </Button>
            <Button variant={activeTab === "history" ? "default" : "outline"} onClick={() => setActiveTab("history")}>
              History ({historyTasks.length})
            </Button>
            <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {activeTab === "pending" ? (
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Task Number</TableHead>
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Serial No</TableHead>
                  <TableHead>Indenter</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Transp. Charges</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>How Much</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && pendingTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading tasks...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pagedPending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-slate-500">
                      No pending tasks
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedPending.map((task) => (
                    <TableRow key={task.task_no}>
                      <TableCell>
                        <Button size="sm" onClick={() => openModal(task)} className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-sm">
                          <CheckCircle className="w-3 h-3" />
                          Material
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">{task.task_no}</TableCell>
                      <TableCell>{task.machine_name}</TableCell>
                      <TableCell>{task.planned_1 || task.planned_2 || "-"}</TableCell>
                      <TableCell>{task.serial_no || "-"}</TableCell>
                      <TableCell>{task.doerName || "-"}</TableCell>
                      <TableCell>{task.vendor_name || "-"}</TableCell>
                      <TableCell>{task.transportation_charges ?? "-"}</TableCell>
                      <TableCell>{task.lead_time_to_deliver_days ?? "-"}</TableCell>
                      <TableCell>{task.payment_type || "-"}</TableCell>
                      <TableCell>{task.how_much ?? "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Pagination
              page={pagePending}
              total={filteredPending.length}
              onChange={(p) => setPagePending(p)}
              pageSize={PAGE_SIZE}
            />
          </div>
        ) : (
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Number</TableHead>
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Serial No</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Indenter</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>How Much</TableHead>
                  <TableHead>Transporter</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Bill Type</TableHead>
                  <TableHead>To Be Paid</TableHead>
                  <TableHead className="sticky right-0 z-20 bg-white">Bill Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && historyTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading tasks...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pagedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-6 text-slate-500">
                      No history tasks
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedHistory.map((task) => (
                    <TableRow key={task.task_no}>
                      <TableCell className="font-medium text-blue-600">{task.task_no}</TableCell>
                      <TableCell>{task.machine_name}</TableCell>
                      <TableCell>{task.serial_no}</TableCell>
                      <TableCell>{task.planned_1 || task.planned_2 || "-"}</TableCell>
                      <TableCell>{task.doerName}</TableCell>
                      <TableCell>{task.vendor_name || "-"}</TableCell>
                      <TableCell>{task.lead_time_to_deliver_days || "-"}</TableCell>
                      <TableCell>{task.payment_type || "-"}</TableCell>
                      <TableCell>{task.how_much || "-"}</TableCell>
                      <TableCell>{task.transporter_name_2 || "-"}</TableCell>
                      <TableCell>
                        {task.total_bill_amount != null
                          ? `₹${Number(task.total_bill_amount).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell>{task.bill_no || "-"}</TableCell>
                      <TableCell>{task.type_of_bill || "-"}</TableCell>
                      <TableCell>
                        {task.to_be_paid_amount != null
                          ? `₹${Number(task.to_be_paid_amount).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 bg-white">
                        {task.bill_image ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(task.bill_image as string, "_blank")}
                          >
                            View
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Pagination
              page={pageHistory}
              total={filteredHistory.length}
              onChange={(p) => setPageHistory(p)}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Check Material Details</DialogTitle>
            <DialogDescription>
              Update billing details and approve the material.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repair Task Number (Read-only)
              </label>
              <Input value={selectedTask?.task_no || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Name (Read-only)
              </label>
              <Input value={selectedTask?.machine_name || ""} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type (Read-only)
              </label>
              <Input value={selectedTask?.payment_type || ""} readOnly />
            </div>
            {selectedTask?.payment_type === "Advance" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How Much (Advance Amount)
                </label>
                <Input value={selectedTask?.how_much || ""} readOnly />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporter Name *
              </label>
              <Input
                value={formData.transporterName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, transporterName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transportation Amount *
              </label>
              <Input
                type="number"
                value={formData.transportationAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    transportationAmount: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill No. *
              </label>
              <Input
                value={formData.bill_no}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bill_no: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Bill *
              </label>
              <select
                value={formData.type_of_bill}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type_of_bill: e.target.value,
                  }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Bill Type</option>
                <option value="Service Bill">Service Bill</option>
                <option value="Material Bill">Material Bill</option>
                <option value="Labor Bill">Labor Bill</option>
                <option value="Combined Bill">Combined Bill</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Bill Amount *
              </label>
              <Input
                type="number"
                value={formData.total_bill_amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    total_bill_amount: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Image *
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bill_image: e.target.files?.[0] || null,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Be Paid Amount
              </label>
              <Input value={computedToBePaid} readOnly />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-sm">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              ✓ Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RepairPageShell>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, start + 2);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
      <span>
        Showing{" "}
        <span className="font-semibold">
          {(page - 1) * pageSize + 1}-
          {Math.min(page * pageSize, total).toLocaleString("en-IN")}
        </span>{" "}
        of <span className="font-semibold">{total.toLocaleString("en-IN")}</span>
      </span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
