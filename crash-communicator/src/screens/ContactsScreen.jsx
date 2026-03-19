import { useState, useEffect } from 'react';
import { speak } from '../utils/speech';

const DEFAULT_CONTACTS = [
  { name: 'Contact 1', phone: '', relationship: 'Family' },
  { name: 'Contact 2', phone: '', relationship: 'Friend' },
  { name: 'Contact 3', phone: '', relationship: 'University' },
];

export default function ContactsScreen({ onBack }) {
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [flashText, setFlashText] = useState(null);
  const [showAddress, setShowAddress] = useState(null);
  const [addresses, setAddresses] = useState({ homeAddress: '', stayingAddress: '' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('crashapp-settings');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.contacts) {
          const loaded = data.contacts.map((c, i) => ({
            name: c.name || DEFAULT_CONTACTS[i].name,
            phone: c.phone || '',
            relationship: c.relationship || DEFAULT_CONTACTS[i].relationship,
          }));
          setContacts(loaded);
        }
        setAddresses({
          homeAddress: data.homeAddress || '',
          stayingAddress: data.stayingAddress || '',
        });
      }
    } catch (e) {
      console.error('Failed to load contacts:', e);
    }
  }, []);

  const handleTap = (contact) => {
    const msg = `Calling ${contact.name}`;
    speak(msg);
    setFlashText(msg);
    setTimeout(() => setFlashText(null), 3000);
    if (contact.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
  };

  const handleAddress = (type) => {
    const addr = type === 'home' ? addresses.homeAddress : addresses.stayingAddress;
    const label = type === 'home' ? 'My home address' : 'Where I am staying';
    if (addr) {
      setShowAddress({ label, addr });
      speak(`${label} is ${addr}`);
    }
  };

  return (
    <div className="screen" style={{ padding: '1.5rem 1rem', position: 'relative', overflowY: 'auto' }}>
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

      {showAddress && (
        <div
          onClick={() => setShowAddress(null)}
          style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(29, 158, 117, 0.92)', zIndex: 10,
            padding: '2rem', animation: 'flashIn 0.15s ease',
            cursor: 'pointer'
          }}
        >
          <span style={{
            fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.8)',
            marginBottom: 12
          }}>
            {showAddress.label}
          </span>
          <span style={{
            fontSize: 28, fontWeight: 500, color: '#fff',
            textAlign: 'center', lineHeight: 1.4
          }}>
            {showAddress.addr}
          </span>
        </div>
      )}

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
        {contacts.map((contact, i) => (
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

      {(addresses.homeAddress || addresses.stayingAddress) && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>
            My addresses
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {addresses.homeAddress && (
              <button
                onClick={() => handleAddress('home')}
                style={{
                  flex: 1, padding: '12px', fontSize: 14, fontWeight: 500,
                  background: 'var(--bg-secondary)', border: 'none',
                  borderRadius: 10, cursor: 'pointer', color: 'var(--text-secondary)'
                }}
              >
                Home address
              </button>
            )}
            {addresses.stayingAddress && (
              <button
                onClick={() => handleAddress('staying')}
                style={{
                  flex: 1, padding: '12px', fontSize: 14, fontWeight: 500,
                  background: 'var(--bg-secondary)', border: 'none',
                  borderRadius: 10, cursor: 'pointer', color: 'var(--text-secondary)'
                }}
              >
                Where I'm staying
              </button>
            )}
          </div>
        </div>
      )}

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