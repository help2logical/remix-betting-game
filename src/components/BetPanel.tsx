import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { audioSynthesizer } from '../utils/audio';
import { GAME_CONFIGS } from '../config';
import { DollarSign, X } from 'lucide-react';

interface BetPanelProps {
  onBetPlaced?: () => void;
}

export const BetPanel: React.FC<BetPanelProps> = ({ onBetPlaced }) => {
  const { currentBets, placeBet, clearBets } = useGame();
  const { currentUser } = useAuth();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);

  if (!currentUser) {
    return (
      <div className="card-glass p-6 rounded-lg text-center text-slate-400">
        Please login to place bets
      </div>
    );
  }

  const totalBetAmount = currentBets.reduce((sum, bet) => sum + bet.amount, 0);
  const remainingBalance = currentUser.balance - totalBetAmount;

  const handlePlaceBet = () => {
    if (!selectedNumber) {
      audioSynthesizer.error();
      return;
    }

    if (betAmount <= 0) {
      audioSynthesizer.error();
      return;
    }

    if (betAmount > remainingBalance) {
      audioSynthesizer.error();
      return;
    }

    audioSynthesizer.beep();
    placeBet(selectedNumber, betAmount);
    onBetPlaced?.();
    setBetAmount(10);
  };

  const handleQuickBet = (amount: number) => {
    if (!selectedNumber || amount > remainingBalance) {
      audioSynthesizer.error();
      return;
    }
    audioSynthesizer.beep();
    placeBet(selectedNumber, amount);
    onBetPlaced?.();
  };

  return (
    <div className="card-glass p-6 rounded-lg">
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <DollarSign size={20} />
        Place Your Bets
      </h3>

      {/* Numbers Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {GAME_CONFIGS.NUMBERS.map((num) => (
          <button
            key={num}
            onClick={() => {
              audioSynthesizer.beep(600, 100);
              setSelectedNumber(selectedNumber === num ? null : num);
            }}
            className={`number-tile ${
              selectedNumber === num ? 'active' : ''
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Bet Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Bet Amount: ${betAmount.toFixed(2)}
        </label>
        <input
          type="range"
          min="1"
          max={Math.floor(remainingBalance)}
          value={betAmount}
          onChange={(e) => setBetAmount(parseInt(e.target.value))}
          className="w-full"
        />
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Math.min(Math.max(1, parseInt(e.target.value) || 1), Math.floor(remainingBalance)))}
          className="w-full mt-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          min="1"
          max={Math.floor(remainingBalance)}
        />
      </div>

      {/* Quick Bet Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[10, 50, 100].map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickBet(amount)}
            disabled={!selectedNumber || amount > remainingBalance}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +${amount}
          </button>
        ))}
      </div>

      {/* Current Bets */}
      <div className="bg-slate-700/30 p-3 rounded mb-4 max-h-32 overflow-y-auto">
        <p className="text-sm font-medium text-slate-300 mb-2">Your Bets ({currentBets.length}):</p>
        {currentBets.length === 0 ? (
          <p className="text-xs text-slate-400">No bets placed yet</p>
        ) : (
          currentBets.map((bet, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs text-slate-200 py-1">
              <span>Number {bet.number}</span>
              <span>${bet.amount.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="p-2 bg-slate-700/50 rounded">
          <p className="text-slate-400 text-xs">Total Bet</p>
          <p className="text-green-400 font-semibold">${totalBetAmount.toFixed(2)}</p>
        </div>
        <div className="p-2 bg-slate-700/50 rounded">
          <p className="text-slate-400 text-xs">Remaining</p>
          <p className={remainingBalance >= 0 ? 'text-blue-400 font-semibold' : 'text-red-400 font-semibold'}>
            ${remainingBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handlePlaceBet}
          disabled={!selectedNumber || betAmount <= 0 || betAmount > remainingBalance}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Place Bet
        </button>
        <button
          onClick={clearBets}
          disabled={currentBets.length === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <X size={16} />
          Clear All
        </button>
      </div>
    </div>
  );
};
