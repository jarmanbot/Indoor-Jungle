import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Clock, 
  Droplets, 
  Scissors, 
  Sun, 
  Thermometer, 
  Leaf, 
  Bug, 
  Calendar,
  RefreshCw 
} from "lucide-react";
import { format } from "date-fns";

// Types for recommendations
type PlantRecommendation = {
  id: number;
  plantId: number;
  seasonalRecommendationId: number;
  isCompleted: number;
  completedAt: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  plant: {
    id: number;
    babyName: string;
    commonName: string;
    category: string;
  };
  seasonalRecommendation: {
    id: number;
    season: string;
    plantCategory: string;
    recommendationType: string;
    title: string;
    description: string;
    frequency: string | null;
    priority: number;
  };
};

const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'watering': return <Droplets className="h-5 w-5" />;
    case 'fertilizing': return <Leaf className="h-5 w-5" />;
    case 'lighting': return <Sun className="h-5 w-5" />;
    case 'humidity': return <Thermometer className="h-5 w-5" />;
    case 'temperature': return <Thermometer className="h-5 w-5" />;
    case 'repotting': return <RefreshCw className="h-5 w-5" />;
    case 'pruning': return <Scissors className="h-5 w-5" />;
    case 'pest_control': return <Bug className="h-5 w-5" />;
    default: return <Calendar className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 3: return "destructive";
    case 2: return "default";
    case 1: return "secondary";
    default: return "secondary";
  }
};

const getPriorityText = (priority: number) => {
  switch (priority) {
    case 3: return "High";
    case 2: return "Medium";
    case 1: return "Low";
    default: return "Normal";
  }
};

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
};

export default function SeasonalRecommendations() {
  const [showCompleted, setShowCompleted] = useState(false);
  const currentSeason = getCurrentSeason();

  // Fetch plant recommendations
  const { data: recommendations, isLoading, error } = useQuery<PlantRecommendation[]>({
    queryKey: ['/api/recommendations/plants', showCompleted],
    queryFn: async () => {
      const response = await fetch(`/api/recommendations/plants?includeCompleted=${showCompleted}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
  });

  // Generate new recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to generate recommendations');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/plants'] });
    },
  });

  // Complete recommendation mutation
  const completeRecommendationMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes?: string }) => {
      const response = await fetch(`/api/recommendations/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to complete recommendation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations/plants'] });
    },
  });

  // Automatically generate recommendations on first load
  useEffect(() => {
    if (!isLoading && recommendations && recommendations.length === 0) {
      generateRecommendationsMutation.mutate();
    }
  }, [isLoading, recommendations, generateRecommendationsMutation]);

  const handleCompleteRecommendation = (id: number) => {
    completeRecommendationMutation.mutate({ id });
  };

  const pendingRecommendations = recommendations?.filter(r => r.isCompleted === 0) || [];
  const completedRecommendations = recommendations?.filter(r => r.isCompleted === 1) || [];

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Seasonal Care Recommendations
        </h1>
        <p className="text-gray-600">
          Current season: <span className="font-semibold capitalize">{currentSeason}</span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          onClick={() => generateRecommendationsMutation.mutate()}
          disabled={generateRecommendationsMutation.isPending}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {generateRecommendationsMutation.isPending ? 'Generating...' : 'Generate New Recommendations'}
        </Button>
        
        <Button
          onClick={() => setShowCompleted(!showCompleted)}
          variant={showCompleted ? "default" : "outline"}
        >
          {showCompleted ? "Hide Completed" : "Show Completed"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md border border-red-100">
          <p className="text-red-600">Failed to load recommendations. Please try again.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Recommendations */}
          {pendingRecommendations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Pending Tasks ({pendingRecommendations.length})
              </h2>
              <div className="space-y-3">
                {pendingRecommendations.map((rec) => (
                  <Card key={rec.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-blue-600 mt-1">
                            {getRecommendationIcon(rec.seasonalRecommendation.recommendationType)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base font-medium">
                              {rec.seasonalRecommendation.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              For {rec.plant.babyName} ({rec.plant.commonName})
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityColor(rec.seasonalRecommendation.priority)}>
                            {getPriorityText(rec.seasonalRecommendation.priority)}
                          </Badge>
                          {rec.dueDate && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(rec.dueDate), 'MMM d')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 mb-4">
                        {rec.seasonalRecommendation.description}
                      </p>
                      {rec.seasonalRecommendation.frequency && (
                        <p className="text-sm text-gray-500 mb-3">
                          Recommended frequency: {rec.seasonalRecommendation.frequency}
                        </p>
                      )}
                      <Button
                        onClick={() => handleCompleteRecommendation(rec.id)}
                        disabled={completeRecommendationMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Recommendations */}
          {showCompleted && completedRecommendations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Completed Tasks ({completedRecommendations.length})
              </h2>
              <div className="space-y-3">
                {completedRecommendations.map((rec) => (
                  <Card key={rec.id} className="border-l-4 border-l-green-500 bg-gray-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-green-600 mt-1">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base font-medium text-gray-700">
                              {rec.seasonalRecommendation.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              For {rec.plant.babyName} ({rec.plant.commonName})
                            </CardDescription>
                          </div>
                        </div>
                        {rec.completedAt && (
                          <Badge variant="outline" className="text-green-700">
                            Completed {format(new Date(rec.completedAt), 'MMM d')}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600">
                        {rec.seasonalRecommendation.description}
                      </p>
                      {rec.notes && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                          <p className="text-sm text-gray-600">{rec.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {pendingRecommendations.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">All caught up!</h3>
              <p className="text-gray-600 mb-4">
                No pending seasonal recommendations at the moment.
              </p>
              <Button 
                onClick={() => generateRecommendationsMutation.mutate()}
                variant="outline"
              >
                Check for New Recommendations
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}