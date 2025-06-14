import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Wifi, 
  Smartphone,
  TrendingUp,
  Bell,
  Battery
} from "lucide-react";

const IndoorJungleMonitor = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indoor Jungle Monitor</h1>
          <Badge variant="secondary" className="mt-1">Coming Soon</Badge>
        </div>
      </div>

      {/* Hero Section */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <Thermometer className="h-12 w-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Smart Plant Care Monitoring
          </h2>
          <p className="text-center text-green-100">
            Advanced environmental monitoring for optimal plant health
          </p>
        </div>
      </Card>

      {/* Device Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Thermometer className="h-5 w-5 text-blue-600" />
            </div>
            Indoor Jungle Monitor Device
          </CardTitle>
          <CardDescription>
            Professional-grade environmental sensor for indoor plants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-6 mb-4">
            {/* Mock device visual */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-40 bg-white rounded-xl shadow-lg border-2 border-gray-200 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-2">
                    <Thermometer className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-xs font-medium text-gray-600">Indoor Jungle</div>
                  <div className="text-xs text-gray-500">Monitor</div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Battery className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">12 Month Battery</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Wifi className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Bluetooth 5.0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What It Monitors</CardTitle>
          <CardDescription>
            Comprehensive environmental data for your plants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <Thermometer className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="font-medium">Temperature</p>
                <p className="text-sm text-gray-600">±0.1°C accuracy</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Droplets className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="font-medium">Humidity</p>
                <p className="text-sm text-gray-600">±2% accuracy</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <Sun className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="font-medium">Light Level</p>
                <p className="text-sm text-gray-600">Full spectrum</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Wind className="h-8 w-8 text-gray-500 mr-3" />
              <div>
                <p className="font-medium">Air Quality</p>
                <p className="text-sm text-gray-600">VOC detection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Process */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Easy Setup Process</CardTitle>
          <CardDescription>
            Connect your monitor in just 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                1
              </div>
              <div>
                <h4 className="font-medium mb-1">Download & Open App</h4>
                <p className="text-sm text-gray-600">Open Indoor Jungle app and go to Monitor setup</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                2
              </div>
              <div>
                <h4 className="font-medium mb-1">Bluetooth Pairing</h4>
                <p className="text-sm text-gray-600">Hold the button on your monitor until it blinks blue, then tap "Connect" in the app</p>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Smartphone className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-sm">📡 Searching for devices...</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Found: Indoor Jungle Monitor #IJ-2024
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                3
              </div>
              <div>
                <h4 className="font-medium mb-1">Place & Calibrate</h4>
                <p className="text-sm text-gray-600">Position near your plants and let it calibrate for 24 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Features */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Smart Plant Care Features</CardTitle>
          <CardDescription>
            AI-powered recommendations based on your environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Dynamic Watering Schedule</p>
                <p className="text-sm text-gray-600">Adjusts frequency based on humidity and temperature</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Seasonal Adjustments</p>
                <p className="text-sm text-gray-600">Automatically adapts care schedules for seasonal changes</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <Sun className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Light Optimization</p>
                <p className="text-sm text-gray-600">Suggests best plant placement for optimal light exposure</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Be the First to Know</h3>
          <p className="text-gray-600 mb-4">
            Get notified when the Indoor Jungle Monitor launches
          </p>
          <div className="space-y-3">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Join Waitlist
            </Button>
            <Button variant="outline" className="w-full">
              Learn More About Pricing
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Expected launch: Q2 2025 • Pre-order discount available
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndoorJungleMonitor;