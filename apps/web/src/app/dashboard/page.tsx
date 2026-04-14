'use client';

import { useState, useEffect } from 'react';
import { Layers, FolderKanban, Activity, Clock } from 'lucide-react';
import styles from './dashboard-home.module.css';

export default function DashboardPage() {
  const [stats, setStats] = useState({ workspaces: 0, projects: 0, entries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:4000/api/workspaces', { credentials: 'include' });
        if (res.ok) {
          const workspaces = await res.json();
          let projectCount = 0;
          workspaces.forEach((w: any) => projectCount += w._count.projects);
          setStats({
            workspaces: workspaces.length,
            projects: projectCount,
            entries: 0 // Will implement entry count later
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div>Loading statistics...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.welcome}>
        <h2 className="gradient-text">Systems Overview</h2>
        <p>Your production-grade MCP environment is healthy.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
            <Layers size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Workspaces</span>
            <span className={styles.statValue}>{stats.workspaces}</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
            <FolderKanban size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Projects</span>
            <span className={styles.statValue}>{stats.projects}</span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Activity size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>System Health</span>
            <span className={styles.statValue}>100%</span>
          </div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <div className={`${styles.activityCard} glass`}>
          <h3><Clock size={18} /> Recent Activity</h3>
          <div className={styles.emptyActivity}>
            <p>No recent synchronization logs found.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
