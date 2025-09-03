import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Zap, 
  Thermometer, 
  Battery, 
  Gauge, 
  TrendingUp,
  AlertOctagon,
  Shield,
  Activity,
  Eye,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useUPSData } from '@/hooks/useUPSData';
import { API_BASE_URL } from '@/services/api';

export default function Alerts() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('predictions');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [lastUPSUpdateTime, setLastUPSUpdateTime] = useState<Date>(new Date());
  const [riskFilter, setRiskFilter] = useState<'high' | 'medium' | 'low' | 'all'>('high');
  const [alertCounts, setAlertCounts] = useState<{ high: number; medium: number; low: number }>({ high: 0, medium: 0, low: 0 });

  const { upsData, loading: upsLoading, refetch: refetchUPSData } = useUPSData();

  // Fetch ML predictions from backend - refresh every 15 minutes
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (riskFilter !== 'all') params.append('risk_level', riskFilter);
        const response = await fetch(`${API_BASE_URL}/predictions?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          const predictionsData = data.predictions || [];
          setPredictions(predictionsData);
          setLastUpdateTime(new Date());
          console.log(`Fetched ${predictionsData.length} predictions at ${new Date().toLocaleTimeString()}`);
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      }
    };

    fetchPredictions();
    // Refresh every 15 minutes (900000 ms) to match prediction generation cycle
    const interval = setInterval(fetchPredictions, 900000);
    return () => clearInterval(interval);
  }, [riskFilter]);

  // Fetch alert counts for cards
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/alerts/count`);
        if (!res.ok) return;
        const data = await res.json();
        const counts = { high: 0, medium: 0, low: 0 } as any;
        (data.counts || []).forEach((c: any) => {
          if (c.risk_level === 'high') counts.high = c.count;
          else if (c.risk_level === 'medium') counts.medium = c.count;
          else if (c.risk_level === 'low') counts.low = c.count;
        });
        setAlertCounts(counts as any);
      } catch (_) {}
    };
    fetchCounts();
  }, []);

  // Refresh UPS data every 5 minutes to match backend monitoring service
  useEffect(() => {
    const refreshUPSData = async () => {
      try {
        await refetchUPSData();
        setLastUPSUpdateTime(new Date());
        console.log(`Refreshed UPS data at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error('Failed to refresh UPS data:', error);
      }
    };

    // Initial refresh
    refreshUPSData();
    
    // Refresh every 5 minutes (300000 ms)
    const interval = setInterval(refreshUPSData, 300000);
    return () => clearInterval(interval);
  }, [refetchUPSData]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNextPredictionTime = () => {
    const now = new Date();
    const nextUpdate = new Date(now.getTime() + (15 * 60 * 1000)); // Add 15 minutes
    return nextUpdate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getNextUPSUpdateTime = () => {
    const now = new Date();
    const nextUpdate = new Date(now.getTime() + (5 * 60 * 1000)); // Add 5 minutes
    return nextUpdate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleManualUPSRefresh = async () => {
    try {
      await refetchUPSData();
      setLastUPSUpdateTime(new Date());
      console.log(`Manually refreshed UPS data`);
    } catch (error) {
      console.error('Failed to manually refresh UPS data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                🔮 Alerts
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                ML-powered failure predictions with detailed analysis and recommendations
              </p>
              {/* Update Cycle Information */}
              <div className="mt-3 space-y-2">
                {/* ML Predictions Cycle */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Predictions: Every 15 minutes • Next update: {getNextPredictionTime()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 mt-1">
                    <Activity className="h-3 w-3" />
                    <span className="text-xs">
                      Last updated: {lastUpdateTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true 
                      })}
                    </span>
                  </div>
                </div>
                
                {/* UPS Data Cycle */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      UPS Data: Every 5 minutes • Next update: {getNextUPSUpdateTime()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 mt-1">
                    <Activity className="h-3 w-3" />
                    <span className="text-xs">
                      Last updated: {lastUPSUpdateTime.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Manual Refresh Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualUPSRefresh}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh UPS
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const fetchPredictions = async () => {
                      try {
                        const response = await fetch(`${API_BASE_URL}/predictions?limit=50`);
                        if (response.ok) {
                          const data = await response.json();
                          const predictionsData = data.predictions || [];
                          setPredictions(predictionsData);
                          setLastUpdateTime(new Date());
                          console.log(`Manually refreshed ${predictionsData.length} predictions`);
                        }
                      } catch (error) {
                        console.error('Failed to refresh predictions:', error);
                      }
                    };
                    fetchPredictions();
                  }}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Refresh ML
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                 Predictions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Change Indicator */}
        {upsLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="font-medium">Updating UPS statuses...</span>
            </div>
          </div>
        )}

        {/* UPS Status Summary removed per request */}

        {/* Filter Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Filter:</span>
          <Button variant={riskFilter === 'high' ? 'default' : 'outline'} size="sm" onClick={() => setRiskFilter('high')}>Critical</Button>
          <Button variant={riskFilter === 'medium' ? 'default' : 'outline'} size="sm" onClick={() => setRiskFilter('medium')}>Warning</Button>
          <Button variant={riskFilter === 'low' ? 'default' : 'outline'} size="sm" onClick={() => setRiskFilter('low')}>Info</Button>
          <Button variant={riskFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setRiskFilter('all')}>All</Button>
        </div>



        {/* ML Predictions Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Critical Alerts</CardTitle>
              <AlertOctagon className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">
                {predictions.filter(p => (p?.risk_assessment?.risk_level || '').toLowerCase() === 'high').length}
              </div>
              <p className="text-xs text-red-600 font-medium">
                High risk alerts
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Warning Alerts</CardTitle>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">
                {predictions.filter(p => (p?.risk_assessment?.risk_level || '').toLowerCase() === 'medium').length}
              </div>
              <p className="text-xs text-yellow-600 font-medium">
                Medium risk alerts
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Info Alerts</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {predictions.filter(p => (p?.risk_assessment?.risk_level || '').toLowerCase() === 'low').length}
              </div>
              <p className="text-xs text-blue-600 font-medium">
                Low risk alerts
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Alerts</CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{predictions.length}</div>
              <p className="text-xs text-purple-600 font-medium">
                Last predicted alerts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
               Prediction Alerts ({predictions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            {predictions.length === 0 ? (
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                    <p className="text-purple-700 font-medium text-lg">No ML Predictions Yet</p>
                    <p className="text-purple-600 text-sm">ML model predictions will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              predictions.map((prediction) => {
                // Prefer backend-provided risk level to avoid mislabeling
                const failureProb = prediction.probability_failure || 0;
                const riskLevel = (prediction?.risk_assessment?.risk_level || '').toLowerCase();
                let severity = 'info';
                let severityColor = 'blue';
                let severityBg = 'blue';
                let severityIcon = <TrendingUp className="h-6 w-6 text-blue-600" />;
                let severityBadge = <Badge variant="outline" className="border-blue-500 text-blue-600 px-3 py-1">INFO</Badge>;

                const setCritical = () => {
                  severity = 'critical';
                  severityColor = 'red';
                  severityBg = 'red';
                  severityIcon = <AlertOctagon className="h-6 w-6 text-red-600" />;
                  severityBadge = <Badge variant="destructive" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1">CRITICAL</Badge>;
                };
                const setWarning = () => {
                  severity = 'warning';
                  severityColor = 'yellow';
                  severityBg = 'yellow';
                  severityIcon = <AlertTriangle className="h-6 w-6 text-yellow-600" />;
                  severityBadge = <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1">WARNING</Badge>;
                };
                const setInfo = () => {
                  severity = 'info';
                  severityColor = 'blue';
                  severityBg = 'blue';
                  severityIcon = <TrendingUp className="h-6 w-6 text-blue-600" />;
                  severityBadge = <Badge variant="outline" className="border-blue-500 text-blue-600 px-3 py-1">INFO</Badge>;
                };
                const setHealthy = () => {
                  severity = 'healthy';
                  severityColor = 'green';
                  severityBg = 'green';
                  severityIcon = <Shield className="h-6 w-6 text-green-600" />;
                  severityBadge = <Badge variant="outline" className="border-green-500 text-green-600 px-3 py-1">HEALTHY</Badge>;
                };

                if (riskLevel === 'high') setCritical();
                else if (riskLevel === 'medium') setWarning();
                else if (riskLevel === 'low') setInfo();
                else {
                  if (failureProb > 0.8) setCritical();
                  else if (failureProb > 0.6) setWarning();
                  else if (failureProb > 0.4) setInfo();
                  else setHealthy();
                }

                // Get proper failure reasons based on actual data
                const getFailureReasons = () => {
                  // Prefer explicit reasons from API if provided
                  const explicit = (prediction.failure_reasons || prediction.risk_assessment?.reasons || prediction.reasons) as string[] | undefined;
                  if (Array.isArray(explicit) && explicit.length > 0) {
                    return explicit;
                  }

                  const reasons: string[] = [];
                  const data: any = prediction.prediction_data || {};

                  // Battery
                  if (data.battery_level !== undefined) {
                    if (data.battery_level < 20) reasons.push(`Critical battery level (${data.battery_level}%) - Replace battery`);
                    else if (data.battery_level < 40) reasons.push(`Low battery level (${data.battery_level}%)`);
                    else reasons.push(`Battery level: ${data.battery_level}%`);
                  }

                  // Temperature
                  if (data.temperature !== undefined) {
                    if (data.temperature > 45) reasons.push(`Critical temperature (${data.temperature}°C) - Overheating risk`);
                    else if (data.temperature > 40) reasons.push(`High temperature (${data.temperature}°C)`);
                    else reasons.push(`Temperature: ${data.temperature}°C`);
                  }

                  // Efficiency
                  if (data.efficiency !== undefined) {
                    if (data.efficiency < 80) reasons.push(`Critical efficiency (${data.efficiency}%)`);
                    else if (data.efficiency < 90) reasons.push(`Low efficiency (${data.efficiency}%)`);
                    else reasons.push(`Efficiency: ${data.efficiency}%`);
                  }

                  // Load
                  if (data.load !== undefined) {
                    if (data.load > 95) reasons.push(`Critical load (${data.load}%) - Overload risk`);
                    else if (data.load > 90) reasons.push(`High load (${data.load}%)`);
                    else reasons.push(`Load: ${data.load}%`);
                  }

                  // Power and other metrics if present
                  if (data.power_input !== undefined) reasons.push(`Power input: ${data.power_input}`);
                  if (data.power_output !== undefined) reasons.push(`Power output: ${data.power_output}`);
                  if (data.uptime !== undefined) reasons.push(`Uptime: ${data.uptime}`);
                  if (data.capacity !== undefined) reasons.push(`Capacity: ${data.capacity}`);

                  // Feature importances (top 3) if provided
                  const fi = prediction.feature_importances as Record<string, number> | undefined;
                  if (fi && typeof fi === 'object') {
                    const top = Object.entries(fi)
                      .sort((a,b) => b[1]-a[1])
                      .slice(0,3)
                      .map(([k,v]) => `${k.replace(/_/g,' ')} influence: ${(v*100).toFixed(0)}%`);
                    if (top.length) {
                      reasons.push(...top);
                    }
                  }

                  if (reasons.length === 0) {
                    if (failureProb > 0.6) reasons.push('Multiple risk factors detected - System showing signs of potential failure');
                    else reasons.push('System operating within normal parameters');
                  }

                  return reasons;
                };

                const failureReasons = getFailureReasons();
                const isHighRisk = failureProb > 0.6;

                return (
                  <Card key={prediction._id} className={`border-${severityColor}-200 bg-gradient-to-r from-${severityColor}-50 to-${severityColor === 'red' ? 'red' : severityColor === 'yellow' ? 'yellow' : severityColor === 'blue' ? 'blue' : 'green'}-100 shadow-lg hover:shadow-xl transition-shadow`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-full bg-${severityColor}-100`}>
                            {severityIcon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className={`font-bold text-xl text-${severityColor}-900`}>
                                {(prediction.ups_id || prediction.ups_name || 'Unknown')} - 🚨 AI Failure Prediction
                              </h4>
                              {severityBadge}
                              <Badge variant="outline" className={`border-${severityColor}-500 text-${severityColor}-600`}>
                                {Math.round(prediction.confidence * 100)}% Confidence
                              </Badge>
                            </div>
                            
                            {/* Removed verbose prediction sentence and threshold display per request */}
                            
                            {/* Detailed Failure Reasons */}
                            {failureReasons.length > 0 && (
                              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-red-50 rounded-lg border border-purple-200">
                                <div className="space-y-3">
                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-sm font-semibold text-purple-700">Failure Reasons:</span>
                                      <div className="mt-2 space-y-2">
                                        {failureReasons.map((reason, index) => (
                                          <p key={index} className={`text-sm ${isHighRisk ? 'text-red-600' : 'text-orange-600'}`}>
                                            • {reason}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-blue-700">Risk Category:</span>
                                        <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                          {prediction.risk_assessment?.risk_level === 'high' ? 'multiple_factors' : 
                                           prediction.risk_assessment?.risk_level === 'medium' ? 'elevated_risk' : 'low_risk'}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-orange-600" />
                                        <span className="text-sm font-semibold text-orange-700">Primary Risk:</span>
                                        <span className="text-sm text-orange-600">{Math.round(failureProb * 100)}%</span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-red-600" />
                                        <span className="text-sm font-semibold text-red-700">Timeframe:</span>
                                        <span className="text-sm text-red-600">{prediction.risk_assessment?.timeframe || '6 hours'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-semibold text-green-700">Recommended Action:</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {isHighRisk && (
                                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                                      <p className="text-sm text-red-700 font-medium">
                                        URGENT: Comprehensive system review required. Multiple components need attention. IMMEDIATE ACTION REQUIRED!
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 text-sm text-${severityColor}-500 font-medium`}>
                          <Clock className="h-4 w-4" />
                          {new Date(prediction.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
