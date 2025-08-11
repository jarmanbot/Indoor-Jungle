import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Shield,
  HardDrive,
  Smartphone,
  Settings,
  Timer,
  Wifi,
  WifiOff,
  Download,
  Upload,
  FileText,
  Clock,
  Zap,
  Database
} from "lucide-react";
import { localStorage as localData } from "@/lib/localDataStorage";

export function UniversalGoogleDriveSync() {
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'uploading' | 'downloading' | 'complete' | 'auto-pending'>('idle');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [nextSyncTime, setNextSyncTime] = useState<string | null>(null);
  const [autoBackupPending, setAutoBackupPending] = useState(false);
  const { toast } = useToast();

  // Smart backup management settings
  const MAX_BACKUP_FILES = 5; // Keep only the last 5 backups

  // Get local data counts
  const localPlants = localData.get('plants') || [];
  const wateringLogs = localData.get('wateringLogs') || [];
  const feedingLogs = localData.get('feedingLogs') || [];
  const repottingLogs = localData.get('repottingLogs') || [];
  const soilTopUpLogs = localData.get('soilTopUpLogs') || [];
  const pruningLogs = localData.get('pruningLogs') || [];
  const localLogs = [...wateringLogs, ...feedingLogs, ...repottingLogs, ...soilTopUpLogs, ...pruningLogs];

  // Load saved settings
  useEffect(() => {
    const savedAutoBackup = localStorage.getItem('autoBackupEnabled') === 'true';
    const savedLastSync = localStorage.getItem('lastSyncTime');
    
    setAutoBackupEnabled(savedAutoBackup);
    setLastSyncTime(savedLastSync);

    // Calculate next sync time (every 4 hours)
    if (savedLastSync) {
      const lastSync = new Date(savedLastSync);
      const nextSync = new Date(lastSync.getTime() + (4 * 60 * 60 * 1000));
      setNextSyncTime(nextSync.toLocaleString());
    }
  }, []);

  // Create backup data
  const createBackupData = () => {
    return {
      plants: localPlants,
      logs: {
        watering: wateringLogs,
        feeding: feedingLogs,
        repotting: repottingLogs,
        soilTopUp: soilTopUpLogs,
        pruning: pruningLogs,
      },
      customLocations: localData.get('customLocations') || [],
      exportDate: new Date().toISOString(),
      version: '1.0',
      autoBackup: true,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };
  };

  // Helper function to trigger download with forced user interaction
  const downloadFile = (blob: Blob, filename: string) => {
    console.log('Starting download for:', filename, 'Size:', blob.size, 'bytes');
    
    // Create the backup data as text for data URI method
    const reader = new FileReader();
    reader.onload = () => {
      const dataText = reader.result as string;
      
      try {
        // Try File System Access API first (Chrome/Edge with HTTPS)
        if ('showSaveFilePicker' in window && window.location.protocol === 'https:') {
          console.log('Using File System Access API for Save As dialog');
          (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'JSON backup files',
              accept: { 'application/json': ['.json'] },
            }],
          }).then((fileHandle: any) => {
            console.log('File handle obtained, creating writable stream');
            return fileHandle.createWritable();
          }).then((writable: any) => {
            console.log('Writing data to file');
            return writable.write(dataText).then(() => writable);
          }).then((writable: any) => {
            console.log('Closing file');
            return writable.close();
          }).then(() => {
            console.log('Backup saved successfully via File System Access API');
            toast({
              title: "Backup Saved",
              description: `Your backup has been saved to your chosen location!`,
            });
          }).catch((error: any) => {
            console.log('File System Access API error:', error.name, error.message);
            if (error.name === 'AbortError') {
              console.log('User cancelled the save dialog');
              return;
            }
            console.log('Falling back to data URI download');
            dataUriDownload(dataText, filename);
          });
        } else {
          console.log('Using simple download method');
          simpleDownload(dataText, filename);
        }
      } catch (error) {
        console.error('Download function error:', error);
        dataUriDownload(dataText, filename);
      }
    };
    
    reader.readAsText(blob);
  };

  // Simple, reliable download method
  const simpleDownload = (dataText: string, filename: string) => {
    console.log('Using simple download method - creating user-clickable button');
    
    // Create a data URI
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataText);
    
    // Remove any existing download buttons
    const existingButtons = document.querySelectorAll('[data-backup-download]');
    existingButtons.forEach(btn => btn.remove());
    
    // Create prominent download button
    const downloadButton = document.createElement('div');
    downloadButton.setAttribute('data-backup-download', 'true');
    downloadButton.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 20000;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 24px 32px;
      border-radius: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      border: 3px solid #065f46;
      transition: all 0.3s ease;
      max-width: 400px;
    `;
    
    downloadButton.innerHTML = `
      <div style="margin-bottom: 8px; font-size: 24px;">📥</div>
      <div style="margin-bottom: 4px;">Click to Download Backup</div>
      <div style="font-size: 14px; opacity: 0.9;">${filename}</div>
      <div style="font-size: 12px; opacity: 0.7; margin-top: 8px;">2.6MB JSON File</div>
    `;
    
    // Add hover effect
    downloadButton.addEventListener('mouseenter', () => {
      downloadButton.style.transform = 'translate(-50%, -50%) scale(1.05)';
      downloadButton.style.boxShadow = '0 25px 50px rgba(0,0,0,0.4)';
    });
    
    downloadButton.addEventListener('mouseleave', () => {
      downloadButton.style.transform = 'translate(-50%, -50%) scale(1)';
      downloadButton.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
    });
    
    // Handle click - create and trigger download
    downloadButton.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Remove button after download
      downloadButton.remove();
      
      console.log('Simple download triggered');
      toast({
        title: "Download Started",
        description: `${filename} should download to your Downloads folder now.`,
      });
    });
    
    // Add to document
    document.body.appendChild(downloadButton);
    
    // Auto-remove after 60 seconds
    setTimeout(() => {
      if (document.body.contains(downloadButton)) {
        downloadButton.remove();
      }
    }, 60000);
    
    toast({
      title: "Download Ready",
      description: "Click the large green button in the center to download your backup file.",
      duration: 8000,
    });
  };

  // Server-side download method - most reliable
  const serverSideDownload = async (dataText: string, filename: string) => {
    console.log('Using server-side download method');
    
    try {
      const response = await fetch('/api/backup/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dataText,
          filename: filename
        })
      });
      
      if (!response.ok) {
        throw new Error('Server download failed');
      }
      
      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Server-side download completed');
      toast({
        title: "Backup Downloaded",
        description: `${filename} has been downloaded via server. Check your Downloads folder.`,
      });
      
    } catch (error) {
      console.error('Server-side download failed:', error);
      // Fallback to data URI method
      dataUriDownload(dataText, filename);
    }
  };

  // Data URI download method using the proven legacy approach
  const dataUriDownload = (dataText: string, filename: string) => {
    console.log('Using proven legacy download method');
    
    try {
      // Create data URL
      const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataText);
      
      // Create download link (same as legacy code)
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Force user interaction with MouseEvent (same as legacy)
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      
      link.dispatchEvent(clickEvent);
      console.log('Triggered download with MouseEvent');
      
      // Add immediate success feedback for the MouseEvent attempt
      setTimeout(() => {
        toast({
          title: "Download Triggered",
          description: `Check Downloads folder for: ${filename} (2.6MB file). If not found, a backup window will open.`,
          duration: 5000,
        });
      }, 500);
      
      // Fallback: open in new window (same as legacy)
      setTimeout(() => {
        const newWindow = window.open(dataUrl, '_blank');
        if (newWindow) {
          // Add instructions to the new window
          setTimeout(() => {
            try {
              newWindow.document.body.innerHTML = `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                  <h2>Indoor Jungle Backup</h2>
                  <p>Your plant backup is ready for download. If the download didn't start automatically:</p>
                  <ol>
                    <li>Right-click on this page</li>
                    <li>Select "Save As..." or "Save Page As..."</li>
                    <li>Save the file as: <strong>${filename}</strong></li>
                  </ol>
                  <p><strong>Or copy the data below and save it manually:</strong></p>
                  <textarea style="width: 100%; height: 300px; font-family: monospace; font-size: 12px;" readonly>${dataText}</textarea>
                  <br><br>
                  <button onclick="window.close();" style="padding: 10px 20px; background: #22c55e; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
              `;
            } catch (e) {
              console.log('Could not modify new window content');
            }
          }, 500);
          console.log('Opened backup data in new window for manual saving');
          
          toast({
            title: "Backup Window Opened",
            description: "A new window opened with your backup. Save it manually if download didn't start.",
            duration: 8000,
          });
        } else {
          console.error('Could not open new window - popup blocked');
          
          // Alternative: Copy to clipboard since popup is blocked
          try {
            navigator.clipboard.writeText(dataText).then(() => {
              toast({
                title: "Download Attempted + Clipboard Backup",
                description: "Download triggered via MouseEvent. If file didn't download, backup data is now in clipboard - paste into text file and save as .json",
                duration: 10000,
              });
            });
          } catch (clipboardError) {
            toast({
              title: "Download Attempted",
              description: `Download triggered via MouseEvent. Check Downloads folder for: ${filename}`,
              duration: 8000,
            });
          }
        }
        
        // Clean up
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
      
      console.log('Plant data exported successfully using legacy method');
      
    } catch (error) {
      console.error('Legacy download method failed:', error);
      
      // Final fallback - copy to clipboard
      try {
        navigator.clipboard.writeText(dataText).then(() => {
          toast({
            title: "Backup Copied to Clipboard",
            description: "Download failed, but your backup data is now in your clipboard. Paste it into a text file and save as .json",
            duration: 15000,
          });
        });
      } catch (clipboardError) {
        toast({
          title: "Download Failed",
          description: "Unable to download or copy backup. Please check browser settings.",
          variant: "destructive"
        });
      }
    }
  };

  // Fallback download method for browsers without File System Access API
  const fallbackDownload = (blob: Blob, filename: string) => {
    console.log('Using fallback download method');
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      console.log('Created download link with URL:', url);
      
      // Ensure link is added to document and clicked with user interaction
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Force click with timeout to ensure it works
      setTimeout(() => {
        console.log('Triggering download click');
        link.click();
        
        // Cleanup after delay
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(url);
          console.log('Download cleanup completed');
        }, 1000);
      }, 100);
      
      console.log('Plant data exported successfully via fallback method');
      
      // Also create a visible backup option in case download is missed
      createBackupPreviewLink(blob, filename);
      
      toast({
        title: "Backup Downloaded",
        description: `${filename} should be in your Downloads folder. If not found, check the backup preview link that appeared.`,
        duration: 10000,
      });
      
    } catch (error) {
      console.error('Fallback download failed:', error);
      
      // Last resort: offer to copy data to clipboard
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const textData = reader.result as string;
          navigator.clipboard.writeText(textData).then(() => {
            toast({
              title: "Backup Copied to Clipboard",
              description: "Download failed, but backup data is now in your clipboard. Paste it into a text file and save as .json",
            });
          }).catch(() => {
            toast({
              title: "Download Failed",
              description: "Could not download or copy backup. Please check browser settings and try again.",
              variant: "destructive"
            });
          });
        };
        reader.readAsText(blob);
      } catch (clipboardError) {
        toast({
          title: "Download Failed",
          description: "Could not download backup file. Please check browser settings and allow downloads.",
          variant: "destructive"
        });
      }
    }
  };

  // Create a visible backup preview/download link as fallback
  const createBackupPreviewLink = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    
    // Create floating download link
    const linkDiv = document.createElement('div');
    linkDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background: #1f2937;
      border: 2px solid #22c55e;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-family: system-ui, -apple-system, sans-serif;
      color: white;
      max-width: 300px;
    `;
    
    linkDiv.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: 600; color: #22c55e;">
        📁 Backup Ready
      </div>
      <div style="margin-bottom: 12px; font-size: 14px; color: #d1d5db;">
        If download didn't start, use this link:
      </div>
      <a href="${url}" download="${filename}" style="
        display: inline-block;
        background: #22c55e;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 8px;
      ">📥 Download ${filename}</a>
      <div style="text-align: right;">
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          border: 1px solid #6b7280;
          color: #9ca3af;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Close</button>
      </div>
    `;
    
    document.body.appendChild(linkDiv);
    
    // Auto-remove after 2 minutes
    setTimeout(() => {
      if (document.body.contains(linkDiv)) {
        document.body.removeChild(linkDiv);
        URL.revokeObjectURL(url);
      }
    }, 120000);
  };

  // Backup file management functions
  const getBackupFileList = () => {
    const backupFiles = JSON.parse(localStorage.getItem('backupFileHistory') || '[]');
    return backupFiles.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const addToBackupHistory = (filename: string) => {
    const backupFiles = getBackupFileList();
    const newBackup = {
      filename,
      timestamp: new Date().toISOString(),
      size: JSON.stringify(createBackupData()).length
    };
    
    // Add new backup and keep only the last MAX_BACKUP_FILES
    const updatedFiles = [newBackup, ...backupFiles].slice(0, MAX_BACKUP_FILES);
    localStorage.setItem('backupFileHistory', JSON.stringify(updatedFiles));
    
    // Clean up old backup files notification
    const removedFiles = backupFiles.slice(MAX_BACKUP_FILES - 1);
    if (removedFiles.length > 0) {
      console.log(`Smart cleanup: Tracking ${MAX_BACKUP_FILES} most recent backup files`);
    }
  };

  const cleanupOrphanedData = () => {
    try {
      // Get all plants
      const plants = localData.get('plants') || [];
      const plantIds = plants.map((plant: any) => plant.id);

      // Clean up logs that reference non-existent plants
      const logTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
      let cleanedCount = 0;

      logTypes.forEach(logType => {
        const logs = localData.get(logType) || [];
        const cleanLogs = logs.filter((log: any) => plantIds.includes(log.plantId));
        
        if (cleanLogs.length !== logs.length) {
          const removed = logs.length - cleanLogs.length;
          cleanedCount += removed;
          localData.set(logType, cleanLogs);
        }
      });

      if (cleanedCount > 0) {
        toast({
          title: "Cleanup Complete",
          description: `Removed ${cleanedCount} orphaned care log${cleanedCount !== 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "No Cleanup Needed",
          description: "All care logs are properly linked to existing plants.",
        });
      }
    } catch (error) {
      toast({
        title: "Cleanup Failed",
        description: "There was an error cleaning up orphaned data.",
        variant: "destructive"
      });
    }
  };

  const clearAllData = () => {
    const adminPassword = "digipl@nts";
    const userPassword = prompt("Enter admin password to clear all data:");
    
    if (userPassword === adminPassword) {
      if (confirm("Are you absolutely sure? This will delete ALL plants, care logs, and settings. This cannot be undone!")) {
        try {
          localData.clear();
          localStorage.removeItem('autoBackupEnabled');
          localStorage.removeItem('googleDriveUnlimited');
          localStorage.removeItem('lastSyncTime');
          localStorage.removeItem('backupFileHistory');
          
          toast({
            title: "All Data Cleared",
            description: "All plants, care logs, and settings have been deleted.",
          });
          
          setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
          toast({
            title: "Clear Failed",
            description: "There was an error clearing the data.",
            variant: "destructive"
          });
        }
      }
    } else if (userPassword !== null) {
      toast({
        title: "Access Denied",
        description: "Incorrect admin password.",
        variant: "destructive"
      });
    }
  };

  // Auto backup - creates downloadable backup file when changes detected
  const performAutoBackup = () => {
    try {
      setSyncStatus('auto-pending');
      setSyncProgress(20);

      const exportData = createBackupData();
      setSyncProgress(60);

      const jsonString = JSON.stringify(exportData, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `indoor-jungle-auto-backup-${timestamp}.json`;
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      downloadFile(blob, filename);
      
      // Track this backup file
      addToBackupHistory(filename);

      setSyncProgress(100);
      setSyncStatus('complete');

      const now = new Date();
      setLastSyncTime(now.toLocaleString());
      localStorage.setItem('lastSyncTime', now.toISOString());

      // Calculate next sync time
      const nextSync = new Date(now.getTime() + (4 * 60 * 60 * 1000));
      setNextSyncTime(nextSync.toLocaleString());

      toast({
        title: "Auto Backup Created",
        description: `Backup file created with ${localPlants.length} plants. Check your downloads folder.`,
      });

      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error) {
      console.error('Auto backup failed:', error);
      setSyncStatus('idle');
      toast({
        title: "Auto Backup Failed",
        description: "Could not create backup file. Please try manual backup.",
        variant: "destructive",
      });
    }
  };

  // Manual backup
  const createManualBackup = () => {
    try {
      setSyncStatus('uploading');
      setSyncProgress(20);

      const exportData = createBackupData();
      setSyncProgress(60);

      const jsonString = JSON.stringify(exportData, null, 2);
      const date = new Date().toISOString().split('T')[0];
      const filename = `indoor-jungle-backup-${date}.json`;
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      downloadFile(blob, filename);
      
      // Track this backup file
      addToBackupHistory(filename);

      setSyncProgress(100);
      setSyncStatus('complete');

      toast({
        title: "Backup Created",
        description: `Backup created with ${localPlants.length} plants. Tracking last ${MAX_BACKUP_FILES} backups.`,
      });

      setTimeout(() => setSyncStatus('idle'), 2000);

    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Could not create backup file",
        variant: "destructive",
      });
      setSyncStatus('idle');
    }
  };

  // Restore from backup
  const restoreFromBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json,text/json';
    input.multiple = false;
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
        toast({
          title: "Wrong File Type",
          description: "Please select a JSON backup file (.json extension)",
          variant: "destructive",
        });
        return;
      }

      setSyncStatus('downloading');
      setSyncProgress(20);

      const reader = new FileReader();
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Could not read the selected file",
          variant: "destructive",
        });
        setSyncStatus('idle');
      };

      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          if (!fileContent) {
            throw new Error('File is empty');
          }

          const importData = JSON.parse(fileContent);
          setSyncProgress(50);

          // Validate data structure - be more flexible
          if (!importData.plants && !importData.logs) {
            throw new Error('Invalid backup file: missing plants and logs data');
          }

          // Import plants if they exist
          if (importData.plants && Array.isArray(importData.plants)) {
            localData.set('plants', importData.plants);
          }

          setSyncProgress(70);

          // Import logs if they exist
          if (importData.logs) {
            if (importData.logs.watering && Array.isArray(importData.logs.watering)) {
              localData.set('wateringLogs', importData.logs.watering);
            }
            if (importData.logs.feeding && Array.isArray(importData.logs.feeding)) {
              localData.set('feedingLogs', importData.logs.feeding);
            }
            if (importData.logs.repotting && Array.isArray(importData.logs.repotting)) {
              localData.set('repottingLogs', importData.logs.repotting);
            }
            if (importData.logs.soilTopUp && Array.isArray(importData.logs.soilTopUp)) {
              localData.set('soilTopUpLogs', importData.logs.soilTopUp);
            }
            if (importData.logs.pruning && Array.isArray(importData.logs.pruning)) {
              localData.set('pruningLogs', importData.logs.pruning);
            }
          }

          // Import custom locations if they exist
          if (importData.customLocations && Array.isArray(importData.customLocations)) {
            localData.set('customLocations', importData.customLocations);
          }

          setSyncProgress(100);
          setSyncStatus('complete');

          // Enable unlimited mode when restoring backup files
          localStorage.setItem('googleDriveUnlimited', 'true');
          
          const plantCount = importData.plants ? importData.plants.length : 0;
          toast({
            title: "Restore Successful",
            description: `Imported ${plantCount} plants successfully. Unlimited plant mode enabled!`,
          });

          setTimeout(() => {
            setSyncStatus('idle');
            window.location.reload();
          }, 2000);

        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Could not read backup file. Please verify it's a valid JSON backup file.",
            variant: "destructive",
          });
          setSyncStatus('idle');
        }
      };
      
      setSyncProgress(10);
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Toggle auto backup
  const toggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    localStorage.setItem('autoBackupEnabled', enabled.toString());
    
    // Set unlimited mode flag when enabling Google Drive backup
    localStorage.setItem('googleDriveUnlimited', enabled.toString());
    
    if (enabled) {
      toast({
        title: "Unlimited Plants Enabled",
        description: "Auto backup enabled - you can now have unlimited plants (250+, 500+, etc.)",
      });
    } else {
      toast({
        title: "Auto Backup Disabled",
        description: "Back to 25 plant limit for local storage only",
      });
    }
  };

  // Auto backup interval (every 4 hours when enabled)
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const checkAutoBackup = () => {
      const lastSync = localStorage.getItem('lastSyncTime');
      if (!lastSync) {
        // First time - create backup after 5 minutes
        setTimeout(performAutoBackup, 5 * 60 * 1000);
        return;
      }

      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const timeDiff = now.getTime() - lastSyncDate.getTime();
      const fourHours = 4 * 60 * 60 * 1000;

      if (timeDiff >= fourHours) {
        performAutoBackup();
      }
    };

    // Check every 15 minutes
    const interval = setInterval(checkAutoBackup, 15 * 60 * 1000);

    // Check immediately
    checkAutoBackup();

    return () => clearInterval(interval);
  }, [autoBackupEnabled, localPlants.length, localLogs.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Universal Google Drive Sync
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Universal
          </Badge>
        </CardTitle>
        <CardDescription>
          Automatic backup creation with manual Google Drive upload - works on any domain without setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {syncStatus === 'uploading' && 'Creating backup file...'}
                {syncStatus === 'downloading' && 'Restoring from backup...'}
                {syncStatus === 'auto-pending' && 'Creating auto backup...'}
                {syncStatus === 'complete' && 'Complete!'}
              </span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} />
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How Universal Sync Works:</h4>
          <ol className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
              <div>
                <strong>Auto backup creates files</strong>
                <br />
                <span className="text-xs">When enabled, backup files are automatically downloaded every 4 hours</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
              <div>
                <strong>You upload to Google Drive</strong>
                <br />
                <span className="text-xs">Upload the downloaded backup files to any folder in your Google Drive</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
              <div>
                <strong>Restore on any device</strong>
                <br />
                <span className="text-xs">Download backup files from Google Drive and restore on any device</span>
              </div>
            </li>
          </ol>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-green-600" />
            <Label htmlFor="auto-backup">Auto Backup (Every 4 Hours)</Label>
          </div>
          <Switch 
            id="auto-backup"
            checked={autoBackupEnabled}
            onCheckedChange={toggleAutoBackup}
          />
        </div>

        {autoBackupEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">Auto Backup Active</span>
            </div>
            <div className="text-sm text-green-800 space-y-1">
              {lastSyncTime && (
                <p>Last backup: {lastSyncTime}</p>
              )}
              {nextSyncTime && (
                <p>Next backup: {nextSyncTime}</p>
              )}
              <p className="text-xs">Backup files are automatically downloaded to your device</p>
            </div>
          </div>
        )}

        {/* Unlimited Plants Mode Banner */}
        {(autoBackupEnabled || localStorage.getItem('googleDriveUnlimited') === 'true') && (
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Cloud className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-lg">Unlimited Plants Mode</div>
                  <p className="text-sm opacity-90">
                    Google Drive backup enabled • {localPlants.length} plants stored
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold">∞</div>
            </div>
            <div className="mt-3 text-xs opacity-80">
              Add 250+, 500+, or thousands of plants without restrictions
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <span className="font-medium">This Device</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{localPlants.length}</div>
            <div className="text-xs text-muted-foreground">Plants</div>
            <div className="text-sm text-muted-foreground">{localLogs.length} care logs</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Cloud className="h-5 w-5 text-green-600" />
              <span className="font-medium">Google Drive</span>
            </div>
            <div className="text-2xl font-bold text-green-600">∞</div>
            <div className="text-xs text-muted-foreground">Unlimited</div>
            <div className="text-sm text-muted-foreground">Manual upload</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button
            onClick={createManualBackup}
            disabled={syncStatus !== 'idle'}
            className="w-full"
            variant="default"
          >
            <Download className="h-4 w-4 mr-2" />
            {syncStatus === 'uploading' ? 'Creating Backup...' : 'Create Backup Now'}
          </Button>
          
          <Button
            onClick={restoreFromBackup}
            disabled={syncStatus !== 'idle'}
            className="w-full"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {syncStatus === 'downloading' ? 'Restoring...' : 'Restore from Backup'}
          </Button>
        </div>

        <Separator />

        {/* Data Management Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Data Management</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={cleanupOrphanedData}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clean Up Orphaned Data
            </Button>
            
            <Button
              onClick={clearAllData}
              variant="destructive"
              size="sm"
              className="w-full text-left justify-start"
            >
              <Shield className="h-4 w-4 mr-2" />
              Clear All Data (Admin)
            </Button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Smart Backup Management:</strong> Keeps last {MAX_BACKUP_FILES} backup files</p>
              <p><strong>Cleanup:</strong> Removes care logs for deleted plants</p>
              <p><strong>Clear All:</strong> Requires admin password (digipl@nts)</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Universal Benefits:</p>
              <ul className="text-xs space-y-1">
                <li>• Works on any domain - no API setup needed</li>
                <li>• Supports unlimited plants (250+, 500+, thousands)</li>
                <li>• Auto creates backup files every 4 hours</li>
                <li>• Cross-device sync via Google Drive</li>
                <li>• No account registration or paid services required</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={() => window.open('https://drive.google.com', '_blank')}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Google Drive
        </Button>
      </CardContent>
    </Card>
  );
}