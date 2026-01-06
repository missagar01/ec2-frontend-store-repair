import { useEffect, useState } from "react";
import { FileText, Loader } from "lucide-react";
import Heading from "../../components/element/Heading";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { repairFollowupApi } from "../../services/repairFollowupApi";
import { set } from "zod";

const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

type GatePassRow = {
    id?: number;
    gate_pass_no?: string;
    gate_pass_date?: string;
    department?: string;
    party_name?: string;
    item_name?: string;
    item_code?: string;
    qty_issued?: number;
    uom?: string;
    lead_time?: number;
    stage1_status?: string;
    stage2_status?: string;
    planened1?: string;
    actual1?: string;
    planned2?: string;
    actual2?: string;
    gate_pass_status?: string;
};

const PAGE_SIZE = 50;

export default function RepairFollowup() {
    const [rows, setRows] = useState<GatePassRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [stage2Status, setStage2Status] = useState("");
    const [gatePassStatus, setGatePassStatus] = useState<"pending" | "completed">("pending");


    // 🔥 STATE CONTROLS TAB (NO ROUTE REQUIRED)
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

    const isCompleted = (status?: string) =>
        status?.toLowerCase() === "completed";

    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await repairFollowupApi.getAll();
                if (!active) return;

                const allRows: GatePassRow[] = Array.isArray(res?.data)
                    ? res.data
                    : [];

                const filtered =
                    activeTab === "history"
                        ? allRows.filter(r => isCompleted(r.gate_pass_status)) // ✅ ONLY completed
                        : allRows.filter(r => !isCompleted(r.gate_pass_status)); // ✅ NOT completed

                setRows(filtered);
            } catch (err) {
                toast.error("Failed to load repair follow-up data");
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => { active = false; };
    }, [activeTab]);


    /* ================= SEARCH ================= */
    const query = search.trim().toLowerCase();
    const filteredRows = query
        ? rows.filter(
            (r) =>
                r.gate_pass_no?.toLowerCase().includes(query) ||
                r.department?.toLowerCase().includes(query) ||
                r.party_name?.toLowerCase().includes(query) ||
                r.item_name?.toLowerCase().includes(query) ||
                r.item_code?.toLowerCase().includes(query)
        )
        : rows;

    /* ================= PAGINATION ================= */
    const total = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

    const handleProcess = async (row: GatePassRow) => {
        if (!row.id) return;

        try {
            const res = await repairFollowupApi.updateStage2(row.id, {
                stage2_status: stage2Status,
                gate_pass_status: gatePassStatus,
            });

            if (res.success) {
                toast.success("Process completed");
                setProcessingId(null);
                setStage2Status("");
                setGatePassStatus("pending");

                // refresh
                setRows(prev =>
                    prev.map(r => (r.id === row.id ? { ...r, ...res.data } : r))
                );
            }
        } catch {
            toast.error("Failed to process");
        }
    };


    return (
        <div className="w-full p-4 md:p-6 lg:p-8">
            <Heading
                heading={
                    activeTab === "history"
                        ? "Repair Follow-up History"
                        : "Repair Follow-up Pending"
                }
                subtext={
                    activeTab === "history"
                        ? "Completed follow-ups"
                        : "Pending follow-ups"
                }
            >
                <FileText size={50} className="text-primary" />
            </Heading>

            {/* ===== TABS ===== */}
            <Button
                size="sm"
                onClick={() => setActiveTab("pending")}
                className={`transition-colors
    ${activeTab === "pending"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white text-gray-700 border hover:bg-gray-100"
                    }`}
            >
                Pending
            </Button>

            <Button
                size="sm"
                onClick={() => setActiveTab("history")}
                className={`transition-colors
    ${activeTab === "history"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white text-gray-700 border hover:bg-gray-100"
                    }`}
            >
                History
            </Button>

            {/* ===== SEARCH ===== */}
            <div className="mb-4 flex justify-end">
                <Input
                    className="w-full max-w-md"
                    placeholder="Search Gate Pass / Department / Party / Item"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* ===== TABLE ===== */}
            <div className="relative overflow-x-auto border rounded-xl bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader className="animate-spin" />
                    </div>
                ) : pageRows.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                        No data found
                    </div>
                ) : (
                    <table className="w-full min-w-[1200px] text-sm border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-100 border-b">
                            <tr>
                                {(activeTab === "pending") && (
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                        Action</th>
                                )}
                                {(activeTab === "pending") && (
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                        Next Followup Date</th>
                                )}
                                {(activeTab === "pending") && (
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                        Enq. Date</th>
                                )}
                                {(activeTab === "history") && (
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                        Delivery Date</th>
                                )}
                                {(activeTab === "history") && (
                                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                        Last Enq.</th>
                                )}
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Gate Pass No</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Gate Pass Date</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Department</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Party</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Item Name</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Item Code</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Qty Issued</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    UOM</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Lead Time</th>
                                {/* {activeTab === "history" && <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Stage 1</th>}*/}
                                {/* {activeTab === "history" && <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Follow up Remark</th>} */}
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Follow Up Remark</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                                    Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pageRows.map((row, idx) => (
                                <tr key={idx} className="border-b even:bg-gray-50 hover:bg-blue-50 transition-colors">
                                    {activeTab === "pending" && (
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {processingId === row.id ? (
                                                <div className="flex gap-2 items-center">
                                                    <Input
                                                        placeholder="add remark"
                                                        value={stage2Status}
                                                        onChange={e => setStage2Status(e.target.value)}
                                                        className="w-32"
                                                    />

                                                    <select
                                                        value={gatePassStatus}
                                                        onChange={e => setGatePassStatus(e.target.value as any)}
                                                        className="border rounded px-2 py-1 text-sm"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                    </select>

                                                    <Button size="sm" onClick={() => handleProcess(row)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md"
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setProcessingId(row.id!)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md"
                                                >
                                                    Process
                                                </Button>
                                            )}
                                        </td>
                                    )}
                                    {(activeTab === "pending") && (
                                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.planned2)}</td>
                                    )}
                                    {(activeTab === "pending") && (
                                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.actual1)}</td>
                                    )}
                                    {(activeTab === "history") && (
                                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.actual2)}</td>
                                    )}
                                    {(activeTab === "history") && (
                                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.planned2)}</td>
                                    )}
                                    <td className="px-3 py-2 whitespace-nowrap">{row.gate_pass_no}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(row.gate_pass_date)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.department}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.party_name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.item_name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.item_code}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.qty_issued}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.uom}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{row.lead_time}</td>
                                    {/* {activeTab === "history" && <td className="px-3 py-2 whitespace-nowrap">{row.stage1_status}</td>}*/}
                                    {/* {activeTab === "history" && <td className="px-3 py-2 whitespace-nowrap">{row.stage2_status}</td>} */}
                                    <td className="px-3 py-2 whitespace-nowrap">{row.stage2_status}</td>
                                    <td className="font-semibold">{row.gate_pass_status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    );
}
