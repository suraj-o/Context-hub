'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './workspaces.module.css';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/workspaces', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
        credentials: 'include'
      });
      if (res.ok) {
        setNewName('');
        setShowModal(false);
        fetchWorkspaces();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workspace? All projects inside will be lost.')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/workspaces/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchWorkspaces();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading workspaces...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h2 className="gradient-text">Workspaces</h2>
          <p>Organize your projects into isolated workspaces.</p>
        </div>
        <button className="gradient-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Workspace
        </button>
      </header>

      <div className={styles.grid}>
        {workspaces.map((ws) => (
          <div key={ws.id} className={`${styles.card} glass`}>
            <div className={styles.cardInfo}>
              <Layers size={24} className={styles.wsIcon} />
              <div>
                <h3>{ws.name}</h3>
                <p>{ws._count?.projects || 0} Projects</p>
              </div>
            </div>
            <div className={styles.cardActions}>
              <button 
                className={styles.deleteBtn} 
                onClick={() => handleDelete(ws.id)}
                title="Delete Workspace"
              >
                <Trash2 size={18} />
              </button>
              <Link href={`/dashboard/workspaces/${ws.id}`} className={styles.viewBtn}>
                View Details <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass`}>
            <h3>Create New Workspace</h3>
            <form onSubmit={handleCreate}>
              <input 
                type="text" 
                placeholder="Workspace Name (e.g. Personal Projects)" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                required
              />
              <div className={styles.modalBtns}>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="gradient-btn">Create Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
