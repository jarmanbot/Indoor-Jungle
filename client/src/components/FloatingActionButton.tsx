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
  BarChart3
} from "lucide-react";

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className={`h-6 w-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          side="top" 
          className="w-56 mb-2 mr-4"
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
              Quick Bulk Care
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/identify" className="flex items-center cursor-pointer">
              <Camera className="h-4 w-4 mr-3" />
              Identify Plant
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/analytics" className="flex items-center cursor-pointer">
              <BarChart3 className="h-4 w-4 mr-3" />
              View Analytics
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/recommendations" className="flex items-center cursor-pointer">
              <Search className="h-4 w-4 mr-3" />
              Get Recommendations
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FloatingActionButton;