import { useEffect, useMemo, useState } from "react";
import { repairApi } from "../../services";
import { FileText } from "lucide-react";
import Heading from "../../components/element/Heading";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { RepairCheckTask } from "./repairCheckTypes";

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }
  return String(value);
};

export default function RepairCheckPending() {
  const [tasks, setTasks] = useState<RepairCheckTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await repairApi.getPendingCheck();
      if (response.success && Array.isArray(response.tasks)) {
        setTasks(response.tasks);
      } else {
        setTasks([]);
      }
    } catch (err: any) {
      console.error("Error fetching pending repair checks:", err);
      setError(err.message || "Failed to fetch pending repair checks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    if (!lower) return tasks;
    return tasks.filter((task) => {
      return (
        task.task_no?.toLowerCase().includes(lower) ||
        task.serial_no?.toLowerCase().includes(lower) ||
        task.machine_name?.toLowerCase().includes(lower) ||
        task.department?.toLowerCase().includes(lower) ||
        task.priority?.toLowerCase().includes(lower) ||
        task.given_by?.toLowerCase().includes(lower)
      );
    });
  }, [searchTerm, tasks]);

  return (
    <div className="w-full p-4 md:p-6 lg:p-10 space-y-6">
      <Heading heading="Pending Repair Checks" subtext="Tasks that require action">
        <FileText size={42} />
      </Heading>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by task no, machine, department, priority..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading pending checks...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Task No</th>
                    <th className="p-2 text-left">Machine</th>
                    <th className="p-2 text-left">Department</th>
                    <th className="p-2 text-left">Priority</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Start</th>
                    <th className="p-2 text-left">End</th>
                    <th className="p-2 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-500">
                        {loading ? "Loading..." : "No pending repair checks found"}
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-semibold">{task.task_no || "—"}</td>
                        <td className="p-2">{task.machine_name || "—"}</td>
                        <td className="p-2">{task.department || "—"}</td>
                        <td className="p-2">{task.priority || "—"}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              task.status === "done"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status || "Pending"}
                          </span>
                        </td>
                        <td className="p-2">{task.task_start_date || "—"}</td>
                        <td className="p-2">{task.task_ending_date || "—"}</td>
                        <td className="p-2">
                          <details className="text-xs text-slate-600">
                            <summary className="cursor-pointer text-slate-800 underline decoration-dotted decoration-slate-300">
                              Show all fields
                            </summary>
                            <div className="mt-2 space-y-1 text-[11px]">
                              {Object.entries(task)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([key, value]) => (
                                  <div
                                    key={`${task.id}-${key}`}
                                    className="flex justify-between border-b border-dashed border-slate-200 py-1"
                                  >
                                    <span className="capitalize text-slate-500">{key}</span>
                                    <span className="font-mono text-right text-slate-900">
                                      {formatValue(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

