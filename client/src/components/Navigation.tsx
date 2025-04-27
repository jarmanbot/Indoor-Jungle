import { useLocation, Link } from "wouter";
import { Leaf, ImageIcon, CalendarRange, Gamepad2 } from "lucide-react";

const Navigation = () => {
  const [location] = useLocation();

  return (
    <nav className="flex justify-around border-t border-gray-200 fixed bottom-0 w-full max-w-md bg-white z-10">
      <Link href="/">
        <a className="nav-item flex flex-col items-center py-2 px-4 flex-1">
          <Leaf className={`h-6 w-6 ${location === "/" ? "text-green-600" : "text-gray-500"}`} />
          <span className="text-xs mt-1 text-gray-600">my plants</span>
        </a>
      </Link>
      <Link href="/pic-list">
        <a className="nav-item flex flex-col items-center py-2 px-4 flex-1">
          <ImageIcon className={`h-6 w-6 ${location === "/pic-list" ? "text-green-600" : "text-gray-500"}`} />
          <span className="text-xs mt-1 text-gray-600">pic list</span>
        </a>
      </Link>
      <Link href="/calendar">
        <a className="nav-item flex flex-col items-center py-2 px-4 flex-1">
          <CalendarRange className={`h-6 w-6 ${location === "/calendar" ? "text-green-600" : "text-gray-500"}`} />
          <span className="text-xs mt-1 text-gray-600">calendar</span>
        </a>
      </Link>
      <Link href="/game">
        <a className="nav-item flex flex-col items-center py-2 px-4 flex-1">
          <Gamepad2 className={`h-6 w-6 ${location === "/game" ? "text-green-600" : "text-gray-500"}`} />
          <span className="text-xs mt-1 text-gray-600">game-fi</span>
        </a>
      </Link>
    </nav>
  );
};

export default Navigation;
