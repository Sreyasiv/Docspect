import { Shield, ShieldCheck, AlertTriangle, Ban } from "lucide-react";
import GaugeComponent from "react-gauge-component";

export default function RiskScoreGauge() {
  const displayScore = 56; // hardcoded to 1%

  return (
    <div className="bg-white rounded-lg p-6 shadow-md mb-4">
      {/* Header */}
      <div className="text-lg font-bold text-gray-800 flex items-center space-x-2 mb-4">
        <Shield className="w-6 h-6 text-[#1D2D5F]" />
        <span>Document Risk Score</span>
      </div>

      {/* Gauge */}
      <div className="w-64 h-46 mx-auto">
        <GaugeComponent
          value={displayScore}
          type="semicircle"
          arc={{
            colorArray: ["#2ECC71", "#F1C40F", "#F39C12", "#E67E22", "#E74C3C"],
            subArcs: [{}, {}, {}, {}, {}],
            width: 0.3,
            padding: 0.02,
          }}
          labels={{
            
            tickLabels: {
              type: "outer",
              ticks: [
                { value: 0 },
                { value: 20 },
                { value: 40 },
                { value: 60 },
                { value: 80 },
                { value: 100 },
              ],
            },
          }}
        />
      </div>

      {/* Legend */}
      <div className="space-y-1 text-base text-gray-700 mt-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <span>Score below 40: This document is generally safe.</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span>Score between 40–60: This document may need caution.</span>
        </div>
        <div className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-red-600" />
          <span>Score above 60: This document is risky and may need legal review.</span>
        </div>
      </div>
    </div>
  );
}
