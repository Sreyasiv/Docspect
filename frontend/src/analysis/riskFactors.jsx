import { TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";

// 🧠 Smart clause extractor
function splitClauses(text) {
  if (!text || typeof text !== "string") return [];

  // Try numbered format like 1., 2., etc.
  let parts = text.split(/\n?\d+\.\s+/).filter((p) => p.trim() !== "");

  // If too few, try bullets like -, *, •
  if (parts.length <= 1) {
    parts = text.split(/\n?[-*•]\s+/).filter((p) => p.trim() !== "");
  }

  // If still not enough, fallback to newlines
  if (parts.length <= 1) {
    parts = text.split(/\n+/).filter((p) => p.trim() !== "");
  }

  return parts.map((p) => p.trim());
}

// 🔍 Basic keyword-based risk guesser
function guessRiskLevel(text) {
  const lower = text.toLowerCase().trim().replace(/\s+/g, " ");
  if (
    lower.includes("terminate") ||
    lower.includes("liability") ||
    lower.includes("damages")
  )
    return "High";
  if (
    lower.includes("payment") ||
    lower.includes("notice") ||
    lower.includes("dispute")
  )
    return "Medium";
  return "Low";
}

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

export default function RiskFactors({ riskClauses }) {
  console.log("🧪 Received riskClauses prop:", riskClauses);

  // 🛑 Check immediately for empty-risk message
  const isEmpty =
    typeof riskClauses === "string" &&
    riskClauses.trim().toLowerCase().includes("no risky clauses found");

  if (isEmpty) {
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

  // ✅ Only split AFTER confirming it's not empty
  const clauseList = Array.isArray(riskClauses)
  ? riskClauses
  : splitClauses(riskClauses);

  console.log("🪓 Extracted clauseList:", clauseList);

  // 🧯 Fallback: AI gave weird string that couldn't be parsed
  if (clauseList.length === 0 && typeof riskClauses === "string") {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md text-gray-600">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
          <TrendingUp className="w-6 h-6 text-[#1D2D5F]" />
          <span>Key Clauses & Risks</span>
        </h2>
        <p>AI returned unstructured text. Review it manually:</p>
        <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
          {riskClauses}
        </pre>
      </div>
    );
  }

  // ✅ Format parsed clauses
  const formattedClauses = clauseList.map((text, idx) => {
    const risk = guessRiskLevel(text);
    return {
      title: `Clause ${idx + 1}`,
      risk,
      description: text,
      recommendation:
        risk === "High"
          ? "Review with legal counsel and consider negotiation."
          : risk === "Medium"
          ? "Clarify terms or keep record of communication."
          : "Clause appears standard. Monitor only if needed.",
    };
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
        <TrendingUp className="w-6 h-6 text-[#1D2D5F]" />
        <span>Key Clauses & Risks</span>
      </h2>
      <div className="space-y-4">
        {formattedClauses.map((clause, idx) => (
          <div
            key={idx}
            className="border-l-4 pl-4 py-2 bg-gray-50 rounded border-gray-200"
          >
            <div className="flex items-center space-x-2 mb-1">
              {clause.risk === "High" && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              {clause.risk === "Medium" && (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
              {clause.risk === "Low" && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="font-semibold text-gray-800">
                {clause.title}
              </span>
              <span
                className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getRiskLevelColor(
                  clause.risk
                )}`}
              >
                {clause.risk} Risk
              </span>
            </div>
            <p className="text-gray-700 text-sm">{clause.description}</p>
            <p className="text-gray-600 text-xs mt-1">
              <span className="font-semibold">AI Suggestion:</span>{" "}
              {clause.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
