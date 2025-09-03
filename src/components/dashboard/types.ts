export interface UPS {
  _id: string;
  upsId: string;
  name: string;
  location: string;
  status: 'healthy' | 'warning' | 'failed' | 'risky';
  lastChecked: string;
  powerInput: number;
  powerOutput: number;
  batteryLevel: number;
  temperature: number;
  load?: number;
  efficiency?: number;
  failureRisk?: number;
  uptime?: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  warrantyExpiry?: string;
  maintenanceSchedule?: string;
  nextMaintenance?: string;
  criticalLoad?: number;
  capacity?: number;
  cause?: string;
  events: UPSEvent[];
  alerts: UPSAlert[];
}

export interface UPSEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  severity?: 'low' | 'medium' | 'high';
  category?: string;
  resolved?: boolean;
}

export interface UPSAlert {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'resolved';
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface DashboardStats {
  totalUPS: number;
  activeUPS: number;
  failedUPS: number;
  warningUPS?: number;
  riskyUPS?: number;
  healthyUPS?: number;
  alertsLast24h?: number;
  predictionsCount?: number;
}