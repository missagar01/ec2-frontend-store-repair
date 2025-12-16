// Repair All Tasks Page
import { useEffect, useState } from "react";
import { repairApi } from "../../services";
import { FileText } from "lucide-react";
import Heading from "../../components/element/Heading";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { RepairCheckTask } from "./repairCheckTypes";

export default function RepairAll() {
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
      const res = await repairApi.getCheckTasks();
      if (res.success && Array.isArray(res.tasks)) {
        setTasks(res.tasks);
      } else {
        setTasks([]);
      }
    } catch (err: any) {
      console.error("Error fetching repair tasks:", err);
      setError(err.message || "Failed to fetch repair tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.task_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.serial_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-4 md:p-6 lg:p-10 space-y-6">
      <Heading heading="All Repair Tasks" subtext="View all repair tasks">
        <FileText size={46} />
      </Heading>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search by task no, serial no, machine name, department..."
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
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Task No</th>
                    <th className="p-2 text-left">Serial No</th>
                    <th className="p-2 text-left">Machine Name</th>
                    <th className="p-2 text-left">Machine Part</th>
                    <th className="p-2 text-left">Department</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Given By</th>
                    <th className="p-2 text-left">Doer</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-gray-500">
                        {loading ? "Loading..." : "No repair tasks found"}
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{task.task_no || "—"}</td>
                        <td className="p-2">{task.serial_no || "—"}</td>
                        <td className="p-2">{task.machine_name || "—"}</td>
                        <td className="p-2">{task.machine_part_name || "—"}</td>
                        <td className="p-2">{task.department || "—"}</td>
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
                        <td className="p-2">{task.given_by || "—"}</td>
                        <td className="p-2">{task.doer_name || "—"}</td>
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




