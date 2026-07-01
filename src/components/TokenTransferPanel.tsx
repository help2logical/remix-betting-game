import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { audioSynthesizer } from '../utils/audio';
import { STORAGE_KEYS, ROLES } from '../config';
import { Send, AlertCircle, RefreshCw } from 'lucide-react';
import { User, TokenTransfer } from '../types';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const TokenTransferPanel: React.FC = () => {
  const { currentUser, userRole, updateUserBalance } = useAuth();
  const [recipientUsername, setRecipientUsername] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transfers, setTransfers] = useState<TokenTransfer[]>(() => {
    return JSON.parse(localStorage.getItem('btg_transfers_v1') || '[]');
  });

  if (!currentUser) {
    return (
      <div className="card-glass p-6 rounded-lg text-center text-slate-400">
        Please login to transfer tokens
      </div>
    );
  }

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    audioSynthesizer.beep(type === 'error' ? 200 : 800);
    setAlerts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 2000);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientUsername || transferAmount <= 0) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    if (transferAmount > currentUser.balance) {
      showAlert('error', 'Insufficient balance');
      return;
    }

    setIsLoading(true);

    try {
      const accounts: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
      const recipient = accounts.find((u) => u.username === recipientUsername);

      if (!recipient) {
        showAlert('error', 'Recipient not found');
        return;
      }

      if (recipient.id === currentUser.id) {
        showAlert('error', 'Cannot transfer to yourself');
        return;
      }

      // Update balances
      const senderNewBalance = currentUser.balance - transferAmount;
      const recipientNewBalance = recipient.balance + transferAmount;

      await updateUserBalance(currentUser.id, senderNewBalance);
      await updateUserBalance(recipient.id, recipientNewBalance);

      // Record transfer
      const newTransfer: TokenTransfer = {
        id: Date.now().toString(),
        fromUser: currentUser.username,
        toUser: recipientUsername,
        amount: transferAmount,
        timestamp: Date.now(),
        status: 'completed',
      };

      const updatedTransfers = [newTransfer, ...transfers.slice(0, 49)];
      setTransfers(updatedTransfers);
      localStorage.setItem('btg_transfers_v1', JSON.stringify(updatedTransfers));

      audioSynthesizer.win();
      showAlert('success', `Transferred $${transferAmount.toFixed(2)} to ${recipientUsername}`);
      setRecipientUsername('');
      setTransferAmount(0);
    } catch (error) {
      audioSynthesizer.error();
      showAlert('error', 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReverse = (transferId: string) => {
    if (!confirm('Reverse this transfer?')) {
      return;
    }

    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer) return;

    // Reverse the transfer (swap from and to)
    const reversedTransfer: TokenTransfer = {
      ...transfer,
      id: Date.now().toString(),
      fromUser: transfer.toUser,
      toUser: transfer.fromUser,
      timestamp: Date.now(),
    };

    const updatedTransfers = [reversedTransfer, ...transfers];
    setTransfers(updatedTransfers);
    localStorage.setItem('btg_transfers_v1', JSON.stringify(updatedTransfers));

    audioSynthesizer.win();
    showAlert('success', 'Transfer reversed');
  };

  const userTransfers = transfers.filter(
    (t) => t.fromUser === currentUser.username || t.toUser === currentUser.username
  );

  return (
    <div className="card-glass p-6 rounded-lg">
      <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
        <Send size={20} />
        Token Transfers
      </h3>

      {/* Transfer Form */}
      <form onSubmit={handleTransfer} className="space-y-3 mb-6 pb-6 border-b border-slate-700">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Recipient Username
          </label>
          <input
            type="text"
            value={recipientUsername}
            onChange={(e) => setRecipientUsername(e.target.value)}
            placeholder="Enter recipient username"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Amount: ${transferAmount.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max={currentUser.balance}
            value={transferAmount}
            onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
            className="w-full"
            step="1"
            disabled={isLoading}
          />
          <input
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(Math.min(Math.max(0, parseFloat(e.target.value) || 0), currentUser.balance))}
            className="w-full mt-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            step="0.01"
            min="0"
            max={currentUser.balance}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !recipientUsername || transferAmount <= 0}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Send Transfer'}
        </button>
      </form>

      {/* Transfer History */}
      <div>
        <h4 className="font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <RefreshCw size={16} />
          Recent Transfers ({userTransfers.length})
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {userTransfers.length === 0 ? (
            <p className="text-slate-400 text-sm p-2">No transfers yet</p>
          ) : (
            userTransfers.map((transfer) => {
              const isSender = transfer.fromUser === currentUser.username;
              return (
                <div
                  key={transfer.id}
                  className={`p-2 rounded text-xs border ${
                    isSender
                      ? 'bg-red-900/20 border-red-600/50'
                      : 'bg-green-900/20 border-green-600/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-semibold text-white">
                        {isSender ? '→' : '←'} {isSender ? 'To' : 'From'}: {isSender ? transfer.toUser : transfer.fromUser}
                      </p>
                      <p className={isSender ? 'text-red-300' : 'text-green-300'}>
                        {isSender ? '-' : '+'} ${transfer.amount.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {new Date(transfer.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {isSender && userRole === ROLES.MASTER_ADMIN && (
                    <button
                      onClick={() => handleReverse(transfer.id)}
                      className="mt-1 text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white"
                    >
                      Reverse
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-4 space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-${alert.type} flex items-center gap-2 text-xs`}>
            <AlertCircle size={14} />
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
};
