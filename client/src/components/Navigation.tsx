import { useLocation, Link } from "wouter";
import { Leaf, CalendarRange, Gamepad2, Sprout } from "lucide-react";

const Navigation = () => {
  const [location] = useLocation();

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
    </nav>
  );
};

export default Navigation;
