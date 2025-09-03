import { Eye, MapPin, Clock, Loader2, Thermometer, Zap, Gauge, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UPS } from './types';

interface UPSTableProps {
  data: UPS[];
  onViewDetails: (ups: UPS) => void;
  isLoading?: boolean;
}

export function UPSTable({ data, onViewDetails, isLoading = false }: UPSTableProps) {
  const getStatusColor = (status: UPS['status']) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'warning':
        return 'status-warning';
      case 'failed':
        return 'status-failed';
      case 'risky':
        return 'status-risky';
      default:
        return '';
    }
  };

  const getStatusText = (status: UPS['status']) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'failed':
        return 'Failed';
      case 'risky':
        return 'Risky';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-card">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">UPS Systems Overview</h2>
        <p className="text-muted-foreground mt-1">Real-time status of all UPS units</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UPS ID / Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Load</TableHead>
              <TableHead>Efficiency</TableHead>
              <TableHead>Battery</TableHead>
              <TableHead>Failure Risk</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">Loading UPS data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <span className="text-muted-foreground">No UPS systems found</span>
                </TableCell>
              </TableRow>
            ) : (
              data.map((ups) => (
                <TableRow key={ups.upsId} className="hover:bg-muted/50 transition-colors">
                                  <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{ups.upsId}</div>
                    <div className="text-sm text-muted-foreground">{ups.name}</div>
                  </div>
                </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{ups.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`status-indicator ${getStatusColor(ups.status)}`}></div>
                      <span className={`font-medium ${
                        ups.status === 'healthy' ? 'text-success' :
                        ups.status === 'warning' ? 'text-warning' :
                        ups.status === 'risky' ? 'text-orange-600' :
                        'text-destructive'
                      }`}>
                        {getStatusText(ups.status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm font-mono ${
                        (ups.temperature || 0) > 40 ? 'text-red-600' :
                        (ups.temperature || 0) > 35 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {ups.temperature || 0}°C
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            (ups.load || 0) > 90 ? 'bg-red-500' :
                            (ups.load || 0) > 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${ups.load || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{ups.load || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm font-mono ${
                        (ups.efficiency || 0) < 80 ? 'text-red-600' :
                        (ups.efficiency || 0) < 85 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {ups.efficiency || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            ups.batteryLevel > 70 ? 'bg-success' :
                            ups.batteryLevel > 30 ? 'bg-warning' :
                            'bg-destructive'
                          }`}
                          style={{ width: `${ups.batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{ups.batteryLevel}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              (ups.failureRisk || 0) > 0.8 ? 'bg-red-500' :
                              (ups.failureRisk || 0) > 0.6 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(ups.failureRisk || 0) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${
                          (ups.failureRisk || 0) > 0.8 ? 'text-red-600' :
                          (ups.failureRisk || 0) > 0.6 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {(ups.failureRisk || 0) * 100}%
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(ups)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}