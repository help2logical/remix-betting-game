import React, { createContext, useContext, useState } from 'react';
import { Bet, SpinResult, DiceResult, GameStats, GameContextType } from '../types';
import { STORAGE_KEYS } from '../config';

const GameContext = createContext<GameContextType | undefined>(undefined);

const defaultGameStats: GameStats = {
  totalSpins: 0,
  totalBets: 0,
  totalWinnings: 0,
  totalLosses: 0,
  hotNumbers: [],
  coldNumbers: [],
  recentSpins: [],
  recentDiceRolls: [],
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : defaultGameStats;
  });

  const [currentBets, setCurrentBets] = useState<Bet[]>([]);

  const placeBet = (number: number, amount: number) => {
    setCurrentBets((prev) => {
      const existing = prev.find((b) => b.number === number);
      if (existing) {
        return prev.map((b) =>
          b.number === number ? { ...b, amount: b.amount + amount } : b
        );
      }
      return [...prev, { number, amount }];
    });

    setGameStats((prev) => {
      const updated = {
        ...prev,
        totalBets: prev.totalBets + amount,
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
      return updated;
    });
  };

  const clearBets = () => {
    setCurrentBets([]);
  };

  const recordSpin = (result: SpinResult) => {
    const numberFrequency = new Map<number, number>();
    const allSpins = [result, ...gameStats.recentSpins];

    allSpins.forEach((spin) => {
      numberFrequency.set(
        spin.number,
        (numberFrequency.get(spin.number) || 0) + 1
      );
    });

    const sorted = Array.from(numberFrequency.entries()).sort((a, b) => b[1] - a[1]);
    const hotNumbers = sorted.slice(0, 3).map((e) => e[0]);
    const coldNumbers = sorted.slice(-3).map((e) => e[0]).reverse();

    setGameStats((prev) => {
      const betTotal = currentBets.reduce((sum, b) => sum + b.amount, 0);
      const updated = {
        ...prev,
        totalSpins: prev.totalSpins + 1,
        totalWinnings: prev.totalWinnings + result.totalWinnings,
        totalLosses: prev.totalLosses + (betTotal - result.totalWinnings),
        hotNumbers,
        coldNumbers,
        recentSpins: [result, ...prev.recentSpins.slice(0, 49)],
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
      return updated;
    });

    clearBets();
  };

  const recordDiceRoll = (result: DiceResult) => {
    setGameStats((prev) => {
      const updated = {
        ...prev,
        recentDiceRolls: [result, ...prev.recentDiceRolls.slice(0, 49)],
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
      return updated;
    });
  };

  const getHotNumbers = (): number[] => gameStats.hotNumbers;
  const getColdNumbers = (): number[] => gameStats.coldNumbers;

  const value: GameContextType = {
    gameStats,
    currentBets,
    placeBet,
    clearBets,
    recordSpin,
    recordDiceRoll,
    getHotNumbers,
    getColdNumbers,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
