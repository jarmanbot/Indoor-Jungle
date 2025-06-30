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
import IndoorJungleMonitor from "@/pages/IndoorJungleMonitor";
import Analytics from "@/pages/Analytics";
import Achievements from "@/pages/Achievements";
import PlantIdentification from "@/pages/PlantIdentification";
import BulkCare from "@/pages/BulkCare";
import SmartRecommendations from "@/pages/SmartRecommendations";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import FloatingActionButton from "@/components/FloatingActionButton";
import Landing from "@/pages/Landing";
// Import Game pages
import Game from "@/pages/Game";
import GameDashboard from "@/pages/Game/Dashboard";
import GameMarketplace from "@/pages/Game/Marketplace";
import { useAuth } from "@/hooks/useAuth";
import LevelDetail from "@/pages/Game/LevelDetail";
import GrowToEarn from "@/pages/GrowToEarn";

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  const isGameRoute = location.startsWith("/game");
  const isGrowToEarnRoute = location.startsWith("/grow-to-earn");
  const hideHeader = isGameRoute || isGrowToEarnRoute;
  
  // Get the current page title based on the route
  const getPageTitle = () => {
    if (location === "/") return "my plants";
    if (location === "/add") return "add plant";
    if (location === "/calendar") return "calendar";
    if (location === "/tasks") return "tasks";
    if (location === "/settings") return "settings";
    if (location === "/indoor-jungle-monitor") return "indoor jungle monitor";
    if (location.startsWith("/plant/")) return "plant details";
    if (location.startsWith("/game")) return "LVS INDOOR JUNGLE";
    if (location.startsWith("/grow-to-earn")) return "GROW TO EARN";
    return "";
  };
      
  return (
    <div className={`${isGameRoute || isGrowToEarnRoute ? '' : 'max-w-md'} mx-auto bg-white min-h-screen shadow relative`}>
      {!hideHeader && <Header title={getPageTitle()} />}
      
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/add" component={AddPlant} />
            <Route path="/plant/:id" component={PlantDetails} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/settings" component={Settings} />
            <Route path="/indoor-jungle-monitor" component={IndoorJungleMonitor} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/achievements" component={Achievements} />
            <Route path="/identify" component={PlantIdentification} />
            <Route path="/bulk-care" component={BulkCare} />
            <Route path="/recommendations" component={SmartRecommendations} />
            {/* Game routes */}
            <Route path="/game" component={Game} />
            <Route path="/game/level/:level" component={LevelDetail} />
            <Route path="/game/:level" component={Game} />
            <Route path="/game/marketplace" component={GameMarketplace} />
            <Route path="/grow-to-earn" component={GrowToEarn} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {/* Show navigation on all pages except add and edit, and only when authenticated */}
      {!location.includes("/add") && isAuthenticated && <Navigation />}
      
      {/* Floating Action Button on main pages, only when authenticated */}
      {!hideHeader && !location.includes("/add") && !location.includes("/settings") && isAuthenticated && <FloatingActionButton />}
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
