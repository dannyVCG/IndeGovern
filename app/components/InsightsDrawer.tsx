"use client";
import { X, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";

interface InsightsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function InsightsDrawer({ open, onClose }: InsightsDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-[#034EA2]" />
          <h2 className="font-bold text-[#034EA2]">Insights</h2>
        </div>
        <button onClick={onClose}>
          <X size={18} className="text-gray-400 hover:text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Theme 1 */}
        <div className="bg-gray-50 border-l-4 border-[#ED0677] p-3 rounded">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-[#ED0677]" />
            <span className="text-xs font-bold text-[#ED0677] uppercase">
              Pattern Detected
            </span>
          </div>
          <p className="text-sm text-gray-700">
            Dependency delays increasing across EMS Box 2 initiatives
          </p>
          <p className="text-xs text-gray-400 mt-1">3 initiatives impacted</p>
        </div>

        {/* Theme 2 */}
        <div className="bg-gray-50 border-l-4 border-[#00C0F3] p-3 rounded">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-[#00C0F3]" />
            <span className="text-xs font-bold text-[#00C0F3] uppercase">
              Evidence Gap
            </span>
          </div>
          <p className="text-sm text-gray-700">
            40% of at-risk initiatives have no linked evidence documents
          </p>
          <p className="text-xs text-gray-400 mt-1">Recommend evidence review</p>
        </div>

        {/* Suggestion */}
        <div className="bg-blue-50 border-l-4 border-[#034EA2] p-3 rounded">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={14} className="text-[#034EA2]" />
            <span className="text-xs font-bold text-[#034EA2] uppercase">
              Suggested Action
            </span>
          </div>
          <p className="text-sm text-gray-700">
            Send nudge to 2 initiative owners with overdue updates
          </p>
        </div>
      </div>
    </div>
  );
}