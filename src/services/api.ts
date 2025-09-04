import { UPS, UPSEvent, DashboardStats } from "@/components/dashboard/types";

console.log("ENV:", import.meta.env);
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("VITE_WS_URL:", import.meta.env.VITE_WS_URL);

// --- API BASE URL ---
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is not set. Please set it in your environment variables."
  );
}

// --- WebSocket URL ---
export const WS_URL = import.meta.env.VITE_WS_URL;
if (!WS_URL) {
  console.warn(
    "VITE_WS_URL is not set. WebSocket connections will not work in production."
  );
}

// --- Generic API call ---
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// --- Dashboard API ---
export const dashboardAPI = {
  getStats: (): Promise<DashboardStats> => apiCall<DashboardStats>("/dashboard/stats"),
};

// --- UPS API ---
export const upsAPI = {
  getAll: (params?: {
    status?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: UPS[]; total: number; limit: number; offset: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.location) searchParams.append("location", params.location);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const queryString = searchParams.toString();
    return apiCall(`/ups${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id: string): Promise<UPS> => apiCall<UPS>(`/ups/${id}`),

  getStatus: (id: string): Promise<{
    upsId: string;
    status: string;
    lastChecked: string;
    batteryLevel: number;
    temperature: number;
    powerInput: number;
    powerOutput: number;
  }> => apiCall(`/ups/${id}/status`),

  getEvents: (
    id: string,
    params?: {
      event_type?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ data: UPSEvent[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.event_type) searchParams.append("event_type", params.event_type);
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    const queryString = searchParams.toString();
    return apiCall(`/ups/${id}/events${queryString ? `?${queryString}` : ""}`);
  },

  getBulkStatus: (ids: string[]): Promise<{ data: any[] }> => {
    const searchParams = new URLSearchParams();
    searchParams.append("ids", ids.join(","));
    return apiCall(`/ups/status/bulk?${searchParams.toString()}`);
  },
};

// --- Predictions API ---
export const predictionsAPI = {
  getAll: (params?: {
    ups_id?: string;
    risk_level?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ predictions: any[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.ups_id) searchParams.append("ups_id", params.ups_id);
    if (params?.risk_level) searchParams.append("risk_level", params.risk_level);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    return apiCall(`/predictions${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
  },
};

// --- Alerts API ---
export const alertsAPI = {
  getAll: (params?: { severity?: string; status?: string; limit?: number; offset?: number }): Promise<{ data: any[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.severity) searchParams.append("severity", params.severity);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());

    return apiCall(`/alerts${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
  },
  getCounts: (): Promise<{ counts: any[] }> => apiCall("/alerts/count"),
};

// --- Reports API ---
export const reportsAPI = {
  getPerformance: (params?: { start_date?: string; end_date?: string; ups_ids?: string[] }): Promise<{ data: any[] }> => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);
    if (params?.ups_ids) searchParams.append("ups_ids", params.ups_ids.join(","));

    return apiCall(`/reports/ups-performance${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
  },
};

// --- Locations API ---
export const locationsAPI = {
  getAll: (): Promise<{ data: string[] }> => apiCall("/locations"),
};

// --- Health Check API ---
export const healthAPI = {
  check: (): Promise<{ status: string; db: boolean; error?: string }> => apiCall("/health"),
};
