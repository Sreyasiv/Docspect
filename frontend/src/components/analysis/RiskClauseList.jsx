import React from 'react';
import { Shield } from 'lucide-react';

export default function RiskClauseList({ riskClauses }) {
  if (!riskClauses || riskClauses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">No risk clauses detected.</p>
      </div>
    );
  }

  function getSeverityBadge(severity) {
    if (severity === "High") {
      return <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">CRITICAL</span>;
    }
    if (severity === "Medium") {
      return <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded">CAUTION</span>;
    }
    return <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">NOTE</span>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-gray-800" />
        <h2 className="text-xl font-bold text-gray-900">Detected Risk Clauses</h2>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-3 gap-4">
        {riskClauses.map((clause, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            {/* Row 1 — severity + section reference */}
            <div className="flex items-center justify-between">
              {getSeverityBadge(clause.severity)}
              <span className="text-xs text-gray-400 font-medium">Clause {index + 1}</span>
            </div>

            {/* Row 2 — quoted clause text */}
            <p className="text-sm text-gray-600 italic leading-relaxed border-l-2 border-gray-200 pl-3">
              "{clause.clause_snippet}"
            </p>

            {/* Row 3 — plain English translation box */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Plain-English Translation
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {clause.ai_suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}