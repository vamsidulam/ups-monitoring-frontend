import { useEffect, useMemo, useState } from 'react';
import { useUPSData } from './useUPSData';
import { API_BASE_URL } from '@/services/api';

export function useDashboardStatsRealTime() {
  const { upsData, loading, error } = useUPSData();
  const [predictionsCount, setPredictionsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const fetchPredictionsCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/predictions?limit=50`);
        if (!response.ok) return;
        const data = await response.json();
        const count = Array.isArray(data?.predictions) ? data.predictions.length : 0;
        if (isMounted) setPredictionsCount(count);
      } catch (_) {
        // silent
      }
    };

    fetchPredictionsCount();
    const interval = setInterval(fetchPredictionsCount, 900000); // 15 minutes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    if (!upsData || upsData.length === 0) {
      return {
        totalUPS: 0,
        activeUPS: 0,
        failedUPS: 0,
        warningUPS: 0,
        riskyUPS: 0,
        healthyUPS: 0,
        alertsLast24h: 0,
        predictionsCount
      };
    }

    const totalUPS = upsData.length;
    const activeUPS = upsData.filter(ups => ups.status === 'healthy').length;
    const failedUPS = upsData.filter(ups => ups.status === 'failed').length;
    const warningUPS = upsData.filter(ups => ups.status === 'warning').length;
    const riskyUPS = upsData.filter(ups => ups.status === 'risky').length;
    const healthyUPS = upsData.filter(ups => ups.status === 'healthy').length;

    // Estimate alerts last 24h from statuses
    const alertsLast24h = failedUPS * 3 + warningUPS * 2 + riskyUPS * 1;

    return {
      totalUPS,
      activeUPS,
      failedUPS,
      warningUPS,
      riskyUPS,
      healthyUPS,
      alertsLast24h,
      predictionsCount
    };
  }, [upsData, predictionsCount]);

  return {
    data: stats,
    isLoading: loading,
    error
  };
}
