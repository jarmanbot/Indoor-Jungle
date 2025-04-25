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

function Router() {
  const [location] = useLocation();
  
  return (
    <div className="max-w-md mx-auto bg-neutral-lightest min-h-screen shadow-sm">
      <Header />
      
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/add" component={AddPlant} />
        <Route path="/plant/:id" component={PlantDetails} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Only show navigation on main pages */}
      {!location.includes("/add") && <Navigation />}
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
