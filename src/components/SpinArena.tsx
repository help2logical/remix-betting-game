import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { audioSynthesizer } from '../utils/audio';
import { GAME_CONFIGS } from '../config';
import { Zap, RotateCcw } from 'lucide-react';

interface SpinArenaProps {
  onSpinComplete?: () => void;
}

export const SpinArena: React.FC<SpinArenaProps> = ({ onSpinComplete }) => {
  const { currentBets, recordSpin, gameStats } = useGame();
  const { currentUser, userRole } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastWinnerNumber, setLastWinnerNumber] = useState<number | null>(null);
  const [lastWinnerAmount, setLastWinnerAmount] = useState<number | null>(null);

  const spinInterval = GAME_CONFIGS.SPIN_INTERVALS[userRole as keyof typeof GAME_CONFIGS.SPIN_INTERVALS] || GAME_CONFIGS.SPIN_INTERVALS.USER;

  // Auto spin countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      if (countdown <= 3) {
        audioSynthesizer.tick();
      }
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      handleSpin();
      setCountdown(spinInterval / 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSpin = () => {
    if (!currentUser || currentBets.length === 0) return;

    setIsSpinning(true);
    audioSynthesizer.beep(800, 200);

    // Simulate spinning animation
    setTimeout(() => {
      const winningNumber = Math.floor(Math.random() * 9) + 1;
      const winningBets = currentBets.filter((bet) => bet.number === winningNumber);
      const totalWinnings = winningBets.reduce((sum, bet) => sum + bet.amount * 2, 0);

      if (totalWinnings > 0) {
        audioSynthesizer.win();
        setLastWinnerNumber(winningNumber);
        setLastWinnerAmount(totalWinnings);
      } else {
        audioSynthesizer.lose();
      }

      recordSpin({
        number: winningNumber,
        timestamp: Date.now(),
        winningBets,
        totalWinnings,
      });

      setIsSpinning(false);
      onSpinComplete?.();
    }, 1500);
  };

  const toggleAutoSpin = () => {
    if (countdown === null) {
      setCountdown(spinInterval / 1000);
    } else {
      setCountdown(null);
    }
  };

  const hotNumbers = gameStats.hotNumbers.slice(0, 3);
  const coldNumbers = gameStats.coldNumbers.slice(0, 3);

  if (!currentUser) {
    return (
      <div className="card-glass p-6 rounded-lg text-center text-slate-400">
        Please login to spin
      </div>
    );
  }

  return (
    <div className="card-glass p-6 rounded-lg">
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Zap size={20} />
        Spin Arena
      </h3>

      {/* Status Message */}
      <div className="text-center mb-6">
        {currentBets.length === 0 ? (
          <p className="text-slate-400">Place bets to spin</p>
        ) : isSpinning ? (
          <p className="text-yellow-400 font-semibold animate-pulse">🎰 SPINNING...</p>
        ) : lastWinnerNumber !== null ? (
          <div>
            <p className="text-sm text-slate-400 mb-2">Last Winner</p>
            <p className="text-3xl font-bold text-green-400">{lastWinnerNumber}</p>
            {lastWinnerAmount !== null && lastWinnerAmount > 0 && (
              <p className="text-lg text-green-300 mt-2">+${lastWinnerAmount.toFixed(2)}</p>
            )}
          </div>
        ) : (
          <p className="text-slate-400">Ready to spin</p>
        )}
      </div>

      {/* Countdown Timer */}
      {countdown !== null && (
        <div className="text-center mb-4">
          <p className="text-sm text-slate-400 mb-2">Auto-spin countdown</p>
          <p className={`text-2xl font-bold ${
            countdown <= 3 ? 'text-red-400 animate-pulse' : 'text-blue-400'
          }`}>
            {countdown}s
          </p>
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={currentBets.length === 0 || isSpinning}
        className="w-full btn-primary mb-3 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg py-3"
      >
        {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN NOW'}
      </button>

      {/* Auto-Spin Toggle */}
      <button
        onClick={toggleAutoSpin}
        disabled={currentBets.length === 0 || isSpinning}
        className={`w-full mb-4 py-2 rounded font-medium transition-colors ${
          countdown !== null
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      >
        <RotateCcw size={16} />
        {countdown !== null ? 'Stop Auto-Spin' : 'Start Auto-Spin'}
      </button>

      {/* Hot & Cold Numbers */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="p-3 bg-orange-900/30 border border-orange-600/50 rounded">
          <p className="text-orange-400 font-semibold mb-1">🔥 Hot Numbers</p>
          <div className="flex gap-2">
            {hotNumbers.length > 0 ? (
              hotNumbers.map((num) => (
                <span key={num} className="px-2 py-1 bg-orange-600 rounded text-white text-xs font-bold">
                  {num}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-xs">None yet</span>
            )}
          </div>
        </div>

        <div className="p-3 bg-blue-900/30 border border-blue-600/50 rounded">
          <p className="text-blue-400 font-semibold mb-1">❄️ Cold Numbers</p>
          <div className="flex gap-2">
            {coldNumbers.length > 0 ? (
              coldNumbers.map((num) => (
                <span key={num} className="px-2 py-1 bg-blue-600 rounded text-white text-xs font-bold">
                  {num}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-xs">None yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 bg-slate-700/50 rounded">
          <p className="text-slate-400 text-xs">Total Spins</p>
          <p className="text-white font-semibold">{gameStats.totalSpins}</p>
        </div>
        <div className="p-2 bg-slate-700/50 rounded">
          <p className="text-slate-400 text-xs">Net Winnings</p>
          <p className={gameStats.totalWinnings >= gameStats.totalLosses ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
            ${(gameStats.totalWinnings - gameStats.totalLosses).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
