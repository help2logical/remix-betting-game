import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { ROLES } from '../config';
import { TrendingUp, Wallet, Target } from 'lucide-react';

export const StatsPanel: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const { gameStats } = useGame();

  if (!currentUser) {
    return (
      <div className="card-glass p-6 rounded-lg text-center text-slate-400">
        Please login to view stats
      </div>
    );
  }

  const netProfit = gameStats.totalWinnings - gameStats.totalLosses;
  const winRate = gameStats.totalSpins > 0
    ? ((gameStats.recentSpins.filter((s) => s.totalWinnings > 0).length / gameStats.totalSpins) * 100).toFixed(1)
    : '0';

  return (
    <div className="card-glass p-6 rounded-lg">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        Player Statistics
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Current Balance */}
        <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
          <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
            <Wallet size={14} />
            Current Balance
          </p>
          <p className="text-2xl font-bold text-green-400">${currentUser.balance.toFixed(2)}</p>
        </div>

        {/* Net Profit/Loss */}
        <div className="p-3 bg-slate-700/50 rounded border border-slate-600">
          <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
            <Target size={14} />
            Net Profit/Loss
          </p>
          <p className={`text-2xl font-bold ${
            netProfit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {netProfit >= 0 ? '+' : ''} ${netProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
          <span className="text-slate-400 text-sm">Total Spins</span>
          <span className="text-white font-semibold">{gameStats.totalSpins}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
          <span className="text-slate-400 text-sm">Win Rate</span>
          <span className="text-blue-400 font-semibold">{winRate}%</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
          <span className="text-slate-400 text-sm">Total Winnings</span>
          <span className="text-green-400 font-semibold">${gameStats.totalWinnings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
          <span className="text-slate-400 text-sm">Total Losses</span>
          <span className="text-red-400 font-semibold">${gameStats.totalLosses.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
          <span className="text-slate-400 text-sm">Total Bets</span>
          <span className="text-slate-300 font-semibold">${gameStats.totalBets.toFixed(2)}</span>
        </div>
      </div>

      {/* Role Badge */}
      <div className="p-3 bg-slate-700/50 rounded border border-slate-600 text-center">
        <p className="text-slate-400 text-xs mb-1">Account Role</p>
        <p className={`text-sm font-semibold uppercase ${
          userRole === ROLES.MASTER_ADMIN ? 'text-red-400' :
          userRole === ROLES.ADMIN ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {userRole === ROLES.MASTER_ADMIN && '👑 Master Admin'}
          {userRole === ROLES.ADMIN && '⚙️ Admin'}
          {userRole === ROLES.USER && '👤 User'}
        </p>
      </div>
    </div>
  );
};
