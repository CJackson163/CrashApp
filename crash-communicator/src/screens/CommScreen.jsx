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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an assistive communication tool for someone experiencing a severe ME/CFS (Myalgic Encephalomyelitis / Chronic Fatigue Syndrome) crash in a public setting such as a university campus, lecture hall, library, shop, or public space. During a crash, the person is non-verbal, extremely fatigued, and cannot move much. They can only communicate by tapping buttons on a screen. The person nearby is likely a stranger, classmate, university staff member, or member of the public who is trying to help.

IMPORTANT CONTEXT ABOUT ME/CFS CRASHES:
- This is NOT a medical emergency — but it looks alarming to people who don't understand ME/CFS
- The person cannot speak, move much, or think clearly
- Light, sound, and touch sensitivity are common
- They should NOT be moved unless they indicate it's ok
- They should NOT be encouraged to push through, stand up, or walk
- Do NOT call an ambulance unless the person indicates they want one
- Recovery requires complete rest — physical AND mental
- The crash may last minutes to hours
- The person may need someone to contact a friend or family member using their phone
- They may need help getting home when they are able to move

COMMON NEEDS DURING A PUBLIC CRASH:
- Water
- To be left in a quiet, dim place
- Someone to stay nearby in case they need help
- Their phone to contact someone
- Help getting to a safe resting spot when ready
- Reassurance that they are ok and this will pass
- People to give them space and not crowd around

GUIDELINES FOR SUGGESTIONS:
- One response should generally address what was asked directly
- One should express a specific physical need if relevant
- One can set a boundary or give direction (e.g. "Please don't call an ambulance")
- Prefer specific responses like "Can you find me a quiet room" over vague ones like "I need help"
- Never suggest anything requiring physical or mental exertion
- Be warm but practical
- Remember the person helping is likely unfamiliar with ME/CFS

Someone nearby has just spoken to the person. Generate exactly 3 short, practical responses they might want to give. Each response MUST be 2-10 words. Return ONLY a JSON array of 3 strings. No markdown, no backticks, no explanation.

The person nearby said: "${heard}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    const data = await res.json();
    console.log('Gemini response:', res.status, data);
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

export default function CommScreen({ onContacts }) {
  const [flash, setFlash] = useState(null);
  const [flashText, setFlashText] = useState(null);
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
    setFlashText(text);
    setTimeout(() => setFlashText(null), 3000);
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
      if (e.error === 'not-allowed' || e.error === 'service-not-available') {
        setListening(false);
        recognitionRef.current = null;
      }
    };

    r.onend = () => {
      // Always restart if we're still meant to be listening
      if (recognitionRef.current) {
        try {
          r.start();
        } catch (e) {
          console.error('Restart failed:', e);
          setListening(false);
          recognitionRef.current = null;
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
          <QuickPhrases onSpoken={(text) => {
            setLastSpoken(text);
            setFlashText(text);
            setTimeout(() => setFlashText(null), 3000);
          }} />
          <button
            onClick={onContacts}
            style={{
              marginTop: 12, width: '100%', padding: '14px',
              fontSize: 15, fontWeight: 500, background: 'var(--red-light)',
              color: 'var(--red)', border: 'none', borderRadius: 12,
              cursor: 'pointer'
            }}
          >
            Emergency contacts
          </button>
        </div>
      </div>
    </div>
  );
}