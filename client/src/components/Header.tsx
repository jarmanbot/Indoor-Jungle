import { Link } from "wouter";
import { Search, Plus } from "lucide-react";

const Header = () => {
  return (
    <header className="px-4 py-3 bg-primary flex items-center justify-between shadow-sm">
      <Link href="/">
        <a className="text-white font-semibold text-xl">Plant Care</a>
      </Link>
      <div className="flex space-x-2">
        <button className="p-2 rounded-full bg-white bg-opacity-20 text-white">
          <Search className="h-5 w-5" />
        </button>
        <Link href="/add">
          <a className="p-2 rounded-full bg-white bg-opacity-20 text-white">
            <Plus className="h-5 w-5" />
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
