import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProject, startAnalysis, getCrawledKeywords } from '../utils/api.js';

const sectorsData = [
  { name: 'Banking', captureRate: 8.0, conversionRate: 3.0, valuePerSale: 250, valueCurrency: 'USD', rampUpMonths: 10, serviceFeePct: 30, overlapDiscount: 0.15 },
  { name: 'Insurance', captureRate: 9.5, conversionRate: 3.0, valuePerSale: 350, valueCurrency: 'USD', rampUpMonths: 9, serviceFeePct: 20, overlapDiscount: 0.14 },
  { name: 'Energy', captureRate: 5.0, conversionRate: 1.5, valuePerSale: 1200, valueCurrency: 'USD', rampUpMonths: 12, serviceFeePct: 20, overlapDiscount: 0.10 },
  { name: 'Basic Materials', captureRate: 6.0, conversionRate: 2.0, valuePerSale: 800, valueCurrency: 'USD', rampUpMonths: 9, serviceFeePct: 18, overlapDiscount: 0.14 },
  { name: 'Industrials', captureRate: 7.0, conversionRate: 2.2, valuePerSale: 500, valueCurrency: 'USD', rampUpMonths: 10, serviceFeePct: 20, overlapDiscount: 0.15 },
  { name: 'Consumer Cyclicals', captureRate: 10.0, conversionRate: 3.5, valuePerSale: 80, valueCurrency: 'USD', rampUpMonths: 8, serviceFeePct: 20, overlapDiscount: 0.16 },
  { name: 'Consumer Non-Cyclicals', captureRate: 15.0, conversionRate: 5.0, valuePerSale: 25, valueCurrency: 'USD', rampUpMonths: 8, serviceFeePct: 15, overlapDiscount: 0.18 },
  { name: 'Healthcare', captureRate: 9.0, conversionRate: 2.8, valuePerSale: 150, valueCurrency: 'USD', rampUpMonths: 11, serviceFeePct: 25, overlapDiscount: 0.13 },
  { name: 'Financials', captureRate: 8.0, conversionRate: 3.0, valuePerSale: 250, valueCurrency: 'USD', rampUpMonths: 10, serviceFeePct: 30, overlapDiscount: 0.15 },
  { name: 'Properties & Real Estate', captureRate: 5.5, conversionRate: 1.0, valuePerSale: 5000, valueCurrency: 'USD', rampUpMonths: 12, serviceFeePct: 30, overlapDiscount: 0.08 },
  { name: 'Technology', captureRate: 12.0, conversionRate: 2.5, valuePerSale: 150, valueCurrency: 'USD', rampUpMonths: 6, serviceFeePct: 25, overlapDiscount: 0.12 },
  { name: 'Infrastructures', captureRate: 4.5, conversionRate: 1.2, valuePerSale: 3000, valueCurrency: 'USD', rampUpMonths: 12, serviceFeePct: 22, overlapDiscount: 0.10 },
  { name: 'Transportation & Logistics', captureRate: 11.0, conversionRate: 4.0, valuePerSale: 120, valueCurrency: 'USD', rampUpMonths: 8, serviceFeePct: 18, overlapDiscount: 0.15 },
  { name: 'Utilities', captureRate: 8.5, conversionRate: 3.2, valuePerSale: 90, valueCurrency: 'USD', rampUpMonths: 7, serviceFeePct: 15, overlapDiscount: 0.17 },
  { name: 'Commercial Services', captureRate: 9.5, conversionRate: 3.0, valuePerSale: 350, valueCurrency: 'USD', rampUpMonths: 9, serviceFeePct: 20, overlapDiscount: 0.14 },
  { name: 'Communications', captureRate: 13.0, conversionRate: 3.8, valuePerSale: 60, valueCurrency: 'USD', rampUpMonths: 8, serviceFeePct: 18, overlapDiscount: 0.16 },
  { name: 'Producer Manufacturing', captureRate: 6.5, conversionRate: 1.8, valuePerSale: 1500, valueCurrency: 'USD', rampUpMonths: 11, serviceFeePct: 20, overlapDiscount: 0.12 },
  { name: 'Electronic Technology', captureRate: 11.5, conversionRate: 2.6, valuePerSale: 180, valueCurrency: 'USD', rampUpMonths: 7, serviceFeePct: 22, overlapDiscount: 0.13 },
  { name: 'Process Industries', captureRate: 7.0, conversionRate: 1.9, valuePerSale: 1100, valueCurrency: 'USD', rampUpMonths: 10, serviceFeePct: 18, overlapDiscount: 0.11 },
  { name: 'Distribution Services', captureRate: 10.5, conversionRate: 3.6, valuePerSale: 95, valueCurrency: 'USD', rampUpMonths: 9, serviceFeePct: 16, overlapDiscount: 0.16 },
  { name: 'Non-Energy Minerals', captureRate: 5.0, conversionRate: 1.4, valuePerSale: 2500, valueCurrency: 'USD', rampUpMonths: 12, serviceFeePct: 20, overlapDiscount: 0.09 },
  { name: 'Miscellaneous', captureRate: 10.0, conversionRate: 3.0, valuePerSale: 100, valueCurrency: 'USD', rampUpMonths: 9, serviceFeePct: 20, overlapDiscount: 0.15 },
];

export default function NewProjectPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [localeCountry, setLocaleCountry] = useState('US');
  const [localeLanguage, setLocaleLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Randomize 2 buttons + 18 dropdown on mount
  const [predefinedSectors] = useState(() => {
    const shuffled = [...sectorsData].sort(() => 0.5 - Math.random());
    const buttonSectors = shuffled.slice(0, 2);
    const dropdownSectors = shuffled.slice(2);
    dropdownSectors.sort((a, b) => a.name.localeCompare(b.name));
    return { buttons: buttonSectors, dropdown: dropdownSectors };
  });

  const [crawledKeywords, setCrawledKeywords] = useState([]);
  const [selectedSector, setSelectedSector] = useState('All');

  useEffect(() => {
    getCrawledKeywords()
      .then(res => {
        setCrawledKeywords(res.keywords || []);
      })
      .catch(err => console.error('Error fetching crawled keywords:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kwParam = params.get('keyword');
    if (kwParam) {
      setKeyword(kwParam);
      if (crawledKeywords.length > 0) {
        const match = crawledKeywords.find(k => (k.keyword || '').toLowerCase().trim() === kwParam.toLowerCase().trim());
        if (match) {
          setSector(match.sector || 'General');
        }
      }
    }
  }, [crawledKeywords]);

  // Assumptions defaults
  const [sector, setSector] = useState('General');
  const [captureRate, setCaptureRate] = useState(10);
  const [conversionRate, setConversionRate] = useState(4);
  const [valuePerSale, setValuePerSale] = useState(100);
  const [valueCurrency, setValueCurrency] = useState('USD');
  const [rampUpMonths, setRampUpMonths] = useState(9);
  const [serviceFeePct, setServiceFeePct] = useState(26);
  const [overlapDiscount, setOverlapDiscount] = useState(0.15);

  const handleSelectSector = (sector) => {
    setSector(sector.name);
    setCaptureRate(sector.captureRate);
    setConversionRate(sector.conversionRate);
    setValuePerSale(sector.valuePerSale);
    setValueCurrency(sector.valueCurrency);
    setRampUpMonths(sector.rampUpMonths);
    setServiceFeePct(sector.serviceFeePct);
    setOverlapDiscount(sector.overlapDiscount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setSubmitting(true);
    try {
      // 1. Create project
      const projectData = {
        seed_keyword: keyword.trim(),
        locale_country: localeCountry,
        locale_language: localeLanguage,
        currency_base: currency,
        currency_display: ['USD', 'IDR'],
        sector: sector,
        assumptions: {
          capture_rate_target_pct: Number(captureRate),
          conversion_rate_pct: Number(conversionRate),
          value_per_sale: {
            amount: Number(valuePerSale),
            currency: valueCurrency,
          },
          ramp_up_months_to_target: Number(rampUpMonths),
          service_fee_pct: Number(serviceFeePct),
          overlap_discount_factor: Number(overlapDiscount),
        }
      };

      const res = await createProject(projectData);
      
      // 2. Trigger analysis background task
      await startAnalysis(res.id);

      // 3. Redirect to dashboard with user-friendly keyword slug
      const kwSlug = encodeURIComponent((res.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      navigate(`/query-planner/${res.id}${kwSlug ? '/' + kwSlug : ''}`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate projection: ' + (err.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  const pageUrl = window.location.href;
  const pageTitle = "YPYM Appraisal - Start New Keyword Analysis";
  const encUrl = encodeURIComponent(pageUrl);
  const encTxt = encodeURIComponent(pageTitle);
  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
    x:        `https://x.com/intent/tweet?url=${encUrl}&text=${encTxt}`,
    wa:       `https://wa.me/?text=${encTxt}%20${encUrl}`,
    tg:       `https://t.me/share/url?url=${encUrl}&text=${encTxt}`,
  };
  const filteredKeywords = crawledKeywords.filter(k => {
    const isCountryMatch = (k.location || '').toLowerCase().trim() === localeCountry.toLowerCase().trim();
    const isLangMatch = localeLanguage === 'en'
      ? (k.lang || '').toLowerCase().trim() === 'english'
      : localeLanguage === 'id'
        ? (k.lang || '').toLowerCase().trim() === 'indonesian'
        : true;
    return isCountryMatch && isLangMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', paddingBottom: '4rem' }}>
      <style>{`
        .assumption-dark-card {
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 1px solid #1C1C1E !important;
          padding: 2rem;
          border-radius: 16px;
        }
        .assumption-dark-card label {
          color: #ffffff !important;
        }
        .assumption-dark-card .font-mono {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .assumption-dark-card input,
        .assumption-dark-card select {
          background-color: #18181B !important;
          color: #ffffff !important;
          border: 1px solid #27272A !important;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .assumption-dark-card input:focus,
        .assumption-dark-card select:focus {
          background-color: #27272A !important;
          border-color: #52525B !important;
          outline: none;
        }
        .dark-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #1C1C1E;
          padding-bottom: 1rem;
          flex-wrap: wrap;
        }
        .sector-quick-select {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .btn-sector-preset {
          background-color: #1C1C1E;
          color: #ffffff;
          border: 1px solid #2C2C2E;
          border-radius: 99px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s, border-color 0.15s, transform 0.1s;
          display: inline-flex;
          align-items: center;
        }
        .btn-sector-preset:hover {
          background-color: #2C2C2E;
          border-color: #48484A;
        }
        .btn-sector-preset:active {
          transform: scale(0.97);
        }
        .select-sector-preset {
          background-color: #1C1C1E !important;
          color: #ffffff !important;
          border: 1px solid #2C2C2E !important;
          border-radius: 99px !important;
          padding: 5px 12px !important;
          font-size: 12px !important;
          cursor: pointer !important;
          width: auto !important;
          height: auto !important;
          outline: none !important;
        }
        .select-sector-preset:hover {
          background-color: #2C2C2E !important;
          border-color: #48484A !important;
        }
        @media (max-width: 768px) {
          .dark-card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .sector-quick-select {
            width: 100%;
            justify-content: flex-start;
          }
        }
        
        /* Premium Stepper Split Layout */
        .new-project-split-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2.5rem;
          width: 100%;
          align-items: start;
        }
        .stepper-sidebar {
          position: sticky;
          top: 2rem;
          background: #ffffff;
          border: 1px solid #EAF0FA;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 24px rgba(11,15,65,0.015);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .stepper-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--ypym-black);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 0.75rem;
        }
        .stepper-items {
          display: flex;
          flex-direction: column;
          position: relative;
          gap: 1.5rem;
        }
        .stepper-items::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 15px;
          bottom: 15px;
          width: 2px;
          background: #E2E8F0;
          z-index: 1;
        }
        .stepper-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          z-index: 2;
        }
        .stepper-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F1F5F9;
          border: 2px solid #E2E8F0;
          color: #64748B;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .stepper-item.active .stepper-icon {
          background: #E2E8FF;
          border-color: var(--ypym-blue);
          color: var(--ypym-blue);
          box-shadow: 0 0 0 4px rgba(26, 75, 255, 0.1);
        }
        .stepper-item.completed .stepper-icon {
          background: #DCFCDE;
          border-color: #09B812;
          color: #09B812;
        }
        .stepper-text {
          display: flex;
          flex-direction: column;
        }
        .stepper-label {
          font-size: 11px;
          font-weight: 600;
          color: #94A3B8;
          text-transform: uppercase;
        }
        .stepper-desc {
          font-size: 13px;
          font-weight: 600;
          color: var(--ypym-black);
        }
        .stepper-item.completed .stepper-desc {
          color: #09B812;
        }
        .checkmark {
          width: 14px;
          height: 14px;
        }
        .stepper-help {
          background: rgba(26, 75, 255, 0.02);
          border: 1px dashed rgba(26, 75, 255, 0.15);
          border-radius: 12px;
          padding: 1.25rem;
          margin-top: 1rem;
        }
        .stepper-help h4 {
          font-size: 12px;
          font-weight: 700;
          color: var(--ypym-blue);
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
        }
        .stepper-help p {
          font-size: 12px;
          color: var(--text-note);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @media (max-width: 1024px) {
          .new-project-split-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .stepper-sidebar {
            position: relative;
            top: 0;
          }
          .stepper-items {
            flex-direction: row;
            justify-content: space-between;
          }
          .stepper-items::before {
            display: none;
          }
        }
      `}</style>

      {/* YPYM Breadcrumbs & Share Bar */}
      <div className="tsl-topbar">
        <nav className="tsl-breadcrumb" aria-label="Breadcrumb">
          <ol className="tsl-bc-list">
            <li><Link to="/" className="tsl-bc-link">Home</Link></li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="tsl-bc-chevron"><path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <Link to="/query-planner" className="tsl-bc-link">Query Planner</Link>
            </li>
            <li>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="tsl-bc-chevron"><path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="tsl-bc-current">New Analysis</span>
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

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginTop: '0.5rem', marginBottom: '0.5rem', fontSize: '32px', fontWeight: 700, color: 'var(--ypym-black)' }}>Start New Keyword Analysis</h1>
        <p style={{ color: 'var(--text-note)', fontSize: '15px', maxWidth: '680px', lineHeight: '1.5' }}>
          Input your target seed keyword below. The system will automatically retrieve Google Autocomplete variations, search interest trends, cluster keywords, and calculate estimated ROI.
        </p>
      </div>

      {/* Main Split Layout Container */}
      <div className="new-project-split-layout">
        
        {/* Left: Sticky Stepper Sidebar */}
        <div className="stepper-sidebar">
          <div className="stepper-title">Analysis Steps</div>
          <div className="stepper-items">
            {/* Step 1: Location & Language */}
            <div
              className={`stepper-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(1)}
              style={{ cursor: 'pointer' }}
            >
              <div className="stepper-icon">
                {currentStep > 1 ? (
                  <svg className="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : '1'}
              </div>
              <div className="stepper-text">
                <div className="stepper-label">Step 1</div>
                <div className="stepper-desc">Location & Language</div>
              </div>
            </div>
            
            {/* Step 2: Target Keyword */}
            <div
              className={`stepper-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(2)}
              style={{ cursor: 'pointer' }}
            >
              <div className="stepper-icon">
                {currentStep > 2 ? (
                  <svg className="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : '2'}
              </div>
              <div className="stepper-text">
                <div className="stepper-label">Step 2</div>
                <div className="stepper-desc">Select Keyword Target</div>
              </div>
            </div>

            {/* Step 3: Projection Currency */}
            <div
              className={`stepper-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}
              onClick={() => {
                if (keyword.trim()) setCurrentStep(3);
              }}
              style={{ cursor: keyword.trim() ? 'pointer' : 'not-allowed', opacity: keyword.trim() ? 1 : 0.6 }}
            >
              <div className="stepper-icon">
                {currentStep > 3 ? (
                  <svg className="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : '3'}
              </div>
              <div className="stepper-text">
                <div className="stepper-label">Step 3</div>
                <div className="stepper-desc">Projection Currency</div>
              </div>
            </div>

            {/* Step 4: Audit Assumptions */}
            <div
              className={`stepper-item ${currentStep === 4 ? 'active' : ''}`}
              onClick={() => {
                if (keyword.trim()) setCurrentStep(4);
              }}
              style={{ cursor: keyword.trim() ? 'pointer' : 'not-allowed', opacity: keyword.trim() ? 1 : 0.6 }}
            >
              <div className="stepper-icon">
                4
              </div>
              <div className="stepper-text">
                <div className="stepper-label">Step 4</div>
                <div className="stepper-desc">Audit Assumptions</div>
              </div>
            </div>
          </div>
          
          <div className="stepper-help">
            <h4>Need Assistance?</h4>
            <p>Select any available crawled keyword to automatically fill out the recommended industry assumptions.</p>
            <a href="https://maarif88.github.io/ypym-company/index.html" target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm" style={{ width: '100%', justifyContent: 'center', background: '#ffffff', borderColor: '#EAF0FA' }}>Read Documentation</a>
          </div>
        </div>

        {/* Right: Main Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Step 1: Target Location & Language Panel */}
          {currentStep === 1 && (
            <div className="card animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--ypym-black)' }}>
                  Step 1: Select Location & Language
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-note)', margin: 0 }}>
                  Choose the target geocoding country and language. This will automatically filter the available crawled keywords database.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="locale" style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Target Location & Language</label>
                <select
                  id="locale"
                  value={`${localeLanguage}-${localeCountry}`}
                  onChange={(e) => {
                    const [lang, country] = e.target.value.split('-');
                    setLocaleLanguage(lang);
                    setLocaleCountry(country);
                  }}
                  disabled={submitting}
                  style={{ fontSize: '14px', padding: '10px', borderRadius: '8px', width: '100%', border: '1px solid #DADCE0' }}
                >
                  <option value="en-US">United States (English - US)</option>
                  <option value="id-ID">Indonesia (Indonesian - ID)</option>
                  <option value="en-GB">United Kingdom (English - GB)</option>
                  <option value="en-SG">Singapore (English - SG)</option>
                  <option value="en-NL">Netherlands (English - NL)</option>
                  <option value="en-HK">Hong Kong (English - HK)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #EAF0FA', paddingTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate('/query-planner')}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => setCurrentStep(2)}
                  style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}
                >
                  Next: Select Keyword
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Target Keyword Selection Panel */}
          {currentStep === 2 && (
            <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--ypym-black)' }}>
                  Step 2: Select Keyword Target
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-note)', margin: 0 }}>
                  Choose from the crawled keywords matching your selected location & language, or enter a custom seed keyword.
                </p>
              </div>

              {/* Crawled Keywords Sub-Panel */}
              <div style={{ border: '1px solid rgba(0, 102, 204, 0.12)', backgroundColor: 'rgba(0, 102, 204, 0.01)', padding: '1.25rem', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ypym-blue)' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--ypym-blue)' }}></span>
                  Available Crawled Keywords for {localeCountry} ({localeLanguage.toUpperCase()})
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-note)', marginBottom: '1rem' }}>
                  These keywords have pre-fetched dataset ideas for your selected locale. Click to auto-fill preset assumptions.
                </p>
                
                {filteredKeywords.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-note)', fontStyle: 'italic', margin: 0 }}>
                    No crawled keywords found for {localeCountry} ({localeLanguage.toUpperCase()}) in the database. Enter a custom target seed keyword below to proceed.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Filter Tabs by Sector */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem' }}>
                      {['All', ...Array.from(new Set(filteredKeywords.map(k => k.sector)))].map(sec => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSelectedSector(sec)}
                          className="btn btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: selectedSector === sec ? 'var(--ypym-blue)' : '#f5f5f7',
                            color: selectedSector === sec ? '#fff' : 'var(--text-main)',
                            border: '1px solid ' + (selectedSector === sec ? 'var(--ypym-blue)' : '#e5e5ea'),
                            borderRadius: '99px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: selectedSector === sec ? '600' : '500'
                          }}
                        >
                          {["Executive Search & Recruitment", "Technology / SaaS", "Construction & EPC", "Energy (Oil, Gas, Power)", "Mining", "Manufacturing"].includes(sec) && (
                            <span style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: selectedSector === sec ? '#ffffff' : '#09b812',
                              marginRight: '6px',
                              flexShrink: 0
                            }}></span>
                          )}
                          {sec}
                        </button>
                      ))}
                    </div>
                    
                    {/* Keywords grid */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxHeight: '160px', overflowY: 'auto', padding: '2px' }}>
                      {filteredKeywords
                        .filter(k => selectedSector === 'All' || k.sector === selectedSector)
                        .map(k => {
                          const isActive = keyword === k.keyword;
                          return (
                            <button
                              key={`${k.keyword}_${k.location}_${k.lang}`}
                              type="button"
                              onClick={() => {
                                setKeyword(k.keyword);
                                const preset = sectorsData.find(s => s.name.toLowerCase() === k.sector.toLowerCase()) || 
                                               sectorsData.find(s => s.name === 'Financials');
                                if (preset) {
                                  handleSelectSector(preset);
                                }
                              }}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                border: '1px solid',
                                borderRadius: '8px',
                                background: isActive ? 'rgba(0,102,204,0.08)' : '#ffffff',
                                borderColor: isActive ? 'var(--ypym-blue)' : '#e5e5ea',
                                color: isActive ? 'var(--ypym-blue)' : 'var(--text-main)',
                                fontWeight: isActive ? '600' : 'normal',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              {k.keyword}
                              <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '6px', padding: '1px 5px', background: '#f2f2f7', borderRadius: '4px', color: '#555' }}>
                                {k.sector}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom/Seed Keyword Input Box */}
              <div>
                <label htmlFor="keyword" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' }}>Target Seed Keyword</label>
                <input
                  type="text"
                  id="keyword"
                  placeholder="e.g., executive search, software developer, etc."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                  disabled={submitting}
                  style={{ fontSize: '15px', padding: '10px 14px', borderRadius: '8px', width: '100%', border: '1px solid #DADCE0' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EAF0FA', paddingTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCurrentStep(1)}
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-solid"
                  disabled={!keyword.trim()}
                  onClick={() => setCurrentStep(3)}
                  style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}
                >
                  Next: Set Currency
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Base Projection Currency Panel */}
          {currentStep === 3 && (
            <div className="card animate-fade-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--ypym-black)' }}>
                  Step 3: Base Projection Currency
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-note)', margin: 0 }}>
                  Choose the display currency for financial ROI modeling and projections.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="currency" style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Base Projection Currency</label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.target.value);
                    setValueCurrency(e.target.value);
                  }}
                  disabled={submitting}
                  style={{ fontSize: '14px', padding: '10px', borderRadius: '8px', width: '100%', border: '1px solid #DADCE0' }}
                >
                  <option value="USD">USD ($) - Dollar</option>
                  <option value="IDR">IDR (Rp) - Rupiah</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EAF0FA', paddingTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCurrentStep(2)}
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={() => setCurrentStep(4)}
                  style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 600, borderRadius: '8px' }}
                >
                  Next: Audit Assumptions
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Assumptions Panel (Black Card) */}
          {currentStep === 4 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card assumption-dark-card">
                <div className="dark-card-header">
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#ffffff' }}>
                      Step 4: Audit Assumption Parameters & Modeling
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0 0 0' }}>
                      Adjust conversion rates, average transaction values, capture targets, and service fees.
                    </p>
                  </div>
                  <div className="sector-quick-select">
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                      Presets:
                    </span>
                    {predefinedSectors.buttons.map(s => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => handleSelectSector(s)}
                        className="btn-sector-preset"
                      >
                        {s.name}
                      </button>
                    ))}
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const sec = predefinedSectors.dropdown.find(d => d.name === val);
                        if (sec) handleSelectSector(sec);
                        e.target.value = '';
                      }}
                      className="select-sector-preset"
                    >
                      <option value="">More ({predefinedSectors.dropdown.length})...</option>
                      {predefinedSectors.dropdown.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div className="grid-2">
                    <div>
                      <label htmlFor="captureRate">Target Capture Rate (%)</label>
                      <input
                        type="number"
                        id="captureRate"
                        value={captureRate}
                        onChange={(e) => setCaptureRate(e.target.value)}
                        min="0.1"
                        max="100"
                        step="0.1"
                        required
                        disabled={submitting}
                      />
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Target percentage of the search traffic pool captured.
                      </span>
                    </div>

                    <div>
                      <label htmlFor="conversionRate">Baseline Conversion Rate (%)</label>
                      <input
                        type="number"
                        id="conversionRate"
                        value={conversionRate}
                        onChange={(e) => setConversionRate(e.target.value)}
                        min="0.1"
                        max="100"
                        step="0.1"
                        required
                        disabled={submitting}
                      />
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Baseline conversion rate before intent multiplier.
                      </span>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div>
                      <label htmlFor="valuePerSale">Value per Transaction / Sale</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="number"
                          id="valuePerSale"
                          value={valuePerSale}
                          onChange={(e) => setValuePerSale(e.target.value)}
                          min="0"
                          required
                          disabled={submitting}
                          style={{ flex: 1 }}
                        />
                        <select
                          value={valueCurrency}
                          onChange={(e) => setValueCurrency(e.target.value)}
                          disabled={submitting}
                          style={{ width: '90px' }}
                        >
                          <option value="USD">USD</option>
                          <option value="IDR">IDR</option>
                        </select>
                      </div>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Average Order Value (AOV) or qualified lead value.
                      </span>
                    </div>

                    <div>
                      <label htmlFor="rampUpMonths">Ranking Ramp-Up Period (Months)</label>
                      <input
                        type="number"
                        id="rampUpMonths"
                        value={rampUpMonths}
                        onChange={(e) => setRampUpMonths(e.target.value)}
                        min="1"
                        max="36"
                        required
                        disabled={submitting}
                      />
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Timeframe to reach peak search optimization using a logistic curve.
                      </span>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div>
                      <label htmlFor="serviceFeePct">SEO Service Fee %</label>
                      <input
                        type="number"
                        id="serviceFeePct"
                        value={serviceFeePct}
                        onChange={(e) => setServiceFeePct(e.target.value)}
                        min="0"
                        max="100"
                        required
                        disabled={submitting}
                      />
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Monthly SEO service fee modeled as a percentage of gross organic revenue.
                      </span>
                    </div>

                    <div>
                      <label htmlFor="overlapDiscount">Cluster Overlap Discount Factor</label>
                      <input
                        type="number"
                        id="overlapDiscount"
                        value={overlapDiscount}
                        onChange={(e) => setOverlapDiscount(e.target.value)}
                        min="0"
                        max="1"
                        step="0.01"
                        required
                        disabled={submitting}
                      />
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Incremental contribution of secondary keywords (default 0.15).
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stepper bottom execute buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem',
                marginTop: '2rem',
                borderTop: '1px solid #EAF0FA',
                paddingTop: '1.5rem'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setCurrentStep(3)}
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-solid"
                    disabled={submitting || !keyword.trim()}
                    style={{
                      padding: '12px 32px',
                      fontSize: '14px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      boxShadow: '0 4px 14px rgba(26, 75, 255, 0.25)'
                    }}
                  >
                    {submitting ? 'Processing Pipeline...' : 'Fetch Data'}
                  </button>
                </div>
                <span style={{ fontSize: '11px', color: '#8F90A6', textAlign: 'right', maxWidth: '320px', lineHeight: 1.4 }}>
                  fetch data from Google Ads, Google Trends, Google Search Suggestion Query
                </span>
              </div>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
