// Repair Followup API Services
import { apiRequest } from "../config/api";

/* =========================
   TYPES / INTERFACES
========================= */

export interface RepairFollowup {
    id?: number;

    gate_pass_date?: string;   // YYYY-MM-DD
    gate_pass_no?: string;

    department?: string;
    party_name?: string;

    item_name?: string;
    item_code?: string;

    remarks?: string;
    uom?: string;

    qty_issued?: number;
    lead_time?: number;

    planned1?: string;
    actual1?: string;
    time_delay1?: number;
    stage1_status?: string;

    planned2?: string;
    actual2?: string;
    time_delay2?: number;
    stage2_status?: string;

    gate_pass_status?: string;

    created_at?: string;
    updated_at?: string;
}

export interface RepairFollowupResponse {
    success: boolean;
    data?: RepairFollowup | RepairFollowup[];
    message?: string;
}

export interface RepairFollowupStage2Payload {
    stage2_status: string;     // e.g. "completed"
    gate_pass_status: string; // e.g. "Closed"
}

export const repairFollowupApi = {
    /* CREATE */
    create: async (
        data: RepairFollowup
    ): Promise<RepairFollowupResponse> => {
        return apiRequest<RepairFollowupResponse>("/repair-followup", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /* READ ALL */
    getAll: async (): Promise<RepairFollowupResponse> => {
        return apiRequest<RepairFollowupResponse>("/repair-followup", {
            method: "GET",
        });
    },

    /* READ BY ID */
    getById: async (
        id: number
    ): Promise<RepairFollowupResponse> => {
        return apiRequest<RepairFollowupResponse>(`/repair-followup/${id}`, {
            method: "GET",
        });
    },

    /* UPDATE */
    update: async (
        id: number,
        data: RepairFollowup
    ): Promise<RepairFollowupResponse> => {
        return apiRequest<RepairFollowupResponse>(`/repair-followup/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    updateStage2: async (
        id: number,
        data: RepairFollowupStage2Payload
    ): Promise<RepairFollowupResponse> => {
        return apiRequest<RepairFollowupResponse>(
            `/repair-followup/${id}/stage2`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            }
        );
    },

    /* DELETE */
    remove: async (
        id: number
    ): Promise<RepairFollowupResponse> => {
        return apiRequest<RepairFollowupResponse>(`/repair-followup/${id}`, {
            method: "DELETE",
        });
    },
};
