import { UPS } from '@/components/dashboard/types';

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  includeEvents?: boolean;
  includeAlerts?: boolean;
  includePerformanceHistory?: boolean;
}

export const exportUPSData = async (
  upsData: UPS[],
  options: ExportOptions = { format: 'csv', includeEvents: false, includeAlerts: false, includePerformanceHistory: false }
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `ups-export-${timestamp}`;

  switch (options.format) {
    case 'csv':
      return exportToCSV(upsData, options, filename);
    case 'json':
      return exportToJSON(upsData, options, filename);
    case 'excel':
      return exportToExcel(upsData, options, filename);
    default:
      throw new Error('Unsupported export format');
  }
};

const exportToCSV = (upsData: UPS[], options: ExportOptions, filename: string) => {
  // Define CSV headers
  const headers = [
    'UPS ID',
    'Name',
    'Location',
    'Status',
    'Last Checked',
    'Battery Level (%)',
    'Temperature (°C)',
    'Power Input (W)',
    'Power Output (W)',
    'Efficiency (%)',
    'Uptime (%)',
    'Manufacturer',
    'Model',
    'Serial Number',
    'Capacity (VA)',
    'Critical Load (W)',
    'Installation Date',
    'Warranty Expiry',
    'Maintenance Schedule',
    'Next Maintenance'
  ];

  // Convert UPS data to CSV rows
  const csvRows = upsData.map(ups => [
    ups.upsId,
    ups.name,
    ups.location,
    ups.status,
    ups.lastChecked,
    ups.batteryLevel,
    ups.temperature,
    ups.powerInput,
    ups.powerOutput,
    ups.efficiency || 0,
    ups.uptime || 0,
    ups.manufacturer || '',
    ups.model || '',
    ups.serialNumber || '',
    ups.capacity || 0,
    ups.criticalLoad || 0,
    ups.installationDate || '',
    ups.warrantyExpiry || '',
    ups.maintenanceSchedule || '',
    ups.nextMaintenance || ''
  ]);

  // Combine headers and data
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
};

const exportToJSON = (upsData: UPS[], options: ExportOptions, filename: string) => {
  // Prepare data for export
  const exportData = upsData.map(ups => {
    const baseData = {
      upsId: ups.upsId,
      name: ups.name,
      location: ups.location,
      status: ups.status,
      lastChecked: ups.lastChecked,
      batteryLevel: ups.batteryLevel,
      temperature: ups.temperature,
      powerInput: ups.powerInput,
      powerOutput: ups.powerOutput,
      efficiency: ups.efficiency,
      uptime: ups.uptime,
      manufacturer: ups.manufacturer,
      model: ups.model,
      serialNumber: ups.serialNumber,
      capacity: ups.capacity,
      criticalLoad: ups.criticalLoad,
      installationDate: ups.installationDate,
      warrantyExpiry: ups.warrantyExpiry,
      maintenanceSchedule: ups.maintenanceSchedule,
      nextMaintenance: ups.nextMaintenance
    };

    // Add optional data based on options
    if (options.includeEvents) {
      (baseData as any).events = ups.events;
    }
    if (options.includeAlerts) {
      (baseData as any).alerts = ups.alerts;
    }
    if (options.includePerformanceHistory) {
      (baseData as any).performanceHistory = ups.performanceHistory;
    }

    return baseData;
  });

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadFile(blob, `${filename}.json`);
};

const exportToExcel = (upsData: UPS[], options: ExportOptions, filename: string) => {
  // For Excel export, we'll create a CSV file with .xlsx extension
  // In a real implementation, you'd use a library like 'xlsx' or 'exceljs'
  exportToCSV(upsData, options, filename.replace('.xlsx', ''));
  
  // Show a message that Excel export is not fully implemented
  console.warn('Excel export is currently implemented as CSV. For full Excel support, install a library like "xlsx".');
};

const downloadFile = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Utility function to format data for display
export const formatUPSDataForExport = (upsData: UPS[]) => {
  return upsData.map(ups => ({
    'UPS ID': ups.upsId,
    'Name': ups.name,
    'Location': ups.location,
    'Status': ups.status,
    'Last Checked': new Date(ups.lastChecked).toLocaleString(),
    'Battery Level (%)': ups.batteryLevel,
    'Temperature (°C)': ups.temperature,
    'Power Input (W)': ups.powerInput,
    'Power Output (W)': ups.powerOutput,
    'Efficiency (%)': ups.efficiency || 0,
    'Uptime (%)': ups.uptime || 0,
    'Manufacturer': ups.manufacturer || 'N/A',
    'Model': ups.model || 'N/A',
    'Serial Number': ups.serialNumber || 'N/A',
    'Capacity (VA)': ups.capacity || 0,
    'Critical Load (W)': ups.criticalLoad || 0,
    'Installation Date': ups.installationDate || 'N/A',
    'Warranty Expiry': ups.warrantyExpiry || 'N/A',
    'Maintenance Schedule': ups.maintenanceSchedule || 'N/A',
    'Next Maintenance': ups.nextMaintenance || 'N/A'
  }));
};
