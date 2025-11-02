import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold tracking-tight">FrameCanvas</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="w-full pl-10"
              />
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <Link to="/templates" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link to="/templates">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
