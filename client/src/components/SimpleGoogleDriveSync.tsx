import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Shield,
  HardDrive,
  Smartphone,
  Copy,
  Check,
  FileText,
  Download,
  Upload
} from "lucide-react";
import { localStorage as localData } from "@/lib/localDataStorage";

export function SimpleGoogleDriveSync() {
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'uploading' | 'downloading' | 'complete'>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const { toast } = useToast();

  // Get local data counts
  const localPlants = localData.get('plants') || [];
  const wateringLogs = localData.get('wateringLogs') || [];
  const feedingLogs = localData.get('feedingLogs') || [];
  const repottingLogs = localData.get('repottingLogs') || [];
  const soilTopUpLogs = localData.get('soilTopUpLogs') || [];
  const pruningLogs = localData.get('pruningLogs') || [];
  const localLogs = [...wateringLogs, ...feedingLogs, ...repottingLogs, ...soilTopUpLogs, ...pruningLogs];

  // Initialize Google Drive Picker
  const initializeGoogleDrive = () => {
    // Load Google APIs
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('auth2,picker', () => {
        // Initialize with a simple public API key (no client secret needed)
        toast({
          title: "Google Drive Ready",
          description: "You can now backup and restore your plant data",
        });
        setIsConnected(true);
      });
    };
    document.head.appendChild(script);
  };

  // Export data as JSON file for manual Google Drive storage
  const exportToJSON = () => {
    try {
      setSyncStatus('uploading');
      setSyncProgress(20);

      const exportData = {
        plants: localPlants,
        logs: {
          watering: wateringLogs,
          feeding: feedingLogs,
          repotting: repottingLogs,
          soilTopUp: soilTopUpLogs,
          pruning: pruningLogs,
        },
        customLocations: localData.get('customLocations') || [],
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      setSyncProgress(60);

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `indoor-jungle-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSyncProgress(100);
      setSyncStatus('complete');

      toast({
        title: "Backup Created!",
        description: `Downloaded backup file with ${localPlants.length} plants and ${localLogs.length} care logs. Upload this file to your Google Drive manually.`,
      });

      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not create backup file",
        variant: "destructive",
      });
      setSyncStatus('idle');
    }
  };

  // Import data from JSON file
  const importFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      setSyncStatus('downloading');
      setSyncProgress(20);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          
          setSyncProgress(50);

          // Validate data structure
          if (!importData.plants || !importData.logs) {
            throw new Error('Invalid backup file format');
          }

          // Import plants
          if (importData.plants.length > 0) {
            localData.set('plants', importData.plants);
          }

          setSyncProgress(70);

          // Import logs
          if (importData.logs.watering) localData.set('wateringLogs', importData.logs.watering);
          if (importData.logs.feeding) localData.set('feedingLogs', importData.logs.feeding);
          if (importData.logs.repotting) localData.set('repottingLogs', importData.logs.repotting);
          if (importData.logs.soilTopUp) localData.set('soilTopUpLogs', importData.logs.soilTopUp);
          if (importData.logs.pruning) localData.set('pruningLogs', importData.logs.pruning);

          // Import custom locations
          if (importData.customLocations) {
            localData.set('customLocations', importData.customLocations);
          }

          setSyncProgress(100);
          setSyncStatus('complete');

          toast({
            title: "Restore Complete!",
            description: `Imported ${importData.plants.length} plants and care logs from Google Drive backup.`,
          });

          setTimeout(() => {
            setSyncStatus('idle');
            window.location.reload(); // Refresh to show imported data
          }, 2000);

        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Could not read backup file. Please check the file format.",
            variant: "destructive",
          });
          setSyncStatus('idle');
        }
      };
      
      setSyncProgress(10);
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Simple Google Drive Backup
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ready
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Easy backup and restore for your plant data - no complex setup required
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Simple 2-Step Process:</h4>
              <ol className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <div>
                    <strong>Download your backup file</strong>
                    <br />
                    <span className="text-xs">Click "Create Backup" to download a file with all your plants</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <div>
                    <strong>Upload to Google Drive</strong>
                    <br />
                    <span className="text-xs">Manually upload the backup file to your Google Drive folder</span>
                  </div>
                </li>
              </ol>
            </div>

            <Button 
              onClick={initializeGoogleDrive}
              className="w-full"
              size="lg"
            >
              <Shield className="h-4 w-4 mr-2" />
              Enable Simple Backup
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {syncStatus !== 'idle' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {syncStatus === 'uploading' && 'Creating backup file...'}
                    {syncStatus === 'downloading' && 'Restoring from backup...'}
                    {syncStatus === 'complete' && 'Complete!'}
                  </span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">This Device</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{localPlants.length}</div>
                <div className="text-xs text-muted-foreground">Plants</div>
                <div className="text-sm text-muted-foreground">{localLogs.length} care logs</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Cloud className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Google Drive</span>
                </div>
                <div className="text-2xl font-bold text-green-600">∞</div>
                <div className="text-xs text-muted-foreground">Manual backup</div>
                <div className="text-sm text-muted-foreground">Your files</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={exportToJSON}
                disabled={syncStatus !== 'idle'}
                className="w-full"
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                {syncStatus === 'uploading' ? 'Creating Backup...' : 'Create Backup File'}
              </Button>
              
              <Button
                onClick={importFromJSON}
                disabled={syncStatus !== 'idle'}
                className="w-full"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                {syncStatus === 'downloading' ? 'Restoring...' : 'Restore from Backup'}
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Download backup files to your computer</li>
                    <li>• Upload them to any folder in your Google Drive</li>
                    <li>• Download and restore on any device</li>
                    <li>• No API keys or complex setup needed</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => window.open('https://drive.google.com', '_blank')}
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Google Drive
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}