import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AddPlant from "@/pages/AddPlant";
import PlantDetails from "@/pages/PlantDetails";
import Calendar from "@/pages/Calendar";
import Tasks from "@/pages/Tasks";
import Settings from "@/pages/Settings";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
// Import Game pages
import GameDashboard from "@/pages/Game/Dashboard";
import GameMarketplace from "@/pages/Game/Marketplace";

function Router() {
  const [location] = useLocation();
  
  const isGameRoute = location.startsWith("/game");
      
  return (
    <div className={`${isGameRoute ? '' : 'max-w-md'} mx-auto bg-neutral-lightest min-h-screen shadow-sm`}>
      {!isGameRoute && <Header />}
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/add" component={AddPlant} />
        <Route path="/plant/:id" component={PlantDetails} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/settings" component={Settings} />
        {/* Game routes */}
        <Route path="/game" component={GameDashboard} />
        <Route path="/game/marketplace" component={GameMarketplace} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Only show navigation on main app pages */}
      {!location.includes("/add") && !isGameRoute && <Navigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
