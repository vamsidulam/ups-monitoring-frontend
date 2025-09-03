import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '@/assets/ups-dashboard-hero.jpg';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { UPSTable } from '@/components/dashboard/UPSTable';
import { UPSDetailModal } from '@/components/dashboard/UPSDetailModal';
import { UPS } from '@/components/dashboard/types';
import { useHealthCheck } from '@/hooks/useAPI';
import { useUPSData } from '@/hooks/useUPSData';
import { useDashboardStatsRealTime } from '@/hooks/useDashboardStatsRealTime';
import { AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedUPS, setSelectedUPS] = useState<UPS | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // API hooks
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStatsRealTime();
  const { upsData, loading: upsLoading, error: upsError } = useUPSData();
  const { data: health, isLoading: healthLoading } = useHealthCheck();

  const handleViewDetails = (ups: UPS) => {
    setSelectedUPS(ups);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUPS(null);
  };

  // Check for critical UPS (failed status)
  const criticalUPS = upsData?.find(ups => ups.status === 'failed');

  // Loading state
  if (statsLoading || upsLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || upsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-2">Failed to load dashboard data</p>
          <p className="text-muted-foreground text-sm">
            {statsError || upsError || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // Backend connection warning
  const isBackendConnected = health?.status === 'ok' && health?.db === true;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative overflow-hidden mb-6"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto p-6 max-w-7xl -mt-16 relative z-10">
        <DashboardHeader />
        
        {/* Backend Connection Warning */}
        {!isBackendConnected && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-yellow-800">Warning: Backend connection issues detected. Data may not be up to date.</p>
            </div>
          </div>
        )}

        {/* Real-time Update Indicator */}
        {upsLoading && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="font-medium">Updating UPS statuses in real-time...</span>
            </div>
          </div>
        )}
        
        {showAlert && criticalUPS && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-red-800">UPS {criticalUPS.upsId} ({criticalUPS.name}) has failed. Immediate attention required.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAlert(false)}>
                ×
              </Button>
            </div>
          </div>
        )}

        <OverviewCards stats={stats || { totalUPS: 0, activeUPS: 0, failedUPS: 0, predictionsCount: 0 }} />
        
        {/* View Alerts Button */}
        {stats && stats.predictionsCount > 0 && (
          <div className="mb-6 flex justify-center">
            <Button 
              onClick={() => navigate('/alerts')}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
            >
              <AlertTriangle className="h-4 w-4" />
              View Alerts ({stats.predictionsCount})
            </Button>
          </div>
        )}
        
        <UPSTable 
          data={upsData || []} 
          onViewDetails={handleViewDetails}
          isLoading={upsLoading}
        />

        <UPSDetailModal
          ups={selectedUPS}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}