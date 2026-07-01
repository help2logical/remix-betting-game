import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { MainLayout } from './components/MainLayout';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <MainLayout />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
