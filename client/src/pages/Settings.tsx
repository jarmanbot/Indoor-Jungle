import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Info, HelpCircle, Palette, Database, Shield, Download, Upload, Clock, ArrowLeft, TestTube, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isAlphaTestingMode, enableAlphaTestingMode, disableAlphaTestingMode, alphaStorage } from "@/lib/alphaTestingMode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Settings = () => {
  const [, setLocation] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [defaultWateringFreq, setDefaultWateringFreq] = useState("7");
  const [defaultFeedingFreq, setDefaultFeedingFreq] = useState("14");
  const [alphaTestingEnabled, setAlphaTestingEnabled] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");

  // Load default frequencies and alpha testing mode from localStorage on mount
  useEffect(() => {
    try {
      const savedWateringFreq = localStorage.getItem('defaultWateringFreq');
      const savedFeedingFreq = localStorage.getItem('defaultFeedingFreq');
      
      if (savedWateringFreq) {
        setDefaultWateringFreq(savedWateringFreq);
      }
      if (savedFeedingFreq) {
        setDefaultFeedingFreq(savedFeedingFreq);
      }
      
      // Check alpha testing mode
      setAlphaTestingEnabled(isAlphaTestingMode());
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);
  const [temperatureUnit, setTemperatureUnit] = useState("celsius");
  const [autoBackup, setAutoBackup] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    try {
      // Save default care frequencies to localStorage
      localStorage.setItem('defaultWateringFreq', defaultWateringFreq);
      localStorage.setItem('defaultFeedingFreq', defaultFeedingFreq);
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
        duration: 1500,
      });
      
      // Navigate back to plants page after 1500ms
      setTimeout(() => {
        setLocation('/');
      }, 1500);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your plant data will be downloaded shortly",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import feature",
      description: "This feature will be available soon",
      variant: "destructive",
    });
  };

  const handleAlphaTestingToggle = (checked: boolean) => {
    if (checked) {
      enableAlphaTestingMode();
      setAlphaTestingEnabled(true);
      toast({
        title: "Alpha testing mode enabled",
        description: "Your data will now be stored locally on this device only",
      });
    } else {
      // Show password dialog to disable alpha mode
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = () => {
    const success = disableAlphaTestingMode(password);
    if (success) {
      setAlphaTestingEnabled(false);
      setShowPasswordDialog(false);
      setPassword("");
      toast({
        title: "Alpha testing mode disabled",
        description: "Your data will now use the server database",
      });
    } else {
      toast({
        title: "Incorrect password",
        description: "Please enter the correct admin password",
        variant: "destructive",
      });
    }
  };

  const handleClearAlphaData = () => {
    alphaStorage.clear();
    toast({
      title: "Local data cleared",
      description: "All alpha testing data has been removed from this device",
    });
  };

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-darkest">Settings</h2>
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>
      
      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive plant care reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm">Enable notifications</Label>
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
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the app's look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm">Dark mode</Label>
              <Switch
                id="dark-mode"
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Temperature Unit</Label>
              <Select value={temperatureUnit} onValueChange={setTemperatureUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Care Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Default Care Frequencies
            </CardTitle>
            <CardDescription>Set default schedules for new plants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Default watering frequency (days)</Label>
              <Input
                type="number"
                value={defaultWateringFreq}
                onChange={(e) => setDefaultWateringFreq(e.target.value)}
                min="1"
                max="30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Default feeding frequency (days)</Label>
              <Input
                type="number"
                value={defaultFeedingFreq}
                onChange={(e) => setDefaultFeedingFreq(e.target.value)}
                min="1"
                max="90"
              />
            </div>
          </CardContent>
        </Card>

        {/* Alpha Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Alpha Testing Mode
            </CardTitle>
            <CardDescription>Store data locally for isolated testing (Password protected)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Alpha Testing Active</Label>
                <p className="text-xs text-muted-foreground">Data isolated on this device - Admin password required to disable</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={alphaTestingEnabled} 
                  onCheckedChange={handleAlphaTestingToggle} 
                />
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            {alphaTestingEnabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    Alpha testing mode is active. All plant data is stored locally on this device only. 
                    Users can't access the shared database without the admin password.
                  </div>
                  <Button 
                    onClick={handleClearAlphaData} 
                    className="w-full" 
                    variant="outline"
                    size="sm"
                  >
                    Clear All Local Data
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Password Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Password Required</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the admin password to disable alpha testing mode and access the shared database:
              </p>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <div className="flex gap-2">
                <Button onClick={handlePasswordSubmit} className="flex-1">
                  Disable Alpha Mode
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setPassword("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Management
            </CardTitle>
            <CardDescription>Export, import, and backup your plant data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Automatic backup</Label>
                <p className="text-xs text-muted-foreground">Daily backup to cloud storage</p>
              </div>
              <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Button onClick={handleExport} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Plant Data
              </Button>
              <Button onClick={handleImport} className="w-full" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Plant Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About Indoor Jungle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="font-medium">Indoor Jungle Monitor v2.0</p>
              <p className="text-muted-foreground">Your comprehensive plant care companion</p>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <h4 className="font-medium">Features</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge variant="outline">Plant Care Tracking</Badge>
                  <Badge variant="outline">Smart Analytics</Badge>
                  <Badge variant="outline">AI Recommendations</Badge>
                  <Badge variant="outline">Plant Identification</Badge>
                  <Badge variant="outline">Bulk Care Tools</Badge>
                  <Badge variant="outline">Achievement System</Badge>
                  <Badge variant="outline">Web3 Gaming</Badge>
                  <Badge variant="outline">Sensor Integration</Badge>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center gap-2 text-sm">
                <HelpCircle className="h-4 w-4" />
                <span>Need help? Check our documentation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button onClick={handleSave} className="w-full">
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;