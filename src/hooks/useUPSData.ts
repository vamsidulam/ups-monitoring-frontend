import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/services/api';

interface UPSData {
  _id: string;
  upsId: string;
  name: string;
  status: "healthy" | "failed" | "warning" | "risky";
  batteryLevel: number;
  temperature: number;
  load: number;
  efficiency: number;
  failureRisk: number;
  lastUpdated: string;
  lastChecked: string;
  powerInput: number;
  powerOutput: number;
  capacity: number;
  criticalLoad: number;
  uptime: number;
  location: string;
  events?: any[];
  alerts?: any[];
}

export function useUPSData() {
  const [upsData, setUpsData] = useState<UPSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUPSData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ups`);
      if (response.ok) {
        const data = await response.json();
        setUpsData(data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch UPS data');
      }
    } catch (err) {
      setError('Network error while fetching UPS data');
      console.error('Error fetching UPS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUPSData();
    
    // Refresh every 5 minutes (300000 ms) to match backend monitoring service
    const interval = setInterval(fetchUPSData, 300000);
    
    return () => clearInterval(interval);
  }, []);

  return { upsData, loading, error, refetch: fetchUPSData };
}
