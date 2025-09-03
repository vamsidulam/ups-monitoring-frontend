import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MapPin, 
  Activity, 
  Battery, 
  Thermometer, 
  Zap,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Download,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { UPS } from '@/components/dashboard/types';
import { useUPSList, useLocations } from '@/hooks/useAPI';
import { UPSDetailModal } from '@/components/dashboard/UPSDetailModal';
import { AddUPSModal } from '@/components/dashboard/AddUPSModal';
import { ExportModal } from '@/components/dashboard/ExportModal';
import { toast } from '@/hooks/use-toast';

export default function UPSList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedUPS, setSelectedUPS] = useState<UPS | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Handle URL parameters for status filtering
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl && ['healthy', 'failed', 'warning', 'risky'].includes(statusFromUrl)) {
      setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  // Handle status filter changes and update URL
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  // API hooks
  const { data: upsData, isLoading, error, refetch } = useUPSList();
  const { data: locationsData } = useLocations();

  const locations = locationsData?.data || [];

  // Filter and search UPS data
  const filteredUPS = useMemo(() => {
    if (!upsData?.data) return [];
    
    const filtered = upsData.data.filter((ups) => {
      const matchesSearch = searchTerm === '' || 
        ups.upsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ups.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ups.status === statusFilter;
      const matchesLocation = locationFilter === 'all' || ups.location === locationFilter;
      
      return matchesSearch && matchesStatus && matchesLocation;
    });

    // Sort UPS by ID to maintain consistent order
    return filtered.sort((a, b) => {
      // Extract numeric part from UPS ID (e.g., "UPS001" -> 1, "UPS002" -> 2)
      const aNum = parseInt(a.upsId.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.upsId.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });
  }, [upsData?.data, searchTerm, statusFilter, locationFilter]);

  const handleViewDetails = (ups: UPS) => {
    setSelectedUPS(ups);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUPS(null);
  };

  const handleAddUPSSuccess = () => {
    refetch(); // Refresh the UPS list
    toast({
      title: "Success",
      description: "UPS list has been refreshed with the new data.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'risky':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'risky':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load UPS data</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">UPS Systems</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all UPS systems across your infrastructure
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-refreshes every 1 minute • Last updated: {new Date().toLocaleTimeString()}
          </p>
          {statusFilter !== 'all' && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getStatusColor(statusFilter)}>
                Filtered by: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilterChange('all')}
                className="text-xs"
              >
                Clear Filter
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add UPS
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search UPS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="risky">Risky</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading UPS systems...</p>
          </div>
        </div>
      )}

      {/* UPS Grid/List View */}
      {!isLoading && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUPS.map((ups) => (
                <Card key={ups.upsId} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusIcon(ups.status)}
                          {ups.upsId}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(ups)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(ups.status)}>
                        {ups.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {ups.location}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Battery Level */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Battery</span>
                        <span className="font-medium">{ups.batteryLevel}%</span>
                      </div>
                      <Progress value={ups.batteryLevel} className="h-2" />
                    </div>

                    {/* Power Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-muted-foreground">Input</p>
                          <p className="font-medium">{ups.powerInput}W</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-muted-foreground">Output</p>
                          <p className="font-medium">{ups.powerOutput}W</p>
                        </div>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span className="text-muted-foreground">Temperature:</span>
                      <span className="font-medium">{ups.temperature}°C</span>
                    </div>

                    {/* Last Checked */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(ups.lastChecked)}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleViewDetails(ups)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">UPS System</th>
                        <th className="text-left p-4 font-medium">Location</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Battery</th>
                        <th className="text-left p-4 font-medium">Power</th>
                        <th className="text-left p-4 font-medium">Temperature</th>
                        <th className="text-left p-4 font-medium">Last Checked</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUPS.map((ups) => (
                        <tr key={ups.upsId} className="border-b hover:bg-muted/50">
                                                     <td className="p-4">
                             <div>
                               <div className="font-medium">{ups.upsId}</div>
                             </div>
                           </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {ups.location}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(ups.status)}
                              <Badge variant="outline" className={getStatusColor(ups.status)}>
                                {ups.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full">
                                <div
                                  className={`h-full rounded-full ${
                                    ups.batteryLevel > 70 ? 'bg-green-500' :
                                    ups.batteryLevel > 30 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${ups.batteryLevel}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{ups.batteryLevel}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div>In: {ups.powerInput}W</div>
                              <div>Out: {ups.powerOutput}W</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{ups.temperature}°C</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-muted-foreground">
                              {formatTimestamp(ups.lastChecked)}
                            </div>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(ups)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Refresh Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {filteredUPS.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No UPS systems found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || locationFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'No UPS systems are currently configured'}
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setLocationFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* UPS Detail Modal */}
      <UPSDetailModal
        ups={selectedUPS}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Add UPS Modal */}
      <AddUPSModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddUPSSuccess}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        upsData={filteredUPS}
      />
    </div>
  );
}