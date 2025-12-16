import React, { useState } from "react";
import Heading from "../../components/element/Heading";
import { Store, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

import { API_URL } from "@/api";

interface StockRow {
  itemCode: string;
  itemName: string;
  uom: string;
  openingQty: number;
  closingQty: number;
}

const PAGE_SIZE = 50;

/* 🔹 Simple Pagination (1,2,3 buttons only) – CLIENT SIDE */
function PaginationBar({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (!total) return null;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pages: number[] = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, page + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
      <span>
        Showing{" "}
        <span className="font-semibold text-slate-700">{startIndex}</span>–
        <span className="font-semibold text-slate-700">{endIndex}</span> of{" "}
        <span className="font-semibold text-slate-700">
          {total.toLocaleString("en-IN")}
        </span>{" "}
        records
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
        >
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
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function StockReport() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ✅ BACKEND se pura data (NO pagination backend)
  const [allRows, setAllRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ FRONTEND pagination + search
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  // Convert YYYY-MM-DD → DD-MM-YYYY for backend
  const toBackendDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const fetchStock = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From Date and To Date");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const fromParam = toBackendDate(fromDate);
      const toParam = toBackendDate(toDate);

      const res = await axios.get(`${API_URL}/stock`, {
        params: {
          fromDate: fromParam,
          toDate: toParam,
        },
      });

      const apiData = res.data;
      if (apiData?.success && Array.isArray(apiData.data)) {
        const rows: StockRow[] = apiData.data.map((r: Record<string, unknown>) => ({
          itemCode: String(r.COL1 || "").trim(),
          itemName: String(r.COL2 || "").trim(),
          uom: String(r.COL3 || "").trim(),
          openingQty: parseFloat(String(r.COL4 || "0")) || 0,
          closingQty: parseFloat(String(r.COL5 || "0")) || 0,
        }));

        setAllRows(rows);
        setPage(1); // naya data → page 1
        toast.success(`Loaded ${rows.length} records`);
      } else {
        setAllRows([]);
        setPage(1);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Fetch error:", err);
      setError(error?.response?.data?.message || "Failed to fetch data");
      setAllRows([]);
      setPage(1);
      toast.error("Failed to fetch stock data");
    } finally {
      setLoading(false);
    }
  };

  /* 🔍 GLOBAL SEARCH (poore data par) */
  const q = searchText.trim().toLowerCase();
  const filteredRows = q
    ? allRows.filter((row) => {
        const c1 = row.itemCode.toLowerCase();
        const c2 = row.itemName.toLowerCase();
        const c3 = row.uom.toLowerCase();
        return c1.includes(q) || c2.includes(q) || c3.includes(q);
      })
    : allRows;

  const totalRecords = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-4 p-4 md:p-6 lg:p-8">
      {/* Heading */}
      <Heading
        heading="Stock Report"
        subtext="View Oracle stock data by date range"
      >
        <Store size={50} className="text-primary" />
      </Heading>

      {/* Filters – ONLY date filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col">
            <label htmlFor="fromDate" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              From Date
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const selectedDate = e.target.value;
                setFromDate(selectedDate);
                // Auto-validate: if toDate is before fromDate, update toDate
                if (selectedDate && toDate && new Date(selectedDate) > new Date(toDate)) {
                  setToDate(selectedDate);
                }
              }}
              className="w-full sm:w-[200px] bg-white border border-slate-200 rounded-md px-3 py-2 text-sm h-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/50 focus-visible:ring-[3px] focus:outline-none"
              min="2020-01-01"
              max={todayStr}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="toDate" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              To Date
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const selectedDate = e.target.value;
                setToDate(selectedDate);
                // Auto-validate: if fromDate is after toDate, update fromDate
                if (selectedDate && fromDate && new Date(selectedDate) < new Date(fromDate)) {
                  setFromDate(selectedDate);
                }
              }}
              className="w-full sm:w-[200px] bg-white border border-slate-200 rounded-md px-3 py-2 text-sm h-10 focus-visible:border-blue-500 focus-visible:ring-blue-500/50 focus-visible:ring-[3px] focus:outline-none"
              min={fromDate || "2020-01-01"}
              max={todayStr}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center justify-between sm:justify-start">
          <Button
            onClick={fetchStock}
            disabled={loading || !fromDate || !toDate}
            className="mt-2 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Loading..." : "Search"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="mt-2 sm:mt-0"
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSearchText("");
              setPage(1);
              setAllRows([]);
              setError(null);
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Record Count + Error */}
      <div className="flex justify-between items-center text-sm text-slate-500">
        <p>
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {totalRecords.toLocaleString("en-IN")}
          </span>{" "}
          total records
        </p>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-1 rounded-md">
            {error}
          </p>
        )}
      </div>

      {/* 🔍 Global Search – table ke upar right me */}
      {allRows.length > 0 && (
        <div className="flex justify-end mb-2">
          <div className="w-full sm:w-[400px] md:w-[500px]">
            <Input
              type="text"
              placeholder="Search: Code / Name / UOM"
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* NEW TABLE with sticky header */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="max-h-[70vh] overflow-auto relative">
          <table className="min-w-full text-center border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-20 shadow-sm">
              <tr>
                <th className="px-3 py-2 font-semibold border-b whitespace-nowrap">S.No</th>
                <th className="px-3 py-2 font-semibold border-b whitespace-nowrap">Item Code</th>
                <th className="px-3 py-2 font-semibold border-b whitespace-nowrap">Item Name</th>
                <th className="px-3 py-2 font-semibold border-b whitespace-nowrap">UOM</th>
                <th className="px-3 py-2 font-semibold border-b whitespace-nowrap">
                  Opening Qty
                </th>
                <th className="px-3 py-2 font-semibold border-b whitespace-nowrap">
                  Closing Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-slate-500 text-sm"
                  >
                    Loading...
                  </td>
                </tr>
              ) : pagedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-slate-400 text-sm"
                  >
                    {allRows.length === 0 ? "Please select dates and click Search to load data" : "No Data Found"}
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="border-b px-2 py-1">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="border-b px-2 py-1">{row.itemCode}</td>
                    <td className="border-b px-2 py-1">{row.itemName}</td>
                    <td className="border-b px-2 py-1">{row.uom}</td>
                    <td className="border-b px-2 py-1">{row.openingQty}</td>
                    <td className="border-b px-2 py-1">
                      {row.closingQty === 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px]">
                          Out of Stock
                        </span>
                      ) : (
                        row.closingQty
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Bar – client-side */}
      {totalRecords > 0 && (
        <PaginationBar
          page={currentPage}
          total={totalRecords}
          onChange={(p) => setPage(p)}
        />
      )}

      {/* Footer */}
      <div className="text-[11px] text-slate-400 text-right">
        Oracle stock view · {new Date().toLocaleString()}
      </div>
    </div>
  );
}

