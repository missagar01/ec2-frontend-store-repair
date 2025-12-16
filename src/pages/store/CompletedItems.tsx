import { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import Heading from "../../components/element/Heading";
import DataTable from "../../components/element/DataTable";
import { storeApi } from "../../services";

type IndentRow = {
  id?: string;
  createdAt: string;
  updatedAt: string;
  requestNumber?: string;
  requesterName?: string;
  department?: string;
  division?: string;
  productName?: string;
  requestQty?: number;
  status?: "APPROVED" | "REJECTED" | "PENDING" | "";
  approvedQuantity?: string;
  groupName?: string;
  formType?: "INDENT" | "REQUISITION" | "";
};

const mapApiRowToIndent = (rec: Record<string, unknown>): IndentRow => {
  const normalizeStatus = (val: unknown): IndentRow["status"] => {
    if (typeof val !== "string") return "";
    const upper = val.toUpperCase();
    if (upper === "APPROVED" || upper === "REJECTED" || upper === "PENDING") {
      return upper as IndentRow["status"];
    }
    return "";
  };

  const normalizeFormType = (val: unknown): IndentRow["formType"] => {
    if (typeof val !== "string") return "";
    const upper = val.toUpperCase();
    if (upper === "INDENT" || upper === "REQUISITION") {
      return upper as IndentRow["formType"];
    }
    return "";
  };

  return {
    id: rec["id"] ? String(rec["id"]) : undefined,
    createdAt: (rec["created_at"] as string) ?? "",
    updatedAt: (rec["updated_at"] as string) ?? "",
    requestNumber:
      (rec["request_number"] as string) ?? (rec["requestNumber"] as string) ?? "",
    requesterName:
      (rec["requester_name"] as string) ?? (rec["requesterName"] as string) ?? "",
    department: (rec["department"] as string) ?? "",
    division: (rec["division"] as string) ?? "",
    productName:
      (rec["product_name"] as string) ?? (rec["productName"] as string) ?? "",
    requestQty: Number(rec["request_qty"] ?? rec["requestQty"] ?? 0) || 0,
    status: normalizeStatus(rec["request_status"]),
    approvedQuantity: String(
      rec["approved_quantity"] ?? rec["approvedQuantity"] ?? ""
    ),
    groupName:
      (rec["group_name"] as string) ??
      (rec["groupName"] as string) ??
      (rec["category_name"] as string) ??
      "",
    formType: normalizeFormType(rec["form_type"] ?? rec["formType"]),
  };
};

export default function CompletedItems() {
  const [rows, setRows] = useState<IndentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetchCompletedItems = async () => {
      try {
        const [approvedRes, rejectedRes] = await Promise.all([
          storeApi.getIndentsByStatus("approved"),
          storeApi.getIndentsByStatus("rejected"),
        ]);

        if (!active) return;

        const approvedData = (
          (approvedRes as any)?.data ?? approvedRes ?? []
        ) as unknown[];
        const rejectedData = (
          (rejectedRes as any)?.data ?? rejectedRes ?? []
        ) as unknown[];

        const combinedData = [...approvedData, ...rejectedData]
          .map((rec) => mapApiRowToIndent(rec as Record<string, unknown>))
          .filter((item) => item.formType === "INDENT")
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

        setRows(combinedData);
      } catch (err) {
        console.error("Failed to load completed items", err);
        if (active) {
          toast.error("Failed to load completed items list");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCompletedItems();

    return () => {
      active = false;
    };
  }, []);

  const columns: ColumnDef<IndentRow>[] = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const timestamp = row.original.createdAt;
          if (!timestamp) return "";
          const date = new Date(timestamp);
          return date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      { accessorKey: "requestNumber", header: "Request No." },
      { accessorKey: "requesterName", header: "Requester" },
      { accessorKey: "department", header: "Department" },
      { accessorKey: "division", header: "Division" },
      { accessorKey: "productName", header: "Product" },
      { accessorKey: "requestQty", header: "Qty" },
      { accessorKey: "approvedQuantity", header: "Approved Qty" },
      { accessorKey: "groupName", header: "Group Name" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          if (status === "APPROVED") {
            return <span className="text-green-600 font-medium">APPROVED</span>;
          }
          if (status === "REJECTED") {
            return <span className="text-red-600 font-medium">REJECTED</span>;
          }
          return <span className="text-gray-500">{status}</span>;
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) => {
          const timestamp = row.original.updatedAt;
          if (!timestamp) return "";
          const date = new Date(timestamp);
          return date.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
    ],
    []
  );

  return (
    <div className="w-full p-4 md:p-6 lg:p-8">
      <Heading
        heading="Completed Indents"
        subtext="A combined list of all approved and rejected indents"
      >
        <div className="flex">
          <CheckCircle className="text-green-500" size={40} />
          <XCircle className="text-red-500" size={40} />
        </div>
      </Heading>

      <div className="mt-4">
        <DataTable
          data={rows}
          columns={columns}
          searchFields={["requestNumber", "requesterName", "productName", "status"]}
          dataLoading={loading}
          className="h-[75dvh]"
        />
      </div>
    </div>
  );
}
