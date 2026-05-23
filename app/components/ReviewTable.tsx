import Link from "next/link";

interface ReviewRow {
  id: string;
  name: string;
  capability: string | null;
  box: string | null;
  status: string;
  confidence: number;
  readiness: string;
  blockerReason: string;
}

interface ReviewTableProps {
  rows: ReviewRow[];
  onResolve: (id: string) => void;
}

const readinessStyle: Record<string, string> = {
  READY: "bg-green-100 text-green-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  NOT_READY: "bg-red-100 text-red-700",
};

const readinessLabel: Record<string, string> = {
  READY: "✅ Ready",
  PARTIAL: "⚠️ Partial",
  NOT_READY: "❌ Not Ready",
};

export default function ReviewTable({ rows, onResolve }: ReviewTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#034EA2] text-white text-xs uppercase">
            <th className="text-left p-3">Initiative</th>
            <th className="text-left p-3">Capability</th>
            <th className="text-left p-3">Box</th>
            <th className="text-left p-3">Status</th>
            <th className="text-center p-3">Confidence</th>
            <th className="text-center p-3">Readiness</th>
            <th className="text-left p-3">Blocker</th>
            <th className="text-center p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
            >
              <td className="p-3 font-semibold text-[#034EA2]">
                <Link href={`/initiatives/${row.id}`} className="hover:underline">
                  {row.name}
                </Link>
              </td>
              <td className="p-3">{row.capability || "—"}</td>
              <td className="p-3">{row.box || "—"}</td>
              <td className="p-3">
                <span className="text-xs font-bold">{row.status}</span>
              </td>
              <td className="p-3 text-center font-bold">{row.confidence}%</td>
              <td className="p-3 text-center">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    readinessStyle[row.readiness] || "bg-gray-100"
                  }`}
                >
                  {readinessLabel[row.readiness] || row.readiness}
                </span>
              </td>
              <td className="p-3 text-xs text-gray-500">{row.blockerReason}</td>
              <td className="p-3 text-center">
                {row.readiness !== "READY" && (
                  <button
                    onClick={() => onResolve(row.id)}
                    className="text-xs bg-[#ED0677] text-white px-3 py-1 rounded hover:bg-pink-700"
                  >
                    Resolve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}