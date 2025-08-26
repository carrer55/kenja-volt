import React from 'react';
import AuthWrapper from './components/AuthWrapper';
import { UserProfileProvider } from './components/UserProfileProvider';
import './index.css';

function App() {
  return (
    <UserProfileProvider>
      <AuthWrapper />
    </UserProfileProvider>
  );
}

export default App;