import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  Search, 
  Leaf, 
  Clock,
  Sparkles,
  BookOpen,
  Target
} from "lucide-react";

const PlantIdentification = () => {
  const [isIdentifying, setIsIdentifying] = useState(false);

  const handlePhotoUpload = () => {
    setIsIdentifying(true);
    // Simulate identification process
    setTimeout(() => {
      setIsIdentifying(false);
    }, 3000);
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-neutral-darkest mb-6">Plant Identification</h2>
      
      {/* Main Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Identify Your Plant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Camera className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Take or Upload a Photo</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Get instant plant identification and care recommendations using AI-powered plant recognition
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handlePhotoUpload}
                disabled={isIdentifying}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {isIdentifying ? "Identifying..." : "Take Photo"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePhotoUpload}
                disabled={isIdentifying}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            What You'll Get
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Accurate Identification</h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered recognition with 95%+ accuracy rate
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <BookOpen className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Care Guidelines</h4>
                <p className="text-sm text-muted-foreground">
                  Personalized watering, lighting, and feeding schedules
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-full p-2">
                <Leaf className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Plant Information</h4>
                <p className="text-sm text-muted-foreground">
                  Scientific name, origin, and growth characteristics
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">Seasonal Advice</h4>
                <p className="text-sm text-muted-foreground">
                  Care adjustments for different seasons and conditions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Identifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Identifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent identifications</p>
            <p className="text-sm">Your identification history will appear here</p>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">v2.0</Badge>
              <span className="text-sm">Disease and pest identification</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">v2.1</Badge>
              <span className="text-sm">Plant health scoring from photos</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">v2.2</Badge>
              <span className="text-sm">Growth stage tracking and predictions</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">v2.3</Badge>
              <span className="text-sm">Bulk plant identification for collections</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantIdentification;