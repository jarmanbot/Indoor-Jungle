import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Moon, Info, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <div className="p-4 pb-16">
      <h2 className="text-lg font-medium text-neutral-darkest mb-4">Settings</h2>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Configure how you receive plant care reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-neutral-dark" />
                <Label htmlFor="notifications" className="text-sm">Enable notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between opacity-75">
              <Label htmlFor="email-notifications" className="text-sm">Email notifications</Label>
              <Switch id="email-notifications" disabled />
            </div>
            
            <div className="flex items-center justify-between opacity-75">
              <Label htmlFor="watering-reminders" className="text-sm">Watering reminders</Label>
              <Switch id="watering-reminders" disabled />
            </div>
            
            <div className="flex items-center justify-between opacity-75">
              <Label htmlFor="feeding-reminders" className="text-sm">Feeding reminders</Label>
              <Switch id="feeding-reminders" disabled />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Display</CardTitle>
          <CardDescription>Customize the appearance of the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-5 w-5 text-neutral-dark" />
                <Label htmlFor="dark-mode" className="text-sm">Dark mode</Label>
              </div>
              <Switch
                id="dark-mode"
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
          <CardDescription>Information about the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-neutral-dark" />
              <span className="text-sm">Version 1.0.0</span>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-neutral-dark" />
              <span className="text-sm">Support</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button className="w-full" onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};

export default Settings;
