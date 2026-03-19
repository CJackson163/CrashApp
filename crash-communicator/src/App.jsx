
import { useState } from 'react';
import { stopSpeaking } from './utils/speech';
import ConfirmScreen from './screens/ConfirmScreen';
import IntroScreen from './screens/IntroScreen';
import CommScreen from './screens/CommScreen';
import ContactsScreen from './screens/ContactsScreen';

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
        {(screen === 'comm' || screen === 'contacts') && (
          <button onClick={handleReset}>Reset</button>
        )}
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
      </div>
    </>
  );
}