import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";

const NavigationBar = () => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm border-b py-4 px-6 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif text-dream-purple hover:text-dream-purple/90 transition-colors">
          Dream Mosaic
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/history">
                <NavigationMenuLink 
                  className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  )}
                >
                  <History className="mr-2 h-4 w-4" />
                  Dream History
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

export default NavigationBar;