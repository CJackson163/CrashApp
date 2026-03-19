import { useState } from 'react';
import { stopSpeaking } from './utils/speech';
import ConfirmScreen from './screens/ConfirmScreen';
import IntroScreen from './screens/IntroScreen';
import CommScreen from './screens/CommScreen';
import ContactsScreen from './screens/ContactsScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [screen, setScreen] = useState('confirm');

  const handleReset = () => {
    stopSpeaking();
    setScreen('confirm');
  };

  return (
    <>
      <div className="app-header">
        <h1>Crash communicator</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {screen === 'confirm' && (
            <button onClick={() => setScreen('settings')}>Settings</button>
          )}
          {(screen === 'comm' || screen === 'contacts') && (
            <button onClick={handleReset}>Reset</button>
          )}
          {screen === 'settings' && (
            <button onClick={() => setScreen('confirm')}>Back</button>
          )}
        </div>
      </div>
      <div className="screen">
        {screen === 'confirm' && (
          <ConfirmScreen onConfirm={() => setScreen('intro')} />
        )}
        {screen === 'intro' && (
          <IntroScreen onDone={() => setScreen('comm')} />
        )}
        {screen === 'comm' && (
          <CommScreen onContacts={() => setScreen('contacts')} />
        )}
        {screen === 'contacts' && (
          <ContactsScreen onBack={() => setScreen('comm')} />
        )}
        {screen === 'settings' && (
          <SettingsScreen onBack={() => setScreen('confirm')} />
        )}
      </div>
    </>
  );
}