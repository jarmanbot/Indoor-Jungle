import { Link } from "wouter";
import { Search, Plus, Menu, TestTube } from "lucide-react";
import { useLocation } from "wouter";
import FloatingActionButton from "./FloatingActionButton";
import { isAlphaTestingMode } from "@/lib/alphaTestingMode";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title?: string;
}

const Header = ({ title }: HeaderProps) => {
  const [location] = useLocation();
  
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
  
  return (
    <header className="px-4 py-3 bg-green-700 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-white font-medium text-xl">INDOOR JUNGLE</h1>
        {isAlphaTestingMode() && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            <TestTube className="h-3 w-3 mr-1" />
            ALPHA
          </Badge>
        )}
      </div>
    </header>
  );
};

export default Header;
