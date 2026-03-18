
import { useState, useEffect, useRef } from 'react';
import { speak } from '../utils/speech';

const INTRO_TEXT =
  "I am experiencing a severe fatigue crash. This is not a medical emergency. This app will help me communicate my needs to you.";

export default function IntroScreen({ onDone }) {
  const [visible, setVisible] = useState(false);
  const hasMoved = useRef(false);

  useEffect(() => {
    setVisible(true);

    const advance = () => {
      if (!hasMoved.current) {
        hasMoved.current = true;
        onDone();
      }
    };

    speak(INTRO_TEXT, () => {
      setTimeout(advance, 1500);
    });

    // Fallback: advance after 12 seconds no matter what
    const fallback = setTimeout(advance, 12000);

    return () => clearTimeout(fallback);
  }, []);

  return (
    <div className="screen-center">
      <p style={{
        fontSize: 24, fontWeight: 500, lineHeight: 1.6,
        maxWidth: 360, opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease'
      }}>
        {INTRO_TEXT}
      </p>
      <div style={{ marginTop: 32 }}>
        <div className="pulse-dot" />
      </div>
    </div>
  );
}