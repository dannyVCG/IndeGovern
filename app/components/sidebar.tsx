"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  ShieldAlert,
  CalendarCheck,
  Lightbulb,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Initiatives", href: "/initiatives", icon: FolderKanban },
  { label: "Risks & Alerts", href: "/risks", icon: AlertTriangle },
  { label: "Decisions", href: "/decisions", icon: ShieldAlert },
  { label: "Weekly Review", href: "/review", icon: CalendarCheck },
  { label: "Insights", href: "/insights", icon: Lightbulb },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-screen bg-[#034EA2] text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-800">
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">
            Governance Tower
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/70 hover:text-white"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-blue-800 text-xs text-white/50">
          Governance Tower v1.0
        </div>
      )}
    </aside>
  );
}