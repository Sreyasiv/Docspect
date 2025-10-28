

import React from 'react';
import { Info } from 'lucide-react';

export default function LLMDisclaimerBanner({ warnings }) {
  if (!warnings || !warnings.length) return null;

  return (
    <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md mb-4">
      <div className="flex items-start text-sm">
        <Info className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
        <div>
          <p className="font-semibold">
            LLM-Generated Content — Verify before use.
          </p>
          <ul className="list-disc ml-5 mt-1 space-y-0.5">
            {warnings.map((warning, index) => (
              <li key={index} className="text-xs">{warning}</li>
            ))}
          </ul>
          <p className="text-xs italic mt-1 text-red-600">
            Final responsibility rests with the user.
          </p>
        </div>
      </div>
    </div>
  );
}
