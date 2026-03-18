import { useState } from 'react';
import { stopSpeaking } from './utils/speech';
import ConfirmScreen from './screens/ConfirmScreen';
import IntroScreen from './screens/IntroScreen';
import CommScreen from './screens/CommScreen';

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
        {screen === 'comm' && (
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
        {screen === 'comm' && <CommScreen />}
      </div>
    </>
  );
}