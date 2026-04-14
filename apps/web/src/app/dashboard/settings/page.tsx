'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, Plus, Trash2 } from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  
  const [newProvider, setNewProvider] = useState('openai');
  const [newKeyValue, setNewKeyValue] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users/api-keys', { credentials: 'include' });
      if (res.ok) setApiKeys(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/users/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: newProvider, key: newKeyValue }),
        credentials: 'include'
      });
      if (res.ok) {
        setNewKeyValue('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className="gradient-text">Settings</h2>
        <p>Manage your account, preferences, and API integrations.</p>
      </header>

      <div className={styles.section}>
        <div className={`${styles.card} glass`}>
          <div className={styles.cardHeader}>
            <Key size={20} />
            <h3>LLM API Keys</h3>
          </div>
          <p className={styles.description}>
            Your keys are encrypted at rest using AES-256-GCM. We never store them in plain text.
          </p>

          <div className={styles.keyList}>
            {apiKeys.map((k) => (
              <div key={k.id} className={styles.keyItem}>
                <div className={styles.keyInfo}>
                  <span className={styles.providerTag}>{k.provider}</span>
                  <span className={styles.keyValue}>
                    {showKey[k.id] ? '••••••••••••••••' : '****************'}
                  </span>
                </div>
                <button onClick={() => toggleKeyVisibility(k.id)} className={styles.iconBtn}>
                  {showKey[k.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddKey} className={styles.addKeyForm}>
            <select value={newProvider} onChange={(e) => setNewProvider(e.target.value)}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Google Gemini</option>
            </select>
            <input 
              type="password" 
              placeholder="Paste your API key here..."
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              required
            />
            <button type="submit" className="gradient-btn"><Plus size={16} /> Add Key</button>
          </form>
        </div>
      </div>
    </div>
  );
}
