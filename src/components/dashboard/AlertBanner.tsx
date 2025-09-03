import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, Bell, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  upsId: string;
  alert: {
    type: 'critical' | 'warning';
    title: string;
    message: string;
    timestamp: string;
    metric: string;
    value: number;
    threshold: number;
  };
}

interface AlertBannerProps {
  className?: string;
}

export function AlertBanner({ className = '' }: AlertBannerProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const wsUrl = (import.meta as any)?.env?.VITE_WS_URL;
    if (!wsUrl) {
      throw new Error('VITE_WS_URL is not set. Please create a .env.local file with VITE_WS_URL=ws://localhost:10000/ws/ups-updates');
    }
    const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('✅ Connected to alert service');
        
        // Request current alerts
        ws.send(JSON.stringify({ type: 'get_alerts' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('❌ Disconnected from alert service');
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!isConnected) {
            connectWebSocket();
          }
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'current_alerts':
        setAlerts(data.data || []);
        break;
      
      case 'new_alert':
        const newAlert = data.data;
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep only 10 most recent
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification for critical alerts
        if (newAlert.alert.type === 'critical') {
          toast({
            title: `🚨 Critical Alert: ${newAlert.alert.title}`,
            description: `${newAlert.upsId} - ${newAlert.alert.message}`,
            variant: 'destructive',
            duration: 10000,
          });
        } else if (newAlert.alert.type === 'warning') {
          toast({
            title: `⚠️ Warning: ${newAlert.alert.title}`,
            description: `${newAlert.upsId} - ${newAlert.alert.message}`,
            variant: 'default',
            duration: 8000,
          });
        }
        break;
      
      case 'status_update':
        // Handle status updates if needed
        break;
      
      case 'pong':
        // Handle ping/pong for connection health
        break;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;

      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';

      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';

      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.alert.type === 'critical');
  const warningAlerts = alerts.filter(alert => alert.alert.type === 'warning');
  const hasActiveAlerts = criticalAlerts.length > 0 || warningAlerts.length > 0;

  if (!showBanner || !hasActiveAlerts) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
      <Card className="shadow-lg border-2 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Real-time Alerts</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
          </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <Button
          variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {criticalAlerts.map((alert, index) => (
              <div
                key={`${alert.upsId}-${alert.alert.timestamp}-${index}`}
                className={`p-3 rounded-lg border ${getAlertColor(alert.alert.type)}`}
              >
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{alert.alert.title}</span>
                      <Badge className={`text-xs ${getAlertBadgeColor(alert.alert.type)}`}>
                        {alert.alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs mb-1">{alert.alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{alert.upsId}</span>
                      <span>{formatTimestamp(alert.alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {warningAlerts.map((alert, index) => (
              <div
                key={`${alert.upsId}-${alert.alert.timestamp}-${index}`}
                className={`p-3 rounded-lg border ${getAlertColor(alert.alert.type)}`}
              >
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{alert.alert.title}</span>
                      <Badge className={`text-xs ${getAlertBadgeColor(alert.alert.type)}`}>
                        {alert.alert.type}
                      </Badge>
                    </div>
                    <p className="text-xs mb-1">{alert.alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{alert.upsId}</span>
                      <span>{formatTimestamp(alert.alert.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {alerts.length > 5 && (
            <div className="mt-3 pt-2 border-t border-orange-200">
              <p className="text-xs text-orange-600 text-center">
                Showing {Math.min(alerts.length, 5)} of {alerts.length} alerts
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}