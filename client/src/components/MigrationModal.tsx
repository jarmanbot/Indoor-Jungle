import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Cloud, Database } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocalDataStorage } from "@/lib/localDataStorage";

interface MigrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrationNeeded: boolean;
}

export function MigrationModal({ open, onOpenChange, migrationNeeded }: MigrationModalProps) {
  const [migrationStep, setMigrationStep] = useState<'intro' | 'migrating' | 'success' | 'error'>('intro');
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const { exportData } = useLocalDataStorage();

  const migrationMutation = useMutation({
    mutationFn: async () => {
      const localData = exportData();
      return apiRequest('/api/migrate/from-localstorage', 'POST', { 
        localStorageData: localData 
      });
    },
    onSuccess: (result) => {
      setMigrationResult(result);
      setMigrationStep('success');
    },
    onError: (error) => {
      console.error('Migration failed:', error);
      setMigrationStep('error');
    },
  });

  const startMigration = () => {
    setMigrationStep('migrating');
    migrationMutation.mutate();
  };

  const skipMigration = () => {
    onOpenChange(false);
  };

  if (!migrationNeeded) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            Upgrade to Firebase Database
          </DialogTitle>
          <DialogDescription>
            Your plant care app is now ready for unlimited scalability with Firebase real-time database.
          </DialogDescription>
        </DialogHeader>

        {migrationStep === 'intro' && (
          <div className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Your plants are currently stored locally on this device. 
                Migrate to Firebase for:
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                  <li>Real-time sync across all devices</li>
                  <li>Support for 250+ plants</li>
                  <li>Automatic cloud backup</li>
                  <li>Never lose your data again</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={startMigration} className="flex-1">
                <Cloud className="mr-2 h-4 w-4" />
                Migrate to Firebase
              </Button>
              <Button variant="outline" onClick={skipMigration}>
                Keep Local Storage
              </Button>
            </div>
          </div>
        )}

        {migrationStep === 'migrating' && (
          <div className="space-y-4 text-center py-4">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p>Migrating your plants to Firebase...</p>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </div>
        )}

        {migrationStep === 'success' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Migration completed successfully!
                <div className="mt-2 text-sm">
                  <p>✓ {migrationResult?.plantsCreated || 0} plants migrated</p>
                  <p>✓ {migrationResult?.logsCreated || 0} care logs migrated</p>
                  <p>✓ Real-time sync enabled</p>
                </div>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your local data is still available as a backup. You can now add, edit, and track plants across all your devices in real-time.
              </AlertDescription>
            </Alert>

            <Button onClick={() => {
              onOpenChange(false);
              window.location.reload(); // Refresh to load Firebase data
            }} className="w-full">
              Start Using Firebase Database
            </Button>
          </div>
        )}

        {migrationStep === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Migration failed. Your local data is safe. Please try again or contact support.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={() => setMigrationStep('intro')} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={skipMigration} className="flex-1">
                Keep Local Storage
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}