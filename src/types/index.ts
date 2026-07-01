export interface User {
  id: string;
  username: string;
  password: string;
  role: 'user' | 'admin' | 'master_admin';
  balance: number;
  createdAt: number;
}

export interface Bet {
  number: number;
  amount: number;
}

export interface SpinResult {
  number: number;
  timestamp: number;
  winningBets: Bet[];
  totalWinnings: number;
}

export interface DiceResult {
  type: 'odd' | 'even' | 'sum';
  value: number | string;
  result: boolean;
  timestamp: number;
  amount: number;
}

export interface TokenTransfer {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface GameStats {
  totalSpins: number;
  totalBets: number;
  totalWinnings: number;
  totalLosses: number;
  hotNumbers: number[];
  coldNumbers: number[];
  recentSpins: SpinResult[];
  recentDiceRolls: DiceResult[];
}

export interface AuthContextType {
  currentUser: User | null;
  userRole: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, role?: string) => Promise<void>;
  updateUserBalance: (userId: string, newBalance: number) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export interface GameContextType {
  gameStats: GameStats;
  currentBets: Bet[];
  placeBet: (number: number, amount: number) => void;
  clearBets: () => void;
  recordSpin: (result: SpinResult) => void;
  recordDiceRoll: (result: DiceResult) => void;
  getHotNumbers: () => number[];
  getColdNumbers: () => number[];
}
