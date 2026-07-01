import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { audioSynthesizer } from '../utils/audio';
import { ROLES, STORAGE_KEYS } from '../config';
import { Users, Trash2, Edit3, Shield, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AdminConsole: React.FC = () => {
  const { currentUser, userRole, register, updateUserBalance, deleteUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState(ROLES.USER);
  const [editingBalance, setEditingBalance] = useState<{ userId: string; balance: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Only show for admin and master_admin
  if (userRole !== ROLES.ADMIN && userRole !== ROLES.MASTER_ADMIN) {
    return null;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
    setUsers(accounts);
  };

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    audioSynthesizer.beep(type === 'error' ? 200 : 800);
    setAlerts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 2000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername || !newPassword) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    // Master admin can create any role, regular admin can only create users
    const roleToCreate = userRole === ROLES.MASTER_ADMIN ? newRole : ROLES.USER;

    setIsLoading(true);
    try {
      await register(newUsername, newPassword, roleToCreate);
      audioSynthesizer.win();
      showAlert('success', `User "${newUsername}" created successfully!`);
      setNewUsername('');
      setNewPassword('');
      setNewRole(ROLES.USER);
      loadUsers();
    } catch (error) {
      audioSynthesizer.error();
      showAlert('error', error instanceof Error ? error.message : 'Creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBalance = async (userId: string, newBalance: number) => {
    setIsLoading(true);
    try {
      await updateUserBalance(userId, newBalance);
      audioSynthesizer.win();
      showAlert('success', 'Balance updated successfully!');
      loadUsers();
      setEditingBalance(null);
    } catch (error) {
      audioSynthesizer.error();
      showAlert('error', 'Failed to update balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteUser(userId);
      audioSynthesizer.win();
      showAlert('success', `User "${username}" deleted successfully!`);
      loadUsers();
    } catch (error) {
      audioSynthesizer.error();
      showAlert('error', 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    if (role === ROLES.MASTER_ADMIN) return 'text-red-400';
    if (role === ROLES.ADMIN) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRoleIcon = (role: string) => {
    if (role === ROLES.MASTER_ADMIN) return '👑';
    if (role === ROLES.ADMIN) return '⚙️';
    return '👤';
  };

  return (
    <div className="card-glass p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
        <Shield size={24} />
        Admin Console
        {userRole === ROLES.MASTER_ADMIN && <span className="text-xs bg-red-600 px-2 py-1 rounded">MASTER</span>}
      </h2>

      {/* Create User Form - Only Master Admin */}
      {userRole === ROLES.MASTER_ADMIN && (
        <div className="bg-slate-700/50 p-4 rounded-lg mb-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
            <Edit3 size={18} />
            Create New User
          </h3>
          <form onSubmit={handleCreateUser} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              >
                <option value={ROLES.USER}>User</option>
                <option value={ROLES.ADMIN}>Admin</option>
                <option value={ROLES.MASTER_ADMIN}>Master Admin</option>
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
          <Users size={18} />
          Registered Users ({users.length})
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-slate-400 text-sm p-3">No users registered yet</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="bg-slate-700/50 p-3 rounded border border-slate-600 text-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {getRoleIcon(user.role)} {user.username}
                    </p>
                    <p className={`text-xs ${getRoleColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </p>
                  </div>
                  <p className="text-green-400 font-semibold">${user.balance.toFixed(2)}</p>
                </div>

                <div className="text-xs text-slate-400 mb-2">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </div>

                {/* Balance Editor */}
                {editingBalance?.userId === user.id ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={editingBalance.balance}
                      onChange={(e) =>
                        setEditingBalance({
                          userId: user.id,
                          balance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-xs"
                      step="0.01"
                    />
                    <button
                      onClick={() => handleUpdateBalance(user.id, editingBalance.balance)}
                      className="btn-primary text-xs px-2 py-1 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingBalance(null)}
                      className="btn-secondary text-xs px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingBalance({ userId: user.id, balance: user.balance })
                      }
                      className="btn-secondary text-xs px-2 py-1 flex-1 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Edit Balance
                    </button>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="btn-danger text-xs px-2 py-1 flex items-center justify-center gap-1 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-${alert.type} flex items-center gap-2`}>
            <AlertCircle size={16} />
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
};
