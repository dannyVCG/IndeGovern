import { AlertTriangle } from "lucide-react";

interface RiskCardProps {
  id: string;
  title: string;
  severity: string;
  initiative: string;
  source: string;
  onResolve: (id: string) => void;
}

const severityColor: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};

export default function RiskCard({
  id,
  title,
  severity,
  initiative,
  source,
  onResolve,
}: RiskCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-orange-500 mt-1" />
        <div>
          <h4 className="font-semibold text-sm text-gray-800">{title}</h4>
          <p className="text-xs text-gray-500 mt-1">
            Initiative: {initiative}
          </p>
          <div className="flex gap-2 mt-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                severityColor[severity] || "bg-gray-100 text-gray-600"
              }`}
            >
              {severity}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#034EA2]">
              {source}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onResolve(id)}
        className="text-xs bg-[#034EA2] text-white px-3 py-1.5 rounded hover:bg-blue-800 transition-colors"
      >
        Resolve
      </button>
    </div>
  );
}