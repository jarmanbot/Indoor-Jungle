import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Smartphone
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { localStorage as localData } from "@/lib/localDataStorage";

export function GoogleDriveSync() {
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'uploading' | 'downloading' | 'complete'>('idle');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status
  const { data: authStatus, isLoading: checkingAuth } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Sync local data to Google Drive
  const syncToGoogleDrive = useMutation({
    mutationFn: async () => {
      setSyncStatus('uploading');
      setSyncProgress(10);

      // Get all local data
      const plants = localData.get('plants') || [];
      const logs = {
        watering: localData.get('wateringLogs') || [],
        feeding: localData.get('feedingLogs') || [],
        repotting: localData.get('repottingLogs') || [],
        soilTopUp: localData.get('soilTopUpLogs') || [],
        pruning: localData.get('pruningLogs') || [],
      };

      setSyncProgress(50);

      // Group logs by plant ID for easier access
      const logsByPlant: any = {};
      Object.entries(logs).forEach(([logType, logArray]) => {
        (logArray as any[]).forEach(log => {
          if (!logsByPlant[log.plantId]) {
            logsByPlant[log.plantId] = {};
          }
          if (!logsByPlant[log.plantId][logType]) {
            logsByPlant[log.plantId][logType] = [];
          }
          logsByPlant[log.plantId][logType].push(log);
        });
      });

      setSyncProgress(80);

      // Sync to Google Drive
      return await fetch('/api/plants/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plants, logs: logsByPlant }),
      }).then(res => res.json());

      setSyncProgress(100);
      setSyncStatus('complete');
      
      return { plants: plants.length, logs: Object.values(logs).flat().length };
    },
    onSuccess: (result) => {
      toast({
        title: "Sync Complete!",
        description: `${result.plants} plants and ${result.logs} care logs backed up to Google Drive.`,
      });
      setTimeout(() => setSyncStatus('idle'), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync data to Google Drive",
        variant: "destructive",
      });
      setSyncStatus('idle');
    },
  });

  // Load data from Google Drive
  const loadFromGoogleDrive = useMutation({
    mutationFn: async () => {
      setSyncStatus('downloading');
      setSyncProgress(20);

      // Load plants from Google Drive
      const plants = await fetch('/api/plants').then(res => res.json());
      setSyncProgress(60);

      // Clear local storage and save new data
      localData.clear();
      localData.set('plants', plants);

      setSyncProgress(80);

      // Load care logs for each plant
      for (const plant of plants) {
        try {
          const logs = await fetch(`/api/plants/${plant.id}/logs`).then(res => res.json());
          
          // Save logs to local storage
          Object.entries(logs).forEach(([logType, logArray]) => {
            const existingLogs = localData.get(`${logType}Logs`) || [];
            localData.set(`${logType}Logs`, [...existingLogs, ...(logArray as any[])]);
          });
        } catch (error) {
          console.warn(`Failed to load logs for plant ${plant.id}`);
        }
      }

      setSyncProgress(100);
      setSyncStatus('complete');
      
      return plants;
    },
    onSuccess: (plants) => {
      toast({
        title: "Data Restored!",
        description: `${plants.length} plants restored from Google Drive.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      setTimeout(() => setSyncStatus('idle'), 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Restore Failed",
        description: error.message || "Failed to restore data from Google Drive",
        variant: "destructive",
      });
      setSyncStatus('idle');
    },
  });

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  const localPlants = localData.get('plants') || [];
  const localLogs = [
    ...(localData.get('wateringLogs') || []),
    ...(localData.get('feedingLogs') || []),
    ...(localData.get('repottingLogs') || []),
    ...(localData.get('soilTopUpLogs') || []),
    ...(localData.get('pruningLogs') || [])
  ];

  if (checkingAuth) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Checking Google Drive connection...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!(authStatus as any)?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Drive Cloud Storage
          </CardTitle>
          <CardDescription>
            Store unlimited plants with your Google Drive account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Why use Google Drive?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Store 250+ plants (vs ~45 with local storage)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Access your plants from any device
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Automatic cloud backup and sync
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                High-resolution plant photos
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-muted rounded-lg p-3">
              <HardDrive className="h-8 w-8 mx-auto text-amber-600 mb-2" />
              <div className="text-sm font-medium">Local Storage</div>
              <div className="text-xs text-muted-foreground">~45 plants max</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <Cloud className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-sm font-medium text-green-900">Google Drive</div>
              <div className="text-xs text-green-700">250+ plants</div>
            </div>
          </div>

          <Button 
            onClick={handleGoogleSignIn}
            className="w-full"
            size="lg"
          >
            <Shield className="h-4 w-4 mr-2" />
            Connect Google Drive
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your plant data stays private in your Google Drive folder
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-green-600" />
          Google Drive Connected
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {(authStatus as any).user.email}
          </Badge>
        </CardTitle>
        <CardDescription>
          Sync your plant data with Google Drive for unlimited storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {syncStatus === 'uploading' && 'Backing up to Google Drive...'}
                {syncStatus === 'downloading' && 'Restoring from Google Drive...'}
                {syncStatus === 'complete' && 'Sync Complete!'}
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
            <div className="text-xs text-muted-foreground">Unlimited</div>
            <div className="text-sm text-muted-foreground">Cloud storage</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button
            onClick={() => syncToGoogleDrive.mutate()}
            disabled={syncToGoogleDrive.isPending || syncStatus !== 'idle'}
            className="w-full"
            variant="default"
          >
            <CloudUpload className="h-4 w-4 mr-2" />
            {syncToGoogleDrive.isPending ? 'Backing Up...' : 'Backup to Google Drive'}
          </Button>
          
          <Button
            onClick={() => loadFromGoogleDrive.mutate()}
            disabled={loadFromGoogleDrive.isPending || syncStatus !== 'idle'}
            className="w-full"
            variant="outline"
          >
            <CloudDownload className="h-4 w-4 mr-2" />
            {loadFromGoogleDrive.isPending ? 'Restoring...' : 'Restore from Google Drive'}
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="text-xs space-y-1">
                <li>• Backup regularly to prevent data loss</li>
                <li>• Restore will replace all local data</li>
                <li>• Photos are stored in your Google Drive</li>
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
          View Google Drive Folder
        </Button>
      </CardContent>
    </Card>
  );
}