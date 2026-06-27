import React from "react";
import { Link, useLocation } from "wouter";
import { clearAuthData } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Upload,
  Files,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Document", icon: Upload },
  { href: "/documents", label: "Documents", icon: Files },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    clearAuthData();
    queryClient.clear();
    setLocation("/login");
  };

  const NavContent = () => (
    <div className="flex h-full flex-col p-4 bg-gray-50 border-r border-gray-200">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl leading-none">D</span>
        </div>
        <span className="text-xl font-bold tracking-tight">DocuChat AI</span>
      </div>

      <nav className="space-y-1 flex-1">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = location.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive
                  ? "bg-white text-primary font-medium shadow-sm border border-gray-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              data-testid={`nav-${link.label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          data-testid="nav-logout"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">D</span>
          </div>
          <span className="text-xl font-bold tracking-tight">DocuChat AI</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
