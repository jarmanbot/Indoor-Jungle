import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Droplet, 
  Package, 
  Zap, 
  Search, 
  Camera,
  BarChart3,
  Brain,
  Award,
  Gamepad2,
  Monitor,
  Settings,
  Calendar
} from "lucide-react";

interface FloatingActionButtonProps {
  isInHeader?: boolean;
}

const FloatingActionButton = ({ isInHeader = false }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className={`h-8 ${isInHeader ? 'w-20 rounded-md bg-amber-800 hover:bg-amber-900' : 'w-10 rounded-full bg-amber-700 hover:bg-amber-800'} shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            {isInHeader ? (
              <span className="text-xs font-medium text-white mr-1">MENU</span>
            ) : (
              <Plus className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          side="bottom" 
          className="w-64 mt-2"
          align="end"
        >
          <DropdownMenuItem asChild>
            <Link href="/add" className="flex items-center cursor-pointer">
              <Plus className="h-4 w-4 mr-3" />
              Add New Plant
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/bulk-care" className="flex items-center cursor-pointer">
              <Zap className="h-4 w-4 mr-3" />
              Bulk Care Tools
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/identify" className="flex items-center cursor-pointer">
              <Camera className="h-4 w-4 mr-3" />
              Plant Identification
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/recommendations" className="flex items-center cursor-pointer">
              <Brain className="h-4 w-4 mr-3" />
              Smart Recommendations
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/analytics" className="flex items-center cursor-pointer">
              <BarChart3 className="h-4 w-4 mr-3" />
              Analytics & Insights
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/achievements" className="flex items-center cursor-pointer">
              <Award className="h-4 w-4 mr-3" />
              Achievements
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/calendar" className="flex items-center cursor-pointer">
              <Calendar className="h-4 w-4 mr-3" />
              Care Calendar
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/game" className="flex items-center cursor-pointer">
              <Gamepad2 className="h-4 w-4 mr-3" />
              Indoor Jungle Game
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/indoor-jungle-monitor" className="flex items-center cursor-pointer">
              <Monitor className="h-4 w-4 mr-3" />
              Environmental Monitor
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center cursor-pointer">
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FloatingActionButton;