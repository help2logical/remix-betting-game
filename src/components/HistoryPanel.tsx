import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp } from 'lucide-react';
import { SpinResult, DiceResult } from '../types';

interface HistoryPanelProps {
  activeTab?: 'spins' | 'dice';
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ activeTab = 'spins' }) => {
  const { gameStats } = useGame();
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'spins' | 'dice'>(activeTab);

  if (!currentUser) {
    return (
      <div className="card-glass p-6 rounded-lg text-center text-slate-400">
        Please login to view history
      </div>
    );
  }

  const recentSpins = gameStats.recentSpins || [];
  const recentDice = gameStats.recentDiceRolls || [];

  // De-duplicate using Set to prevent duplicates
  const uniqueSpins = Array.from(
    new Map(
      recentSpins.map((spin) => [spin.timestamp, spin])
    ).values()
  );

  const uniqueDice = Array.from(
    new Map(
      recentDice.map((dice) => [dice.timestamp, dice])
    ).values()
  );

  return (
    <div className="card-glass p-6 rounded-lg">
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <BarChart3 size={20} />
        Game History
      </h3>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-slate-700">
        <button
          onClick={() => setSelectedTab('spins')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === 'spins'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Spins ({uniqueSpins.length})
        </button>
        <button
          onClick={() => setSelectedTab('dice')}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedTab === 'dice'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Dice Rolls ({uniqueDice.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {selectedTab === 'spins' ? (
          uniqueSpins.length === 0 ? (
            <p className="text-slate-400 text-sm p-4 text-center">No spins yet</p>
          ) : (
            uniqueSpins.map((spin, idx) => (
              <div
                key={`spin-${spin.timestamp}-${idx}`}
                className={`p-3 rounded text-sm border ${
                  spin.totalWinnings > 0
                    ? 'bg-green-900/30 border-green-600/50'
                    : 'bg-slate-700/30 border-slate-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{spin.number}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(spin.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {spin.totalWinnings > 0 ? (
                  <p className="text-green-400 text-sm mt-1">✓ Won: +${spin.totalWinnings.toFixed(2)}</p>
                ) : (
                  <p className="text-red-400 text-sm mt-1">✗ No wins</p>
                )}
              </div>
            ))
          )
        ) : (
          uniqueDice.length === 0 ? (
            <p className="text-slate-400 text-sm p-4 text-center">No dice rolls yet</p>
          ) : (
            uniqueDice.map((dice, idx) => (
              <div
                key={`dice-${dice.timestamp}-${idx}`}
                className={`p-3 rounded text-sm border ${
                  dice.result
                    ? 'bg-green-900/30 border-green-600/50'
                    : 'bg-red-900/30 border-red-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{dice.type.toUpperCase()}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(dice.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-white">
                  {dice.result ? '✓' : '✗'} {dice.value}
                </p>
              </div>
            ))
          )
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-700 pt-3">
        <div className="p-2 bg-slate-700/30 rounded">
          <p className="text-slate-400">Total Spins</p>
          <p className="text-white font-semibold">{gameStats.totalSpins}</p>
        </div>
        <div className="p-2 bg-slate-700/30 rounded">
          <p className="text-slate-400">Win Rate</p>
          <p className="text-white font-semibold">
            {gameStats.totalSpins > 0
              ? ((gameStats.recentSpins.filter((s) => s.totalWinnings > 0).length / gameStats.totalSpins) * 100).toFixed(
                  1
                )
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
};
