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
    <div className="fixed top-20 right-4 z-50">
      {/* Floating container with quick actions and menu button */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 mb-2">
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <Link href="/bulk-care">
            <div className="flex flex-col items-center p-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-green-100 rounded-full p-1 mb-0.5">
                <Zap className="h-2.5 w-2.5 text-green-600" />
              </div>
              <span className="text-xs text-center text-gray-700">Bulk Care</span>
            </div>
          </Link>
          
          <Link href="/identify">
            <div className="flex flex-col items-center p-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-blue-100 rounded-full p-1 mb-0.5">
                <Search className="h-2.5 w-2.5 text-blue-600" />
              </div>
              <span className="text-xs text-center text-gray-700">Plant ID</span>
            </div>
          </Link>
          
          <Link href="/recommendations">
            <div className="flex flex-col items-center p-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-purple-100 rounded-full p-1 mb-0.5">
                <Brain className="h-2.5 w-2.5 text-purple-600" />
              </div>
              <span className="text-xs text-center text-gray-700">Smart Tips</span>
            </div>
          </Link>
          
          <Link href="/analytics">
            <div className="flex flex-col items-center p-1.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="bg-indigo-100 rounded-full p-1 mb-0.5">
                <BarChart3 className="h-2.5 w-2.5 text-indigo-600" />
              </div>
              <span className="text-xs text-center text-gray-700">Analytics</span>
            </div>
          </Link>
        </div>
      </div>

      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="h-10 w-16 rounded-md bg-amber-800 hover:bg-amber-900 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          side="left" 
          className="w-64 mr-2"
          align="start"
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