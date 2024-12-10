import { Link, useLocation } from 'react-router-dom';
import { Home, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NavBar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg md:top-0 md:bottom-auto z-50">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center h-16 gap-8">
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center gap-1 text-sm transition-colors",
              isActive('/') 
                ? "text-dream-purple" 
                : "text-gray-600 hover:text-dream-purple"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          
          <Link
            to="/history"
            className={cn(
              "flex flex-col items-center gap-1 text-sm transition-colors",
              isActive('/history') 
                ? "text-dream-purple" 
                : "text-gray-600 hover:text-dream-purple"
            )}
          >
            <History className="h-5 w-5" />
            <span>History</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};