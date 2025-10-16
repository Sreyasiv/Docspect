// components/analysis/RiskClauseList.jsx

import React from 'react';
import { Gavel } from 'lucide-react';

export default function RiskClauseList({ riskClauses }) {
  if (!riskClauses || riskClauses.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
          <Gavel className="w-6 h-6 text-[#1D2D5F]" />
          <span>Risk Clauses Found</span>
        </h2>
        <p className="text-gray-600">No significant risk clauses were detected in this document.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-6">
        <Gavel className="w-6 h-6 text-[#1D2D5F]" />
        <span>Detected Risk Clauses ({riskClauses.length})</span>
      </h2>

      <div className="space-y-6">
        {riskClauses.map((clause, index) => (
          <div key={index} className="border-l-4 border-red-600 pl-4 py-1"> {/* The main red left border */}
            
            <h3 className="text-lg font-bold text-red-600 mb-3">
              Clause {index + 1}
            </h3>

            {/* The Clause Text (Snippet) */}
            <p className="text-gray-800 text-base mb-4">
              {clause.clause_snippet || 'No clause snippet provided by the analysis.'}
            </p>

            {/* AI Suggestion Box */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <h4 className="font-bold text-green-700 mb-2">AI Suggestion</h4>
              <p className="text-gray-700 text-sm">
                {clause.ai_suggestion || 'No suggestion provided for this clause.'}
              </p>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}