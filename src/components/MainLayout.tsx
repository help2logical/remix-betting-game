import React, { useState } from 'react';
import { AuthPanel } from './AuthPanel';
import { BetPanel } from './BetPanel';
import { SpinArena } from './SpinArena';
import { DicePanel } from './DicePanel';
import { AdminConsole } from './AdminConsole';
import { HistoryPanel } from './HistoryPanel';
import { TokenTransferPanel } from './TokenTransferPanel';
import { StatsPanel } from './StatsPanel';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../config';

export const MainLayout: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [betRefresh, setBetRefresh] = useState(0);

  const isAdmin = userRole === ROLES.ADMIN || userRole === ROLES.MASTER_ADMIN;
  const isMasterAdmin = userRole === ROLES.MASTER_ADMIN;

  // Responsive grid: 2 columns for users, 3 for admins
  const gridClass = isAdmin ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">🎰 REMIX</h1>
        <p className="text-slate-400">Number Betting Game & Access Control Terminal</p>
      </div>

      {/* Main Grid */}
      <div className={`grid ${gridClass} gap-6 auto-rows-max`}>
        {/* Column 1: Auth & Betting */}
        <div className="space-y-6">
          <AuthPanel />
          {currentUser && <BetPanel onBetPlaced={() => setBetRefresh(r => r + 1)} />}
        </div>

        {/* Column 2: Spinning & Stats */}
        <div className="space-y-6">
          {currentUser && <SpinArena onSpinComplete={() => setBetRefresh(r => r + 1)} />}
          {currentUser && <DicePanel />}
          {currentUser && <StatsPanel />}
        </div>

        {/* Column 3: Admin & History (only for admins) */}
        {isAdmin && (
          <div className="space-y-6">
            <AdminConsole />
            {currentUser && <HistoryPanel />}
            {currentUser && <TokenTransferPanel />}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 p-4 text-center text-slate-500 text-sm border-t border-slate-700">
        <p>🎮 Remix Betting Game v1.0 | Built with React, Vite & Tailwind CSS</p>
        <p className="mt-2 text-xs">This is a simulation environment for educational purposes</p>
      </div>
    </div>
  );
};
