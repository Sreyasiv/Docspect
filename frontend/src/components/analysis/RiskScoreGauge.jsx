export default function RiskScoreGauge({ score }) {
  // ⚡ Use the passed-in score, default to 0 if undefined
  const displayScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;

  // Determine color based on score
  const getColor = (value) => {
    if (value < 40) return "#2ECC71";
    if (value < 60) return "#F39C12";
    return "#E74C3C";
  };

  // Determine risk label
  const getRiskLabel = (value) => {
    if (value < 40) return "LOW RISK";
    if (value < 60) return "CAUTION";
    return "HIGH RISK";
  };

  const arcColor = getColor(displayScore);
  const riskLabel = getRiskLabel(displayScore);

  // Circular gauge calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Circular SVG Gauge */}
      <div className="flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="#F0F0F0"
            strokeWidth="16"
            fill="none"
          />
          {/* Foreground arc */}
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke={arcColor}
            strokeWidth="16"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          {/* Score text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fontSize="42"
            fontWeight="bold"
            fill={arcColor}
          >
            {displayScore}%
          </text>
          {/* Risk label */}
          <text
            x="100"
            y="118"
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {riskLabel}
          </text>
        </svg>
      </div>

      {/* Title and description */}
      <h3 className="text-sm font-bold text-gray-800 text-center mt-3 mb-1">
        Contract Vulnerability Index
      </h3>
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        The score is calculated based on indemnity clauses, termination liabilities, and IP assignment clarity on a scale of 0 (Safe) to 100 (Extremely Risky).
      </p>

      {/* Gradient bar */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-green-600 font-medium">Safe</span>
        <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
        <span className="text-xs text-red-600 font-medium">Risky</span>
      </div>
    </div>
  );
}
