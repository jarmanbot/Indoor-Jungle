import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plant } from "@shared/schema";
import { 
  Brain, 
  Lightbulb, 
  Droplet, 
  Sun, 
  Thermometer,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Zap
} from "lucide-react";

const SmartRecommendations = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ['/api/plants'],
  });

  // Simulate smart recommendations based on plant data
  const generateRecommendations = () => {
    if (!plants || plants.length === 0) return [];
    
    const recommendations = [];
    
    // Check for overdue watering
    plants.forEach(plant => {
      const daysSinceWatered = plant.lastWatered 
        ? Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (daysSinceWatered > (plant.wateringFrequencyDays || 7)) {
        recommendations.push({
          id: `water-${plant.id}`,
          type: "urgent",
          category: "watering",
          title: `${plant.name} needs water`,
          description: `It's been ${daysSinceWatered} days since last watering (recommended: ${plant.wateringFrequencyDays || 7} days)`,
          action: "Water now",
          priority: daysSinceWatered > (plant.wateringFrequencyDays || 7) * 1.5 ? "high" : "medium",
          plantId: plant.id,
          icon: Droplet
        });
      }
    });

    // Add seasonal recommendations
    const currentMonth = new Date().getMonth();
    const isWinter = currentMonth >= 11 || currentMonth <= 1;
    
    if (isWinter) {
      recommendations.push({
        id: "winter-care",
        type: "seasonal",
        category: "care",
        title: "Winter care adjustments",
        description: "Reduce watering frequency by 25-30% during winter months when plants grow slower",
        action: "Adjust schedules",
        priority: "low",
        icon: Sun
      });
    }

    // Add growth optimization recommendations
    recommendations.push({
      id: "growth-optimization",
      type: "optimization",
      category: "growth",
      title: "Optimize plant placement",
      description: "Consider moving plants closer to windows for better light exposure during shorter days",
      action: "Review placement",
      priority: "medium",
      icon: TrendingUp
    });

    return recommendations;
  };

  const recommendations = generateRecommendations();
  const urgentCount = recommendations.filter(r => r.priority === "high").length;
  const categories = ["all", "watering", "feeding", "care", "growth"];

  const filteredRecommendations = selectedCategory === "all" 
    ? recommendations 
    : recommendations.filter(r => r.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-orange-600 bg-orange-100";
      case "low": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Smart Recommendations</h2>
      
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{urgentCount}</div>
                <p className="text-sm text-muted-foreground">Urgent actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{recommendations.length}</div>
                <p className="text-sm text-muted-foreground">Total suggestions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-sm text-muted-foreground">Care score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recommendations in this category</p>
              <p className="text-sm">Great job keeping up with plant care!</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <Card key={rec.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-100 rounded-full p-3">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                          {rec.priority} priority
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                        
                        <Button size="sm" variant="outline">
                          {rec.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* AI Features Coming Soon */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Powered Features Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Machine Learning Care Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Learn from your plant's responses to optimize watering and feeding schedules
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Thermometer className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Environmental Correlation Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Connect sensor data with plant health to provide personalized recommendations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Predictive Plant Health</h4>
                <p className="text-sm text-muted-foreground">
                  Forecast potential issues before they become problems
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">Seasonal Auto-Adjustments</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically adapt care schedules based on weather and seasonal patterns
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartRecommendations;