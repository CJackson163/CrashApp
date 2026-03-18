import { speak } from '../utils/speech';

const PHRASES = [
  "I need water",
  "I need to rest",
  "Please be quiet",
  "Turn off the light",
  "I need help",
  "Thank you",
  "I'm in pain",
  "Please stay with me",
];

export default function QuickPhrases({ onSpoken }) {
  const handleTap = (phrase) => {
    speak(phrase);
    if (onSpoken) onSpoken(phrase);
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {PHRASES.map((phrase, i) => (
        <button
          key={i}
          className="quick-phrase"
          onClick={() => handleTap(phrase)}
        >
          {phrase}
        </button>
      ))}
    </div>
  );
}