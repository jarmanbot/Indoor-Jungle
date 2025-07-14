import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, 
  Flower, 
  Shovel,
  Scissors,
  Mountain,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import WateringLogForm from "./WateringLogForm";
import FeedingLogForm from "./FeedingLogForm";
import RepottingLogForm from "./RepottingLogForm";
import SoilTopUpLogForm from "./SoilTopUpLogForm";
import PruningLogForm from "./PruningLogForm";
import type { Plant, WateringLog, FeedingLog, RepottingLog, SoilTopUpLog, PruningLog } from "@shared/schema";
import { localStorage as localData, isUsingLocalStorage } from "@/lib/localDataStorage";

interface PlantCareHistoryProps {
  plant: Plant;
  showWateringForm?: boolean;
  setShowWateringForm?: (show: boolean) => void;
  showFeedingForm?: boolean;
  setShowFeedingForm?: (show: boolean) => void;
  showRepottingForm?: boolean;
  setShowRepottingForm?: (show: boolean) => void;
  showSoilTopUpForm?: boolean;
  setShowSoilTopUpForm?: (show: boolean) => void;
  showPruningForm?: boolean;
  setShowPruningForm?: (show: boolean) => void;
}

export default function PlantCareHistory({ 
  plant,
  showWateringForm = false,
  setShowWateringForm = () => {},
  showFeedingForm = false,
  setShowFeedingForm = () => {},
  showRepottingForm = false,
  setShowRepottingForm = () => {},
  showSoilTopUpForm = false,
  setShowSoilTopUpForm = () => {},
  showPruningForm = false,
  setShowPruningForm = () => {}
}: PlantCareHistoryProps) {
  const [activeTab, setActiveTab] = useState("watering");
  const [deletedLogIds, setDeletedLogIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch watering logs
  const { data: wateringLogs, isLoading: wateringLogsLoading, error: wateringLogsError } = useQuery({
    queryKey: ['/api/plants', plant.id, 'watering-logs'],
    queryFn: async () => {
      if (isAlphaTestingMode()) {
        const allLogs = alphaStorage.get('wateringLogs') || [];
        return allLogs
          .filter((log: any) => log.plantId === plant.id)
          .sort((a: any, b: any) => new Date(b.wateredAt).getTime() - new Date(a.wateredAt).getTime());
      }
      const response = await fetch(`/api/plants/${plant.id}/watering-logs`);
      if (!response.ok) throw new Error('Failed to fetch watering logs');
      return response.json();
    }
  });

  // Fetch feeding logs
  const { data: feedingLogs, isLoading: feedingLogsLoading, error: feedingLogsError } = useQuery({
    queryKey: ['/api/plants', plant.id, 'feeding-logs'],
    queryFn: async () => {
      if (isAlphaTestingMode()) {
        const allLogs = alphaStorage.get('feedingLogs') || [];
        return allLogs
          .filter((log: any) => log.plantId === plant.id)
          .sort((a: any, b: any) => new Date(b.fedAt).getTime() - new Date(a.fedAt).getTime());
      }
      const response = await fetch(`/api/plants/${plant.id}/feeding-logs`);
      if (!response.ok) throw new Error('Failed to fetch feeding logs');
      return response.json();
    }
  });

  // Fetch repotting logs
  const { data: repottingLogs, isLoading: repottingLogsLoading, error: repottingLogsError } = useQuery({
    queryKey: ['/api/plants', plant.id, 'repotting-logs'],
    queryFn: async () => {
      if (isAlphaTestingMode()) {
        const allLogs = alphaStorage.get('repottingLogs') || [];
        return allLogs
          .filter((log: any) => log.plantId === plant.id)
          .sort((a: any, b: any) => new Date(b.repottedAt).getTime() - new Date(a.repottedAt).getTime());
      }
      const response = await fetch(`/api/plants/${plant.id}/repotting-logs`);
      if (!response.ok) throw new Error('Failed to fetch repotting logs');
      return response.json();
    }
  });

  // Fetch soil top up logs
  const { data: soilTopUpLogs, isLoading: soilTopUpLogsLoading, error: soilTopUpLogsError } = useQuery({
    queryKey: ['/api/plants', plant.id, 'soil-top-up-logs'],
    queryFn: async () => {
      if (isAlphaTestingMode()) {
        const allLogs = alphaStorage.get('soilTopUpLogs') || [];
        return allLogs
          .filter((log: any) => log.plantId === plant.id)
          .sort((a: any, b: any) => new Date(b.toppedUpAt).getTime() - new Date(a.toppedUpAt).getTime());
      }
      const response = await fetch(`/api/plants/${plant.id}/soil-top-up-logs`);
      if (!response.ok) throw new Error('Failed to fetch soil top up logs');
      return response.json();
    }
  });

  // Fetch pruning logs
  const { data: pruningLogs, isLoading: pruningLogsLoading, error: pruningLogsError } = useQuery({
    queryKey: ['/api/plants', plant.id, 'pruning-logs'],
    queryFn: async () => {
      if (isAlphaTestingMode()) {
        const allLogs = alphaStorage.get('pruningLogs') || [];
        return allLogs
          .filter((log: any) => log.plantId === plant.id)
          .sort((a: any, b: any) => new Date(b.prunedAt).getTime() - new Date(a.prunedAt).getTime());
      }
      const response = await fetch(`/api/plants/${plant.id}/pruning-logs`);
      if (!response.ok) throw new Error('Failed to fetch pruning logs');
      return response.json();
    }
  });

  // Delete mutations
  const deleteWateringLogMutation = useMutation({
    mutationFn: async (logId: number) => {
      console.log('Deleting watering log:', logId);
      const result = await apiRequest('DELETE', `/api/watering-logs/${logId}`);
      console.log('Delete result:', result);
      return result;
    },
    onSuccess: (_, logId) => {
      console.log('Watering log deleted successfully, logId:', logId);
      
      // Add to deleted set for immediate UI update
      setDeletedLogIds(prev => new Set(prev).add(logId));
      
      // Also refresh the plants list to update lastWatered timestamp
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
      
      toast({ title: "Watering log deleted", description: "The log entry has been removed" });
    },
    onError: (error) => {
      console.error('Failed to delete watering log:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete the watering log", 
        variant: "destructive" 
      });
    }
  });

  const deleteFeedingLogMutation = useMutation({
    mutationFn: async (logId: number) => {
      console.log('Deleting feeding log:', logId);
      const result = await apiRequest('DELETE', `/api/feeding-logs/${logId}`);
      console.log('Delete result:', result);
      return result;
    },
    onSuccess: (_, logId) => {
      console.log('Feeding log deleted successfully, logId:', logId);
      
      // Add to deleted set for immediate UI update
      setDeletedLogIds(prev => new Set(prev).add(logId));
      
      // Also refresh the plants list to update lastFed timestamp
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
      
      toast({ title: "Feeding log deleted", description: "The log entry has been removed" });
    },
    onError: (error) => {
      console.error('Failed to delete feeding log:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete the feeding log", 
        variant: "destructive" 
      });
    }
  });

  const deleteRepottingLogMutation = useMutation({
    mutationFn: (logId: number) => apiRequest('DELETE', `/api/repotting-logs/${logId}`),
    onSuccess: (_, logId) => {
      // Add to deleted set for immediate UI update
      setDeletedLogIds(prev => new Set(prev).add(logId));
      
      queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'repotting-logs'] });
      toast({ title: "Repotting log deleted", description: "The log entry has been removed" });
    }
  });

  const deleteSoilTopUpLogMutation = useMutation({
    mutationFn: (logId: number) => apiRequest('DELETE', `/api/soil-top-up-logs/${logId}`),
    onSuccess: (_, logId) => {
      // Add to deleted set for immediate UI update
      setDeletedLogIds(prev => new Set(prev).add(logId));
      
      queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'soil-top-up-logs'] });
      toast({ title: "Soil top up log deleted", description: "The log entry has been removed" });
    }
  });

  const deletePruningLogMutation = useMutation({
    mutationFn: (logId: number) => apiRequest('DELETE', `/api/pruning-logs/${logId}`),
    onSuccess: (_, logId) => {
      // Add to deleted set for immediate UI update
      setDeletedLogIds(prev => new Set(prev).add(logId));
      
      queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'pruning-logs'] });
      toast({ title: "Pruning log deleted", description: "The log entry has been removed" });
    }
  });

  // Success handlers
  const handleWateringSuccess = () => {
    setShowWateringForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'watering-logs'] });
  };

  const handleFeedingSuccess = () => {
    setShowFeedingForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'feeding-logs'] });
  };

  const handleRepottingSuccess = () => {
    setShowRepottingForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'repotting-logs'] });
  };

  const handleSoilTopUpSuccess = () => {
    setShowSoilTopUpForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'soil-top-up-logs'] });
  };

  const handlePruningSuccess = () => {
    setShowPruningForm(false);
    queryClient.invalidateQueries({ queryKey: ['/api/plants', plant.id, 'pruning-logs'] });
  };

  // Render functions
  const renderWateringLogs = () => {
    if (wateringLogsLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="mb-2">
          <Skeleton className="h-20 w-full mb-2" />
        </div>
      ));
    }

    if (wateringLogsError) {
      return (
        <div className="text-center py-4 text-red-500">
          Failed to load watering history
        </div>
      );
    }

    if (!wateringLogs || wateringLogs.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          <Droplets className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p>No watering logs yet</p>
          <p className="text-sm">Start tracking when you water this plant</p>
        </div>
      );
    }

    return wateringLogs.filter((log: any) => !deletedLogIds.has(log.id)).map((log) => (
      <Card key={log.id} className="mb-3">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-md flex items-center">
                <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                {format(new Date(log.wateredAt), "PPP")}
              </CardTitle>
              {log.amount && (
                <CardDescription>
                  Amount: {log.amount}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-destructive"
                onClick={() => deleteWateringLogMutation.mutate(log.id)}
                disabled={deleteWateringLogMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {deleteWateringLogMutation.isPending ? "..." : "Undo"}
              </Button>
              <Badge variant="outline" className="text-xs">
                {format(new Date(log.wateredAt), "p")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {log.notes && (
          <CardContent className="py-0 px-4">
            <p className="text-sm text-gray-600">{log.notes}</p>
          </CardContent>
        )}
      </Card>
    ));
  };

  const renderFeedingLogs = () => {
    if (feedingLogsLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="mb-2">
          <Skeleton className="h-20 w-full mb-2" />
        </div>
      ));
    }

    if (feedingLogsError) {
      return (
        <div className="text-center py-4 text-red-500">
          Failed to load feeding history
        </div>
      );
    }

    if (!feedingLogs || feedingLogs.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          <Flower className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p>No feeding logs yet</p>
          <p className="text-sm">Track when you fertilize this plant</p>
        </div>
      );
    }

    return feedingLogs.filter((log: any) => !deletedLogIds.has(log.id)).map((log) => (
      <Card key={log.id} className="mb-3">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-md flex items-center">
                <Flower className="h-4 w-4 mr-2 text-green-500" />
                {format(new Date(log.fedAt), "PPP")}
              </CardTitle>
              {(log.fertilizer || log.amount) && (
                <CardDescription>
                  {log.fertilizer && `Fertilizer: ${log.fertilizer}`}
                  {log.fertilizer && log.amount && " • "}
                  {log.amount && `Amount: ${log.amount}`}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-destructive"
                onClick={() => deleteFeedingLogMutation.mutate(log.id)}
                disabled={deleteFeedingLogMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {deleteFeedingLogMutation.isPending ? "..." : "Undo"}
              </Button>
              <Badge variant="outline" className="text-xs">
                {format(new Date(log.fedAt), "p")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {log.notes && (
          <CardContent className="py-0 px-4">
            <p className="text-sm text-gray-600">{log.notes}</p>
          </CardContent>
        )}
      </Card>
    ));
  };

  const renderRepottingLogs = () => {
    if (repottingLogsLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="mb-2">
          <Skeleton className="h-20 w-full mb-2" />
        </div>
      ));
    }

    if (repottingLogsError) {
      return (
        <div className="text-center py-4 text-red-500">
          Failed to load repotting history
        </div>
      );
    }

    if (!repottingLogs || repottingLogs.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          <Shovel className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p>No repotting logs yet</p>
          <p className="text-sm">Log when you repot this plant to track its care history</p>
        </div>
      );
    }

    return repottingLogs.filter((log: any) => !deletedLogIds.has(log.id)).map((log) => (
      <Card key={log.id} className="mb-3">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-md flex items-center">
                <Shovel className="h-4 w-4 mr-2 text-orange-500" />
                {format(new Date(log.repottedAt), "PPP")}
              </CardTitle>
              {(log.potSize || log.soilType) && (
                <CardDescription>
                  {log.potSize && `Pot Size: ${log.potSize}`}
                  {log.potSize && log.soilType && " • "}
                  {log.soilType && `Soil: ${log.soilType}`}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-destructive"
                onClick={() => deleteRepottingLogMutation.mutate(log.id)}
                disabled={deleteRepottingLogMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {deleteRepottingLogMutation.isPending ? "..." : "Undo"}
              </Button>
              <Badge variant="outline" className="text-xs">
                {format(new Date(log.repottedAt), "p")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {log.notes && (
          <CardContent className="py-0 px-4">
            <p className="text-sm text-gray-600">{log.notes}</p>
          </CardContent>
        )}
      </Card>
    ));
  };

  const renderSoilTopUpLogs = () => {
    if (soilTopUpLogsLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="mb-2">
          <Skeleton className="h-20 w-full mb-2" />
        </div>
      ));
    }

    if (soilTopUpLogsError) {
      return (
        <div className="text-center py-4 text-red-500">
          Failed to load soil top up history
        </div>
      );
    }

    if (!soilTopUpLogs || soilTopUpLogs.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          <Mountain className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p>No soil top up logs yet</p>
          <p className="text-sm">Log when you add soil to this plant</p>
        </div>
      );
    }

    return soilTopUpLogs.filter((log: any) => !deletedLogIds.has(log.id)).map((log) => (
      <Card key={log.id} className="mb-3">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-md flex items-center">
                <Mountain className="h-4 w-4 mr-2 text-brown-500" />
                {format(new Date(log.toppedUpAt), "PPP")}
              </CardTitle>
              {(log.soilType || log.amount) && (
                <CardDescription>
                  {log.soilType && `Soil Type: ${log.soilType}`}
                  {log.soilType && log.amount && " • "}
                  {log.amount && `Amount: ${log.amount}`}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-destructive"
                onClick={() => deleteSoilTopUpLogMutation.mutate(log.id)}
                disabled={deleteSoilTopUpLogMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {deleteSoilTopUpLogMutation.isPending ? "..." : "Undo"}
              </Button>
              <Badge variant="outline" className="text-xs">
                {format(new Date(log.toppedUpAt), "p")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {log.notes && (
          <CardContent className="py-0 px-4">
            <p className="text-sm text-gray-600">{log.notes}</p>
          </CardContent>
        )}
      </Card>
    ));
  };

  const renderPruningLogs = () => {
    if (pruningLogsLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="mb-2">
          <Skeleton className="h-20 w-full mb-2" />
        </div>
      ));
    }

    if (pruningLogsError) {
      return (
        <div className="text-center py-4 text-red-500">
          Failed to load pruning history
        </div>
      );
    }

    if (!pruningLogs || pruningLogs.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500">
          <Scissors className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p>No pruning logs yet</p>
          <p className="text-sm">Log when you prune this plant</p>
        </div>
      );
    }

    return pruningLogs.filter((log: any) => !deletedLogIds.has(log.id)).map((log) => (
      <Card key={log.id} className="mb-3">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-md flex items-center">
                <Scissors className="h-4 w-4 mr-2 text-purple-500" />
                {format(new Date(log.prunedAt), "PPP")}
              </CardTitle>
              {(log.partsRemoved || log.reason) && (
                <CardDescription>
                  {log.partsRemoved && `Removed: ${log.partsRemoved}`}
                  {log.partsRemoved && log.reason && " • "}
                  {log.reason && `Reason: ${log.reason}`}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-destructive"
                onClick={() => deletePruningLogMutation.mutate(log.id)}
                disabled={deletePruningLogMutation.isPending}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {deletePruningLogMutation.isPending ? "..." : "Undo"}
              </Button>
              <Badge variant="outline" className="text-xs">
                {format(new Date(log.prunedAt), "p")}
              </Badge>
            </div>
          </div>
        </CardHeader>
        {log.notes && (
          <CardContent className="py-0 px-4">
            <p className="text-sm text-gray-600">{log.notes}</p>
          </CardContent>
        )}
      </Card>
    ));
  };

  return (
    <div>
      {/* Care History Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="watering">Water</TabsTrigger>
          <TabsTrigger value="feeding">Feed</TabsTrigger>
          <TabsTrigger value="repotting">Repot</TabsTrigger>
          <TabsTrigger value="soil">Soil</TabsTrigger>
          <TabsTrigger value="pruning">Prune</TabsTrigger>
        </TabsList>
        
        <TabsContent value="watering" className="mt-4">
          {renderWateringLogs()}
        </TabsContent>
        
        <TabsContent value="feeding" className="mt-4">
          {renderFeedingLogs()}
        </TabsContent>
        
        <TabsContent value="repotting" className="mt-4">
          {renderRepottingLogs()}
        </TabsContent>
        
        <TabsContent value="soil" className="mt-4">
          {renderSoilTopUpLogs()}
        </TabsContent>
        
        <TabsContent value="pruning" className="mt-4">
          {renderPruningLogs()}
        </TabsContent>
      </Tabs>
    </div>
  );
}