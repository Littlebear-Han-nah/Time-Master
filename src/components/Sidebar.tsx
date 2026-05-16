"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Cpu, 
  LineChart, 
  Settings, 
  LogOut,
  Layers,
  UserCircle
} from "lucide-react";
import { useProfile } from "@/context/ProfileContext";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Planning", href: "/planning", icon: CalendarDays },
  { name: "Algorithm", href: "/algorithm", icon: Cpu },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const handleLogout = () => {
    // Clear the simulated profile data (or just navigate away)
    updateProfile({ nickname: "", major: "" });
    localStorage.removeItem("vc_profile"); // Hard clear for realism
    router.push("/login");
  };

  const displayName = profile.nickname.trim() || "Scholar";

  return (
    <aside className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-orange-200/50 flex flex-col fixed left-0 top-0 shadow-[4px_0_24px_rgba(249,115,22,0.05)] z-40">
      
      {/* Brand Section */}
      <div className="h-20 flex items-center px-6 border-b border-orange-100/50">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-xl text-orange-950 tracking-tight">UniFlow</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                isActive 
                  ? "bg-orange-100 text-orange-600 shadow-sm" 
                  : "text-slate-500 hover:bg-orange-50 hover:text-orange-950"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-orange-100/50">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
            <UserCircle className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-orange-950 truncate">{displayName}</p>
            <p className="text-xs font-semibold text-orange-700/60 truncate">Free Plan</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

    </aside>
  );
}
