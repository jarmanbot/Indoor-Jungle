import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Sprout, Calendar, BarChart3, Camera, Bell } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="mb-6">
              <Leaf className="h-16 w-16 mx-auto mb-4 text-green-200" />
              <h1 className="text-4xl sm:text-6xl font-bold mb-6">
                Indoor Jungle
              </h1>
              <p className="text-xl sm:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
                Your complete plant care companion. Track, nurture, and grow your plant collection with ease.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-green-50 font-semibold px-8 py-3"
                onClick={() => window.location.href = "/home"}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to care for your plants
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From watering schedules to growth tracking, Indoor Jungle helps you become the plant parent you've always wanted to be.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Sprout className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Plant Management</CardTitle>
              <CardDescription>
                Keep detailed records of all your plants with photos, care notes, and growth tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Care Schedules</CardTitle>
              <CardDescription>
                Never forget to water or feed your plants with customizable care schedules and reminders.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Growth Analytics</CardTitle>
              <CardDescription>
                Track your plants' health and growth over time with detailed analytics and insights.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Camera className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Photo Timeline</CardTitle>
              <CardDescription>
                Document your plants' journey with photos and create beautiful growth timelines.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Smart Reminders</CardTitle>
              <CardDescription>
                Get timely notifications for watering, feeding, and other care activities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Leaf className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Plant Database</CardTitle>
              <CardDescription>
                Access care guides and information for thousands of plant species.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your plant care?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of plant parents who've already improved their plant care with Indoor Jungle.
          </p>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
          >
            Start Your Plant Journey
          </Button>
        </div>
      </div>
    </div>
  );
}