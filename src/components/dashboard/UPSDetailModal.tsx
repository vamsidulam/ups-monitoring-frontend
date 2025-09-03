import { X, MapPin, Activity, Thermometer, Battery, Zap, Clock, AlertCircle, Loader2, TrendingUp, Gauge, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UPS } from './types';
import { useUPSDetail, useUPSEvents, usePredictionsByUPS } from '@/hooks/useAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface UPSDetailModalProps {
  ups: UPS | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UPSDetailModal({ ups, isOpen, onClose }: UPSDetailModalProps) {
  // API hooks for detailed data
  const { data: upsDetail, isLoading: detailLoading } = useUPSDetail(ups?.upsId || '');
  const { data: eventsData, isLoading: eventsLoading } = useUPSEvents(ups?.upsId || '');
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictionsByUPS(ups?.upsId || '', 5);

  // Use detailed data if available, otherwise fall back to basic ups data
  const displayData = upsDetail || ups;
  const events = eventsData?.data || ups?.events || [];

  // Generate realistic historical data for charts based on current values
  const generateChartData = () => {
    const data = [];
    const now = new Date();
    const basePowerInput = displayData?.powerInput || 1200;
    const basePowerOutput = displayData?.powerOutput || 1000;
    const baseBatteryLevel = displayData?.batteryLevel || 85;
    const baseTemperature = displayData?.temperature || 35;
    const baseEfficiency = displayData?.efficiency || 92;
    const baseUptime = displayData?.uptime || 99.5;
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000); // Last 24 hours
      const hour = time.getHours();
      
      // Simulate realistic patterns based on time of day
      const loadVariation = Math.sin((hour - 6) * Math.PI / 12) * 0.3 + 1; // Peak during business hours
      const tempVariation = Math.sin((hour - 14) * Math.PI / 12) * 0.2 + 1; // Peak in afternoon
      
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        powerInput: Math.max(0, Math.round(basePowerInput * loadVariation + (Math.random() - 0.5) * 100)),
        powerOutput: Math.max(0, Math.round(basePowerOutput * loadVariation + (Math.random() - 0.5) * 80)),
        batteryLevel: Math.max(0, Math.min(100, Math.round(baseBatteryLevel + (Math.random() - 0.5) * 10))),
        temperature: Math.max(20, Math.min(80, Math.round((baseTemperature * tempVariation + (Math.random() - 0.5) * 8) * 10) / 10)),
        efficiency: Math.max(85, Math.min(99, Math.round((baseEfficiency + (Math.random() - 0.5) * 4) * 10) / 10)),
        uptime: Math.max(95, Math.min(100, Math.round((baseUptime + (Math.random() - 0.5) * 2) * 100) / 100)),
      });
    }
    return data;
  };

  const chartData = generateChartData();

  if (!ups) return null;

  const getStatusColor = (status: UPS['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 border-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 border-yellow-600 bg-yellow-50';
      case 'risky':
        return 'text-orange-600 border-orange-600 bg-orange-50';
      case 'failed':
        return 'text-red-600 border-red-600 bg-red-50';
      default:
        return 'text-gray-600 border-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: UPS['status']) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'risky':
        return 'Risky';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle className="text-2xl font-bold">{displayData?.upsId}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Data updates every 5 minutes • Last updated: {displayData?.lastChecked ? formatTimestamp(displayData.lastChecked) : 'Unknown'}
              </p>
            </div>
            {detailLoading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading UPS details...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-2 ${getStatusColor(displayData?.status || 'healthy')}`}>
                  <div className="flex items-center gap-3">
                    <Activity className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold">Current Status</h3>
                      <p className="text-lg font-bold">{getStatusText(displayData?.status || 'healthy')}</p>
                      {displayData?.cause && (
                        <p className="text-sm mt-1">Cause: {displayData.cause}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dashboard-card p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Location</h4>
                      <p className="text-muted-foreground">{displayData?.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="dashboard-card p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Last Checked</h4>
                      <p className="text-muted-foreground">
                        {displayData?.lastChecked ? formatTimestamp(displayData.lastChecked) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card p-4">
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Temperature</h4>
                      <p className="text-lg font-mono">{displayData?.temperature}°C</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Power Metrics */}
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Power Metrics
              </h3>
              
              {/* Current Values with Compact Status Bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-sm font-bold text-primary mb-1">{displayData?.powerInput}W</div>
                  <p className="text-xs text-muted-foreground mb-1">Power Input</p>
                  <div className="w-full bg-muted rounded-full h-0.5">
                    <div 
                      className="bg-primary h-0.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((displayData?.powerInput || 0) / 3000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-success mb-1">{displayData?.powerOutput}W</div>
                  <p className="text-xs text-muted-foreground mb-1">Power Output</p>
                  <div className="w-full bg-muted rounded-full h-0.5">
                    <div 
                      className="bg-success h-0.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((displayData?.powerOutput || 0) / 3000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Battery className="h-2 w-2" />
                    <span className="text-sm font-bold">{displayData?.batteryLevel}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Battery Level</p>
                  <div className="w-full bg-muted rounded-full h-0.5">
                    <div 
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        (displayData?.batteryLevel || 0) > 70 ? 'bg-success' :
                        (displayData?.batteryLevel || 0) > 30 ? 'bg-warning' :
                        'bg-destructive'
                      }`}
                      style={{ width: `${displayData?.batteryLevel || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-orange-600 mb-1">{displayData?.temperature}°C</div>
                  <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                  <div className="w-full bg-muted rounded-full h-0.5">
                    <div 
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        (displayData?.temperature || 0) > 60 ? 'bg-destructive' :
                        (displayData?.temperature || 0) > 45 ? 'bg-warning' :
                        'bg-success'
                      }`}
                      style={{ width: `${Math.min(((displayData?.temperature || 0) / 80) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Gauge className="h-2 w-2" />
                    <span className="text-sm font-bold">{displayData?.efficiency}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                  <div className="w-full bg-muted rounded-full h-0.5">
                    <div 
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        (displayData?.efficiency || 0) > 95 ? 'bg-success' :
                        (displayData?.efficiency || 0) > 90 ? 'bg-warning' :
                        'bg-destructive'
                      }`}
                      style={{ width: `${displayData?.efficiency || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-bold">{Math.round((displayData?.failureRisk || 0) * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Failure Risk</p>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        (displayData?.failureRisk || 0) > 0.8 ? 'bg-red-500' :
                        (displayData?.failureRisk || 0) > 0.6 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(displayData?.failureRisk || 0) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600 mb-1">{displayData?.uptime}%</div>
                  <p className="text-xs text-muted-foreground mb-1">Uptime</p>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        (displayData?.uptime || 0) > 99.5 ? 'bg-green-500' :
                        (displayData?.uptime || 0) > 99 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${displayData?.uptime || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-600 mb-1">{displayData?.capacity || 0}W</div>
                  <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((displayData?.powerOutput || 0) / (displayData?.capacity || 3000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-indigo-600 mb-1">{displayData?.criticalLoad || 0}W</div>
                  <p className="text-xs text-muted-foreground mb-1">Critical Load</p>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((displayData?.criticalLoad || 0) / (displayData?.capacity || 3000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Historical Data Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Power Input Chart */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Power Input (24h) - Source Stability</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="powerInputGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 8 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 8 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="powerInput" 
                          stroke="#3b82f6" 
                          strokeWidth={1.5}
                          fill="url(#powerInputGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Power Output Chart */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Power Output (24h) - Load Fluctuations</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="powerOutputGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 8 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 8 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="powerOutput" 
                          stroke="#10b981" 
                          strokeWidth={1.5}
                          fill="url(#powerOutputGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Battery Level Chart */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Battery Level (24h) - Charge Cycles</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 8 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="batteryLevel" 
                          stroke="#f59e0b" 
                          strokeWidth={1.5}
                          fill="url(#batteryGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Temperature Chart */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Temperature (24h) - Heat Trends</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 8 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 8 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="#f97316" 
                          strokeWidth={1.5}
                          fill="url(#tempGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Efficiency Chart */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Efficiency (24h) - Conversion Rate</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 8 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 8 }} domain={[85, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="#8b5cf6" 
                          strokeWidth={1.5}
                          fill="url(#efficiencyGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Uptime Chart */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Uptime (24h) - System Availability</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 8 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 8 }} domain={[95, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="uptime" 
                          stroke="#06b6d4" 
                          strokeWidth={1.5}
                          fill="url(#uptimeGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            {displayData?.alerts && displayData.alerts.length > 0 && (
              <div className="dashboard-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Active Alerts ({displayData.alerts.filter((alert: any) => alert.status === 'active').length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {displayData.alerts
                    .filter((alert: any) => alert.status === 'active')
                    .map((alert: any, index: number) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-sm">{alert.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                alert.type === 'critical' ? 'bg-red-100 text-red-700' :
                                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {alert.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                            {alert.metric && (
                              <p className="text-xs text-gray-600">
                                Metric: {alert.metric} = {alert.value}
                                {alert.threshold && ` (Threshold: ${alert.threshold})`}
                              </p>
                            )}
                            {alert.failure_reasons && (
                              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                                <strong>Failure Reasons:</strong> {alert.failure_reasons}
                              </div>
                            )}
                            {alert.recommended_action && (
                              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                                <strong>Recommended Action:</strong> {alert.recommended_action}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {alert.timestamp ? formatTimestamp(alert.timestamp) : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recent Events & Predictions */}
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Recent Events & Predictions
                {(eventsLoading || predictionsLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              </h3>
              
              {/* Recent Predictions Section */}
              {predictionsData?.predictions && predictionsData.predictions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-3 text-orange-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Latest ML Predictions ({predictionsData.predictions.length})
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {predictionsData.predictions.map((prediction: any, index: number) => (
                      <div key={index} className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-orange-800">
                                Failure Risk: {(prediction.probability_failure * 100).toFixed(1)}%
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                prediction.risk_assessment?.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                                prediction.risk_assessment?.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {prediction.risk_assessment?.risk_level || 'unknown'}
                              </span>
                            </div>
                            {prediction.failure_reasons && prediction.failure_reasons.length > 0 && (
                              <div className="text-xs text-gray-700 mb-2">
                                <strong>Key Issues:</strong> {prediction.failure_reasons[0]}
                              </div>
                            )}
                            <p className="text-xs text-gray-600">
                              Confidence: {(prediction.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {prediction.timestamp ? formatTimestamp(prediction.timestamp) : 'Unknown'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Events Section */}
              <div>
                <h4 className="text-md font-medium mb-3 text-blue-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  System Events ({events.length})
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {eventsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-muted-foreground">Loading events...</span>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-muted-foreground">No events found</span>
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          event.type === 'error' ? 'bg-destructive' :
                          event.type === 'warning' ? 'bg-warning' :
                          'bg-success'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{event.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}