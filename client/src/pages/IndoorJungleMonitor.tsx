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

      {/* Device Mockup */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="flex justify-center">
            <div className="relative">
              {/* Device SVG Mockup */}
              <svg width="200" height="280" viewBox="0 0 200 280" className="drop-shadow-2xl">
                {/* Device Body */}
                <rect x="20" y="20" width="160" height="240" rx="20" ry="20" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
                
                {/* Screen */}
                <rect x="35" y="35" width="130" height="80" rx="8" ry="8" fill="#1f2937"/>
                
                {/* Screen Content */}
                <text x="100" y="55" textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="Arial, sans-serif">Indoor Jungle</text>
                <text x="100" y="75" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="Arial, sans-serif">Monitor v2.0</text>
                <circle cx="45" cy="95" r="3" fill="#10b981"/>
                <text x="55" y="99" fill="#e5e7eb" fontSize="8" fontFamily="Arial, sans-serif">Connected</text>
                <text x="120" y="99" fill="#e5e7eb" fontSize="8" fontFamily="Arial, sans-serif">22°C 65%</text>
                
                {/* Sensors */}
                <circle cx="100" cy="140" r="15" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1"/>
                <circle cx="100" cy="140" r="8" fill="#3b82f6"/>
                <text x="100" y="165" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="Arial, sans-serif">TEMP/HUMID</text>
                
                {/* Light Sensor */}
                <rect x="85" y="180" width="30" height="15" rx="7" ry="7" fill="#fbbf24"/>
                <text x="100" y="205" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="Arial, sans-serif">LIGHT</text>
                
                {/* Air Quality Sensor */}
                <rect x="85" y="220" width="30" height="10" rx="5" ry="5" fill="#8b5cf6"/>
                <text x="100" y="240" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="Arial, sans-serif">AIR QUALITY</text>
                
                {/* Status LED */}
                <circle cx="165" cy="35" r="4" fill="#10b981" className="animate-pulse"/>
                
                {/* Bluetooth Icon */}
                <path d="M 150 250 L 155 245 L 150 240 L 155 235 L 150 230 M 150 240 L 145 235 M 150 240 L 145 245" 
                      stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
                
                {/* Battery Indicator */}
                <rect x="160" y="250" width="15" height="8" rx="1" ry="1" fill="none" stroke="#6b7280" strokeWidth="1"/>
                <rect x="175" y="252" width="2" height="4" fill="#6b7280"/>
                <rect x="162" y="252" width="11" height="4" fill="#10b981"/>
              </svg>
              
              {/* Floating Sensor Data */}
              <div className="absolute -right-16 top-8 bg-white rounded-lg shadow-lg p-3 text-xs animate-pulse">
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>24.5°C</span>
                </div>
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>68% RH</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span>850 lux</span>
                </div>
              </div>
              
              <div className="absolute -left-16 bottom-16 bg-white rounded-lg shadow-lg p-3 text-xs animate-pulse">
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Good Air</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>98% Battery</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Indoor Jungle Monitor</h3>
            <p className="text-sm text-gray-600">Professional environmental monitoring for optimal plant health</p>
            <div className="flex justify-center items-center mt-3 space-x-4">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">12-month battery</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Bluetooth 5.0</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">IP65 rated</span>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium text-center">
                Connect up to 10 sensors per app
              </p>
              <p className="text-xs text-green-600 text-center mt-1">
                Place one in each room for precise, location-specific data that links directly to your plants
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <p className="text-sm text-gray-600">Hold the button on your monitor until it blinks blue, then tap Connect in the app</p>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Smartphone className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-sm">Searching for devices...</span>
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
            
            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
              <Wifi className="h-6 w-6 text-orange-600 mr-3" />
              <div>
                <p className="font-medium">Multi-Room Monitoring</p>
                <p className="text-sm text-gray-600">Connect up to 10 sensors across different rooms for location-specific plant care</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-Sensor Benefits */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Room-Specific Plant Care</CardTitle>
          <CardDescription>
            Each sensor provides targeted environmental data for plants in that specific location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Living Room Sensor</h4>
              <p className="text-sm text-blue-700 mb-2">Tracks conditions for your fiddle leaf fig and monstera</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="bg-white px-2 py-1 rounded">23°C</span>
                <span className="bg-white px-2 py-1 rounded">62% RH</span>
                <span className="bg-white px-2 py-1 rounded">750 lux</span>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Kitchen Sensor</h4>
              <p className="text-sm text-green-700 mb-2">Monitors humidity for your herb garden and succulents</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="bg-white px-2 py-1 rounded">25°C</span>
                <span className="bg-white px-2 py-1 rounded">58% RH</span>
                <span className="bg-white px-2 py-1 rounded">920 lux</span>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Bedroom Sensor</h4>
              <p className="text-sm text-purple-700 mb-2">Optimizes air quality and light for your snake plants</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="bg-white px-2 py-1 rounded">21°C</span>
                <span className="bg-white px-2 py-1 rounded">65% RH</span>
                <span className="bg-white px-2 py-1 rounded">320 lux</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-700">
              Each plant automatically receives care recommendations based on its room's specific environmental conditions
            </p>
          </div>
        </CardContent>
      </Card>

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