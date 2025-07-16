import { Link } from "wouter";
import { Search, Plus, Menu, Download } from "lucide-react";
import { useLocation } from "wouter";
import FloatingActionButton from "./FloatingActionButton";
import { usePWA } from "../hooks/usePWA";
import { Button } from "./ui/button";

interface HeaderProps {
  title?: string;
}

const Header = ({ title }: HeaderProps) => {
  const [location] = useLocation();
  const { isInstallable, install } = usePWA();
  
  // Determine the title based on current route or prop
  const getTitle = () => {
    if (title) return title;
    
    switch (location) {
      case "/":
      case "/home":
        return "my plants";
      case "/calendar":
        return "calendar";
      case "/tasks":
        return "tasks";
      case "/settings":
        return "settings";
      case "/add":
        return "add plant";
      case "/game":
        return "LVS INDOOR JUNGLE";
      default:
        return "my plants";
    }
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      console.log('App installed successfully');
    }
  };
  
  return (
    <header className="px-4 py-3 bg-green-700 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-white font-medium text-xl">INDOOR JUNGLE</h1>
      </div>
      
      {isInstallable && (
        <Button 
          onClick={handleInstall}
          variant="ghost" 
          size="sm"
          className="text-white hover:bg-green-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      )}
    </header>
  );
};

export default Header;
