"use client";
import { useState } from "react";
import { Search, Bell, Lightbulb, User } from "lucide-react";

interface TopBarProps {
  onToggleInsights: () => void;
}

export default function TopBar({ onToggleInsights }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-80">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search initiatives, risks, decisions…"
          className="bg-transparent text-sm outline-none w-full"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Insights drawer toggle */}
        <button
          onClick={onToggleInsights}
          className="flex items-center gap-1 text-sm text-[#034EA2] hover:text-[#ED0677] transition-colors"
          title="Open Insights"
        >
          <Lightbulb size={18} />
          <span className="hidden md:inline">Insights</span>
        </button>

        {/* Notifications */}
        <button className="relative" title="Notifications">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute -top-1 -right-1 bg-[#ED0677] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={18} />
          <span className="hidden md:inline">PMO</span>
        </div>
      </div>
    </header>
  );
}