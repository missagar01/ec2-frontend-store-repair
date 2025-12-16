import type { ColumnDef, Row } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PuffLoader as Loader } from "react-spinners";
import { Users } from "lucide-react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import DataTable from "../components/element/DataTable";
import Heading from "../components/element/Heading";
import { toast } from "sonner";
import { storeApi } from "../services";

type VendorItem = {
  name?: string;
  vendorName?: string;
  vendor_name?: string;
  rate?: number | string;
  rate_value?: number | string;
  term?: string;
  paymentTerm?: string;
  payment_term?: string;
};

interface VendorData {
  indentNo: string;
  indenter: string;
  department: string;
  product: string;
  comparisonSheet?: string;
  vendors: { name: string; rate: number; term: string }[];
  vendorType: string;
}

const schema = z.object({
  vendor: z.string().nonempty(),
});

const normalizeString = (...values: (string | undefined | null)[]) =>
  values.find((value) => typeof value === "string" && value.trim() !== "") ?? "";

const normalizeVendors = (raw: unknown): VendorData["vendors"] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((candidate) => {
    const obj = candidate as VendorItem;
    const rate =
      typeof obj.rate === "number"
        ? obj.rate
        : typeof obj.rate_value === "number"
        ? obj.rate_value
        : Number(obj.rate ?? obj.rate_value ?? 0);
    return {
      name:
        normalizeString(obj.name, obj.vendorName, obj.vendor_name) || "Vendor",
      rate: Number.isFinite(rate) ? rate : 0,
      term:
        normalizeString(
          obj.term,
          obj.paymentTerm,
          obj.payment_term
        ) || "Pending",
    };
  });
};

const mapThreePartyRow = (row: Record<string, unknown>): VendorData => {
  return {
    indentNo: normalizeString(
      row.indentNo as string,
      row.INDENT_NUMBER as string,
      row.indent_number as string
    ),
    indenter: normalizeString(
      row.indenter as string,
      row.INDENTER_NAME as string,
      row.indenter_name as string
    ),
    department: normalizeString(
      row.department as string,
      row.DEPARTMENT as string
    ),
    product: normalizeString(row.product as string, row.ITEM_NAME as string),
    comparisonSheet: normalizeString(
      row.comparisonSheet as string,
      row.COMPARISON_SHEET as string
    ),
    vendorType: normalizeString(
      row.vendorType as string,
      row.VENDOR_TYPE as string,
      row.vendor_type as string
    ),
    vendors: normalizeVendors(
      row.vendors ??
        row.vendorList ??
        row.comparison_sheet ??
        row.vendor_list ??
        row.vendor_details
    ),
  };
};

export default function ThreePartyRateApproval() {
  const [pendingData, setPendingData] = useState<VendorData[]>([]);
  const [historyData, setHistoryData] = useState<VendorData[]>([]);
  const [selectedIndent, setSelectedIndent] = useState<VendorData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { vendor: "" },
  });

  const columns: ColumnDef<VendorData>[] = useMemo(
    () => [
      {
        header: "Action",
        id: "action",
        cell: ({ row }: { row: Row<VendorData> }) => (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedIndent(row.original);
              setOpenDialog(true);
            }}
          >
            Approve
          </Button>
        ),
      },
      { accessorKey: "indentNo", header: "Indent No." },
      { accessorKey: "indenter", header: "Indenter" },
      { accessorKey: "department", header: "Department" },
      { accessorKey: "product", header: "Product" },
      { accessorKey: "vendorType", header: "Vendor Type" },
    ],
    []
  );

  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, historyRes] = await Promise.all([
        storeApi.getThreePartyPending(),
        storeApi.getThreePartyHistory(),
      ]);
      const pendingPayload = Array.isArray(pendingRes?.data)
        ? pendingRes.data
        : Array.isArray(pendingRes)
        ? pendingRes
        : [];
      const historyPayload = Array.isArray(historyRes?.data)
        ? historyRes.data
        : Array.isArray(historyRes)
        ? historyRes
        : [];
      setPendingData(pendingPayload.map((row) => mapThreePartyRow(row)));
      setHistoryData(historyPayload.map((row) => mapThreePartyRow(row)));
    } catch (err) {
      console.error("Failed to load approvals", err);
      toast.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  useEffect(() => {
    if (!openDialog) {
      form.reset();
      setSelectedIndent(null);
    }
  }, [openDialog, form]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!selectedIndent) return;
    const vendorIdx = Number(values.vendor);
    const vendor = selectedIndent.vendors[vendorIdx];
    if (!vendor) return toast.error("Please select a vendor");
    try {
      await storeApi.approveThreeParty({
        indentNumber: selectedIndent.indentNo,
        vendorName: vendor.name,
        rate: vendor.rate,
        paymentTerm: vendor.term,
      });
      toast.success(
        `Approved vendor ${vendor.name} for ${selectedIndent.indentNo}`
      );
      setOpenDialog(false);
      await loadApprovals();
    } catch (err) {
      console.error("Failed to approve vendor", err);
      toast.error("Failed to approve vendor");
    }
  };

  const onError = () => {
    toast.error("Please select a vendor");
  };

  return (
    <div className="p-4 md:p-6 lg:p-10">
      <Heading
        heading="Three Party Rate Approval"
        subtext="Approve rates for three party vendors"
      >
        <Users size={50} className="text-primary" />
      </Heading>

      <Tabs defaultValue="pending" className="mt-6 w-full">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable
            data={pendingData}
            columns={columns}
            searchFields={["product", "department", "indenter"]}
            dataLoading={loading}
            className="h-[68dvh]"
          />
        </TabsContent>
        <TabsContent value="history">
          <DataTable
            data={historyData}
            columns={columns}
            searchFields={["product", "department", "indenter"]}
            dataLoading={loading}
            className="h-[68dvh]"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {selectedIndent && (
          <DialogContent className="sm:max-w-3xl">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="space-y-5"
              >
                <DialogHeader>
                  <DialogTitle>Approve Vendor</DialogTitle>
                  <DialogDescription>
                    Choose a vendor for <b>{selectedIndent.indentNo}</b>
                  </DialogDescription>
                </DialogHeader>

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Vendor</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange}>
                          {selectedIndent.vendors.map((option, index) => (
                            <FormItem key={index}>
                              <FormLabel className="flex justify-between items-center border rounded-md p-3">
                                <FormControl>
                                  <RadioGroupItem value={`${index}`} />
                                </FormControl>
                                <div className="flex justify-between w-full px-3">
                                  <span>{option.name}</span>
                                  <span>₹{option.rate}</span>
                                </div>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && (
                      <Loader size={20} color="white" />
                    )}
                    Approve
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
