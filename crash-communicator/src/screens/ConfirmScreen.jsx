import { speak } from '../utils/speech';

export default function ConfirmScreen({ onConfirm }) {
  return (
    <div className="screen-center">
      <div style={{ fontSize: 48, marginBottom: 24 }}>&#9888;&#65039;</div>
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 12 }}>
        Before continuing
      </h2>
      <p style={{
        fontSize: 16, color: 'var(--text-secondary)',
        lineHeight: 1.7, marginBottom: 32, maxWidth: 320
      }}>
        This app is for communicating during an ME/CFS crash.
        It is <strong>not</strong> a substitute for emergency medical help.
      </p>
      <p style={{
        fontSize: 15, color: 'var(--text-secondary)',
        lineHeight: 1.7, marginBottom: 40, maxWidth: 320
      }}>
        Are you sure this is an ME/CFS crash and not a medical emergency?
      </p>
      <button className="btn-primary" onClick={onConfirm}
        style={{ marginBottom: 16 }}>
        Yes, this is ME/CFS
      </button>
      <button className="btn-emergency" onClick={() => {
        speak("If you think this may be a medical emergency, please call 999 or ask someone nearby for help.");
      }}>
        No — I need emergency help
      </button>
    </div>
  );
}