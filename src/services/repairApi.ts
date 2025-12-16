// Repair System API Services
import { apiRequest, API_BASE_URL, getToken } from "../config/api";

// Repair Task APIs
export const repairApi = {
  // Get all repair tasks
  getAllTasks: () => apiRequest<{ success: boolean; tasks: any[] }>("/repair/all"),

  // Create repair task (with file upload)
  createTask: (formData: FormData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/repair/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then((res) => res.json());
  },

  // Get form options
  getFormOptions: () => apiRequest("/repair-options/form-options"),

  // Repair Check APIs
  getCheckTasks: () => apiRequest("/repair-check/all"),
  getPendingCheck: () => apiRequest("/repair-check/pending"),
  getHistoryCheck: () => apiRequest("/repair-check/history"),
  updateCheckTask: (taskNo: string, data: any) =>
    apiRequest(`/repair-check/update/${taskNo}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  uploadBill: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    return fetch(`${API_BASE_URL}/repair-check/upload-bill`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then((res) => res.json());
  },

  // Sent to Vendor APIs
  getSentToVendorAll: () => apiRequest("/repair-system/all"),
  getSentToVendorPending: () => apiRequest("/repair-system/pending"),
  getSentToVendorHistory: () => apiRequest("/repair-system/history"),
  updateSentToVendor: (taskNo: string, formData: FormData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/repair-system/update/${taskNo}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then((res) => res.json());
  },

  // Store In APIs
  getStoreInAll: () => apiRequest("/store-in/all"),
  updateStoreIn: (taskNo: string, data: any) =>
    apiRequest(`/store-in/update/${taskNo}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    return fetch(`${API_BASE_URL}/store-in/upload-product`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).then((res) => res.json());
  },

  // Payment APIs
  getPendingPayments: () => apiRequest("/payment/pending"),
  getPaymentHistory: () => apiRequest("/payment/history"),
  addPayment: (data: any) =>
    apiRequest("/payment/add", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Dashboard APIs
  getDashboardMetrics: () => apiRequest("/dashboard"),
};

