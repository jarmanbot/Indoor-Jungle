import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, 
  Flower, 
  CalendarIcon, 
  PlusCircle, 
  Info 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WateringLogForm from "./WateringLogForm";
import FeedingLogForm from "./FeedingLogForm";
import type { Plant, WateringLog, FeedingLog } from "@shared/schema";

interface PlantCareHistoryProps {
  plant: Plant;
}

export default function PlantCareHistory({ plant }: PlantCareHistoryProps) {
  const [activeTab, setActiveTab] = useState("watering");
  const [showWateringForm, setShowWateringForm] = useState(false);
  const [showFeedingForm, setShowFeedingForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch watering logs
  const {
    data: wateringLogs,
    isLoading: wateringLogsLoading,
    error: wateringLogsError
  } = useQuery({
    queryKey: [`/api/plants/${plant.id}/watering-logs`],
    enabled: activeTab === "watering",
  }) as { data: WateringLog[], isLoading: boolean, error: any };

  // Fetch feeding logs
  const {
    data: feedingLogs,
    isLoading: feedingLogsLoading,
    error: feedingLogsError
  } = useQuery({
    queryKey: [`/api/plants/${plant.id}/feeding-logs`],
    enabled: activeTab === "feeding",
  }) as { data: FeedingLog[], isLoading: boolean, error: any };

  const handleWateringSuccess = () => {
    setShowWateringForm(false);
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}/watering-logs`] });
    queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
  };

  const handleFeedingSuccess = () => {
    setShowFeedingForm(false);
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}/feeding-logs`] });
    queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
  };

  const calculateNextCheckDate = () => {
    if (plant.lastWatered) {
      const lastWateredDate = new Date(plant.lastWatered);
      const nextCheck = plant.nextCheck 
        ? new Date(plant.nextCheck) 
        : new Date(lastWateredDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later by default
      return format(nextCheck, "PPP");
    }
    return "Not set";
  };

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
          <p className="text-sm">Log when you water this plant to track its care history</p>
        </div>
      );
    }

    return wateringLogs.map((log) => (
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
                onClick={() => {
                  // Delete the watering log - we'd need to add this endpoint
                  toast({
                    title: "Undo not implemented yet",
                    description: "We'll need a deletion endpoint for this feature",
                    variant: "destructive"
                  });
                }}
              >
                Undo
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
          <p className="text-sm">Log when you fertilize this plant to track its care history</p>
        </div>
      );
    }

    return feedingLogs.map((log) => (
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
                  {log.fertilizer} {log.amount && `(${log.amount})`}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-destructive"
                onClick={() => {
                  // Delete the feeding log - we'd need to add this endpoint
                  toast({
                    title: "Undo not implemented yet",
                    description: "We'll need a deletion endpoint for this feature",
                    variant: "destructive"
                  });
                }}
              >
                Undo
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

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Care History</h2>
        <div className="flex space-x-2">
          {activeTab === "watering" ? (
            <Dialog open={showWateringForm} onOpenChange={setShowWateringForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-black">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Water Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Watering</DialogTitle>
                </DialogHeader>
                <WateringLogForm 
                  plantId={plant.id}
                  onSuccess={handleWateringSuccess}
                  onCancel={() => setShowWateringForm(false)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={showFeedingForm} onOpenChange={setShowFeedingForm}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Feed Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Feeding</DialogTitle>
                </DialogHeader>
                <FeedingLogForm 
                  plantId={plant.id}
                  onSuccess={handleFeedingSuccess}
                  onCancel={() => setShowFeedingForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-md flex items-center">
            <Info className="h-4 w-4 mr-2 text-amber-500" />
            Care Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2 px-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Last Watered</p>
              <p className="text-sm">
                {plant.lastWatered 
                  ? format(new Date(plant.lastWatered), "PPP") 
                  : "Never"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Next Check</p>
              <p className="text-sm flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1 text-gray-500" />
                {calculateNextCheckDate()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Fed</p>
              <p className="text-sm">
                {plant.lastFed 
                  ? format(new Date(plant.lastFed), "PPP") 
                  : "Never"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge 
                variant={plant.status === "healthy" ? "default" : "destructive"}
                className="mt-1"
              >
                {plant.status?.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="watering" className="flex items-center">
            <Droplets className="h-4 w-4 mr-2" />
            Watering
          </TabsTrigger>
          <TabsTrigger value="feeding" className="flex items-center">
            <Flower className="h-4 w-4 mr-2" />
            Feeding
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="watering" className="mt-4">
          {renderWateringLogs()}
        </TabsContent>
        
        <TabsContent value="feeding" className="mt-4">
          {renderFeedingLogs()}
        </TabsContent>
      </Tabs>
    </div>
  );
}