import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Moon, Info, HelpCircle, Database, Shield, Download, Upload, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { localStorage as localData, exportUserData, importUserData, cleanupLocalData, getStorageUsage } from "@/lib/localDataStorage";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Settings = () => {
  const [, setLocation] = useLocation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [defaultWateringFreq, setDefaultWateringFreq] = useState("7");
  const [defaultFeedingFreq, setDefaultFeedingFreq] = useState("14");
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [clearDataPassword, setClearDataPassword] = useState("");
  const [showDemoPlantDialog, setShowDemoPlantDialog] = useState(false);
  const [demoPlantEnabled, setDemoPlantEnabled] = useState(true);
  const [temperatureUnit, setTemperatureUnit] = useState("celsius");
  const [autoBackup, setAutoBackup] = useState(true);
  const { toast } = useToast();

  // Load default frequencies and check demo plant status on mount
  useEffect(() => {
    try {
      const savedWateringFreq = window.localStorage.getItem('defaultWateringFreq');
      const savedFeedingFreq = window.localStorage.getItem('defaultFeedingFreq');
      const savedDarkMode = window.localStorage.getItem('darkMode');
      
      if (savedWateringFreq) {
        setDefaultWateringFreq(savedWateringFreq);
      }
      if (savedFeedingFreq) {
        setDefaultFeedingFreq(savedFeedingFreq);
      }
      if (savedDarkMode) {
        setDarkModeEnabled(savedDarkMode === 'true');
        // Apply dark mode class to document
        if (savedDarkMode === 'true') {
          document.documentElement.classList.add('dark');
        }
      }
      
      // Check if demo plant exists in Firebase
      fetch('/api/demo-plant/status')
        .then(res => res.json())
        .then(data => setDemoPlantEnabled(data.enabled))
        .catch(err => {
          console.error('Failed to check demo plant status:', err);
          // Fallback to local storage check
          const plants = localData.get('plants') || [];
          const hasDemo = plants.some((plant: any) => 
            plant.babyName === 'Demo Plant' && 
            plant.notes?.includes('This is your demo plant to explore the app!')
          );
          setDemoPlantEnabled(hasDemo);
        });
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const handleSave = () => {
    try {
      // Save default care frequencies to localStorage
      window.localStorage.setItem('defaultWateringFreq', defaultWateringFreq);
      window.localStorage.setItem('defaultFeedingFreq', defaultFeedingFreq);
      window.localStorage.setItem('darkMode', darkModeEnabled.toString());
      
      // Apply dark mode immediately
      if (darkModeEnabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
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

  const handleExport = async () => {
    try {
      // Export Firebase data instead of localStorage
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'X-User-ID': 'dev-user'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      const result = await response.json();
      
      // Download the backup file
      const downloadUrl = result.downloadUrl;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Firebase Export Successful",
        description: `Data exported successfully (${result.totalPlants} plants)`,
      });
    } catch (error: any) {
      console.error("Failed to export Firebase data:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export your Firebase data",
        variant: "destructive"
      });
    }
  };

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file?.name, 'Type:', file?.type, 'Size:', file?.size);
    
    if (file) {
      // More flexible validation - check if filename contains expected pattern or is a JSON-like file
      const isLikelyPlantData = file.name.includes('plant-data-backup') || 
                               file.name.endsWith('.json') || 
                               file.type === 'application/json' ||
                               file.type === 'text/plain' ||
                               file.type === '';
      
      if (!isLikelyPlantData) {
        const proceed = confirm(`The selected file "${file.name}" doesn't appear to be a plant data backup file. Do you want to try importing it anyway?`);
        if (!proceed) {
          return;
        }
      }
      
      handleImport(file);
    } else {
      console.log('No file selected');
    }
  };

  const handleImport = async (file: File) => {
    try {
      console.log('Starting import process for file:', file.name);
      
      // Read the file as text
      const text = await file.text();
      const data = JSON.parse(text);
      
      console.log('Import data:', data);
      
      // Send the data to Firebase import endpoint
      const response = await fetch('/api/backup/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': 'dev-user'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import failed');
      }
      
      const result = await response.json();
      
      toast({
        title: "Firebase Import Successful",
        description: `Imported ${result.totalPlants} plants successfully`,
      });
      
      // Refresh the page to show updated data
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      
      // Force a page refresh to ensure all components reload with new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import Firebase data",
        variant: "destructive",
      });
    }
  };

  const handleCleanupData = () => {
    cleanupLocalData();
    toast({
      title: "Data cleanup completed",
      description: "Removed orphaned logs and unnecessary data",
    });
  };

  const handleClearAllData = () => {
    // Show password dialog for clearing data
    setShowClearDataDialog(true);
  };

  const handleClearDataPasswordSubmit = () => {
    const adminPassword = 'digipl@nts'; // Keep same admin password for data protection
    if (clearDataPassword === adminPassword) {
      localData.clear();
      setShowClearDataDialog(false);
      setClearDataPassword("");
      toast({
        title: "All data cleared",
        description: "All plant data has been removed from this device",
      });
      // Enhanced cache management for immediate UI update
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.removeQueries();
      queryClient.refetchQueries({ queryKey: ['/api/plants'] });
    } else {
      toast({
        title: "Incorrect password",
        description: "Please enter the correct admin password to clear data",
        variant: "destructive",
      });
    }
  };

  const handleDemoPlantToggle = async () => {
    try {
      const response = await fetch('/api/demo-plant/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !demoPlantEnabled }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle demo plant');
      }
      
      const result = await response.json();
      setDemoPlantEnabled(!demoPlantEnabled);
      
      toast({
        title: !demoPlantEnabled ? "Demo plant added" : "Demo plant removed",
        description: result.message,
      });
      
      // Clear cache to refresh plant list immediately
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/plants/local'] });
    } catch (error) {
      console.error("Failed to toggle demo plant:", error);
      toast({
        title: "Error",
        description: "Failed to update demo plant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addDemoPlant = async () => {
    setShowDemoPlantDialog(false);
    await handleDemoPlantToggle();
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
        {/* 1. Demo Plant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Demo Plant
            </CardTitle>
            <CardDescription>Explore the app with a sample plant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Demo Plant</Label>
                <p className="text-xs text-muted-foreground">
                  Display demo plant as plant #1 for exploring the app features
                </p>
              </div>
              <Switch 
                checked={demoPlantEnabled} 
                onCheckedChange={handleDemoPlantToggle} 
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Default Care Frequencies */}
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

        {/* 3. Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Management
            </CardTitle>
            <CardDescription>Backup, export, and import your plant data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-4">
                Your plant data is stored locally on this device. Regular backups are recommended.
              </div>
              
              {/* Storage Usage Display */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage Usage</span>
                  <span className="font-medium">
                    {(() => {
                      const usage = getStorageUsage();
                      return `${(usage.used / 1024 / 1024).toFixed(1)}MB / ${(usage.total / 1024 / 1024).toFixed(0)}MB`;
                    })()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      (() => {
                        const usage = getStorageUsage();
                        if (usage.percentage > 90) return 'bg-red-500';
                        if (usage.percentage > 70) return 'bg-yellow-500';
                        return 'bg-green-500';
                      })()
                    }`}
                    style={{ 
                      width: `${Math.min(getStorageUsage().percentage, 100)}%` 
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {getStorageUsage().percentage.toFixed(1)}% used
                  {getStorageUsage().percentage > 80 && (
                    <span className="text-amber-600 ml-2">
                      • Storage nearly full - consider exporting data and removing images
                    </span>
                  )}
                </div>
              </div>
              
              <Button onClick={handleExport} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Firebase Data
              </Button>
              
              <Button 
                onClick={() => {
                  const exportData = sessionStorage.getItem('plantDataExport');
                  const filename = sessionStorage.getItem('plantDataExportFilename');
                  if (exportData && filename) {
                    navigator.clipboard.writeText(exportData).then(() => {
                      toast({
                        title: "Export data copied",
                        description: `Data copied to clipboard. Save as ${filename}`,
                      });
                    }).catch(() => {
                      // Fallback: show in alert
                      const userConfirmed = confirm(`Copy this data and save as ${filename}:\n\nClick OK to see the data.`);
                      if (userConfirmed) {
                        alert(exportData);
                      }
                    });
                  } else {
                    toast({
                      title: "No export data",
                      description: "Please export data first",
                      variant: "destructive",
                    });
                  }
                }}
                className="w-full" 
                variant="outline"
                size="sm"
              >
                Copy Last Export Data
              </Button>
              
              <div className="text-xs text-muted-foreground mt-2 space-y-2">
                <div>
                  <p><strong>Import Instructions:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Click "Import Plant Data" above</li>
                    <li>Navigate to your Downloads folder</li>
                    <li>Look for a file named like "plant-data-backup-2025-07-14.json"</li>
                    <li>If the file appears greyed out, try changing the file type filter to "All Files (*.*)"</li>
                    <li>Select the file and click "Open"</li>
                  </ol>
                </div>
                
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                    <strong>File appears greyed out?</strong> This can happen due to browser security. 
                    Try: 1) Look for "All Files" or "*.*" option in file picker, 2) Use "Copy Last Export Data" button instead, 
                    or 3) Rename your file to have a .txt extension and try again.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <input
                  type="file"
                  accept="*/*"
                  onChange={handleImportFileSelect}
                  style={{ display: 'none' }}
                  id="import-input"
                  key={Math.random()} // Force re-render to clear previous selections
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById('import-input') as HTMLInputElement;
                    if (input) {
                      input.value = ''; // Clear previous selection
                      input.click();
                    }
                  }}
                  className="w-full" 
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Firebase Data (Select Any File)
                </Button>
              </div>
              
              <Button onClick={handleCleanupData} className="w-full" variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Cleanup Orphaned Data
              </Button>
              
              <Separator />
              
              <Button 
                onClick={handleClearAllData} 
                className="w-full" 
                variant="destructive"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Clear All Data (Password Protected)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 4. Notifications */}
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

        {/* 5. Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
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
          </CardContent>
        </Card>

        {/* 5. About Indoor Jungle */}
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

      {/* Clear Data Password Dialog */}
      <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Password Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the admin password to permanently clear all plant data from this device:
            </p>
            <p className="text-sm font-medium text-destructive">
              ⚠️ This action cannot be undone. All plants and care history will be lost.
            </p>
            <Input
              type="password"
              placeholder="Enter admin password"
              value={clearDataPassword}
              onChange={(e) => setClearDataPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClearDataPasswordSubmit()}
            />
            <div className="flex gap-2">
              <Button onClick={handleClearDataPasswordSubmit} variant="destructive" className="flex-1">
                Clear All Data
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowClearDataDialog(false);
                  setClearDataPassword("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demo Plant Warning Dialog */}
      <Dialog open={showDemoPlantDialog} onOpenChange={setShowDemoPlantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Plant #1?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You currently have a plant using #1. Adding the demo plant will permanently delete your plant #1 and all its care history. This cannot be undone.
            </p>
            <p className="text-sm font-medium text-destructive">
              Are you sure you want to replace your plant with the demo plant?
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={addDemoPlant} 
                variant="destructive"
                className="flex-1"
              >
                Yes, Replace Plant #1
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDemoPlantDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;