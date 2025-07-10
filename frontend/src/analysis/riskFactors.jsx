import { TrendingUp, AlertTriangle } from "lucide-react";

export default function RiskFactors({ riskClauses }) {
  if (
    typeof riskClauses === "string" &&
    riskClauses.trim().toLowerCase().includes("no risky clauses found")
  ) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md text-gray-600">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
          <TrendingUp className="w-6 h-6 text-[#1D2D5F]" />
          <span>Key Clauses & Risks</span>
        </h2>
        <p>No key risk clauses found for this document.</p>
      </div>
    );
  }

  if (!Array.isArray(riskClauses) || riskClauses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
        <TrendingUp className="w-6 h-6 text-[#1D2D5F]" />
        <span>Key Clauses & Risks</span>
      </h2>
      <div className="space-y-4">
        {riskClauses.map((item, idx) => (
          <div
            key={idx}
            className="border-l-4 pl-4 py-2 bg-gray-50 rounded border-gray-200"
          >
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-gray-800">
                Clause {idx + 1}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{item.clause}</p>
            <p className="text-gray-600 text-xs mt-1">
              <span className="font-semibold">AI Advice:</span>{" "}
              {item.advice || "No specific advice given."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
