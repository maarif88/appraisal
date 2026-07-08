import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, deleteProject } from '../utils/api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import { formatNumber } from '../utils/api.js';

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = () => {
    setLoading(true);
    listProjects()
      .then(res => {
        setProjects(res.projects);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to load projection list');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id, keyword) => {
    if (!window.confirm(`Are you sure you want to delete the projection for keyword "${keyword}"?`)) {
      return;
    }
    
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete projection: ' + err.message);
    }
  };

  const pageUrl = window.location.href;
  const pageTitle = "YPYM Appraisal - Keyword Projection History";
  const encUrl = encodeURIComponent(pageUrl);
  const encTxt = encodeURIComponent(pageTitle);
  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
    x:        `https://x.com/intent/tweet?url=${encUrl}&text=${encTxt}`,
    wa:       `https://wa.me/?text=${encTxt}%20${encUrl}`,
    tg:       `https://t.me/share/url?url=${encUrl}&text=${encTxt}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', marginTop: '1rem' }}>
      {/* YPYM Breadcrumbs & Share Bar */}
      <div className="tsl-topbar">
        <nav className="tsl-breadcrumb" aria-label="Breadcrumb">
          <ol className="tsl-bc-list">
            <li><Link to="/" className="tsl-bc-link">Home</Link></li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="tsl-bc-chevron"><path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <Link to="/" className="tsl-bc-link">YPYM Appraisal</Link>
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="tsl-bc-chevron"><path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="tsl-bc-current">Projection History</span>
            </li>
          </ol>
        </nav>
        
        <div className="tsl-share-row" role="group" aria-label="Share this page">
          <span className="tsl-share-icon" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </span>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on LinkedIn" title="LinkedIn" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` }} />
          <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on X" title="X" dangerouslySetInnerHTML={{ __html: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` }} />
          <a href={shareLinks.wa} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on WhatsApp" title="WhatsApp" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>` }} />
          <a href={shareLinks.tg} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on Telegram" title="Telegram" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>` }} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="eyebrow" style={{ color: 'var(--ypym-blue)' }}>Projection History</span>
          <h1 style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>All Keyword Projections</h1>
          <p style={{ color: 'var(--text-note)', fontSize: '15px' }}>
            List of all target keywords that have been analyzed and had their investment value audited.
          </p>
        </div>
        <Link to="/projects/new" className="btn btn-solid">New Projection</Link>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ fontFamily: 'var(--font-mono)' }}>Loading projection list...</p>
        </div>
      ) : error ? (
        <div className="callout callout-error">
          <span className="callout-title">Error</span>
          <p>{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-note)', marginBottom: '1.5rem', fontSize: '16px' }}>
            No projections have been generated yet. Get started by creating a new projection.
          </p>
          <Link to="/projects/new" className="btn btn-solid">Create First Projection</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Seed Keyword</th>
                <th>Sector</th>
                <th>Target Locale</th>
                <th>Status</th>
                <th className="text-right">Raw SV Pool</th>
                <th className="text-right">Effective SV Pool</th>
                <th>Created Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const kwSlug = encodeURIComponent((p.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                const projectUrl = `/projects/${p.id}${kwSlug ? '/' + kwSlug : ''}`;
                return (
                  <tr key={p.id}>
                    <td>
                      <Link to={projectUrl} style={{ fontWeight: 600, textDecoration: 'none' }}>
                        {p.seed_keyword}
                      </Link>
                    </td>
                    <td>
                      <span style={{ padding: '3px 8px', background: 'rgba(0,102,204,0.06)', border: '1px solid rgba(0,102,204,0.12)', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--ypym-blue)' }}>
                        {p.sector || 'General'}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '12px' }}>
                      {p.locale_language}-{p.locale_country} ({p.currency_base})
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="text-right font-mono">
                      {p.status === 'completed' ? formatNumber(p.raw_sv_pool) : '-'}
                    </td>
                    <td className="text-right font-mono" style={{ color: 'var(--ypym-blue)', fontWeight: 600 }}>
                      {p.status === 'completed' ? formatNumber(p.effective_sv_pool) : '-'}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-note)' }}>
                      {new Date(p.created_at).toLocaleString('en-US')}
                    </td>
                    <td className="text-right" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link to={projectUrl} className="btn btn-ghost btn-sm">Dashboard</Link>
                      <button 
                        onClick={() => handleDelete(p.id, p.seed_keyword)} 
                        className="btn btn-light btn-sm"
                        style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
