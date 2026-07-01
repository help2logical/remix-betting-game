# Remix: Number Betting Game & Access Control Terminal

An immersive, high-fidelity full-stack simulation sandbox built with React (v18+), Vite, Tailwind CSS, and Firebase Firestore/Auth. It merges a fast-paced continuous betting arena with an enterprise-grade Role-Based Access Control (RBAC) simulation platform.

## 🚀 Key Features

### 1. Roulette-Style Betting Arena
- **Interactive Multi-Bet Numbers Board**: Place simulated wagers on numbers 1 through 9.
- **Dual Dice Roll Option**: Engage with a secondary dice rolling strategy panel (Odd, Even, Specific Sums).
- **Continuous Time Lap**: Autonomous game rounds with configurable intervals (10s to 120s depending on privilege level).
- **Tactile Sound System**: Immersive custom-synthesized Web Audio API sound effects for interactions, countdowns, wins, and losses.
- **Hot & Cold Statistics**: Visually track high-frequency winning numbers ("Hot") and low-frequency numbers ("Cold") updated dynamically after each round.

### 2. Role-Based Access Control (RBAC) & Permission Engine
- **Simulated Role Matrix**:
  - `user`: Standard profile. The Access Control management console is completely omitted from the layout for a clean, streamlined user experience.
  - `admin`: Renders the administrative hub. Can view registered users, but restrictions prevent advanced creation options and limit countdown speeds to a safe `120s`.
  - `master_admin`: Full system authorization. Register admin or user accounts, change loop configurations dynamically (10s to 120s), access the plain-text credentials audit vault, and execute hard profile deletions.
- **Dynamic Flexible Layout**: Column spans adapt dynamically. The layout contracts to a clean two-column grid for standard users and expands into a dense three-column grid when administrative privileges are authorized.

### 3. Token Transmission System (TTP)
- **Direct Transfers**: Send simulated tokens securely to any other registered user profile in the database.
- **Inter-Account Swaps**: Master admins can transfer balances between arbitrary source and target accounts.
- **Audit Trails**: Clear records tracking active transmission trails with built-in instant rollback and reversal operations.

## 🛠️ Recent Technical Updates & Bug Fixes

We have polished the application to enterprise-grade execution with the following targeted fixes:

1. **Auto-Dismissing Alerts**:
   - Transfer status alerts and token transmission errors are now managed dynamically. Any failed transfer or input validation error automatically auto-dismisses after **2 seconds** for a fluid, uninterrupted workflow.
2. **De-duplicated Spin & Dice History**:
   - Implemented a dual-layered de-duplication strategy. Real-time Firestore query snapshots are filtered via standard `Set` structures, and visual row mapping inside the `HistoryPanel` is key-stabilized to ensure no duplicate cards render under any circumstances.
3. **Asynchronous Token Transfer Pipeline**:
   - Refactored the `onTransfer` and `onReverseTransfer` callback patterns to fully support asynchronous `Promise` states. This resolved a race condition where successful transactions briefly flashed "failed" before status resolution.

## 💾 Local Storage Schema

State persists reliably across page refreshes using the following client-side storage keys:
- `btg_current_user_v1` (String): Current active profile name (active login required; Guest Player mode is completely removed).
- `btg_current_user_role_v1` (String): Active authorized role (defaults to `'user'`).
- `btg_stats_v1` (JSON): Dynamic player analytics and account numbers.
- `btg_accounts_v1` (JSON): Registry database listing registered users and their credentials.
- `btg_transfers_v1` (JSON): Token transfer audit trail.

## ⚙️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Utility-First, responsive layout engine)
- **Database / Backend**: Local Storage for real-time state synchronization (Firebase ready)
- **Icons**: Lucide React
- **Audio Engine**: Custom Web Audio API synthesizer oscillators (zero external dependencies)

## 💻 Getting Started

### Installation

Install project dependencies using the package manager:

```bash
npm install
```

### Run Development Server

Boot the localized container service:

```bash
npm run dev
```

The application will automatically open at `http://localhost:5173`

### Static Build & Production Output

Bundle compile the applet into an optimized static deployment package inside the `dist/` directory:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎮 How to Play

### For Standard Users
1. **Create an Account** or **Login** with existing credentials
2. **Place Bets** on numbers 1-9 using the betting panel
3. **Spin the Wheel** to generate a random winning number
4. **Win or Lose**: Matching numbers multiply your bet by 2x
5. **Try Dice Rolls**: Alternative betting with Odd/Even/Sum strategies
6. **Track History**: View all spins and rolls with detailed stats

### For Admins
- Access the **Admin Console** in the right column
- **View all registered users** and their balances
- **Edit user balances** directly
- **Delete user accounts** (except your own)
- **Create new admin accounts** (Master Admin only)

### For Master Admins
- Full access to all Admin Console features
- **Create Master Admin accounts**
- **Create, edit, and delete any user account**
- **Reverse token transfers** using the Token Transfer panel
- **Audit trail access** for all transactions

## 🔐 Demo Credentials

The application initializes with local storage. Create your first account to get started:

1. Click "Don't have an account? Register"
2. Choose a username and password
3. Select your role (User or Admin)
4. Click "Create Account"
5. Login with your new credentials

## 🎨 UI/UX Features

- **Dark Mode Theme**: Sleek slate and dark backgrounds with vibrant accent colors
- **Responsive Grid Layout**: Adapts from 2 columns (users) to 3 columns (admins)
- **Real-time Feedback**: Audio cues and visual alerts for all interactions
- **Auto-dismissing Alerts**: 2-second timeout for error/success messages
- **Hot & Cold Number Tracking**: Visual indicators for frequently appearing numbers
- **Smooth Animations**: Spin animations, pulse effects, and transitions

## 📊 Game Statistics

Track your performance with:
- **Total Spins**: Number of times you've spun the wheel
- **Win Rate**: Percentage of winning spins
- **Total Winnings**: Sum of all winning amounts
- **Total Losses**: Sum of all losing bets
- **Net Profit/Loss**: Overall account performance
- **Current Balance**: Your remaining tokens

## 🔊 Sound Effects

Custom Web Audio API synthesizer generates:
- **Beep**: Button interactions (800Hz sine wave)
- **Win Sound**: Upward frequency sweep (400-1200Hz)
- **Lose Sound**: Downward frequency sweep (600-200Hz)
- **Tick**: Countdown timer (400Hz, 50ms)
- **Error**: Alert sound (200-300Hz square wave)

## 🚀 Future Enhancements

- Firebase Firestore integration for multi-user real-time sync
- WebSocket support for live leaderboards
- Advanced betting strategies and pattern analysis
- Mobile-optimized UI improvements
- Additional game modes (Blackjack, Poker)
- Achievement and badge system
- Blockchain integration for token verification

## 📝 License

MIT License - Feel free to use and modify for educational purposes.

## 💬 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
