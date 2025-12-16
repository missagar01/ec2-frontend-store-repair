import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { repairApi } from "../../services";
import RepairPageShell from "./RepairPageShell";
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
  id?: string;
  task_no?: string;
  taskNo?: string;
  serial_no?: string;
  machine_name?: string;
  machineName?: string;
  machine_part_name?: string;
  department?: string;
  priority?: string;
  status?: string;
  given_by?: string;
  doer_name?: string;
  problem_with_machine?: string;
  location?: string;
  task_start_date?: string;
  task_ending_date?: string;
};

type FormOptions = {
  machines: string[];
  serials: { machine_name: string; serial_no: string }[];
  doerNames: string[];
  givenBy: string[];
  priority: string[];
  departments: string[];
};

type FormState = {
  machine_name: string;
  serial_no: string;
  given_by: string;
  doer_name: string;
  priority: string;
  department: string;
  machine_part_name: string;
  problem_with_machine: string;
  location: string;
  task_start_date: string;
  task_start_time: string;
  task_ending_date: string;
  task_end_time: string;
  enable_reminders: boolean;
  require_attachment: boolean;
  image?: File | null;
};

const PAGE_SIZE = 25;

export default function Indent() {
  const [tasks, setTasks] = useState<RepairTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formOptions, setFormOptions] = useState<FormOptions>({
    machines: [],
    serials: [],
    doerNames: [],
    givenBy: [],
    priority: [],
    departments: [],
  });
  const [form, setForm] = useState<FormState>({
    machine_name: "",
    serial_no: "",
    given_by: "",
    doer_name: "",
    priority: "",
    department: "",
    machine_part_name: "",
    problem_with_machine: "",
    location: "",
    task_start_date: "",
    task_start_time: "",
    task_ending_date: "",
    task_end_time: "",
    enable_reminders: false,
    require_attachment: false,
    image: null,
  });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const filteredSerials = useMemo(
    () =>
      formOptions.serials
        .filter((s) => s.machine_name === form.machine_name)
        .map((s) => s.serial_no),
    [form.machine_name, formOptions.serials]
  );

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => {
      const values = [
        t.machine_name ?? t.machineName ?? "",
        t.task_no ?? t.taskNo ?? "",
        t.serial_no ?? "",
        t.doer_name ?? "",
        t.department ?? "",
        t.machine_part_name ?? "",
      ];
      return values.some((v) => v.toLowerCase().includes(q));
    });
  }, [tasks, search]);

  const pagedTasks = filteredTasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await repairApi.getAllTasks();
      const list = (res as { tasks?: unknown[] } | unknown);
      const payload = Array.isArray((list as { tasks?: unknown[] })?.tasks)
        ? (list as { tasks?: unknown[] }).tasks
        : Array.isArray(list)
        ? (list as unknown[])
        : [];
      setTasks(payload as RepairTask[]);
      setPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch indent requests.");
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const res = await repairApi.getFormOptions();
      const rawData = (res as { data?: Record<string, unknown> })?.data ?? res;
      const data = (rawData ?? {}) as Record<string, unknown>;
      setFormOptions({
        machines: Array.isArray(data.machines) ? (data.machines as string[]) : [],
        serials: Array.isArray(data.serials)
          ? (data.serials as { machine_name: string; serial_no: string }[])
          : [],
        doerNames: Array.isArray(data.doerNames) ? (data.doerNames as string[]) : [],
        givenBy: Array.isArray(data.givenBy) ? (data.givenBy as string[]) : [],
        priority: Array.isArray(data.priority) ? (data.priority as string[]) : [],
        departments: Array.isArray(data.departments) ? (data.departments as string[]) : [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
    loadOptions();
  }, []);

  const resetForm = () => {
    setForm({
      machine_name: "",
      serial_no: "",
      given_by: "",
      doer_name: "",
      priority: "",
      department: "",
      machine_part_name: "",
      problem_with_machine: "",
      location: "",
      task_start_date: "",
      task_start_time: "",
      task_ending_date: "",
      task_end_time: "",
      enable_reminders: false,
      require_attachment: false,
      image: null,
    });
  };

  const handleSubmit = async () => {
    if (!form.machine_name || !form.serial_no || !form.given_by || !form.doer_name) {
      toast.error("Please fill required fields");
      return;
    }

    const buildTimestamp = (date?: string, time?: string) => {
      if (!date || !time) return "";
      return `${date} ${time}:00`;
    };

    const now = new Date();
    const timeStamp = now.toISOString().replace("T", " ").substring(0, 19);

    const fd = new FormData();
    fd.append("time_stamp", timeStamp);
    fd.append("serial_no", form.serial_no);
    fd.append("machine_name", form.machine_name);
    fd.append("given_by", form.given_by);
    fd.append("doer_name", form.doer_name);
    fd.append("enable_reminders", String(form.enable_reminders));
    fd.append("require_attachment", String(form.require_attachment));
    fd.append("task_start_date", buildTimestamp(form.task_start_date, form.task_start_time));
    fd.append("task_ending_date", buildTimestamp(form.task_ending_date, form.task_end_time));
    fd.append("problem_with_machine", form.problem_with_machine);
    fd.append("department", form.department);
    fd.append("location", form.location);
    fd.append("machine_part_name", form.machine_part_name);
    fd.append("priority", form.priority);
    if (form.image) {
      fd.append("image", form.image);
    }

    try {
      setSaving(true);
      const res = await repairApi.createTask(fd);
      if (res?.success) {
        toast.success("Repair task created successfully");
        setIsModalOpen(false);
        resetForm();
        await loadTasks();
      } else {
        toast.error(res?.message || "Server error");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to submit");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  const formatText = (text?: string, len = 20) => {
    if (!text) return "N/A";
    return text.length > len ? `${text.slice(0, len)}…` : text;
  };

  return (
    <RepairPageShell
      heading="Indent Management"
      subtext="Create and track repair indents"
      icon={<Plus className="text-blue-600" size={36} />}
    >
      <div className="px-4 md:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by machine, task no, serial, doer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={loadTasks} disabled={loading}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Indent
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="relative w-full">
            <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
                  <TableRow>
                    <TableHead className="bg-white min-w-[120px]">Task Number</TableHead>
                    <TableHead className="bg-white min-w-[150px]">Machine Name</TableHead>
                    <TableHead className="bg-white min-w-[120px]">Serial No</TableHead>
                        <TableHead className="bg-white min-w-[120px]">Doer</TableHead>
                    <TableHead className="bg-white min-w-[120px]">Department</TableHead>
                    <TableHead className="bg-white min-w-[160px]">Machine Part Name</TableHead>
                    <TableHead className="bg-white min-w-[100px]">Priority</TableHead>
                    <TableHead className="bg-white min-w-[110px]">Start Date</TableHead>
                    <TableHead className="bg-white min-w-[110px]">End Date</TableHead>
                    <TableHead className="bg-white min-w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading tasks...
                    </div>
                  </TableCell>
                </TableRow>
              ) : pagedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                pagedTasks.map((task) => (
                  <TableRow key={task.id ?? task.task_no ?? task.taskNo ?? Math.random()}>
                    <TableCell className="font-medium text-blue-600">
                      {task.task_no || task.taskNo || "N/A"}
                    </TableCell>
                    <TableCell>{formatText(task.machine_name || task.machineName, 25)}</TableCell>
                    <TableCell>{formatText(task.serial_no, 15)}</TableCell>
                    <TableCell>{formatText(task.doer_name, 15)}</TableCell>
                    <TableCell>{formatText(task.department, 15)}</TableCell>
                    <TableCell>{formatText(task.machine_part_name, 20)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                        {task.priority || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(task.task_start_date)}</TableCell>
                    <TableCell>{formatDate(task.task_ending_date)}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                        {task.status || "N/A"}
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

        <div className="px-4 md:px-6 lg:px-8">
          <Pagination
        page={page}
        total={filteredTasks.length}
        pageSize={PAGE_SIZE}
            onChange={(p) => setPage(p)}
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Add New Indent</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new repair indent
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm">Machine Name *</label>
              <select
                value={form.machine_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, machine_name: e.target.value, serial_no: "" }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select Machine</option>
                {formOptions.machines.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Serial No *</label>
              <select
                value={form.serial_no}
                onChange={(e) => setForm((prev) => ({ ...prev, serial_no: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select Serial</option>
                {filteredSerials.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Doer Name *</label>
              <select
                value={form.doer_name}
                onChange={(e) => setForm((prev) => ({ ...prev, doer_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select Doer Name</option>
                {formOptions.doerNames.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Given By *</label>
              <select
                value={form.given_by}
                onChange={(e) => setForm((prev) => ({ ...prev, given_by: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select Given By</option>
                {formOptions.givenBy.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select Department</option>
                {formOptions.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm">Machine Part Name</label>
              <Input
                value={form.machine_part_name}
                onChange={(e) => setForm((prev) => ({ ...prev, machine_part_name: e.target.value }))}
                placeholder="Enter part name"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Select Priority</option>
                {formOptions.priority.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Task Start Date</label>
              <Input
                type="date"
                value={form.task_start_date}
                onChange={(e) => setForm((prev) => ({ ...prev, task_start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Task Start Time</label>
              <Input
                type="time"
                value={form.task_start_time}
                onChange={(e) => setForm((prev) => ({ ...prev, task_start_time: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Task End Date</label>
              <Input
                type="date"
                value={form.task_ending_date}
                onChange={(e) => setForm((prev) => ({ ...prev, task_ending_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Task End Time</label>
              <Input
                type="time"
                value={form.task_end_time}
                onChange={(e) => setForm((prev) => ({ ...prev, task_end_time: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Problem With Machine</label>
              <textarea
                value={form.problem_with_machine}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, problem_with_machine: e.target.value }))
                }
                className="w-full rounded-md border border-gray-300 p-2"
                rows={3}
                placeholder="Describe the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image of the Machine</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image: e.target.files?.[0] || null }))
                }
              />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.enable_reminders}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, enable_reminders: !prev.enable_reminders }))
                  }
                />
                Enable Reminders
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.require_attachment}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, require_attachment: !prev.require_attachment }))
                  }
                />
                Require Attachment
              </label>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-sm">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              💾 Save Indent
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
