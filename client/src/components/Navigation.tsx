import { useLocation, Link } from "wouter";
import { Home, Calendar, Clipboard, Settings } from "lucide-react";

const Navigation = () => {
  const [location] = useLocation();

  return (
    <nav className="flex justify-around border-t border-neutral-medium fixed bottom-0 w-full max-w-md bg-white">
      <Link href="/">
        <a className={`nav-item flex flex-col items-center py-2 px-4 ${location === "/" ? "active text-primary" : "text-neutral-dark"}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Plants</span>
        </a>
      </Link>
      <Link href="/calendar">
        <a className={`nav-item flex flex-col items-center py-2 px-4 ${location === "/calendar" ? "active text-primary" : "text-neutral-dark"}`}>
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Calendar</span>
        </a>
      </Link>
      <Link href="/tasks">
        <a className={`nav-item flex flex-col items-center py-2 px-4 ${location === "/tasks" ? "active text-primary" : "text-neutral-dark"}`}>
          <Clipboard className="h-6 w-6" />
          <span className="text-xs mt-1">Tasks</span>
        </a>
      </Link>
      <Link href="/settings">
        <a className={`nav-item flex flex-col items-center py-2 px-4 ${location === "/settings" ? "active text-primary" : "text-neutral-dark"}`}>
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </a>
      </Link>
    </nav>
  );
};

export default Navigation;
