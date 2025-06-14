import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Trophy, 
  Star, 
  Flame, 
  Droplet, 
  Leaf, 
  Calendar,
  Target,
  Clock,
  CheckCircle,
  Lock
} from "lucide-react";

const Achievements = () => {
  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Add your first plant to the collection",
      icon: Leaf,
      earned: true,
      progress: 100,
      category: "Getting Started",
      points: 10
    },
    {
      id: 2,
      title: "Consistent Caregiver",
      description: "Water plants for 7 days in a row",
      icon: Droplet,
      earned: true,
      progress: 100,
      category: "Care Streak",
      points: 25
    },
    {
      id: 3,
      title: "Plant Parent",
      description: "Successfully care for 5 plants",
      icon: Award,
      earned: false,
      progress: 20,
      category: "Collection",
      points: 50
    },
    {
      id: 4,
      title: "Green Thumb",
      description: "Maintain a 30-day care streak",
      icon: Flame,
      earned: false,
      progress: 23,
      category: "Care Streak",
      points: 100
    },
    {
      id: 5,
      title: "Plant Whisperer",
      description: "Log 100 care activities",
      icon: Star,
      earned: false,
      progress: 45,
      category: "Activity",
      points: 75
    },
    {
      id: 6,
      title: "Season Survivor",
      description: "Keep all plants healthy through a full season",
      icon: Calendar,
      earned: false,
      progress: 0,
      category: "Seasonal",
      points: 150
    }
  ];

  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Achievements</h2>
      
      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{earnedCount}/{totalCount}</div>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{Math.round((earnedCount / totalCount) * 100)}%</span>
            </div>
            <Progress value={(earnedCount / totalCount) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Achievements List */}
      <div className="space-y-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Card key={achievement.id} className={`transition-all ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${achievement.earned ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {achievement.earned ? (
                      <Icon className="h-6 w-6 text-green-600" />
                    ) : achievement.progress > 0 ? (
                      <Icon className="h-6 w-6 text-gray-600" />
                    ) : (
                      <Lock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      {achievement.earned && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {achievement.points} pts
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {achievement.category}
                      </Badge>
                      
                      {!achievement.earned && achievement.progress > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{achievement.progress}%</span>
                          <Progress value={achievement.progress} className="w-16 h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coming Soon Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">More Achievements Coming Soon!</p>
            <ul className="text-sm space-y-1 max-w-sm mx-auto">
              <li>• Seasonal care challenges</li>
              <li>• Plant identification badges</li>
              <li>• Growth milestone rewards</li>
              <li>• Rare plant collector achievements</li>
              <li>• Smart sensor integration badges</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Achievements;