import { useLocation, Link } from "wouter";
import { Leaf, CalendarRange, Gamepad2, Sprout, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  BarChart3, 
  Award, 
  Search, 
  Zap, 
  Brain,
  Settings,
  Thermometer
} from "lucide-react";

const Navigation = () => {
  const [location] = useLocation();

  const isMoreActive = [
    "/analytics", "/achievements", "/identify", "/bulk-care", 
    "/recommendations", "/settings", "/indoor-jungle-monitor"
  ].some(path => location === path);

  return (
    <nav className="flex justify-around border-t border-gray-200 fixed bottom-0 w-full max-w-md bg-white z-10">
      <Link href="/" className="nav-item flex flex-col items-center py-2 px-4 flex-1">
        <Leaf className={`h-6 w-6 ${location === "/" ? "text-green-600" : "text-gray-500"}`} />
        <span className="text-xs mt-1 text-gray-600">plants</span>
      </Link>
      
      <Link href="/calendar" className="nav-item flex flex-col items-center py-2 px-4 flex-1">
        <CalendarRange className={`h-6 w-6 ${location === "/calendar" ? "text-green-600" : "text-gray-500"}`} />
        <span className="text-xs mt-1 text-gray-600">calendar</span>
      </Link>
      
      <Link href="/game" className="nav-item flex flex-col items-center py-2 px-4 flex-1">
        <Gamepad2 className={`h-6 w-6 ${location === "/game" || location.startsWith("/game/") ? "text-green-600" : "text-gray-500"}`} />
        <span className="text-xs mt-1 text-gray-600">game</span>
      </Link>
      
      <Link href="/grow-to-earn" className="nav-item flex flex-col items-center py-2 px-4 flex-1">
        <Sprout className={`h-6 w-6 ${location === "/grow-to-earn" ? "text-green-600" : "text-gray-500"}`} />
        <span className="text-xs mt-1 text-gray-600">earn</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="nav-item flex flex-col items-center py-2 px-4 flex-1 focus:outline-none">
          <MoreHorizontal className={`h-6 w-6 ${isMoreActive ? "text-green-600" : "text-gray-500"}`} />
          <span className="text-xs mt-1 text-gray-600">more</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" className="w-56 mb-2">
          <DropdownMenuItem asChild>
            <Link href="/bulk-care" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Bulk Care
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/identify" className="flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Plant ID
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/recommendations" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Smart Tips
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/achievements" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/indoor-jungle-monitor" className="flex items-center">
              <Thermometer className="h-4 w-4 mr-2" />
              Sensors
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Navigation;
