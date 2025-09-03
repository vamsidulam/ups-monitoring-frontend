import { UPS, UPSEvent, DashboardStats } from "@/components/dashboard/types";

// Sample UPS Events
const generateEvents = (upsId: string): UPSEvent[] => [
  {
    id: `${upsId}-evt-1`,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: 'info',
    message: 'Battery test completed successfully'
  },
  {
    id: `${upsId}-evt-2`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: 'warning',
    message: 'High temperature detected'
  },
  {
    id: `${upsId}-evt-3`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    type: 'info',
    message: 'Power restored from utility'
  }
];

// Sample UPS Data
export const mockUPSData: UPS[] = [
  {
    id: 'UPS-DC-001',
    name: 'Data Center Main',
    location: 'Building A - Floor 3',
    status: 'healthy',
    lastChecked: new Date(Date.now() - 1000 * 60 * 2),
    powerInput: 2400,
    powerOutput: 2100,
    batteryLevel: 98,
    temperature: 24.5,
    events: generateEvents('UPS-DC-001')
  },
  {
    id: 'UPS-DC-002',
    name: 'Server Room Alpha',
    location: 'Building A - Floor 2',
    status: 'warning',
    lastChecked: new Date(Date.now() - 1000 * 60 * 5),
    powerInput: 1800,
    powerOutput: 1600,
    batteryLevel: 45,
    temperature: 31.2,
    cause: 'High Temperature',
    events: generateEvents('UPS-DC-002')
  },
  {
    id: 'UPS-DC-003',
    name: 'Network Equipment',
    location: 'Building B - Floor 1',
    status: 'failed',
    lastChecked: new Date(Date.now() - 1000 * 60 * 15),
    powerInput: 0,
    powerOutput: 0,
    batteryLevel: 12,
    temperature: 28.7,
    cause: 'Power Input Failure',
    events: [
      ...generateEvents('UPS-DC-003'),
      {
        id: 'UPS-DC-003-evt-4',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        type: 'error',
        message: 'Critical: Power input failure detected'
      }
    ]
  },
  {
    id: 'UPS-DC-004',
    name: 'Emergency Systems',
    location: 'Building C - Basement',
    status: 'healthy',
    lastChecked: new Date(Date.now() - 1000 * 60 * 1),
    powerInput: 1200,
    powerOutput: 950,
    batteryLevel: 100,
    temperature: 22.8,
    events: generateEvents('UPS-DC-004')
  },
  {
    id: 'UPS-DC-005',
    name: 'Lab Equipment',
    location: 'Building A - Floor 1',
    status: 'warning',
    lastChecked: new Date(Date.now() - 1000 * 60 * 8),
    powerInput: 800,
    powerOutput: 750,
    batteryLevel: 67,
    temperature: 26.3,
    cause: 'Battery Aging',
    events: generateEvents('UPS-DC-005')
  },
  {
    id: 'UPS-DC-006',
    name: 'Communications Hub',
    location: 'Building B - Floor 3',
    status: 'healthy',
    lastChecked: new Date(Date.now() - 1000 * 60 * 3),
    powerInput: 1500,
    powerOutput: 1350,
    batteryLevel: 95,
    temperature: 25.1,
    events: generateEvents('UPS-DC-006')
  }
];

export const mockStats: DashboardStats = {
  totalUPS: mockUPSData.length,
  activeUPS: mockUPSData.filter(ups => ups.status === 'healthy').length,
  failedUPS: mockUPSData.filter(ups => ups.status === 'failed').length,
  alertsLast24h: 8
};