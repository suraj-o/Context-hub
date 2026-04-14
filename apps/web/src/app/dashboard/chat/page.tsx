'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import styles from './chat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI GPT-4o' },
  { id: 'anthropic', name: 'Claude 3.5 Sonnet' },
  { id: 'gemini', name: 'Gemini 1.5 Pro' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState('openai');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider, 
          messages: [...messages, userMessage] 
        }),
        credentials: 'include'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Chat failed');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.chatBox} glass`}>
        <header className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <Bot className={styles.botIcon} />
            <div>
              <h3>MCP AI Assistant</h3>
              <p>Powered by Semantic Memory</p>
            </div>
          </div>
          
          <div className={styles.providerSelector}>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </header>

        <div className={styles.messagesContainer} ref={scrollRef}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <Sparkles size={48} className={styles.sparkle} />
              <h2>How can I help you today?</h2>
              <p>I can help you analyze your project knowledge and write better code.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`${styles.message} ${styles[m.role]}`}>
              <div className={styles.avatar}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={styles.content}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.avatar}><Bot size={16} /></div>
              <div className={styles.typing}>
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className={styles.inputArea}>
          <input 
            type="text" 
            placeholder="Ask anything about your projects..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="gradient-btn" disabled={loading || !input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
