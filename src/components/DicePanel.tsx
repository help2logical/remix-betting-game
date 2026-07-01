import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { DiceIcon, TrendingUp } from 'lucide-react';

export const DicePanel: React.FC = () => {
  const { recordDiceRoll } = useGame();
  const [diceType, setDiceType] = useState<'odd' | 'even' | 'sum'>('odd');
  const [betAmount, setBetAmount] = useState(10);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<{
    type: string;
    value: string;
    result: boolean;
    amount: number;
  } | null>(null);

  const handleRoll = () => {
    setIsRolling(true);

    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const sum = dice1 + dice2;

      let result = false;
      let value = '';

      if (diceType === 'odd') {
        result = sum % 2 === 1;
        value = result ? 'ODD ✓' : 'EVEN ✗';
      } else if (diceType === 'even') {
        result = sum % 2 === 0;
        value = result ? 'EVEN ✓' : 'ODD ✗';
      } else {
        result = sum >= 7;
        value = result ? `${sum} ≥ 7 ✓` : `${sum} < 7 ✗`;
      }

      recordDiceRoll({
        type: diceType,
        value: sum.toString(),
        result,
        timestamp: Date.now(),
        amount: betAmount,
      });

      setLastResult({
        type: `${dice1} + ${dice2}`,
        value,
        result,
        amount: result ? betAmount * 2 : 0,
      });

      setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="card-glass p-6 rounded-lg">
      <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
        <DiceIcon size={20} />
        Dice Roller
      </h3>

      <div className="space-y-4">
        {/* Dice Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Choose Strategy
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['odd', 'even', 'sum'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setDiceType(type)}
                className={`py-2 rounded font-medium transition-colors ${
                  diceType === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {type === 'sum' ? '≥7' : type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bet Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Bet Amount: ${betAmount}
          </label>
          <input
            type="range"
            min="1"
            max="500"
            value={betAmount}
            onChange={(e) => setBetAmount(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className={`p-3 rounded text-center ${
            lastResult.result ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'
          }`}>
            <p className="text-sm text-slate-400 mb-1">Last Roll: {lastResult.type}</p>
            <p className={`text-lg font-bold ${
              lastResult.result ? 'text-green-400' : 'text-red-400'
            }`}>
              {lastResult.value}
            </p>
            {lastResult.amount > 0 && (
              <p className="text-green-300 text-sm mt-1">Won: +${lastResult.amount.toFixed(2)}</p>
            )}
          </div>
        )}

        {/* Roll Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-bold py-2"
        >
          {isRolling ? '🎲 ROLLING...' : '🎲 ROLL DICE'}
        </button>
      </div>
    </div>
  );
};
