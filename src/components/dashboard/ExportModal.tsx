import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { exportUPSData, ExportOptions } from '@/utils/exportUtils';
import { UPS } from '@/components/dashboard/types';
import { toast } from '@/hooks/use-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  upsData: UPS[];
}

export function ExportModal({ isOpen, onClose, upsData }: ExportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeEvents: false,
    includeAlerts: false,
    includePerformanceHistory: false
  });

  const handleExport = async () => {
    setIsLoading(true);

    try {
      await exportUPSData(upsData, exportOptions);
      
      toast({
        title: "Export Successful",
        description: `UPS data exported as ${exportOptions.format.toUpperCase()}`,
      });

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export UPS data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatChange = (format: string) => {
    setExportOptions(prev => ({
      ...prev,
      format: format as 'csv' | 'json' | 'excel'
    }));
  };

  const handleOptionChange = (option: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">Export UPS Data</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={exportOptions.format} onValueChange={handleFormatChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                <SelectItem value="json">JSON (Full data)</SelectItem>
                <SelectItem value="excel">Excel (CSV format)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Include Additional Data</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeEvents"
                  checked={exportOptions.includeEvents}
                  onCheckedChange={(checked) => handleOptionChange('includeEvents', checked as boolean)}
                />
                <Label htmlFor="includeEvents" className="text-sm">
                  Include Events History
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAlerts"
                  checked={exportOptions.includeAlerts}
                  onCheckedChange={(checked) => handleOptionChange('includeAlerts', checked as boolean)}
                />
                <Label htmlFor="includeAlerts" className="text-sm">
                  Include Alerts History
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePerformanceHistory"
                  checked={exportOptions.includePerformanceHistory}
                  onCheckedChange={(checked) => handleOptionChange('includePerformanceHistory', checked as boolean)}
                />
                <Label htmlFor="includePerformanceHistory" className="text-sm">
                  Include Performance History
                </Label>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p>• {upsData.length} UPS systems</p>
              <p>• Format: {exportOptions.format.toUpperCase()}</p>
              {exportOptions.includeEvents && <p>• Including events history</p>}
              {exportOptions.includeAlerts && <p>• Including alerts history</p>}
              {exportOptions.includePerformanceHistory && <p>• Including performance history</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
