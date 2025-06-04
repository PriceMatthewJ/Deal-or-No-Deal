import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import CaseGrid from './components/CaseGrid';
import BankerOfferModal from './components/BankerOfferModal';
import ResultsPanel from './components/ResultsPanel';

const DealOrNoDealGame = () => {
  const prizes = [
    0.01, 1, 5, 10, 25, 50, 75, 100, 200, 300, 400, 500, 750, 1000, 5000, 10000, 25000, 50000, 75000, 100000, 200000, 300000, 400000, 500000, 750000, 1000000
  ];
  
  const casesToOpenSequence = [6, 5, 4, 3, 2, 1, 1, 1]; // Standard Deal or No Deal progression
  
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [openedCases, setOpenedCases] = useState([]);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [gamePhase, setGamePhase] = useState('select');
  const [casesToOpen, setCasesToOpen] = useState(6);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [roundNumber, setRoundNumber] = useState(0);
  const [showEVAdvisor, setShowEVAdvisor] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [allOffers, setAllOffers] = useState([]);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  
  useEffect(() => {
    initializeGame();
  }, []);
  
  // Sound effects
  const playSound = async (type) => {
    if (!soundsEnabled) return;
    
    try {
      await Tone.start(); // Required for audio to work
      
      const synth = new Tone.Synth().toDestination();
      
      switch (type) {
        case 'select':
          synth.triggerAttackRelease('C4', '0.2s');
          break;
        case 'open':
          synth.triggerAttackRelease('F4', '0.1s');
          setTimeout(() => synth.triggerAttackRelease('A4', '0.1s'), 100);
          break;
        case 'lowValue':
          synth.triggerAttackRelease('G3', '0.3s');
          break;
        case 'highValue':
          synth.triggerAttackRelease('C5', '0.1s');
          setTimeout(() => synth.triggerAttackRelease('E5', '0.1s'), 80);
          setTimeout(() => synth.triggerAttackRelease('G5', '0.2s'), 160);
          break;
        case 'offer':
          const notes = ['C4', 'E4', 'G4', 'C5'];
          notes.forEach((note, i) => {
            setTimeout(() => synth.triggerAttackRelease(note, '0.1s'), i * 100);
          });
          break;
        case 'deal':
          synth.triggerAttackRelease('C5', '0.3s');
          setTimeout(() => synth.triggerAttackRelease('G5', '0.4s'), 200);
          break;
        case 'noDeal':
          synth.triggerAttackRelease('G3', '0.2s');
          setTimeout(() => synth.triggerAttackRelease('F3', '0.2s'), 150);
          break;
        case 'win':
          const winNotes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6'];
          winNotes.forEach((note, i) => {
            setTimeout(() => synth.triggerAttackRelease(note, '0.2s'), i * 120);
          });
          break;
        case 'lose':
          // Sad descending notes
          const loseNotes = ['C4', 'A3', 'F3', 'D3', 'C3'];
          loseNotes.forEach((note, i) => {
            setTimeout(() => synth.triggerAttackRelease(note, '0.3s'), i * 200);
          });
          break;
        case 'disappointed':
          // Short disappointed sound
          synth.triggerAttackRelease('D3', '0.4s');
          setTimeout(() => synth.triggerAttackRelease('C3', '0.6s'), 300);
          break;
      }
    } catch (error) {
      console.log('Audio not available');
    }
  };
  
  const initializeGame = () => {
    const shuffledPrizes = [...prizes].sort(() => Math.random() - 0.5);
    const newCases = shuffledPrizes.map((prize, index) => ({
      id: index + 1,
      prize: prize,
      isOpened: false
    }));
    
    setCases(newCases);
    setSelectedCase(null);
    setOpenedCases([]);
    setCurrentOffer(null);
    setGamePhase('select');
    setCasesToOpen(6);
    setRoundNumber(0);
    setTotalWinnings(0);
    setGameResult(null);
    setAllOffers([]);
  };
  
  const selectPlayerCase = (caseId) => {
    if (gamePhase !== 'select') return;
    setSelectedCase(caseId);
    setGamePhase('opening');
    playSound('select');
  };
  
  const openCase = (caseId) => {
    if (gamePhase !== 'opening' || caseId === selectedCase) return;
    
    const caseToOpen = cases.find(c => c.id === caseId);
    const isHighValue = caseToOpen && caseToOpen.prize >= 50000;
    
    playSound('open');
    setTimeout(() => {
      playSound(isHighValue ? 'lowValue' : 'highValue'); // Opposite because eliminating high value is bad
    }, 300);
    
    const newOpenedCases = [...openedCases, caseId];
    setOpenedCases(newOpenedCases);
    
    const newCasesToOpen = casesToOpen - 1;
    setCasesToOpen(newCasesToOpen);
    
    if (newCasesToOpen === 0) {
      setTimeout(() => {
        makeOffer(newOpenedCases);
      }, 800);
    }
  };

  const handleCaseClick = (caseId) => {
    if (gamePhase === 'select') selectPlayerCase(caseId);
    else if (gamePhase === 'opening') openCase(caseId);
  };

  const makeOffer = (currentOpenedCases) => {
    const remainingPrizes = cases
      .filter(c => !currentOpenedCases.includes(c.id) && c.id !== selectedCase)
      .map(c => c.prize);
    
    const selectedCasePrize = cases.find(c => c.id === selectedCase)?.prize || 0;
    const allRemainingPrizes = [...remainingPrizes, selectedCasePrize];
    
    if (allRemainingPrizes.length <= 1) {
      const finalPrize = cases.find(c => c.id === selectedCase)?.prize || 0;
      setTotalWinnings(finalPrize);
      const wasGoodResult = finalPrize >= 100000; // Determine if this is a win or loss
      setGameResult({
        type: 'final',
        playerCasePrize: finalPrize,
        acceptedOffer: null
      });
      setGamePhase('won');
      playSound(wasGoodResult ? 'win' : 'lose');
      return;
    }
    
    const expectedValue = allRemainingPrizes.reduce((a, b) => a + b, 0) / allRemainingPrizes.length;
    const bankerMultiplier = 0.7 + (roundNumber * 0.05);
    const offer = Math.round(expectedValue * bankerMultiplier);
    
    setCurrentOffer(offer);
    setAllOffers(prev => [...prev, offer]);
    setGamePhase('offer');
    playSound('offer');
    
    const newRoundNumber = roundNumber + 1;
    setRoundNumber(newRoundNumber);
    if (newRoundNumber < casesToOpenSequence.length) {
      setCasesToOpen(casesToOpenSequence[newRoundNumber]);
    }
  };
  
  const acceptDeal = () => {
    const playerCasePrize = cases.find(c => c.id === selectedCase)?.prize || 0;
    setTotalWinnings(currentOffer);
    setGameResult({
      type: 'deal',
      playerCasePrize: playerCasePrize,
      acceptedOffer: currentOffer
    });
    setGamePhase('won');
    playSound('deal');
    
    // Determine sound based on comprehensive analysis
    setTimeout(() => {
      const tacticalWin = currentOffer > playerCasePrize;
      const goodAmount = currentOffer >= 100000;
      const decentAmount = currentOffer >= 25000;
      
      if (goodAmount && tacticalWin) {
        playSound('win');
      } else if (decentAmount && tacticalWin) {
        playSound('disappointed');
      } else if (tacticalWin) {
        playSound('disappointed');
      } else {
        playSound('lose');
      }
    }, 800);
  };
  
  const rejectDeal = () => {
    const remainingCases = cases.filter(c => !openedCases.includes(c.id) && c.id !== selectedCase);
    
    playSound('noDeal');
    
    if (remainingCases.length === 1) {
      setGamePhase('final');
    } else if (remainingCases.length === 0) {
      const finalPrize = cases.find(c => c.id === selectedCase)?.prize || 0;
      setTotalWinnings(finalPrize);
      const wasGoodResult = finalPrize >= 100000;
      setGameResult({
        type: 'final',
        playerCasePrize: finalPrize,
        acceptedOffer: null
      });
      setGamePhase('won');
      playSound(wasGoodResult ? 'win' : 'lose');
    } else {
      setGamePhase('opening');
    }
  };
  
  const keepCase = () => {
    const finalPrize = cases.find(c => c.id === selectedCase)?.prize || 0;
    const lastCasePrize = cases.find(c => !openedCases.includes(c.id) && c.id !== selectedCase)?.prize || 0;
    setTotalWinnings(finalPrize);
    setGameResult({
      type: 'kept',
      playerCasePrize: finalPrize,
      lastCasePrize: lastCasePrize
    });
    setGamePhase('won');
    
    // Comprehensive sound logic
    const tacticalWin = finalPrize >= lastCasePrize;
    const highestOffer = Math.max(...allOffers, 0);
    const majorMissedOpportunity = highestOffer > finalPrize * 3 && highestOffer >= 50000;
    
    if (finalPrize >= 500000) {
      playSound('win'); // Big win regardless
    } else if (finalPrize >= 100000 && tacticalWin && !majorMissedOpportunity) {
      playSound('win'); // Good result with smart choice
    } else if (finalPrize >= 50000 && tacticalWin) {
      playSound('disappointed'); // Decent but could be better
    } else if (finalPrize >= 10000) {
      playSound(tacticalWin ? 'disappointed' : 'lose');
    } else {
      playSound('lose'); // Poor result
    }
  };
  
  const swapCase = () => {
    const lastCase = cases.find(c => !openedCases.includes(c.id) && c.id !== selectedCase);
    const playerCasePrize = cases.find(c => c.id === selectedCase)?.prize || 0;
    if (lastCase) {
      setTotalWinnings(lastCase.prize);
      setGameResult({
        type: 'swapped',
        playerCasePrize: playerCasePrize,
        lastCasePrize: lastCase.prize
      });
      setGamePhase('won');
      
      // Comprehensive sound logic for swapping
      const tacticalWin = lastCase.prize >= playerCasePrize;
      const highestOffer = Math.max(...allOffers, 0);
      const majorMissedOpportunity = highestOffer > lastCase.prize * 3 && highestOffer >= 50000;
      
      if (lastCase.prize >= 500000) {
        playSound('win'); // Big win regardless
      } else if (lastCase.prize >= 100000 && tacticalWin && !majorMissedOpportunity) {
        playSound('win'); // Good result with smart choice
      } else if (lastCase.prize >= 50000 && tacticalWin) {
        playSound('disappointed'); // Decent but could be better
      } else if (lastCase.prize >= 10000) {
        playSound(tacticalWin ? 'disappointed' : 'lose');
      } else {
        playSound('lose'); // Poor result
      }
    }
  };
  
  const calculateEV = () => {
    const remainingPrizes = cases
      .filter(c => !openedCases.includes(c.id))
      .map(c => c.prize);
    return remainingPrizes.reduce((a, b) => a + b, 0) / remainingPrizes.length;
  };
  
  const getAdvancedEVAdvice = () => {
    if (gamePhase !== 'offer') return null;
    
    const expectedValue = calculateEV();
    const offerRatio = currentOffer / expectedValue;
    const remainingPrizes = cases
      .filter(c => !openedCases.includes(c.id))
      .map(c => c.prize)
      .sort((a, b) => b - a);
    
    const topPrizes = remainingPrizes.filter(p => p >= 100000);
    const lowPrizes = remainingPrizes.filter(p => p <= 1000);
    const midPrizes = remainingPrizes.filter(p => p > 1000 && p < 100000);
    
    const riskLevel = topPrizes.length / remainingPrizes.length;
    const safetyLevel = lowPrizes.length / remainingPrizes.length;
    
    let advice = "";
    let riskAssessment = "";
    let recommendation = "";
    let urgency = "normal";
    
    // Determine risk level
    if (riskLevel >= 0.5) {
      riskAssessment = "🎯 HIGH REWARD POTENTIAL";
      urgency = "high";
    } else if (safetyLevel >= 0.6) {
      riskAssessment = "⚠️ HIGH RISK SITUATION";
      urgency = "high";
    } else {
      riskAssessment = "📊 MODERATE RISK";
    }
    
    // Generate specific advice based on offer ratio and game state
    if (offerRatio >= 1.1) {
      advice = "🔥 EXCELLENT OFFER! Banker is paying above expected value.";
      recommendation = "STRONG TAKE";
    } else if (offerRatio >= 0.95) {
      advice = "✅ FAIR OFFER. Very close to mathematical expectation.";
      recommendation = topPrizes.length >= 2 ? "CONSIDER RISK" : "REASONABLE TAKE";
    } else if (offerRatio >= 0.8) {
      advice = "📈 BELOW AVERAGE. Banker lowballing but not terrible.";
      recommendation = riskLevel >= 0.4 ? "HOLD FOR BETTER" : "BORDERLINE";
    } else if (offerRatio >= 0.6) {
      advice = "📉 POOR OFFER. Significantly below expected value.";
      recommendation = "LIKELY REJECT";
    } else {
      advice = "💸 TERRIBLE OFFER! Banker being very stingy.";
      recommendation = "DEFINITELY REJECT";
    }
    
    // Add specific game situation context
    let situationContext = "";
    if (remainingPrizes.length <= 3) {
      situationContext = "⏰ ENDGAME: Few cases left, decisions become critical!";
    } else if (topPrizes.length === 0) {
      situationContext = "😱 NO BIG PRIZES LEFT: This might be your best shot!";
      urgency = "critical";
    } else if (topPrizes.includes(1000000) && topPrizes.length === 1) {
      situationContext = "💰 MILLION DOLLAR DREAM: The big one is still out there!";
    } else if (lowPrizes.length >= remainingPrizes.length * 0.7) {
      situationContext = "🎲 MOSTLY SMALL PRIZES: Limited upside remaining.";
    }
    
    return {
      advice,
      recommendation,
      riskAssessment,
      situationContext,
      urgency,
      offerRatio: (offerRatio * 100).toFixed(0) + "%",
      topPrizesCount: topPrizes.length,
      expectedValue,
      currentOffer
    };
  };
  
  const formatPrize = (amount) => {
    if (amount < 1) return `${Math.round(amount * 100)}¢`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };
  
  // Comprehensive result evaluation considering multiple factors
  const getResultStyling = () => {
    if (!gameResult) return { bg: 'from-green-600 to-emerald-500', icon: '🎉', message: '' };
    
    const { type, playerCasePrize, acceptedOffer, lastCasePrize } = gameResult;
    const highestOffer = Math.max(...allOffers, 0);
    
    let tacticalSuccess = false;
    let strategicSuccess = false;
    let absoluteSuccess = false;
    let majorMissedOpportunity = false;
    
    // Evaluate tactical success (beat your case or made right final choice)
    if (type === 'deal') {
      tacticalSuccess = acceptedOffer > playerCasePrize;
    } else if (type === 'kept') {
      tacticalSuccess = playerCasePrize >= (lastCasePrize || 0);
    } else if (type === 'swapped') {
      tacticalSuccess = (lastCasePrize || 0) >= playerCasePrize;
    } else { // final
      tacticalSuccess = true; // No choice made, so neutral
    }
    
    // Evaluate strategic success (didn't miss much better opportunities)
    if (highestOffer > 0) {
      const missedAmount = highestOffer - totalWinnings;
      const missedRatio = missedAmount / Math.max(totalWinnings, 1);
      majorMissedOpportunity = missedAmount >= 50000 && missedRatio >= 2; // Missed 2x+ what you got AND significant amount
      strategicSuccess = missedAmount < Math.max(25000, totalWinnings * 0.5); // Didn't miss more than 50% or $25K
    } else {
      strategicSuccess = true;
    }
    
    // Evaluate absolute success (good final amount)
    absoluteSuccess = totalWinnings >= 100000;
    
    // Determine overall result category
    if (absoluteSuccess && strategicSuccess && tacticalSuccess) {
      // Perfect game
      return {
        bg: 'from-green-500 to-emerald-400',
        icon: '🏆',
        text: 'text-white',
        message: 'PERFECT GAME!'
      };
    } else if (absoluteSuccess && tacticalSuccess) {
      // Great result with good decisions
      return {
        bg: 'from-green-600 to-emerald-500',
        icon: '🎉',
        text: 'text-white',
        message: strategicSuccess ? 'EXCELLENT RESULT!' : 'GREAT WIN, but you left money on the table!'
      };
    } else if (totalWinnings >= 50000 && tacticalSuccess && strategicSuccess) {
      // Solid result with smart play
      return {
        bg: 'from-blue-600 to-cyan-500',
        icon: '🎯',
        text: 'text-white',
        message: 'SMART PLAY!'
      };
    } else if (totalWinnings >= 25000 && tacticalSuccess) {
      // Decent result, good tactics
      return {
        bg: 'from-yellow-600 to-orange-500',
        icon: '👍',
        text: 'text-white',
        message: majorMissedOpportunity ? 'Good tactics, but missed the big one!' : 'Decent result!'
      };
    } else if (tacticalSuccess && totalWinnings >= 5000) {
      // Small win but right decisions
      return {
        bg: 'from-yellow-700 to-orange-600',
        icon: '😊',
        text: 'text-white',
        message: 'Right choice, modest reward!'
      };
    } else if (majorMissedOpportunity && totalWinnings < 10000) {
      // Major strategic failure
      return {
        bg: 'from-red-700 to-red-800',
        icon: '💸',
        text: 'text-white',
        message: 'OUCH! That one stings...'
      };
    } else if (!tacticalSuccess && totalWinnings < 25000) {
      // Poor tactical and strategic result
      return {
        bg: 'from-red-600 to-red-700',
        icon: '😞',
        text: 'text-white',
        message: 'Tough break!'
      };
    } else if (totalWinnings < 1000) {
      // Very poor result
      return {
        bg: 'from-gray-700 to-gray-800',
        icon: '😬',
        text: 'text-white',
        message: 'Better luck next time!'
      };
    } else {
      // Mixed bag - some success, some failure
      return {
        bg: 'from-purple-600 to-indigo-600',
        icon: '🤷',
        text: 'text-white',
        message: 'Mixed results!'
      };
    }
  };
  
  const remainingPrizes = cases
    .filter(c => !openedCases.includes(c.id))
    .map(c => c.prize)
    .sort((a, b) => b - a);

  const expectedValue = calculateEV();
  const highestOffer = Math.max(...allOffers, 0);
  const advancedAdvice = getAdvancedEVAdvice();
  const resultStyling = getResultStyling();

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 min-h-screen text-white">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-amber-300 mb-2 drop-shadow-lg">DEAL OR NO DEAL</h1>
        <ResultsPanel
          show={gamePhase === 'won'}
          resultStyling={resultStyling}
          totalWinnings={totalWinnings}
          formatPrize={formatPrize}
          gameResult={gameResult}
          selectedCase={selectedCase}
          highestOffer={highestOffer}
        />
      </div>
      
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowEVAdvisor(!showEVAdvisor)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-sm transition-colors"
        >
          {showEVAdvisor ? '📊 Hide' : '🤖 Show'} EV Advisor
        </button>
      </div>
      
      {showEVAdvisor && gamePhase === 'offer' && advancedAdvice && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          advancedAdvice.urgency === 'critical' ? 'bg-red-900 border-red-500' :
          advancedAdvice.urgency === 'high' ? 'bg-yellow-900 border-yellow-500' :
          'bg-cyan-800 border-cyan-600'
        }`}>
          <div className="space-y-2 text-sm">
            <div className="font-bold text-lg">{advancedAdvice.riskAssessment}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div><strong>Expected Value:</strong> {formatPrize(advancedAdvice.expectedValue)}</div>
                <div><strong>Banker Offer:</strong> {formatPrize(advancedAdvice.currentOffer)}</div>
                <div><strong>Offer Ratio:</strong> {advancedAdvice.offerRatio} of EV</div>
              </div>
              <div>
                <div><strong>Big Prizes Left:</strong> {advancedAdvice.topPrizesCount}</div>
                <div><strong>Cases Remaining:</strong> {remainingPrizes.length}</div>
              </div>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="font-bold">{advancedAdvice.advice}</div>
              <div className={`font-bold text-lg ${
                advancedAdvice.recommendation.includes('TAKE') || advancedAdvice.recommendation.includes('REASONABLE') ? 'text-green-300' :
                advancedAdvice.recommendation.includes('REJECT') ? 'text-red-300' :
                'text-yellow-300'
              }`}>
                💡 RECOMMENDATION: {advancedAdvice.recommendation}
              </div>
              {advancedAdvice.situationContext && (
                <div className="mt-1 text-orange-200 font-semibold">{advancedAdvice.situationContext}</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {gamePhase === 'select' && (
        <div className="text-center mb-6">
          <h2 className="text-xl mb-4 text-amber-200">Choose your case!</h2>
        </div>
      )}
      
      {gamePhase === 'opening' && (
        <div className="text-center mb-6">
          <h2 className="text-xl mb-2 text-amber-200">Open {casesToOpen} case{casesToOpen !== 1 ? 's' : ''}</h2>
          <p className="text-sm text-purple-200">Your case is #{selectedCase}</p>
        </div>
      )}
      
      {gamePhase === 'offer' && (
        <BankerOfferModal
          currentOffer={currentOffer}
          acceptDeal={acceptDeal}
          rejectDeal={rejectDeal}
          formatPrize={formatPrize}
        />
      )}
      
      {gamePhase === 'final' && totalWinnings === 0 && (
        <div className="text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl shadow-lg border-2 border-purple-400">
          <h2 className="text-xl font-bold mb-2 text-white">🎯 FINAL DECISION</h2>
          <p className="mb-4 text-purple-100">Keep your case #{selectedCase} or swap with the last remaining case?</p>
          <div className="space-x-4">
            <button
              onClick={keepCase}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg transition-all hover:scale-105"
            >
              KEEP CASE #{selectedCase}
            </button>
            <button
              onClick={swapCase}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold shadow-lg transition-all hover:scale-105"
            >
              SWAP CASES
            </button>
          </div>
        </div>
      )}
      
      <CaseGrid
        cases={cases}
        selectedCase={selectedCase}
        openedCases={openedCases}
        onCaseClick={handleCaseClick}
        formatPrize={formatPrize}
      />
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="font-bold mb-2 text-emerald-300">💚 Remaining Prizes:</h3>
          <div className="grid grid-cols-2 gap-1">
            {remainingPrizes.map((prize, index) => (
              <div key={index} className="bg-emerald-800 px-2 py-1 rounded text-center border border-emerald-600">
                {formatPrize(prize)}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-2 text-red-300">💔 Eliminated Prizes:</h3>
          <div className="grid grid-cols-2 gap-1">
            {cases
              .filter(c => openedCases.includes(c.id))
              .map((case_item) => (
                <div key={case_item.id} className="bg-red-800 px-2 py-1 rounded text-center border border-red-600">
                  {formatPrize(case_item.prize)}
                </div>
              ))}
          </div>
        </div>
      </div>
      
      {(gamePhase === 'won' || gamePhase === 'final') && (
        <div className="text-center mt-6">
          <button
            onClick={initializeGame}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold shadow-lg transition-all hover:scale-105"
          >
            🎮 NEW GAME
          </button>
        </div>
      )}
    </div>
  );
};

export default DealOrNoDealGame;
