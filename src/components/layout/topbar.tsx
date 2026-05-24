"use client";

import { Bell, Search, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";

export function Topbar() {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md flex justify-between items-center w-full px-10 py-6 border-b border-border/40">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input 
            className="bg-card border-none rounded-full pl-12 pr-6 py-2.5 w-72 text-sm focus:ring-1 focus:ring-accent outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground" 
            placeholder="Search projects..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-muted-foreground hover:text-accent transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full text-muted-foreground hover:text-accent transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button 
            onClick={logout} 
            className="p-2 rounded-full text-muted-foreground hover:text-accent transition-colors ml-2 border-l border-border/40 pl-6"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
