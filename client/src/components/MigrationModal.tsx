import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Upload, Database, Cloud, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { localStorage as localData } from "@/lib/localDataStorage";

interface MigrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMigrationComplete: () => void;
}

export function MigrationModal({ open, onOpenChange, onMigrationComplete }: MigrationModalProps) {
  const [migrationStep, setMigrationStep] = useState<'check' | 'confirm' | 'migrating' | 'complete'>('check');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [localDataSummary, setLocalDataSummary] = useState<{
    plants: number;
    logs: number;
    hasImages: boolean;
  }>({ plants: 0, logs: 0, hasImages: false });
  const { toast } = useToast();

  // Check if migration is needed
  const { data: migrationNeeded, isLoading: checkingMigration } = useQuery({
    queryKey: ['/api/migrate/check'],
    enabled: open,
  });

  // Get local storage data summary
  useEffect(() => {
    if (open) {
      const plants = localData.get('plants') || [];
      const wateringLogs = localData.get('wateringLogs') || [];
      const feedingLogs = localData.get('feedingLogs') || [];
      const repottingLogs = localData.get('repottingLogs') || [];
      const soilTopUpLogs = localData.get('soilTopUpLogs') || [];
      const pruningLogs = localData.get('pruningLogs') || [];
      
      const totalLogs = wateringLogs.length + feedingLogs.length + repottingLogs.length + soilTopUpLogs.length + pruningLogs.length;
      const hasImages = plants.some((plant: any) => plant.imageUrl && plant.imageUrl.startsWith('data:'));

      setLocalDataSummary({
        plants: plants.length,
        logs: totalLogs,
        hasImages
      });
    }
  }, [open]);

  // Migration mutation
  const migrationMutation = useMutation({
    mutationFn: async () => {
      const localStorageData = {
        plants: localData.get('plants') || [],
        customLocations: localData.get('customLocations') || [],
        wateringLogs: localData.get('wateringLogs') || [],
        feedingLogs: localData.get('feedingLogs') || [],
        repottingLogs: localData.get('repottingLogs') || [],
        soilTopUpLogs: localData.get('soilTopUpLogs') || [],
        pruningLogs: localData.get('pruningLogs') || [],
      };

      return apiRequest('/api/migrate/from-localstorage', 'POST', { localStorageData });
    },
    onSuccess: (result: any) => {
      toast({
        title: "Migration Successful!",
        description: `Migrated ${result.plantsCreated} plants, ${result.logsCreated} care logs, and ${result.imagesUploaded} images to the cloud.`,
      });
      setMigrationStep('complete');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    },
    onError: (error: any) => {
      toast({
        title: "Migration Failed",
        description: error.message || "Failed to migrate data. Please try again.",
        variant: "destructive",
      });
      setMigrationStep('confirm');
    },
  });

  const handleStartMigration = async () => {
    setMigrationStep('migrating');
    setMigrationProgress(20);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setMigrationProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      await migrationMutation.mutateAsync();
      setMigrationProgress(100);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleComplete = () => {
    onOpenChange(false);
    onMigrationComplete();
    // Reset state for next time
    setMigrationStep('check');
    setMigrationProgress(0);
  };

  if (checkingMigration) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checking Migration Status...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!(migrationNeeded as any)?.migrationNeeded || localDataSummary.plants === 0) {
    return null; // No migration needed
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Upgrade to Cloud Storage
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {migrationStep === 'check' || migrationStep === 'confirm' ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Scale Beyond 45 Plants!</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Your local storage is limited to about 45 plants due to browser storage limits. 
                      Upgrade to cloud storage to manage 250+ plants with unlimited space!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Found in Local Storage:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{localDataSummary.plants}</div>
                    <div className="text-sm text-muted-foreground">Plants</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{localDataSummary.logs}</div>
                    <div className="text-sm text-muted-foreground">Care Logs</div>
                  </div>
                </div>
                {localDataSummary.hasImages && (
                  <div className="text-sm text-muted-foreground text-center">
                    📸 Including plant photos that will be moved to cloud storage
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Migration Benefits:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Store 250+ plants with unlimited space
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Cloud backup - never lose your data
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Access from any device when logged in
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    High-quality image storage
                  </li>
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Keep Local
                </Button>
                <Button onClick={handleStartMigration} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Migrate to Cloud
                </Button>
              </div>
            </>
          ) : migrationStep === 'migrating' ? (
            <>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <Database className="h-12 w-12 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-medium">Migrating Your Data...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Moving your plants and care logs to cloud storage. This may take a few moments.
                  </p>
                </div>
                <Progress value={migrationProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {migrationProgress < 30 && "Preparing data..."}
                  {migrationProgress >= 30 && migrationProgress < 60 && "Uploading plant images..."}
                  {migrationProgress >= 60 && migrationProgress < 90 && "Saving plant data..."}
                  {migrationProgress >= 90 && "Finalizing migration..."}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">Migration Complete!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your plants are now stored in the cloud. You can now add up to 250+ plants!
                  </p>
                </div>
              </div>
              <Button onClick={handleComplete} className="w-full">
                Continue to Your Plants
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}