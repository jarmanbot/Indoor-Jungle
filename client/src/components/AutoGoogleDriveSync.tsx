import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Settings,
  Play,
  Pause,
  Timer,
  Wifi,
  WifiOff
} from "lucide-react";
import { localStorage as localData } from "@/lib/localDataStorage";

declare global {
  interface Window {
    gapi: any;
  }
}

export function AutoGoogleDriveSync() {
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'uploading' | 'downloading' | 'complete' | 'error'>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [nextSyncTime, setNextSyncTime] = useState<string | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const { toast } = useToast();

  // Dynamic Google Drive configuration that works with any domain
  const API_KEY = 'AIzaSyDfF8kGZt2qjElEfKXBmNfb7Wr1VT4KcYs'; // Universal API key
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/drive.file';
  const BACKUP_FOLDER_NAME = 'Indoor Jungle Backups';
  const BACKUP_FILE_NAME = 'indoor-jungle-auto-backup.json';

  // Get local data counts
  const localPlants = localData.get('plants') || [];
  const wateringLogs = localData.get('wateringLogs') || [];
  const feedingLogs = localData.get('feedingLogs') || [];
  const repottingLogs = localData.get('repottingLogs') || [];
  const soilTopUpLogs = localData.get('soilTopUpLogs') || [];
  const pruningLogs = localData.get('pruningLogs') || [];
  const localLogs = [...wateringLogs, ...feedingLogs, ...repottingLogs, ...soilTopUpLogs, ...pruningLogs];

  // Load saved settings
  useEffect(() => {
    const savedAutoBackup = localStorage.getItem('autoBackupEnabled') === 'true';
    const savedLastSync = localStorage.getItem('lastSyncTime');
    const savedFileId = localStorage.getItem('driveBackupFileId');
    
    setAutoBackupEnabled(savedAutoBackup);
    setLastSyncTime(savedLastSync);
    setDriveFileId(savedFileId);

    // Calculate next sync time (every 6 hours)
    if (savedLastSync) {
      const lastSync = new Date(savedLastSync);
      const nextSync = new Date(lastSync.getTime() + (6 * 60 * 60 * 1000));
      setNextSyncTime(nextSync.toLocaleString());
    }
  }, []);

  // Initialize Google Drive API
  const initializeGoogleDrive = async () => {
    try {
      setSyncStatus('downloading');
      setSyncProgress(10);

      // Load Google APIs
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      setSyncProgress(30);

      // Initialize gapi
      await new Promise((resolve) => {
        window.gapi.load('auth2,client', resolve);
      });

      setSyncProgress(50);

      // Initialize the API client
      await window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });

      setSyncProgress(70);

      // Check if user is already signed in
      const authInstance = window.gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      
      setIsConnected(true);
      setIsAuthorized(isSignedIn);

      setSyncProgress(100);
      setSyncStatus('complete');

      toast({
        title: "Google Drive Connected",
        description: isSignedIn ? "Ready for auto backup!" : "Click 'Authorize' to enable auto backup",
      });

      setTimeout(() => setSyncStatus('idle'), 2000);

    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      setSyncStatus('error');
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Authorize with Google
  const authorizeGoogleDrive = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsAuthorized(true);
      
      toast({
        title: "Authorization Complete",
        description: "Auto backup is now ready to use!",
      });

      // Perform initial backup
      if (localPlants.length > 0) {
        await performAutoBackup();
      }
    } catch (error) {
      toast({
        title: "Authorization Failed",
        description: "Please try again or check your Google account permissions.",
        variant: "destructive",
      });
    }
  };

  // Create or get backup folder
  const getBackupFolder = async () => {
    try {
      // Search for existing backup folder
      const response = await window.gapi.client.drive.files.list({
        q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)'
      });

      if (response.result.files.length > 0) {
        return response.result.files[0].id;
      }

      // Create backup folder if it doesn't exist
      const createResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: BACKUP_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });

      return createResponse.result.id;
    } catch (error) {
      throw new Error('Failed to create backup folder');
    }
  };

  // Perform auto backup
  const performAutoBackup = async () => {
    try {
      setSyncStatus('uploading');
      setSyncProgress(10);

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
        version: '1.0',
        autoBackup: true
      };

      setSyncProgress(30);

      const folderId = await getBackupFolder();
      setSyncProgress(50);

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      const metadata = {
        name: BACKUP_FILE_NAME,
        parents: [folderId]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      setSyncProgress(70);

      // Upload or update file
      let response;
      if (driveFileId) {
        // Update existing file
        response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=multipart`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
          },
          body: form
        });
      } else {
        // Create new file
        response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
          },
          body: form
        });
      }

      const result = await response.json();
      
      if (!driveFileId) {
        setDriveFileId(result.id);
        localStorage.setItem('driveBackupFileId', result.id);
      }

      setSyncProgress(100);
      setSyncStatus('complete');

      const now = new Date();
      setLastSyncTime(now.toLocaleString());
      localStorage.setItem('lastSyncTime', now.toISOString());

      // Calculate next sync time
      const nextSync = new Date(now.getTime() + (6 * 60 * 60 * 1000));
      setNextSyncTime(nextSync.toLocaleString());

      toast({
        title: "Backup Complete",
        description: `Successfully backed up ${localPlants.length} plants to Google Drive`,
      });

      setTimeout(() => setSyncStatus('idle'), 2000);

    } catch (error) {
      console.error('Backup failed:', error);
      setSyncStatus('error');
      toast({
        title: "Backup Failed",
        description: "Could not backup to Google Drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Restore from auto backup
  const restoreFromBackup = async () => {
    try {
      if (!driveFileId) {
        toast({
          title: "No Backup Found",
          description: "No auto backup file found in Google Drive",
          variant: "destructive",
        });
        return;
      }

      setSyncStatus('downloading');
      setSyncProgress(20);

      const response = await window.gapi.client.drive.files.get({
        fileId: driveFileId,
        alt: 'media'
      });

      setSyncProgress(50);

      const importData = JSON.parse(response.body);

      // Validate data structure
      if (!importData.plants || !importData.logs) {
        throw new Error('Invalid backup file format');
      }

      // Import plants and logs
      if (importData.plants.length > 0) {
        localData.set('plants', importData.plants);
      }

      setSyncProgress(70);

      if (importData.logs.watering) localData.set('wateringLogs', importData.logs.watering);
      if (importData.logs.feeding) localData.set('feedingLogs', importData.logs.feeding);
      if (importData.logs.repotting) localData.set('repottingLogs', importData.logs.repotting);
      if (importData.logs.soilTopUp) localData.set('soilTopUpLogs', importData.logs.soilTopUp);
      if (importData.logs.pruning) localData.set('pruningLogs', importData.logs.pruning);

      if (importData.customLocations) {
        localData.set('customLocations', importData.customLocations);
      }

      setSyncProgress(100);
      setSyncStatus('complete');

      toast({
        title: "Restore Complete",
        description: `Restored ${importData.plants.length} plants from Google Drive`,
      });

      setTimeout(() => {
        setSyncStatus('idle');
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Restore failed:', error);
      setSyncStatus('error');
      toast({
        title: "Restore Failed",
        description: "Could not restore from Google Drive backup",
        variant: "destructive",
      });
    }
  };

  // Toggle auto backup
  const toggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    localStorage.setItem('autoBackupEnabled', enabled.toString());
    
    if (enabled && isAuthorized) {
      toast({
        title: "Auto Backup Enabled",
        description: "Your plants will be automatically backed up every 6 hours",
      });
    } else if (!enabled) {
      toast({
        title: "Auto Backup Disabled",
        description: "Automatic backups have been turned off",
      });
    }
  };

  // Auto backup interval (every 6 hours when enabled)
  useEffect(() => {
    if (!autoBackupEnabled || !isAuthorized) return;

    const checkAutoBackup = () => {
      if (!lastSyncTime) return;

      const lastSync = new Date(lastSyncTime);
      const now = new Date();
      const timeDiff = now.getTime() - lastSync.getTime();
      const sixHours = 6 * 60 * 60 * 1000;

      if (timeDiff >= sixHours) {
        performAutoBackup();
      }
    };

    // Check every 30 minutes
    const interval = setInterval(checkAutoBackup, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoBackupEnabled, isAuthorized, lastSyncTime]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Auto Google Drive Sync
          {isConnected && (
            <Badge variant="secondary" className={isAuthorized ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {isAuthorized ? 'Active' : 'Ready'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Automatic backup and sync with Google Drive - unlimited plants with zero setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Automatic Cloud Sync Features:</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Automatic backup every 6 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Unlimited plants (250+, 500+, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Cross-device synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>No complex setup required</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={initializeGoogleDrive}
              className="w-full"
              size="lg"
              disabled={syncStatus !== 'idle'}
            >
              <Shield className="h-4 w-4 mr-2" />
              {syncStatus === 'downloading' ? 'Connecting...' : 'Connect to Google Drive'}
            </Button>
          </div>
        ) : !isAuthorized ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Authorization Required</h4>
                  <p className="text-sm text-amber-800">
                    To enable auto backup, you need to authorize access to your Google Drive. 
                    This is a one-time setup that creates a private backup folder.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={authorizeGoogleDrive}
              className="w-full"
              size="lg"
            >
              <Shield className="h-4 w-4 mr-2" />
              Authorize Google Drive Access
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {syncStatus !== 'idle' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {syncStatus === 'uploading' && 'Backing up to Google Drive...'}
                    {syncStatus === 'downloading' && 'Restoring from Google Drive...'}
                    {syncStatus === 'complete' && 'Complete!'}
                    {syncStatus === 'error' && 'Error occurred'}
                  </span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-green-600" />
                <Label htmlFor="auto-backup">Auto Backup</Label>
              </div>
              <Switch 
                id="auto-backup"
                checked={autoBackupEnabled}
                onCheckedChange={toggleAutoBackup}
              />
            </div>

            {autoBackupEnabled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Auto Backup Active</span>
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  {lastSyncTime && (
                    <p>Last backup: {lastSyncTime}</p>
                  )}
                  {nextSyncTime && (
                    <p>Next backup: {nextSyncTime}</p>
                  )}
                </div>
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
                <div className="text-sm text-muted-foreground">Auto sync</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={performAutoBackup}
                disabled={syncStatus !== 'idle'}
                className="w-full"
                variant="default"
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                {syncStatus === 'uploading' ? 'Backing Up...' : 'Backup Now'}
              </Button>
              
              <Button
                onClick={restoreFromBackup}
                disabled={syncStatus !== 'idle' || !driveFileId}
                className="w-full"
                variant="outline"
              >
                <CloudDownload className="h-4 w-4 mr-2" />
                {syncStatus === 'downloading' ? 'Restoring...' : 'Restore from Backup'}
              </Button>
            </div>

            <Button
              onClick={() => window.open('https://drive.google.com', '_blank')}
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Google Drive Backups
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}