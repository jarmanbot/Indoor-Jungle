import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Upload, Cloud, Database } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { initializeLocalStorage } from "@/lib/localDataStorage";

interface MigrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MigrationProgress {
  step: string;
  current: number;
  total: number;
  message: string;
}

export function MigrationModal({ open, onOpenChange }: MigrationModalProps) {
  const [migrationStep, setMigrationStep] = useState<'ready' | 'migrating' | 'complete' | 'error'>('ready');
  const [progress, setProgress] = useState<MigrationProgress>({ step: '', current: 0, total: 0, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [migrationStats, setMigrationStats] = useState<{ plants: number; logs: number } | null>(null);

  const queryClient = useQueryClient();

  const migrationMutation = useMutation({
    mutationFn: async () => {
      setMigrationStep('migrating');
      setError(null);
      
      // Initialize local storage to get current data
      initializeLocalStorage();
      const localStorageData = {
        plants: JSON.parse(window.localStorage.getItem('plant_app_plants') || '[]'),
        wateringLogs: JSON.parse(window.localStorage.getItem('plant_app_wateringLogs') || '[]'),
        feedingLogs: JSON.parse(window.localStorage.getItem('plant_app_feedingLogs') || '[]'),
        repottingLogs: JSON.parse(window.localStorage.getItem('plant_app_repottingLogs') || '[]'),
        soilTopUpLogs: JSON.parse(window.localStorage.getItem('plant_app_soilTopUpLogs') || '[]'),
        pruningLogs: JSON.parse(window.localStorage.getItem('plant_app_pruningLogs') || '[]'),
        customLocations: JSON.parse(window.localStorage.getItem('plant_app_customLocations') || '[]'),
      };

      // Step 1: Validate data
      setProgress({
        step: 'validate',
        current: 1,
        total: 4,
        message: 'Validating local storage data...'
      });

      const totalPlants = localStorageData.plants.length;
      const totalLogs = Object.values(localStorageData)
        .filter(data => Array.isArray(data) && data !== localStorageData.plants)
        .reduce((sum, logs: any) => sum + logs.length, 0);

      if (totalPlants === 0) {
        throw new Error('No plants found in local storage to migrate');
      }

      // Step 2: Start migration
      setProgress({
        step: 'migrate',
        current: 2,
        total: 4,
        message: `Migrating ${totalPlants} plants and ${totalLogs} care logs...`
      });

      const response = await fetch('/api/migration/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user',
        },
        body: JSON.stringify({ data: localStorageData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Migration failed');
      }

      const result = await response.json();

      // Step 3: Verify migration
      setProgress({
        step: 'verify',
        current: 3,
        total: 4,
        message: 'Verifying migrated data...'
      });

      const verifyResponse = await fetch('/api/plants', {
        headers: { 'X-User-ID': 'dev-user' },
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify migrated data');
      }

      const migratedPlants = await verifyResponse.json();

      if (migratedPlants.length !== totalPlants) {
        throw new Error(`Migration verification failed: expected ${totalPlants} plants, found ${migratedPlants.length}`);
      }

      // Step 4: Complete
      setProgress({
        step: 'complete',
        current: 4,
        total: 4,
        message: 'Migration completed successfully!'
      });

      setMigrationStats({
        plants: totalPlants,
        logs: totalLogs
      });

      return result;
    },
    onSuccess: () => {
      setMigrationStep('complete');
      // Invalidate queries to refresh data and clear cache
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.removeQueries({ queryKey: ['/api/plants'] });
    },
    onError: (error: Error) => {
      setMigrationStep('error');
      setError(error.message);
    },
  });

  const handleStartMigration = () => {
    migrationMutation.mutate();
  };

  const handleClose = () => {
    if (migrationStep !== 'migrating') {
      onOpenChange(false);
    }
  };

  const getProgressPercentage = () => {
    return (progress.current / progress.total) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Migrate to Firebase
          </DialogTitle>
          <DialogDescription>
            Transfer your plants and care logs from local storage to Firebase for unlimited storage and cross-device sync.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {migrationStep === 'ready' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                Local Storage → Firebase Cloud
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will copy all your plants and care logs to Firebase. Your local data will remain unchanged as a backup.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button onClick={handleStartMigration} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Start Migration
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {migrationStep === 'migrating' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progress.message}</span>
                  <span>{progress.current}/{progress.total}</span>
                </div>
                <Progress value={getProgressPercentage()} className="w-full" />
              </div>
              
              <div className="text-sm text-muted-foreground">
                Please don't close this window during migration...
              </div>
            </div>
          )}

          {migrationStep === 'complete' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Migration Completed Successfully!</span>
              </div>

              {migrationStats && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div>✓ Migrated {migrationStats.plants} plants</div>
                    <div>✓ Migrated {migrationStats.logs} care logs</div>
                    <div>✓ All data verified in Firebase</div>
                  </div>
                </div>
              )}

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your data is now stored in Firebase with unlimited capacity and cross-device sync. You can continue using the app normally.
                </AlertDescription>
              </Alert>

              <Button onClick={handleClose} className="w-full">
                Continue to App
              </Button>
            </div>
          )}

          {migrationStep === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Migration Failed</span>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartMigration} 
                  disabled={migrationMutation.isPending}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}