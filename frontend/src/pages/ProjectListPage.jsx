import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, deleteProject, getProject, getCrawledKeywords, formatCurrency, formatNumber } from '../utils/api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import SearchAutocomplete from '../components/shared/SearchAutocomplete.jsx';

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [crawledCount, setCrawledCount] = useState(0);
  const [randomProject, setRandomProject] = useState(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);

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
    
    // Fetch crawled keywords count
    getCrawledKeywords()
      .then(res => setCrawledCount(res.keywords ? res.keywords.length : 0))
      .catch(err => console.error('[ProjectListPage] Failed to fetch crawled count:', err));
  }, []);

  // Fetch details for a random completed project once projects load
  useEffect(() => {
    if (projects && projects.length > 0) {
      const completed = projects.filter(p => p.status === 'completed');
      if (completed.length > 0) {
        const randomIdx = Math.floor(Math.random() * completed.length);
        const selectedProj = completed[randomIdx];
        
        setLoadingRandom(true);
        getProject(selectedProj.id)
          .then(res => {
            setRandomProject(res);
            setLoadingRandom(false);
          })
          .catch(err => {
            console.error('[ProjectListPage] Failed to fetch details for random project:', err);
            setLoadingRandom(false);
          });
      }
    }
  }, [projects]);

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

  const toggleGroup = (keyword) => {
    const key = (keyword || '').toLowerCase().trim();
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Group projects by seed keyword (case-insensitive)
  const groupedProjects = useMemo(() => {
    const groups = {};
    projects.forEach(p => {
      const key = (p.seed_keyword || '').toLowerCase().trim();
      if (!key) return;
      if (!groups[key]) {
        groups[key] = {
          seed_keyword: p.seed_keyword,
          items: []
        };
      }
      groups[key].items.push(p);
    });

    // Sort the unique groups by the latest created_at date of their first item
    return Object.values(groups).sort((a, b) => {
      return new Date(b.items[0].created_at) - new Date(a.items[0].created_at);
    });
  }, [projects]);

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

  // Calculate randomized/simulated projection details
  const { simulatedKeyword, simulatedFee, simulatedRoi, simulatedRoiPct, simulatedProjectUrl } = useMemo(() => {
    let simulatedKeyword = "jasa seo jakarta";
    let simulatedFee = "Rp 45.000.000";
    let simulatedRoi = "Rp 135.000.000";
    let simulatedRoiPct = 300;
    let simulatedProjectUrl = "/query-planner/new";

    if (randomProject && randomProject.project) {
      const proj = randomProject.project;
      simulatedKeyword = proj.seed_keyword;
      const kwSlug = encodeURIComponent((proj.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      simulatedProjectUrl = `/query-planner/${proj.id}${kwSlug ? '/' + kwSlug : ''}`;
      
      // Find the 12-month horizon or first available
      const proj12 = randomProject.projections?.find(p => p.horizon_months === 12) || randomProject.projections?.[0];
      if (proj12) {
        const isUSD = proj.currency_base === 'USD';
        const feeVal = isUSD ? proj12.recommended_service_fee_usd : proj12.recommended_service_fee_idr;
        const revVal = isUSD ? proj12.revenue_usd : proj12.revenue_idr;
        
        simulatedFee = formatCurrency(feeVal, proj.currency_base).split(',')[0];
        simulatedRoi = formatCurrency(revVal, proj.currency_base).split(',')[0];
        simulatedRoiPct = feeVal > 0 ? Math.round((revVal / feeVal) * 100) : 0;
      }
    }

    return { simulatedKeyword, simulatedFee, simulatedRoi, simulatedRoiPct, simulatedProjectUrl };
  }, [randomProject]);

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

      <style>{`
        .search-tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border: 1px solid #DADCE0;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 500;
          color: #5F6368;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .search-tag-chip:hover {
          background: #F8F9FA;
          border-color: #BEC1C5;
          color: var(--ypym-black);
        }
        .hover-blue-arrow:hover {
          color: var(--ypym-blue) !important;
          transform: translateX(2px);
        }
      `}</style>

      {/* Google-like Dashboard Search Header Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem 1rem 1rem',
        background: 'transparent',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        gap: '1.25rem'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--ypym-black)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          What projection will you audit today?
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#5f6368',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          You have{' '}
          <span style={{ background: '#E8F0FE', color: '#1A73E8', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
            {projects.filter(p => p.status === 'completed').length} completed audits
          </span>
          ,{' '}
          <span style={{ background: '#FEF7E0', color: '#B06000', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
            {crawledCount} crawled keywords
          </span>{' '}
          and{' '}
          <span style={{ background: '#F3E8FF', color: '#6B21A8', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
            {projects.filter(p => p.status === 'pending' || p.status === 'processing').length} active tasks
          </span>
          . Let's review them!
        </p>

        {/* Search input container */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          margin: '0.5rem 0',
          boxShadow: '0 4px 20px rgba(11, 15, 65, 0.05)',
          borderRadius: '99px',
          border: '1px solid #DADCE0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center'
        }} className="search-bar-pill">
          <SearchAutocomplete 
            placeholder="Search or analyze keyword..." 
            containerStyle={{ maxWidth: '100%' }}
            inputStyle={{
              width: '100%',
              padding: '14px 110px 14px 54px',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--ypym-black)',
              background: 'transparent',
              border: 'none',
              borderRadius: '99px',
              outline: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />
          <div style={{
            position: 'absolute',
            right: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '11px', color: '#8F90A6', fontWeight: 500 }}>Ask AI</span>
            <span style={{
              background: '#F1F3F4',
              border: '1px solid #DADCE0',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              color: '#5F6368',
              fontWeight: 700,
              boxShadow: '0 1px 0 rgba(0,0,0,0.05)'
            }}>Tab</span>
          </div>
        </div>

        {/* Action tags */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '0.25rem',
          marginBottom: '1rem'
        }}>
          <Link to="/query-planner/new" className="search-tag-chip" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#FF5E3A' }}>⊕</span> Generate projection
          </Link>
          <a href="https://maarif88.github.io/ypym-company/index.html" target="_blank" rel="noopener noreferrer" className="search-tag-chip" style={{ textDecoration: 'none' }}>
            <span>📖</span> Read documentation
          </a>
          <div className="search-tag-chip" style={{ cursor: 'pointer' }} onClick={() => fetchProjects()}>
            <span>🔄</span> Refresh list
          </div>
        </div>
      </div>

      {/* 2 Simulation Cards Side-by-Side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto 1.5rem'
      }}>
        {/* Card 1: Investasi SEO */}
        <div className="card" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #EAF0FA',
          padding: '20px 24px',
          boxShadow: '0 8px 20px rgba(11,15,65,0.015)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px',
          position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#5f6368' }}>Berapa Investasi SEO?</span>
              {simulatedProjectUrl !== "/query-planner/new" ? (
                <Link to={simulatedProjectUrl} style={{ color: '#5f6368', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }} className="hover-blue-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Link>
              ) : (
                <span style={{ color: '#5f6368', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ypym-black)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                {loadingRandom ? (
                  <span style={{ fontSize: '16px', color: 'var(--text-note)' }}>Calculating...</span>
                ) : simulatedFee}
              </div>
              
              {/* Miniature Sparkline Charts */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px', paddingRight: '8px' }}>
                <span style={{ width: '8px', height: '14px', background: '#F1F3F4', borderRadius: '1px' }} />
                <span style={{ width: '8px', height: '22px', background: '#F1F3F4', borderRadius: '1px' }} />
                <span style={{ width: '8px', height: '18px', background: '#F1F3F4', borderRadius: '1px' }} />
                <span style={{ width: '8px', height: '32px', background: '#F1F3F4', borderRadius: '1px' }} />
                <span style={{ width: '8px', height: '26px', background: '#FF5E3A', borderRadius: '1px' }} />
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '12px', color: '#8F90A6', marginTop: '1rem', lineHeight: 1.4 }}>
            Rekomendasi nilai investasi untuk kata kunci: <strong style={{ color: 'var(--ypym-black)' }}>"{simulatedKeyword}"</strong>
          </div>
        </div>

        {/* Card 2: ROI SEO */}
        <div className="card" style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #EAF0FA',
          padding: '20px 24px',
          boxShadow: '0 8px 20px rgba(11,15,65,0.015)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '160px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#5f6368' }}>Berapa ROI dari SEO?</span>
              {simulatedProjectUrl !== "/query-planner/new" ? (
                <Link to={simulatedProjectUrl} style={{ color: '#5f6368', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }} className="hover-blue-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Link>
              ) : (
                <span style={{ color: '#5f6368', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ypym-black)', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                {loadingRandom ? (
                  <span style={{ fontSize: '16px', color: 'var(--text-note)' }}>Calculating...</span>
                ) : simulatedRoi}
              </div>

              {/* Circular Progress Ring */}
              <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0, marginRight: '4px' }}>
                <svg width="48" height="48" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F3F4" strokeWidth="3.5" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--ypym-blue)" strokeWidth="3.5" strokeDasharray={`${Math.min(simulatedRoiPct, 100)}, 100`} />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--ypym-blue)' }}>{simulatedRoiPct}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '12px', color: '#8F90A6', marginTop: '1rem', lineHeight: 1.4 }}>
            Proyeksi estimasi organic value untuk kata kunci: <strong style={{ color: 'var(--ypym-black)' }}>"{simulatedKeyword}"</strong>
          </div>
        </div>
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
          <Link to="/query-planner/new" className="btn btn-solid">Create First Projection</Link>
        </div>
      ) : (
        <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: !showAllKeywords && groupedProjects.length > 10 ? '120px' : '0' }}>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
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
                {(() => {
                  const visibleGroups = showAllKeywords ? groupedProjects : groupedProjects.slice(0, 10);
                  
                  return visibleGroups.map((group, groupIdx) => {
                    const latest = group.items[0];
                    const key = group.seed_keyword.toLowerCase().trim();
                    const isExpanded = !!expandedGroups[key];
                    const hasMultiple = group.items.length > 1;
                    
                    const kwSlug = encodeURIComponent((latest.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    const latestProjectUrl = `/query-planner/${latest.id}${kwSlug ? '/' + kwSlug : ''}`;

                    let blurAmount = 0;
                    if (!showAllKeywords && groupIdx >= 2) {
                      // We have 8 items starting from index 2 to 9
                      const steps = [0.5, 1.2, 2.0, 3.2, 4.5, 6.0, 8.0, 10.0];
                      blurAmount = steps[groupIdx - 2] || 10.0;
                    }

                    const groupStyle = {
                      filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
                      opacity: blurAmount > 0 ? Math.max(0.12, 1 - blurAmount / 11) : 1,
                      pointerEvents: blurAmount > 4 ? 'none' : 'auto',
                      transition: 'filter 0.3s ease, opacity 0.3s ease'
                    };

                    return (
                      <React.Fragment key={key}>
                        {/* Main/Latest Row */}
                        <tr style={{ background: hasMultiple ? 'rgba(26, 75, 255, 0.02)' : 'transparent', ...groupStyle }}>
                          <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                            {hasMultiple && (
                              <button
                                onClick={() => toggleGroup(group.seed_keyword)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--ypym-blue)',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'transform 0.15s ease',
                                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                }}
                              >
                                ▶
                              </button>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Link to={latestProjectUrl} style={{ fontWeight: 600, textDecoration: 'none' }}>
                                {group.seed_keyword}
                              </Link>
                              {hasMultiple && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    background: '#E2E8FF',
                                    color: 'var(--ypym-blue)',
                                    padding: '2px 6px',
                                    borderRadius: '99px',
                                    fontWeight: 500,
                                  }}
                                >
                                  {group.items.length} runs
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ padding: '3px 8px', background: 'rgba(0,102,204,0.06)', border: '1px solid rgba(0,102,204,0.12)', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--ypym-blue)' }}>
                              {latest.sector || 'General'}
                            </span>
                          </td>
                          <td className="font-mono" style={{ fontSize: '12px' }}>
                            {latest.locale_language}-{latest.locale_country} ({latest.currency_base})
                          </td>
                          <td>
                            <StatusBadge status={latest.status} />
                          </td>
                          <td className="text-right font-mono">
                            {latest.status === 'completed' ? formatNumber(latest.raw_sv_pool) : '-'}
                          </td>
                          <td className="text-right font-mono" style={{ color: 'var(--ypym-blue)', fontWeight: 600 }}>
                            {latest.status === 'completed' ? formatNumber(latest.effective_sv_pool) : '-'}
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--text-note)' }}>
                            {new Date(latest.created_at).toLocaleString('en-US')}
                          </td>
                          <td className="text-right">
                            <Link to={latestProjectUrl} className="btn btn-ghost btn-sm">Dashboard</Link>
                          </td>
                        </tr>

                        {/* Child Rows (Older versions) */}
                        {isExpanded && group.items.slice(1).map((p, idx) => {
                          const childKwSlug = encodeURIComponent((p.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                          const childProjectUrl = `/query-planner/${p.id}${childKwSlug ? '/' + childKwSlug : ''}`;
                          const versionNum = group.items.length - (idx + 1);

                          return (
                            <tr key={p.id} style={{ background: '#f8fafc', ...groupStyle }}>
                              <td></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '16px', color: 'var(--text-note)' }}>
                                  <span style={{ marginRight: '8px', color: '#cbd5e1' }}>↳</span>
                                  <Link to={childProjectUrl} style={{ textDecoration: 'none', color: 'var(--text-note)', fontSize: '13px', fontWeight: 500 }}>
                                    Scenario #{versionNum}
                                  </Link>
                                </div>
                              </td>
                              <td>
                                <span style={{ opacity: 0.5, padding: '3px 8px', background: 'rgba(0,102,204,0.06)', border: '1px solid rgba(0,102,204,0.12)', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--ypym-blue)' }}>
                                  {p.sector || 'General'}
                                </span>
                              </td>
                              <td className="font-mono" style={{ fontSize: '12px', opacity: 0.7 }}>
                                {p.locale_language}-{p.locale_country} ({p.currency_base})
                              </td>
                              <td>
                                <StatusBadge status={p.status} />
                              </td>
                              <td className="text-right font-mono" style={{ opacity: 0.8 }}>
                                {p.status === 'completed' ? formatNumber(p.raw_sv_pool) : '-'}
                              </td>
                              <td className="text-right font-mono" style={{ color: 'rgba(26, 75, 255, 0.7)', fontWeight: 600 }}>
                                {p.status === 'completed' ? formatNumber(p.effective_sv_pool) : '-'}
                              </td>
                              <td style={{ fontSize: '13px', color: 'var(--text-note)', opacity: 0.8 }}>
                                {new Date(p.created_at).toLocaleString('en-US')}
                              </td>
                              <td className="text-right">
                                <Link to={childProjectUrl} className="btn btn-ghost btn-sm" style={{ borderColor: 'rgba(26,75,255,0.15)', color: 'rgba(26, 75, 255, 0.8)' }}>Dashboard</Link>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Translucent gradient overlay with floating button */}
          {!showAllKeywords && groupedProjects.length > 10 && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '220px',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.95) 70%, rgba(255, 255, 255, 1) 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '32px',
              pointerEvents: 'none'
            }}>
              <button 
                onClick={() => setShowAllKeywords(true)}
                className="btn btn-solid"
                style={{
                  borderRadius: '99px',
                  padding: '12px 28px',
                  background: 'var(--ypym-blue)',
                  color: '#ffffff',
                  fontWeight: 600,
                  boxShadow: '0 8px 24px rgba(26, 75, 255, 0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transform: 'translateY(-10px)'
                }}
              >
                View All Keywords ({groupedProjects.length})
              </button>
            </div>
          )}

          {/* Show Less button when expanded */}
          {showAllKeywords && groupedProjects.length > 10 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
              <button 
                onClick={() => setShowAllKeywords(false)}
                className="btn btn-ghost"
                style={{
                  borderRadius: '99px',
                  padding: '10px 24px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderColor: 'rgba(26, 75, 255, 0.2)',
                  color: 'var(--ypym-blue)'
                }}
              >
                Show Less Keywords
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
