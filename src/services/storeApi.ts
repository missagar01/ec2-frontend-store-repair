// Store System API Services
import { apiRequest, API_BASE_URL, getToken } from "../config/api";

// Store Indent APIs
export const storeApi = {
  // Store Indent
  createStoreIndent: (data: any) =>
    apiRequest("/store-indent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPendingIndents: () => apiRequest("/store-indent/pending"),
  getHistoryIndents: () => apiRequest("/store-indent/history"),
  approveStoreIndent: (data: any) =>
    apiRequest("/store-indent/approve", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getStoreIndentDashboard: () => apiRequest("/store-indent/dashboard"),
  downloadPendingIndents: () => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/store-indent/pending/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.blob());
  },
  // Repair Gate Pass APIs
  getRepairGatePassPending: () => apiRequest("/repair-gate-pass/pending"),
  getRepairGatePassReceived: () => apiRequest("/repair-gate-pass/received"),
  getRepairGatePassHistory: () => apiRequest("/repair-gate-pass/history"),
  getRepairGatePassCounts: () => apiRequest("/repair-gate-pass/counts"),

  downloadHistoryIndents: () => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/store-indent/history/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.blob());
  },

  // Indent APIs
  getIndents: () => apiRequest("/indent"),
  getAllIndents: () => apiRequest("/indent/all"),
  getIndent: (requestNumber: string) => apiRequest(`/indent/${requestNumber}`),
  submitIndent: (data: any) =>
    apiRequest("/indent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateIndentStatus: (requestNumber: string, data: any) =>
    apiRequest(`/indent/${requestNumber}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  filterIndents: (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/indent/filter?${queryString}`);
  },
  getIndentsByStatus: (statusType: string) =>
    apiRequest(`/indent/status/${statusType}`),

  // Purchase Order APIs
  getPoPending: () => apiRequest("/po/pending"),
  getPoHistory: () => apiRequest("/po/history"),
  downloadPoPending: () => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/po/pending/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.blob());
  },
  downloadPoHistory: () => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/po/history/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.blob());
  },

  // Item APIs
  getItems: () => apiRequest("/items"),

  // Stock APIs
  getStock: (fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    const query = params.toString();
    return apiRequest(`/stock${query ? `?${query}` : ""}`);
  },

  // UOM APIs
  getUom: () => apiRequest("/uom"),

  // Cost Location APIs
  getCostLocations: (divCode?: string) => {
    const query = divCode ? `?divCode=${divCode}` : "";
    return apiRequest(`/cost-location${query}`);
  },
  getCostLocationsRP: () => apiRequest("/cost-location/rp"),
  getCostLocationsPM: () => apiRequest("/cost-location/pm"),
  getCostLocationsCO: () => apiRequest("/cost-location/co"),

  // Vendor Rate Update APIs
  getVendorRatePending: () => apiRequest("/vendor-rate-update/pending"),
  getVendorRateHistory: () => apiRequest("/vendor-rate-update/history"),
  updateVendorRate: (data: any) =>
    apiRequest("/vendor-rate-update", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Three Party Approval APIs
  getThreePartyPending: () => apiRequest("/three-party-approval/pending"),
  getThreePartyHistory: () => apiRequest("/three-party-approval/history"),
  approveThreeParty: (data: any) =>
    apiRequest("/three-party-approval/approve", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // User APIs
  getUser: (employeeId: string) => apiRequest(`/user/${employeeId}`),
  getMe: () => apiRequest("/user/me"),
};

