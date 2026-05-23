import { TrendingDown, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";

interface DashboardCardsProps {
  totalInitiatives: number;
  atRisk: number;
  decisions: number;
  avgConfidence: number;
}

export default function DashboardCards({
  totalInitiatives,
  atRisk,
  decisions,
  avgConfidence,
}: DashboardCardsProps) {
  const cards = [
    {
      label: "Total Initiatives",
      value: totalInitiatives,
      icon: CheckCircle,
      color: "text-[#034EA2]",
      bg: "bg-blue-50",
    },
    {
      label: "At Risk",
      value: atRisk,
      icon: AlertTriangle,
      color: "text-[#ED0677]",
      bg: "bg-pink-50",
    },
    {
      label: "Decisions Needed",
      value: decisions,
      icon: ShieldAlert,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Avg Confidence",
      value: `${avgConfidence}%`,
      icon: TrendingDown,
      color: "text-[#00C0F3]",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} border border-gray-100 rounded-xl p-4`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              {card.label}
            </span>
            <card.icon size={18} className={card.color} />
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}