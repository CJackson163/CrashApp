import { useState, useEffect } from 'react';

const DEFAULT_DATA = {
  contacts: [
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
  ],
  homeAddress: '',
  stayingAddress: '',
};

export default function SettingsScreen({ onBack }) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('crashapp-settings');
      if (stored) setData(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  const updateContact = (index, field, value) => {
    const updated = { ...data };
    updated.contacts = [...data.contacts];
    updated.contacts[index] = { ...data.contacts[index], [field]: value };
    setData(updated);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('crashapp-settings', JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  return (
    <div className="screen" style={{ padding: '1.5rem 1rem', overflowY: 'auto' }}>
      <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
        Settings
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
        This data is stored only on this device. It never goes online.
      </p>

      {data.contacts.map((contact, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
            Contact {i + 1}
          </p>
          <input
            type="text"
            placeholder="Name"
            value={contact.name}
            onChange={(e) => updateContact(i, 'name', e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', fontSize: 15,
              border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg)', color: 'var(--text-primary)',
              marginBottom: 8, boxSizing: 'border-box'
            }}
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={contact.phone}
            onChange={(e) => updateContact(i, 'phone', e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', fontSize: 15,
              border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg)', color: 'var(--text-primary)',
              marginBottom: 8, boxSizing: 'border-box'
            }}
          />
          <input
            type="text"
            placeholder="Relationship (e.g. Mum, Friend, University)"
            value={contact.relationship}
            onChange={(e) => updateContact(i, 'relationship', e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', fontSize: 15,
              border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg)', color: 'var(--text-primary)',
              boxSizing: 'border-box'
            }}
          />
        </div>
      ))}

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
          Home address
        </p>
        <textarea
          placeholder="Your home address"
          value={data.homeAddress}
          onChange={(e) => setData({ ...data, homeAddress: e.target.value })}
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 15,
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'var(--bg)', color: 'var(--text-primary)',
            resize: 'vertical', fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
          Where I am staying now
        </p>
        <textarea
          placeholder="Current accommodation address"
          value={data.stayingAddress}
          onChange={(e) => setData({ ...data, stayingAddress: e.target.value })}
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 15,
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'var(--bg)', color: 'var(--text-primary)',
            resize: 'vertical', fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        onClick={handleSave}
        className="btn-primary"
        style={{ width: '100%', maxWidth: 'none', marginBottom: 12 }}
      >
        {saved ? 'Saved!' : 'Save'}
      </button>

      <button
        onClick={onBack}
        style={{
          width: '100%', padding: '14px', fontSize: 15, fontWeight: 500,
          background: 'var(--bg-secondary)', border: 'none', borderRadius: 12,
          cursor: 'pointer', color: 'var(--text-secondary)'
        }}
      >
        Back
      </button>
    </div>
  );
}