import { speak } from '../utils/speech';

const PHRASES = [
  "I need water",
  "Please don't call an ambulance",
  "I just need to rest",
  "Please speak quietly",
  "Can you find a quiet room",
  "Please call someone on my phone",
  "I can't move right now",
  "This will pass, I'm ok",
  "Please give me space",
  "Thank you for helping",
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