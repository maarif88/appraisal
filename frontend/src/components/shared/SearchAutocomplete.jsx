import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { listProjects, getCrawledKeywords, createProject, startAnalysis } from '../../utils/api.js';

export default function SearchAutocomplete({ placeholder = "Search or analyze keyword...", defaultValue = "", inputStyle = {}, containerStyle = {} }) {
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);
  const [projects, setProjects] = useState([]);
  const [crawledKeywords, setCrawledKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all projects
    listProjects()
      .then(res => setProjects(res.projects || []))
      .catch(err => console.error('[Autocomplete] Failed to load projects:', err));

    // Fetch crawled keywords
    getCrawledKeywords()
      .then(res => setCrawledKeywords(res.keywords || []))
      .catch(err => console.error('[Autocomplete] Failed to load crawled keywords:', err));
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate suggestions based on input query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    
    // Find matching projects (grouped by seed keyword)
    const matchedProjectsMap = new Map();
    projects.forEach(p => {
      if ((p.seed_keyword || '').toLowerCase().includes(cleanQuery)) {
        const key = p.seed_keyword.toLowerCase().trim();
        // Keep the latest run project
        if (!matchedProjectsMap.has(key)) {
          matchedProjectsMap.set(key, p);
        }
      }
    });

    const projectSuggestions = Array.from(matchedProjectsMap.values()).map(p => ({
      id: p.id,
      keyword: p.seed_keyword,
      sector: p.sector,
      type: 'project',
      label: 'Go to Dashboard'
    }));

    // Find matching crawled keywords that DO NOT have an existing project
    const existingProjectKeys = new Set(projects.map(p => p.seed_keyword.toLowerCase().trim()));
    const matchedCrawled = crawledKeywords
      .filter(k => 
        (k.keyword || '').toLowerCase().includes(cleanQuery) && 
        !existingProjectKeys.has((k.keyword || '').toLowerCase().trim())
      )
      .map(k => ({
        keyword: k.keyword,
        sector: k.sector,
        lang: k.lang,
        location: k.location,
        type: 'crawled',
        label: 'Run Analysis'
      }));

    // Combine: projects first, then crawled
    setSuggestions([...projectSuggestions, ...matchedCrawled].slice(0, 10));
  }, [query, projects, crawledKeywords]);

  const handleSelect = async (item) => {
    setIsOpen(false);
    setQuery(item.keyword);
    
    if (item.type === 'project') {
      const kwSlug = encodeURIComponent((item.keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      navigate(`/query-planner/${item.id}${kwSlug ? '/' + kwSlug : ''}`);
    } else if (item.type === 'crawled') {
      setSubmitting(true);
      try {
        const projectData = {
          seed_keyword: item.keyword,
          locale_country: item.location || 'ID',
          locale_language: item.lang === 'English' ? 'en' : (item.lang === 'Indonesian' ? 'id' : item.lang || 'id'),
          currency_base: 'USD',
          currency_display: ['USD', 'IDR'],
          sector: item.sector || 'General',
          assumptions: {
            capture_rate_target_pct: 10,
            conversion_rate_pct: 4,
            value_per_sale: { amount: 100, currency: 'USD' },
            ramp_up_months_to_target: 9,
            service_fee_pct: 26,
            overlap_discount_factor: 0.15
          }
        };

        const res = await createProject(projectData);
        await startAnalysis(res.id);
        
        const kwSlug = encodeURIComponent((res.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        navigate(`/query-planner/${res.id}${kwSlug ? '/' + kwSlug : ''}`);
      } catch (err) {
        console.error(err);
        alert('Failed to generate projection: ' + (err.message || 'Unknown error'));
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      alert(`Keyword "${query}" has not been crawled yet. Please run the crawler script first.`);
    }
  };

  const clearRightOffset = inputStyle.paddingRight 
    ? (parseInt(inputStyle.paddingRight) - 24) + 'px' 
    : '16px';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '580px', ...containerStyle }}>
      <form onSubmit={handleSubmit} style={{ margin: 0, padding: 0 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '16px', color: '#8F90A6', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            type="text"
            placeholder={submitting ? "Starting analysis..." : placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--ypym-black)',
              background: '#F4F5F9',
              border: '1px solid transparent',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
              ...inputStyle
            }}
            className="search-input-focus"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              style={{
                position: 'absolute',
                right: clearRightOffset,
                background: 'transparent',
                border: 'none',
                color: '#8F90A6',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(11, 15, 65, 0.15)',
          marginTop: '6px',
          zIndex: 99999,
          overflow: 'hidden',
          border: '1px solid var(--border-light)'
        }}>
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item)}
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                borderBottom: idx < suggestions.length - 1 ? '1px solid #F4F5F9' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FC'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#8F90A6', display: 'flex', alignItems: 'center' }}>
                  {item.type === 'project' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  )}
                </span>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ypym-black)' }}>{item.keyword}</span>
                  <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(0,102,204,0.06)', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: 'var(--ypym-blue)' }}>
                    {item.sector || 'General'}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ypym-blue)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .search-input-focus:focus {
          background: #ffffff !important;
          border-color: var(--border-hover) !important;
          box-shadow: 0 4px 12px rgba(26, 75, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
