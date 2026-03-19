import { useState, useEffect } from 'react';
import { speak, stopSpeaking } from '../utils/speech';
import FlashOverlay from '../components/FlashOverlay';
import QuickPhrases from '../components/QuickPhrases';

export default function CommScreen({ onContacts }) {
  const [flash, setFlash] = useState(null);
  const [flashText, setFlashText] = useState(null);
  const [lastSpoken, setLastSpoken] = useState('');

  const handleYesNo = (val) => {
    speak(val);
    setFlash(val);
    setTimeout(() => setFlash(null), 1200);
  };

  const showFlash = (text) => {
    setLastSpoken(text);
    setFlashText(text);
    setTimeout(() => setFlashText(null), 3000);
  };

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {flash && (
        <FlashOverlay
          text={flash}
          color={flash === 'YES' ? 'green' : 'red'}
        />
      )}

      {flashText && (
        <div
          onClick={() => setFlashText(null)}
          style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(29, 158, 117, 0.92)', zIndex: 10,
            padding: '2rem', animation: 'flashIn 0.15s ease',
            cursor: 'pointer'
          }}
        >
          <span style={{
            fontSize: 36, fontWeight: 500, color: '#fff',
            textAlign: 'center', lineHeight: 1.4
          }}>
            {flashText}
          </span>
        </div>
      )}

      {/* YES / NO buttons */}
      <div style={{ display: 'flex', gap: 12, padding: '1.5rem 1rem 1rem', flexShrink: 0 }}>
        <button className="btn-yes" onClick={() => handleYesNo('YES')}>YES</button>
        <button className="btn-no" onClick={() => handleYesNo('NO')}>NO</button>
      </div>

      {/* Last spoken confirmation */}
      {lastSpoken && (
        <div className="last-spoken">
          You said: &ldquo;{lastSpoken}&rdquo;
        </div>
      )}

      {/* Quick phrases */}
      <div style={{ flex: 1, padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Quick phrases
        </span>

        <QuickPhrases onSpoken={(text) => {
          showFlash(text);
        }} />

        <button
          onClick={onContacts}
          style={{
            marginTop: 'auto', paddingTop: 16, width: '100%', padding: '14px',
            fontSize: 15, fontWeight: 500, background: 'var(--red-light)',
            color: 'var(--red)', border: 'none', borderRadius: 12,
            cursor: 'pointer'
          }}
        >
          Emergency contacts
        </button>
      </div>
    </div>
  );
}