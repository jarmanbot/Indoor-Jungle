import { Link } from "wouter";
import { Search, Plus, Menu } from "lucide-react";
import { useLocation } from "wouter";

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
      <div className="flex space-x-3">
        <Link href="/add" className="text-white flex items-center">
          <span className="mr-1">ADD PLANT</span>
          <Plus className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
