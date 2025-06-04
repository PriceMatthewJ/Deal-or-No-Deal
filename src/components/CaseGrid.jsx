import React from 'react';

const CaseGrid = ({ cases, selectedCase, openedCases, gamePhase, onCaseClick, formatPrize }) => (
  <div className="grid grid-cols-6 gap-2 mb-6">
    {cases.map((caseItem) => (
      <div key={caseItem.id} className="relative">
        <button
          onClick={() => onCaseClick(caseItem.id)}
          disabled={openedCases.includes(caseItem.id) || caseItem.id === selectedCase}
          className={`w-full h-16 rounded-lg font-bold text-sm transition-all ${
            caseItem.id === selectedCase
              ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black border-2 border-amber-500 shadow-lg'
              : openedCases.includes(caseItem.id)
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 cursor-pointer shadow-md hover:shadow-lg hover:scale-105'
          }`}
        >
          {openedCases.includes(caseItem.id) ? formatPrize(caseItem.prize) : `CASE ${caseItem.id}`}
        </button>
        {caseItem.id === selectedCase && (
          <div className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs px-2 py-1 rounded-full font-bold">
            YOURS
          </div>
        )}
      </div>
    ))}
  </div>
);

export default CaseGrid;
