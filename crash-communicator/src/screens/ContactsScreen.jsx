
import { speak } from '../utils/speech';

const CONTACTS = [
  { name: 'Contact 1', relationship: 'Family' },
  { name: 'Contact 2', relationship: 'Friend' },
  { name: 'Contact 3', relationship: 'University' },
];

export default function ContactsScreen({ onBack }) {
  const handleTap = (contact) => {
    speak(`Please call ${contact.name} on my phone`);
  };

  return (
    <div className="screen" style={{ padding: '1.5rem 1rem' }}>
      <p style={{
        fontSize: 16, fontWeight: 500, color: 'var(--text-primary)',
        marginBottom: 8
      }}>
        Please call one of these people on my phone
      </p>
      <p style={{
        fontSize: 13, color: 'var(--text-secondary)',
        marginBottom: 24, lineHeight: 1.5
      }}>
        Find this contact in my phone and call them for me.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CONTACTS.map((contact, i) => (
          <button
            key={i}
            onClick={() => handleTap(contact)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '18px 20px', background: 'var(--bg)',
              border: '1.5px solid var(--border)', borderRadius: 14,
              cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--info-bg)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 500, fontSize: 16, color: 'var(--info-text)',
              flexShrink: 0
            }}>
              {contact.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)' }}>
                {contact.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {contact.relationship}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        style={{
          marginTop: 24, width: '100%', padding: '14px',
          fontSize: 15, fontWeight: 500, background: 'var(--bg-secondary)',
          border: 'none', borderRadius: 12, cursor: 'pointer',
          color: 'var(--text-secondary)'
        }}
      >
        Back to communicator
      </button>
    </div>
  );
}