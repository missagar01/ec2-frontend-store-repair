// Store GRN API Services
import { apiRequest } from "../config/api";

export interface StoreGRN {
    PLANNEDDATE?: string;
    VRNO?: string;
    VRDATE?: string;
    PARTYBILLNO?: string;
    PARTYBILLAMT?: number;
    PARTYNAME?: string;
}

export interface StoreGRNResponse {
    success: boolean;
    total?: number;
    data?: StoreGRN[];
    error?: string;
}


export const storeGRNApi = {
    /* READ – Pending Store GRN */
    getPending: async (): Promise<StoreGRNResponse> => {
        return apiRequest<StoreGRNResponse>("/store-grn/pending", {
            method: "GET",
        });
    },
};
