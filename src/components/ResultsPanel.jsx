import React from 'react';

const ResultsPanel = ({ show, resultStyling, totalWinnings, formatPrize, gameResult, selectedCase, highestOffer }) => {
  if (!show) return null;
  return (
    <div className={`bg-gradient-to-r ${resultStyling.bg} p-4 rounded-xl shadow-lg`}>
      <div className={`text-2xl font-bold ${resultStyling.text} mb-2`}>
        {resultStyling.icon} Final Result: {formatPrize(totalWinnings)}! {resultStyling.icon}
      </div>
      {resultStyling.message && (
        <div className="text-lg font-bold mb-2 text-yellow-200">{resultStyling.message}</div>
      )}
      {gameResult && (
        <div className="text-sm space-y-1">
          <div>Your case #{selectedCase} contained: <span className="font-bold">{formatPrize(gameResult.playerCasePrize)}</span></div>
          {gameResult.type === 'deal' && (
            <div className={`font-bold ${gameResult.acceptedOffer > gameResult.playerCasePrize ? 'text-green-200' : 'text-red-200'}`}>{gameResult.acceptedOffer > gameResult.playerCasePrize ? '✅ Good deal!' : '❌ You could have had more!'}</div>
          )}
          {gameResult.type === 'swapped' && (
            <div>You swapped for: <span className="font-bold">{formatPrize(gameResult.lastCasePrize)}</span></div>
          )}
          {gameResult.type === 'kept' && gameResult.lastCasePrize && (
            <div>The other case had: <span className="font-bold">{formatPrize(gameResult.lastCasePrize)}</span></div>
          )}
          {highestOffer > totalWinnings && (
            <div className="text-yellow-200">💡 Highest banker offer was: <span className="font-bold">{formatPrize(highestOffer)}</span></div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
