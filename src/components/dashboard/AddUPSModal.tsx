import { useState } from 'react';
import { API_BASE_URL } from '@/services/api';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface AddUPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UPSFormData {
  upsId: string;
  name: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  capacity: number;
  criticalLoad: number;
  installationDate: string;
  warrantyExpiry: string;
  maintenanceSchedule: string;
  nextMaintenance: string;
}

export function AddUPSModal({ isOpen, onClose, onSuccess }: AddUPSModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UPSFormData>({
    upsId: '',
    name: '',
    location: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    capacity: 0,
    criticalLoad: 0,
    installationDate: '',
    warrantyExpiry: '',
    maintenanceSchedule: 'monthly',
    nextMaintenance: ''
  });

  const handleInputChange = (field: keyof UPSFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.upsId || !formData.name || !formData.location) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (UPS ID, Name, Location)",
          variant: "destructive"
        });
        return;
      }

      // Check if UPS ID already exists
      const checkResponse = await fetch(`${API_BASE_URL}/ups?search=${formData.upsId}`);
      const existingUPS = await checkResponse.json();
      
      if (existingUPS.data.some((ups: any) => ups.upsId === formData.upsId)) {
        toast({
          title: "UPS ID Already Exists",
          description: "A UPS with this ID already exists. Please use a different ID.",
          variant: "destructive"
        });
        return;
      }

      // Create new UPS data
      const newUPS = {
        ...formData,
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        powerInput: 0,
        powerOutput: 0,
        batteryLevel: 100,
        temperature: 25.0,
        efficiency: 95.0,
        uptime: 100.0,
        events: [],
        alerts: [],
        performanceHistory: []
      };

      // Add UPS to database via API
      const createResponse = await fetch(`${API_BASE_URL}/ups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUPS),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.detail || 'Failed to add UPS');
      }

      const addedUPS = await createResponse.json();
      console.log('UPS added successfully:', addedUPS);
      
      toast({
        title: "UPS Added Successfully",
        description: `UPS ${formData.name} has been added to the system.`,
      });

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        upsId: '',
        name: '',
        location: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        capacity: 0,
        criticalLoad: 0,
        installationDate: '',
        warrantyExpiry: '',
        maintenanceSchedule: 'monthly',
        nextMaintenance: ''
      });

    } catch (error) {
      console.error('Error adding UPS:', error);
      toast({
        title: "Error",
        description: "Failed to add UPS. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl font-bold">Add New UPS System</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upsId">UPS ID *</Label>
                <Input
                  id="upsId"
                  value={formData.upsId}
                  onChange={(e) => handleInputChange('upsId', e.target.value)}
                  placeholder="e.g., UPS-DC-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Data Center Main"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Building A - Floor 3"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  placeholder="e.g., APC, Eaton, Schneider"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., Smart-UPS RT 3000VA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  placeholder="e.g., APC123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (VA)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 3000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criticalLoad">Critical Load (W)</Label>
                <Input
                  id="criticalLoad"
                  type="number"
                  value={formData.criticalLoad}
                  onChange={(e) => handleInputChange('criticalLoad', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 1800"
                />
              </div>
            </div>
          </div>

          {/* Installation & Maintenance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Installation & Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installationDate">Installation Date</Label>
                <Input
                  id="installationDate"
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => handleInputChange('installationDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleInputChange('warrantyExpiry', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceSchedule">Maintenance Schedule</Label>
                <Select value={formData.maintenanceSchedule} onValueChange={(value) => handleInputChange('maintenanceSchedule', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance}
                  onChange={(e) => handleInputChange('nextMaintenance', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add UPS
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
