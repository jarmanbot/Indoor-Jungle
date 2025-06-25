import { Link } from "wouter";
import { Search, Plus, Menu } from "lucide-react";
import { useLocation } from "wouter";
import FloatingActionButton from "./FloatingActionButton";

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
    <header className="px-4 py-3 bg-green-600 flex items-center justify-between shadow-sm">
      <h1 className="text-white font-medium text-xl">INDOOR JUNGLE</h1>
    </header>
  );
};

export default Header;
