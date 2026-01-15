import { apiRequest } from "../config/api";

export interface UserSettings {
    id: number;
    user_name?: string;
    store_access?: string;
}

export interface UserSettingsResponse {
    success: boolean;
    data?: UserSettings | UserSettings[];
    message?: string;
}


export const settingsApi = {
    /* READ ALL USERS */
    getUsers: async (): Promise<UserSettingsResponse> => {
        return apiRequest<UserSettingsResponse>("/settings/users", {
            method: "GET",
        });
    },

    /* PATCH STORE ACCESS */
    patchStoreAccess: async (
        id: number,
        store_access: string
    ): Promise<UserSettingsResponse> => {
        return apiRequest<UserSettingsResponse>(
            `/settings/users/${id}/store-access`,
            {
                method: "PATCH",
                body: JSON.stringify({ store_access }),
            }
        );
    },

};
