import { Link, useLocation } from "wouter";
import { Home, Search, Heart, Stethoscope, User } from "lucide-react";

interface BottomNavigationProps {
  currentPage: string;
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [location] = useLocation();
  
  const isActive = (page: string) => {
    if (page === "home") return location === "/";
    return location === `/${page}`;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        <Link href="/">
          <button className={`flex flex-col items-center space-y-1 py-2 ${isActive("home") ? "text-gray-900" : "text-gray-500"}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
        </Link>
        
        <Link href="/discover">
          <button className={`flex flex-col items-center space-y-1 py-2 ${isActive("discover") ? "text-gray-900" : "text-gray-500"}`}>
            <Search className="w-6 h-6" />
            <span className="text-xs">Discover</span>
          </button>
        </Link>
        
        <Link href="/care">
          <button className={`flex flex-col items-center space-y-1 py-2 ${isActive("care") ? "text-gray-900" : "text-gray-500"}`}>
            <Stethoscope className="w-6 h-6" />
            <span className="text-xs">Care</span>
          </button>
        </Link>
        <Link href="/profile">
          <button className={`flex flex-col items-center space-y-1 py-2 ${isActive("profile") ? "text-gray-900" : "text-gray-500"}`}>
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </Link>
      </div>
    </nav>
  );
}