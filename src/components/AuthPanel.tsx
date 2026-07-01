import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { audioSynthesizer } from '../utils/audio';
import { STORAGE_KEYS, ROLES } from '../config';
import { AlertCircle, LogOut, Users, Lock } from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AuthPanel: React.FC = () => {
  const { currentUser, userRole, login, logout, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.USER);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    audioSynthesizer.beep(type === 'error' ? 200 : 800);
    setAlerts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      audioSynthesizer.win();
      showAlert('success', `Welcome back, ${username}!`);
      setUsername('');
      setPassword('');
    } catch (error) {
      audioSynthesizer.error();
      showAlert('error', error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    if (password.length < 4) {
      showAlert('error', 'Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, password, selectedRole);
      audioSynthesizer.win();
      showAlert('success', `Account created! Please login.`);
      setUsername('');
      setPassword('');
      setIsLogin(true);
    } catch (error) {
      audioSynthesizer.error();
      showAlert('error', error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    audioSynthesizer.beep();
    logout();
    showAlert('info', 'Logged out successfully');
  };

  if (currentUser) {
    return (
      <div className="card-glass p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              <Lock size={24} />
              Profile
            </h2>
            <p className="text-slate-400 text-sm mt-1">Logged in as {currentUser.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-danger flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-slate-700/50 rounded">
            <span className="text-slate-300">Username:</span>
            <span className="text-white font-semibold">{currentUser.username}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-700/50 rounded">
            <span className="text-slate-300">Role:</span>
            <span className="text-white font-semibold uppercase">
              {userRole === ROLES.MASTER_ADMIN && (
                <span className="text-red-400">👑 {userRole}</span>
              )}
              {userRole === ROLES.ADMIN && (
                <span className="text-yellow-400">⚙️ {userRole}</span>
              )}
              {userRole === ROLES.USER && (
                <span className="text-green-400">👤 {userRole}</span>
              )}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-slate-700/50 rounded">
            <span className="text-slate-300">Balance:</span>
            <span className="text-green-400 font-semibold">${currentUser.balance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-700/50 rounded">
            <span className="text-slate-300">Account Created:</span>
            <span className="text-white">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-${alert.type} mt-3 flex items-center gap-2`}>
            <AlertCircle size={16} />
            {alert.message}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="card-glass p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
        <Lock size={24} />
        {isLogin ? 'Login' : 'Register'}
      </h2>

      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Enter username"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            placeholder="Enter password"
            disabled={isLoading}
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            >
              <option value={ROLES.USER}>User (Player)</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Master Admin role can only be set by existing Master Admins</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setUsername('');
            setPassword('');
          }}
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>

      {alerts.map((alert) => (
        <div key={alert.id} className={`alert-${alert.type} mt-3 flex items-center gap-2`}>
          <AlertCircle size={16} />
          {alert.message}
        </div>
      ))}
    </div>
  );
};
