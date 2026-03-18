import { useState, useEffect, useRef, useCallback } from 'react';
import { speak, stopSpeaking } from '../utils/speech';
import FlashOverlay from '../components/FlashOverlay';
import QuickPhrases from '../components/QuickPhrases';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

async function fetchSuggestions(heard) {
  if (!GEMINI_KEY) {
    console.warn('No Gemini API key found. Using fallback suggestions.');
    return ['Yes please', 'No thank you', 'I need a moment'];
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are helping someone with ME/CFS who cannot speak during a severe fatigue crash. Someone nearby has just said something to them. Generate exactly 3 short, practical responses they might want to give. Each response should be 2-10 words.

Return ONLY a JSON array of 3 strings. No markdown, no backticks, no explanation. Just the array.

Consider the context and suggest responses covering different likely intentions (e.g. one affirmative, one negative, one specific need).

The person nearby said: "${heard}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3);
    }
    return ['Yes please', 'No thank you', 'I need a moment'];
  } catch (e) {
    console.error('Gemini suggestion error:', e);
    return ['Yes please', 'No thank you', 'I need a moment'];
  }
}

export default function CommScreen() {
  const [flash, setFlash] = useState(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSpoken, setLastSpoken] = useState('');
  const recognitionRef = useRef(null);
  const lastProcessed = useRef('');

  const handleYesNo = (val) => {
    speak(val);
    setFlash(val);
    setTimeout(() => setFlash(null), 1200);
  };

  const speakSuggestion = (text) => {
    speak(text);
    setLastSpoken(text);
    setFlash(null);
    setSuggestions([]);
    setTranscript('');
  };

  const generateSuggestions = useCallback(async (heard) => {
    if (!heard.trim() || heard.trim() === lastProcessed.current) return;
    lastProcessed.current = heard.trim();
    setLoading(true);
    const results = await fetchSuggestions(heard);
    setSuggestions(results);
    setLoading(false);
  }, []);

  const toggleListening = () => {
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert(
        'Speech recognition is not supported in this browser. Please use Chrome or Safari.'
      );
      return;
    }

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-GB';

    let debounce = null;

    r.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      setTranscript(t);
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (t.trim().length > 3) generateSuggestions(t);
      }, 1500);
    };

    r.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      if (e.error !== 'no-speech') {
        setListening(false);
      }
    };

    r.onend = () => {
      if (recognitionRef.current) {
        try {
          r.start();
        } catch (e) {
          setListening(false);
        }
      }
    };

    recognitionRef.current = r;
    r.start();
    setListening(true);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      stopSpeaking();
    };
  }, []);

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {flash && (
        <FlashOverlay
          text={flash}
          color={flash === 'YES' ? 'green' : 'red'}
        />
      )}

      {/* YES / NO buttons */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          padding: '1.5rem 1rem 1rem',
          flexShrink: 0,
        }}
      >
        <button className="btn-yes" onClick={() => handleYesNo('YES')}>
          YES
        </button>
        <button className="btn-no" onClick={() => handleYesNo('NO')}>
          NO
        </button>
      </div>

      {/* Last spoken confirmation */}
      {lastSpoken && (
        <div className="last-spoken">
          You said: &ldquo;{lastSpoken}&rdquo;
        </div>
      )}

      {/* Smart suggestions area */}
      <div
        style={{
          flex: 1,
          padding: '0 1rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Smart suggestions
          </span>
          <button
            className={`listen-btn ${listening ? 'active' : 'inactive'}`}
            onClick={toggleListening}
          >
            <span
              className={`listen-dot ${listening ? 'active' : 'inactive'}`}
            />
            {listening ? 'Listening...' : 'Start listening'}
          </button>
        </div>

        {/* Empty state */}
        {!listening && suggestions.length === 0 && !loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--text-tertiary)',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Tap &ldquo;Start listening&rdquo; to hear what the other person is
            saying. The app will suggest responses for you.
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="transcript-box">
            <span className="transcript-label">They said:</span>
            {transcript}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              color: 'var(--text-tertiary)',
              fontSize: 14,
            }}
          >
            Thinking of suggestions...
          </div>
        )}

        {/* Suggestion buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-btn"
              onClick={() => speakSuggestion(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Quick phrases pinned to bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <QuickPhrases onSpoken={setLastSpoken} />
        </div>
      </div>
    </div>
  );
}