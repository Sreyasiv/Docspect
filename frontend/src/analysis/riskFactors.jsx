// components/RiskFactors.jsx
import { TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";

function getRiskLevelColor(risk) {
  switch (risk) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    case "Low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function RiskFactors({ keyClauses }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
        <TrendingUp className="w-6 h-6 text-[#1D2D5F]" />
        <span>Key Clauses & Risks</span>
      </h2>
      <div className="space-y-4">
        {keyClauses.map((clause, idx) => (
          <div
            key={idx}
            className="border-l-4 pl-4 py-2 bg-gray-50 rounded border-gray-200"
          >
            <div className="flex items-center space-x-2 mb-1">
              {clause.risk === "High" && <AlertTriangle className="w-4 h-4 text-red-500" />}
              {clause.risk === "Medium" && <Clock className="w-4 h-4 text-yellow-500" />}
              {clause.risk === "Low" && <CheckCircle className="w-4 h-4 text-green-500" />}
              <span className="font-semibold text-gray-800">{clause.title}</span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getRiskLevelColor(clause.risk)}`}>
                {clause.risk} Risk
              </span>
            </div>
            <p className="text-gray-700 text-sm">{clause.description}</p>
            <p className="text-gray-600 text-xs mt-1">
              <span className="font-semibold">AI Suggestion:</span> {clause.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
