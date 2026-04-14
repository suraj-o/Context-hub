'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, FolderKanban, Link as LinkIcon, ExternalLink } from 'lucide-react';
import styles from './projects.module.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const fetchData = async () => {
    try {
      const [pRes, wRes] = await Promise.all([
        fetch('http://localhost:4000/api/projects', { credentials: 'include' }),
        fetch('http://localhost:4000/api/workspaces', { credentials: 'include' })
      ]);
      if (pRes.ok) setProjects(await pRes.json());
      if (wRes.ok) setWorkspaces(await wRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName, 
          workspaceId: selectedWorkspace,
          repositoryUrl: repoUrl 
        }),
        credentials: 'include'
      });
      if (res.ok) {
        setNewName('');
        setRepoUrl('');
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h2 className="gradient-text">Projects</h2>
          <p>Manage your repositories and synchronization tasks.</p>
        </div>
        <button className="gradient-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </header>

      <div className={styles.grid}>
        {projects.map((p) => (
          <div key={p.id} className={`${styles.card} glass`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <FolderKanban size={20} />
              </div>
              <div className={styles.titleInfo}>
                <h3>{p.name}</h3>
                <p>Workspace: {p.workspace.name}</p>
              </div>
            </div>
            
            <div className={styles.cardBody}>
              {p.repositoryUrl && (
                <div className={styles.repoInfo}>
                  <LinkIcon size={14} />
                  <span className={styles.repoLink}>{p.repositoryUrl}</span>
                </div>
              )}
              <div className={styles.stats}>
                <span>{p._count?.contexts || 0} Knowledge Items</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button 
                className={styles.deleteBtn}
                onClick={() => handleDelete(p.id)}
              >
                <Trash2 size={16} />
              </button>
              <button className={styles.syncBtn}>
                Sync Now <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass`}>
            <h3>Create Project</h3>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Project Name</label>
                <input 
                  type="text" 
                  placeholder="My AI Tool" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Target Workspace</label>
                <select 
                  value={selectedWorkspace} 
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                  required
                >
                  <option value="">Select Workspace...</option>
                  {workspaces.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Repository URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://github.com/user/repo" 
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>
              <div className={styles.modalBtns}>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="gradient-btn">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
