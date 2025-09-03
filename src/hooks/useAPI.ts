import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  dashboardAPI, 
  upsAPI, 
  alertsAPI, 
  predictionsAPI,
  reportsAPI, 
  locationsAPI, 
  healthAPI 
} from '@/services/api';

// Query keys
export const queryKeys = {
  health: ['health'],
  dashboard: {
    stats: ['dashboard', 'stats'],
  },
  ups: {
    all: (params?: any) => ['ups', 'all', params],
    byId: (id: string) => ['ups', 'detail', id],
    status: (id: string) => ['ups', 'status', id],
    events: (id: string, params?: any) => ['ups', 'events', id, params],
    bulkStatus: (ids: string[]) => ['ups', 'bulk-status', ids],
  },
  alerts: {
    all: (params?: any) => ['alerts', 'all', params],
    counts: ['alerts', 'counts'],
  },
  predictions: {
    all: (params?: any) => ['predictions', 'all', params],
    byUPS: (upsId: string) => ['predictions', 'byUPS', upsId],
  },
  reports: {
    performance: (params?: any) => ['reports', 'performance', params],
  },
  locations: {
    all: ['locations', 'all'],
  },
};

// Health check hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: healthAPI.check,
    refetchInterval: 30000, // Check every 30 seconds
  });
};

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: dashboardAPI.getStats,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// UPS hooks
export const useUPSList = (params?: {
  status?: string;
  location?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.ups.all(params),
    queryFn: () => upsAPI.getAll(params),
    refetchInterval: 60000, // Refresh every 1 minute for real-time updates
  });
};

export const useUPSDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.ups.byId(id),
    queryFn: () => upsAPI.getById(id),
    enabled: !!id,
    refetchInterval: 300000, // Refresh every 5 minutes (300 seconds)
    refetchIntervalInBackground: true, // Continue refetching even when tab is not active
  });
};

export const useUPSStatus = (id: string) => {
  return useQuery({
    queryKey: queryKeys.ups.status(id),
    queryFn: () => upsAPI.getStatus(id),
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time status
  });
};

export const useUPSEvents = (
  id: string,
  params?: {
    event_type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }
) => {
  return useQuery({
    queryKey: queryKeys.ups.events(id, params),
    queryFn: () => upsAPI.getEvents(id, params),
    enabled: !!id,
  });
};

export const useUPSBulkStatus = (ids: string[]) => {
  return useQuery({
    queryKey: queryKeys.ups.bulkStatus(ids),
    queryFn: () => upsAPI.getBulkStatus(ids),
    enabled: ids.length > 0,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// Alerts hooks
export const useAlerts = (params?: {
  severity?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.alerts.all(params),
    queryFn: () => alertsAPI.getAll(params),
    refetchInterval: 20000, // Refresh every 20 seconds
  });
};

export const useAlertCounts = () => {
  return useQuery({
    queryKey: queryKeys.alerts.counts,
    queryFn: alertsAPI.getCounts,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Predictions hooks
export const usePredictions = (params?: {
  ups_id?: string;
  risk_level?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.predictions.all(params),
    queryFn: () => predictionsAPI.getAll(params),
    refetchInterval: 60000, // Refresh every 1 minute
  });
};

export const usePredictionsByUPS = (upsId: string, limit: number = 5) => {
  return useQuery({
    queryKey: queryKeys.predictions.byUPS(upsId),
    queryFn: () => predictionsAPI.getAll({ ups_id: upsId, limit }),
    enabled: !!upsId,
    refetchInterval: 60000, // Refresh every 1 minute
  });
};

// Reports hooks
export const usePerformanceReport = (params?: {
  start_date?: string;
  end_date?: string;
  ups_ids?: string[];
}) => {
  return useQuery({
    queryKey: queryKeys.reports.performance(params),
    queryFn: () => reportsAPI.getPerformance(params),
    enabled: !!params?.start_date || !!params?.end_date, // Only fetch if date range is provided
  });
};

// Locations hooks
export const useLocations = () => {
  return useQuery({
    queryKey: queryKeys.locations.all,
    queryFn: locationsAPI.getAll,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

// Utility hook for invalidating queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateUPS: () => {
      queryClient.invalidateQueries({ queryKey: ['ups'] });
    },
    invalidateAlerts: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
};
