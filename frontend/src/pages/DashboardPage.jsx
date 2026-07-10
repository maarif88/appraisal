import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProject, reproject, exportProject } from '../utils/api.js';
import { LoadingSpinner } from '../components/shared/LoadingStates.jsx';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import CurrencyDisplay from '../components/shared/CurrencyDisplay.jsx';
import { formatNumber, formatCurrency } from '../utils/api.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import SearchAutocomplete from '../components/shared/SearchAutocomplete.jsx';

import { LineChart, Line, BarChart, Bar, AreaChart, Area, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  // Editable Assumptions State
  const [captureRate, setCaptureRate] = useState(10);
  const [conversionRate, setConversionRate] = useState(4);
  const [valuePerSale, setValuePerSale] = useState(100);
  const [valueCurrency, setValueCurrency] = useState('USD');
  const [rampUpMonths, setRampUpMonths] = useState(9);
  const [serviceFeePct, setServiceFeePct] = useState(26);
  const [overlapDiscount, setOverlapDiscount] = useState(0.15);
  const [recalculating, setRecalculating] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(window.innerWidth > 768);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedHorizon, setSelectedHorizon] = useState(24);
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');

  const handleSliderScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const clientWidth = e.target.clientWidth;
    if (clientWidth > 0) {
      const activeIdx = Math.round(scrollLeft / (clientWidth + 16));
      setActiveSlide(activeIdx);
    }
  };

  // Table filters & sorting
  const [selectedKeywords, setSelectedKeywords] = useState({});
  const getGoogleAdsSvRange = (sv) => {
    if (sv === undefined || sv === null) return '—';
    if (sv < 10) return '0 - 10';
    if (sv < 100) return '10 - 100';
    if (sv < 1000) return '100 - 1K';
    if (sv < 10000) return '1K - 10K';
    if (sv < 100000) return '10K - 100K';
    if (sv < 1000000) return '100K - 1M';
    return '1M+';
  };

  const [keywordSearch, setKeywordSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortField, setSortField] = useState('avg_monthly_sv');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchProjectData = (showLoading = true) => {
    if (showLoading) setLoading(true);
    getProject(id)
      .then(res => {
        setData(res);
        setLoading(false);
        setError(null);

        // Prepopulate assumptions state
        const assumptions = res.project.assumptions;
        setCaptureRate(assumptions.capture_rate_target_pct);
        setConversionRate(assumptions.conversion_rate_pct);
        setValuePerSale(assumptions.value_per_sale.amount);
        setValueCurrency(assumptions.value_per_sale.currency);
        setRampUpMonths(assumptions.ramp_up_months_to_target);
        setServiceFeePct(assumptions.service_fee_pct);
        setOverlapDiscount(assumptions.overlap_discount_factor || 0.15);

        // Manage status polling
        const status = res.project.status;
        if (status !== 'completed' && status !== 'failed') {
          if (!pollIntervalRef.current) {
            pollIntervalRef.current = setInterval(() => {
              fetchProjectData(false);
            }, 2000);
          }
        } else {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Failed to load projection details');
        setLoading(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      });
  };

  useEffect(() => {
    fetchProjectData();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPanelVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleReproject = async (e) => {
    e.preventDefault();
    setRecalculating(true);
    try {
      const assumptions = {
        capture_rate_target_pct: Number(captureRate),
        conversion_rate_pct: Number(conversionRate),
        value_per_sale: {
          amount: Number(valuePerSale),
          currency: valueCurrency,
        },
        ramp_up_months_to_target: Number(rampUpMonths),
        service_fee_pct: Number(serviceFeePct),
        overlap_discount_factor: Number(overlapDiscount),
      };

      const res = await reproject(id, assumptions);
      // Update local state with recalculated projection values
      setData(prev => ({
        ...prev,
        project: {
          ...prev.project,
          assumptions: res.assumptions
        },
        projections: res.projections
      }));
      setRecalculating(false);
    } catch (err) {
      console.error(err);
      alert('Failed to recalculate: ' + (err.message || 'Unknown error'));
      setRecalculating(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await exportProject(id, format);
      if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `ypym-appraisal-projection-${data.project.seed_keyword}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } else if (format === 'csv') {
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(res);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `ypym-appraisal-keywords-${data.project.seed_keyword}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to export data: ' + err.message);
    }
  };

  const generatePDFBlob = async (element) => {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#F8FAFC',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('dashboard-cards-container');
        if (clonedElement) {
          clonedElement.style.padding = '32px';
        }
      }
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    return { pdf, filename: `YPYM-Appraisal-Report-${data.project.seed_keyword}.pdf` };
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('dashboard-cards-container');
    if (!element) {
      alert('Could not find dashboard cards element to capture');
      return;
    }
    setExportDropdownOpen(false);
    try {
      const { pdf, filename } = await generatePDFBlob(element);
      pdf.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF: ' + err.message);
    }
  };

  const handleDownloadJPEG = async () => {
    const element = document.getElementById('dashboard-cards-container');
    if (!element) {
      alert('Could not find dashboard cards element to capture');
      return;
    }
    setExportDropdownOpen(false);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F8FAFC',
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('dashboard-cards-container');
          if (clonedElement) {
            clonedElement.style.padding = '32px';
          }
        }
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `YPYM-Appraisal-Insights-${data.project.seed_keyword}.jpg`;
      link.click();
    } catch (err) {
      console.error('Error capturing JPEG:', err);
      alert('Failed to download JPEG: ' + err.message);
    }
  };

  const handleSendEmailSubmit = async (e) => {
    e.preventDefault();
    if (!recipientEmail) return;
    
    const element = document.getElementById('dashboard-cards-container');
    if (!element) {
      alert('Could not find dashboard cards element to capture');
      return;
    }
    
    setEmailSending(true);
    try {
      const { pdf } = await generatePDFBlob(element);
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      
      const response = await fetch(`/api/v1/projects/${id}/email-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: recipientEmail,
          pdfBase64
        })
      });
      
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to email report');
      }
      
      setEmailSuccessMessage(`Report successfully sent to ${recipientEmail}!`);
      setEmailModalOpen(false);
      
      setTimeout(() => {
        setEmailSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email: ' + err.message);
    } finally {
      setEmailSending(false);
    }
  };

  const broadenSuggestions = useMemo(() => {
    if (!data) return [];
    const { project, keywords, trends } = data;
    let list = [];
    if (trends?.rising_queries?.length) {
      list = trends.rising_queries.map(q => q.Query || q.query).filter(Boolean);
    }
    if (list.length < 3 && trends?.top_queries?.length) {
      const topList = trends.top_queries.map(q => q.Query || q.query).filter(Boolean);
      list = [...list, ...topList];
    }
    if (list.length < 3 && keywords?.length) {
      const kwList = keywords.filter(k => !k.is_cluster_primary).map(k => k.keyword);
      list = [...list, ...kwList];
    }
    const seed = (project?.seed_keyword || '').toLowerCase().trim();
    return Array.from(new Set(list))
      .filter(item => item.toLowerCase().trim() !== seed)
      .slice(0, 8);
  }, [data]);

  if (loading && !data) {
    return <LoadingSpinner message="Connecting to server & loading projection details..." />;
  }

  if (error) {
    return (
      <div className="callout callout-error" style={{ marginTop: '2rem' }}>
        <span className="callout-title">Failed to Load Projection</span>
        <p>{error}</p>
        <Link to="/" className="btn btn-solid mt-4">Back to Home</Link>
      </div>
    );
  }

  const { project, keywords, trends, projections, cost_ledger } = data;

  const pageUrl = window.location.href;
  const pageTitle = `YPYM Appraisal - SEO Projection for ${project.seed_keyword}`;
  const encUrl = encodeURIComponent(pageUrl);
  const encTxt = encodeURIComponent(pageTitle);
  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
    x:        `https://x.com/intent/tweet?url=${encUrl}&text=${encTxt}`,
    wa:       `https://wa.me/?text=${encTxt}%20${encUrl}`,
    tg:       `https://t.me/share/url?url=${encUrl}&text=${encTxt}`,
  };

  // Real-time Pipeline Progress display
  if (project.status !== 'completed' && project.status !== 'failed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', paddingBottom: '4rem' }}>
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
                <span className="tsl-bc-current">{project.seed_keyword}</span>
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

        <div style={{ maxWidth: '600px', margin: '4rem auto', width: '100%' }} className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Pipeline Analysis in Progress</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div className="spinner" style={{ width: '50px', height: '50px', borderWidth: '4px' }}></div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="font-mono">{project.pipeline_step || 'Initializing...'}</span>
                <span className="font-mono">{project.pipeline_progress || 0}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${project.pipeline_progress || 0}%` }}></div>
              </div>
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--text-note)',
              fontFamily: 'var(--font-mono)'
            }}>
              Seed Keyword: <span style={{ fontWeight: 600, color: 'var(--ypym-blue)' }}>"{project.seed_keyword}"</span>
            </p>
            <div className="callout callout-information" style={{ width: '100%' }}>
              <span className="callout-title">Please Wait</span>
              The system is expanding keyword ideas, mapping intents, checking Google Trends, and modeling the S-Curve projection in the background. This page will update automatically.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (project.status === 'failed') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', paddingBottom: '4rem' }}>
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
                <span className="tsl-bc-current">{project.seed_keyword}</span>
              </li>
            </ol>
          </nav>
          
          <div className="tsl-share-row" role="group" aria-label="Bagikan halaman ini">
            <span className="tsl-share-icon" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </span>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Bagikan di LinkedIn" title="LinkedIn" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` }} />
            <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Bagikan di X" title="X" dangerouslySetInnerHTML={{ __html: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` }} />
            <a href={shareLinks.wa} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Bagikan di WhatsApp" title="WhatsApp" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>` }} />
            <a href={shareLinks.tg} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Bagikan di Telegram" title="Telegram" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>` }} />
          </div>
        </div>

        <div className="callout callout-error" style={{ marginTop: '2rem' }}>
          <span className="callout-title">Pipeline Failed</span>
          <p>Error: {project.error_message || 'Unknown pipeline error'}</p>
          <Link to="/" className="btn btn-solid mt-4">Back to Home</Link>
        </div>
      </div>
    );
  }

  // Filter & Sort keywords
  const sortedKeywords = [...keywords]
    .filter(kw => {
      const matchSearch = kw.keyword.toLowerCase().includes(keywordSearch.toLowerCase());
      const matchIntent = intentFilter ? kw.intent === intentFilter : true;
      const matchSource = sourceFilter ? kw.source === sourceFilter : true;
      return matchSearch && matchIntent && matchSource;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'ASC' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }
      return sortOrder === 'ASC' ? valA - valB : valB - valA;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('DESC');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕';
    return sortOrder === 'ASC' ? '↑' : '↓';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', paddingBottom: '4rem' }}>
      <style>{`
        .floating-scenario-panel {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: #ffffff;
          border-top: 1px solid var(--border-hover);
          box-shadow: 0 -8px 30px rgba(11, 15, 65, 0.12);
          z-index: 9999;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          opacity: 0;
          transform: translateY(100%);
          pointer-events: none;
        }
        .floating-scenario-panel.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .floating-inner {
          max-width: var(--max-w);
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }
        .floating-header {
          background: #ffffff;
          color: var(--ypym-black);
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          user-select: none;
          border-radius: 12px 12px 0 0;
          max-width: var(--max-w);
          margin: 0 auto;
          border-bottom: 1px solid var(--border-light);
          transition: background-color 0.2s;
        }
        .floating-header:hover {
          background: #f8fafc;
        }
        .floating-header h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--ypym-black);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .floating-header .toggle-btn {
          background: rgba(11, 15, 65, 0.05);
          border: none;
          color: var(--ypym-black);
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          transition: background-color 0.15s;
        }
        .floating-header .toggle-btn:hover {
          background: rgba(11, 15, 65, 0.12);
        }
        .floating-body {
          padding: 1.5rem 0;
          background: #ffffff;
          border-top: 1px solid var(--border-light);
          transition: max-height 0.3s ease, padding 0.3s ease;
          max-height: 300px;
        }
        .floating-scenario-panel.collapsed .floating-body {
          max-height: 0;
          padding-top: 0;
          padding-bottom: 0;
          overflow: hidden;
          border-top: none;
        }
        .floating-inputs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px 16px;
        }
        .floating-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }
        .floating-input-group label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-note);
        }
        .floating-input-group input {
          width: 100%;
          padding: 8px 12px;
          font-size: 13px;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .floating-input-group input:focus {
          border-color: var(--ypym-blue);
        }
        .btn-header-recalc {
          background: var(--ypym-blue);
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s, transform 0.1s;
        }
        .btn-header-recalc:hover {
          background: #0036FF;
        }
        .btn-header-recalc:active {
          transform: scale(0.97);
        }
        .btn-header-recalc:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Responsive styling */
        @media (max-width: 1024px) {
          .floating-inputs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .floating-scenario-panel {
            border-radius: 16px 16px 0 0;
            border-top: 1px solid var(--border-hover);
          }
          .floating-header {
            width: 100%;
            border-radius: 0;
            padding: 12px 16px;
          }
          .floating-body {
            padding: 16px;
            max-height: 60vh;
            overflow-y: auto;
          }
          .floating-inputs-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }

        .chart-scroll-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 8px;
        }
        .chart-wrapper {
          width: 100%;
          height: 280px;
        }
        @media (max-width: 768px) {
          .chart-wrapper {
            width: 600px;
          }
        }

        /* Hero Viewport Section */
        .hero-viewport-section {
          background: #F3F4F6;
          min-height: calc(100vh - var(--header-h));
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          margin-top: -24px;
          width: 100vw;
          padding: 3rem calc(50vw - 50% + 24px);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          gap: 2rem;
          justify-content: center;
        }
        .hero-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .hero-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--ypym-black);
          margin-top: 4px;
          margin-bottom: 2px;
        }
        .hero-subtitle {
          color: var(--text-note);
          font-size: 12px;
          font-family: var(--font-mono);
          margin: 0;
        }
        .hero-actions {
          display: flex;
          gap: 0.75rem;
        }

        /* Desktop Cards Grid */
        .desktop-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          align-items: stretch;
        }

        /* Refined Reference Card Style */
        .ref-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(11, 15, 65, 0.04);
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 330px;
          height: auto;
          box-sizing: border-box;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: 1px solid rgba(0,0,0,0.015);
          text-align: left;
        }
        .ref-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(11, 15, 65, 0.08);
        }
        .ref-card-blue {
          background: var(--ypym-blue) !important;
          color: #ffffff !important;
          border-color: rgba(255,255,255,0.05) !important;
        }
        .ref-card-blue .ref-card-category {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .ref-card-blue .ref-card-dropdown {
          background: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
        }
        .ref-card-blue .ref-card-label {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .ref-card-blue .ref-card-value {
          color: #ffffff !important;
        }
        .ref-card-blue .ref-card-footer {
          color: rgba(255, 255, 255, 0.75) !important;
        }
        .ref-card-blue .ref-card-footer-arrow {
          background: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
        }
        .ref-card-blue:hover .ref-card-footer-arrow {
          background: #ffffff !important;
          color: var(--ypym-blue) !important;
        }
        .ref-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ref-card-category {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-heading);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-mono);
        }
        .ref-card-dropdown {
          background: #F1F5F9;
          color: var(--text-note);
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 600;
          user-select: none;
          font-family: var(--font-mono);
        }
        .ref-card-body {
          margin-top: 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ref-card-label {
          font-size: 11px;
          color: var(--text-note);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
          font-weight: 600;
          font-family: var(--font-mono);
        }
        .ref-card-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .ref-card-value {
          font-size: 30px;
          font-weight: 800;
          color: var(--ypym-black);
          line-height: 1.1;
          font-family: var(--font-display);
        }
        .ref-card-trend-arrow {
          font-size: 18px;
          font-weight: 700;
        }
        .ref-card-trend-arrow.green { color: #10B981; }
        .ref-card-trend-arrow.blue { color: var(--ypym-blue); }

        .ref-card-visual {
          height: auto;
          width: 100%;
          margin-top: 10px;
        }
        .ref-card-footer {
          border-top: 1px solid #F1F5F9;
          padding-top: 14px;
          margin-top: 14px;
          font-size: 11px;
          color: var(--text-note);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-mono);
        }
        .ref-card-footer-arrow {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-note);
          font-size: 12px;
          transition: background-color 0.2s;
        }
        .ref-card:hover .ref-card-footer-arrow {
          background: var(--ypym-blue);
          color: #ffffff;
        }

        /* Mobile Viewport Slider */
        .mobile-cards-slider {
          display: none;
        }


        /* Responsive styling */
        @media (max-width: 1024px) {
          .desktop-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 768px) {
          .hero-viewport-section {
            margin-top: -24px;
            margin-left: calc(-50vw + 50%);
            margin-right: calc(-50vw + 50%);
            width: 100vw;
            padding: 24px 16px;
            gap: 1.5rem;
            min-height: auto;
          }
          .desktop-cards-grid {
            display: none;
          }
          .mobile-cards-slider {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 8px;
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
          }
          .mobile-cards-slider .ref-card {
            min-width: 280px;
            width: 80vw;
            scroll-snap-align: center;
            min-height: 310px;
            height: auto;
          }
        }
        .export-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 6px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(11, 15, 65, 0.08);
          z-index: 100;
          min-width: 210px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .export-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-body);
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.15s ease;
        }
        .export-menu-item:hover {
          background: #F1F5F9;
          color: var(--ypym-blue);
        }
        .export-menu-item svg {
          fill: currentColor;
          flex-shrink: 0;
          color: var(--text-note);
        }
        .export-menu-item:hover svg {
          color: var(--ypym-blue);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .google-ads-row:hover {
          background: #f4f7fb !important;
        }
      `}</style>

      {/* Hero Viewport Section */}
      <div className="hero-viewport-section">
        {/* Breadcrumbs & Share Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '16px' }}>
          <nav className="tsl-breadcrumb" aria-label="Breadcrumb" style={{ margin: 0 }}>
            <ol className="tsl-bc-list">
              <li><Link to="/" className="tsl-bc-link">Home</Link></li>
              <li>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="tsl-bc-chevron"><path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <Link to="/" className="tsl-bc-link">YPYM Appraisal</Link>
              </li>
              <li>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="tsl-bc-chevron"><path d="M4.5 2.5L7.5 6l-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="tsl-bc-current">{project.seed_keyword}</span>
              </li>
            </ol>
          </nav>
          
          <div className="tsl-share-row" role="group" aria-label="Share this page" style={{ margin: 0 }}>
            <span className="tsl-share-icon" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </span>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on LinkedIn" title="LinkedIn" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` }} />
            <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on X" title="X" dangerouslySetInnerHTML={{ __html: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` }} />
            <a href={shareLinks.wa} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on WhatsApp" title="WhatsApp" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>` }} />
            <a href={shareLinks.tg} target="_blank" rel="noopener noreferrer" className="tsl-share-btn" aria-label="Share on Telegram" title="Telegram" dangerouslySetInnerHTML={{ __html: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>` }} />
          </div>
        </div>

        {/* Google Ads style Tabs Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E0E0', background: '#F8F9FA', marginTop: '1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', flexWrap: 'wrap', paddingRight: '16px' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ padding: '12px 20px', fontWeight: 600, borderBottom: '3px solid #1A73E8', color: '#1A73E8', cursor: 'pointer', fontSize: '13px' }}>Keyword ideas</div>
            <div style={{ padding: '12px 20px', fontWeight: 500, color: '#5F6368', cursor: 'pointer', fontSize: '13px' }}>Forecast</div>
            <div style={{ padding: '12px 20px', fontWeight: 500, color: '#5F6368', cursor: 'pointer', fontSize: '13px' }}>Saved keywords</div>
            <div style={{ padding: '12px 20px', fontWeight: 500, color: '#5F6368', cursor: 'pointer', fontSize: '13px' }}>Negative keywords</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
            {/* Action Dropdown Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                style={{ gap: '6px', background: '#ffffff', borderColor: '#DADCE0' }}
              >
                <span>Export Report</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" style={{ fill: 'currentColor', transition: 'transform 0.2s', transform: exportDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M12 16l-6-6h12z"></path>
                </svg>
              </button>
              {exportDropdownOpen && (
                <div className="export-menu-dropdown" style={{ right: 0, top: '100%' }}>
                  <button className="export-menu-item" onClick={() => { handleExport('csv'); setExportDropdownOpen(false); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-5 14h-4v-2h4v2zm3-4H7V7h10v6z"/></svg>
                    <span>Export CSV</span>
                  </button>
                  <button className="export-menu-item" onClick={() => { handleExport('json'); setExportDropdownOpen(false); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="m11.293 17.293-1.414 1.414L4.586 13l5.293-5.293 1.414 1.414L7.414 13l3.879 4.293zm1.414 0 3.879-4.293-3.879-4.293 1.414-1.414L19.414 13l-5.293 5.293-1.414-1.414z"/></svg>
                    <span>Export JSON</span>
                  </button>
                  <button className="export-menu-item" onClick={handleDownloadPDF}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M8.293 12.293 11 9.586V15h2V9.586l2.707 2.707 1.414-1.414L12 5.758l-5.121 5.121zm10.707 3.707V18H5v-2H3v2c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-2h-2z"/></svg>
                    <span>Download PDF</span>
                  </button>
                  <button className="export-menu-item" onClick={handleDownloadJPEG}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M4 4h16c1.103 0 2 .897 2 2v12c0 1.103-.897 2-2 2H4c-1.103 0-2-.897-2-2V6c0-1.103.897-2 2-2zm16 14.002V6H4v12h16zM6 15h3v2H6v-2zm12-4-3 4H9l3-4 6 4z"/></svg>
                    <span>Download JPEG (5 Cards)</span>
                  </button>
                  <button className="export-menu-item" onClick={() => { setEmailModalOpen(true); setExportDropdownOpen(false); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    <span>Send to Email (PDF)</span>
                  </button>
                </div>
              )}
            </div>
            <Link to="/projects" className="btn btn-light btn-sm" style={{ background: '#ffffff', borderColor: '#DADCE0' }}>All Projections</Link>
          </div>
        </div>

        {/* Google Ads style Settings Bar */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', padding: '12px 20px', background: '#ffffff', borderBottom: '1px solid #E0E0E0' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <SearchAutocomplete placeholder="Search or analyze keyword..." defaultValue={project.seed_keyword} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '13px', color: '#5f6368' }}>
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f3f4', borderRadius: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span style={{ fontWeight: 500 }}>{project.locale_country === 'ID' ? 'Indonesia' : project.locale_country || 'United States'}</span>
            </div>
            {/* Language */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f3f4', borderRadius: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5h12M7 2h2m-4 3c0 4.418 3.582 8 8 8m-2-12c0 2.209-1.791 4-4 4"></path></svg>
              <span style={{ fontWeight: 500 }}>{project.locale_language === 'id' ? 'Indonesian' : 'English'}</span>
            </div>
            {/* Search Network */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f3f4', borderRadius: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span style={{ fontWeight: 500 }}>Google</span>
            </div>
            {/* Timeframe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f3f4', borderRadius: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span style={{ fontWeight: 500 }}>
                {(() => {
                  const createdDate = new Date(project.created_at);
                  const startYear = createdDate.getFullYear() - 1;
                  const endYear = createdDate.getFullYear();
                  const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
                  const startMonthStr = months[createdDate.getMonth() % 12];
                  const endMonthStr = months[(createdDate.getMonth() - 1 + 12) % 12];
                  return `${startMonthStr} ${startYear} - ${endMonthStr} ${endYear}`;
                })()}
              </span>
            </div>
            
            <div style={{ width: '1px', height: '16px', background: 'var(--border-light)', margin: '0 6px' }} />
            
            {/* Timeframe Slider Selector */}
            <div style={{ display: 'inline-flex', gap: '2px', background: '#F1F5F9', padding: '2px', borderRadius: '6px', height: '30px', alignItems: 'center', boxSizing: 'border-box' }}>
              {[1, 3, 6, 8, 12, 24].map(h => {
                const isDisabled = h <= 6;
                const isSelected = selectedHorizon === h;
                return (
                  <button
                    key={h}
                    disabled={isDisabled}
                    onClick={() => setSelectedHorizon(h)}
                    style={{
                      padding: '0 10px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.35 : 1,
                      background: isSelected ? 'var(--ypym-black)' : 'transparent',
                      color: isSelected ? '#ffffff' : isDisabled ? 'var(--text-subtle)' : 'var(--text-note)',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    title={isDisabled ? "YPYM only supports SEO engagements for 8-24 months" : `${h} Months`}
                  >
                    {h}M
                  </button>
                );
              })}
            </div>
            
            <div style={{ width: '1px', height: '16px', background: 'var(--border-light)', margin: '0 6px' }} />
            
            {/* Currency Selector */}
            <div style={{ display: 'inline-flex', gap: '2px', background: '#F1F5F9', padding: '2px', borderRadius: '6px', height: '30px', alignItems: 'center', boxSizing: 'border-box' }}>
              {['USD', 'IDR'].map(curr => {
                const isSelected = primaryCurrency === curr;
                return (
                  <button
                    key={curr}
                    onClick={() => setPrimaryCurrency(curr)}
                    style={{
                      padding: '0 12px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--ypym-black)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-note)',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {curr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Broaden suggestions */}
        {broadenSuggestions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#ffffff', borderBottom: '1px solid #E0E0E0', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '13px', color: '#5f6368', marginRight: '8px', flexShrink: 0, fontWeight: 500 }}>Broaden your search:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {broadenSuggestions.map((sug, idx) => (
                <Link
                  key={idx}
                  to={`/projects/new?keyword=${encodeURIComponent(sug)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    background: '#ffffff',
                    border: '1px solid #DADCE0',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#3C4043',
                    cursor: 'pointer',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F8F9FC'; e.currentTarget.style.borderColor = '#1A73E8'; e.currentTarget.style.color = '#1A73E8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#DADCE0'; e.currentTarget.style.color = '#3C4043'; }}
                >
                  <span style={{ color: '#1A73E8', fontWeight: 'bold' }}>+</span>
                  <span>{sug}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(() => {
          const p24 = projections?.find(p => p.horizon_months === 24) || projections?.[projections.length - 1];
          const selectedProj = projections?.find(p => p.horizon_months === selectedHorizon) || p24;
          const sparklineData = projections ? projections.map(p => ({
            month: p.horizon_months,
            revenue: p.revenue_usd,
            fee: p.recommended_service_fee_usd,
            leads: p.total_leads,
          })) : [];

          // Compute average metrics for keywords in the project
          const totalSv = keywords ? keywords.reduce((sum, kw) => sum + (kw.avg_monthly_sv || 0), 0) : 0;
          const avgComp = keywords && keywords.length ? Math.round(keywords.reduce((sum, kw) => sum + (kw.competition_index || 0), 0) / keywords.length) : 0;
          const avgLowBid = keywords && keywords.length ? (keywords.reduce((sum, kw) => sum + (kw.low_bid_micros || 0), 0) / keywords.length) / 1000000 : 0;
          const avgHighBid = keywords && keywords.length ? (keywords.reduce((sum, kw) => sum + (kw.high_bid_micros || 0), 0) / keywords.length) / 1000000 : 0;

          const cards = [
            // Card 1: Return
            {
              category: 'Potential Revenue',
              dropdown: `${selectedHorizon}-Month Proj.`,
              label: 'Potential Revenue',
              value: selectedProj ? (primaryCurrency === 'USD' ? formatCurrency(selectedProj.revenue_usd, 'USD') : formatCurrency(selectedProj.revenue_idr, 'IDR')) : '-',
              subValue: selectedProj ? (primaryCurrency === 'USD' ? formatCurrency(selectedProj.revenue_idr, 'IDR') : formatCurrency(selectedProj.revenue_usd, 'USD')) : '-',
              arrowClass: 'green',
              showArrow: false,
              trendRow: (() => {
                const p1 = projections?.[0];
                const growthPct = p1 && p1.revenue_usd > 0 ? Math.round(((selectedProj.revenue_usd - p1.revenue_usd) / p1.revenue_usd) * 100) : 0;
                return `+${formatNumber(growthPct)}% (${selectedHorizon}-month growth)`;
              })(),
              visual: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px', borderTop: '1px dashed var(--border-light)', paddingTop: '12px' }}>
                  {/* Mini-cards inside the Card (style cards inside card) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '4px' }}>
                    {/* Mini Card 1: Total SV */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-note)', textTransform: 'uppercase', fontWeight: 600 }}>Total SV Pool</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ypym-blue)' }}>{formatNumber(totalSv)} / mo</span>
                    </div>
                    
                    {/* Mini Card 2: Avg Competition */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-note)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Competition</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{avgComp} / 100</span>
                    </div>
                    
                    {/* Mini Card 3: Avg Low Bid */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-note)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Low Bid</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                        {primaryCurrency === 'USD' ? formatCurrency(avgLowBid, 'USD') : formatCurrency(avgLowBid * (project.fx_rate_usd_idr || 16400), 'IDR').split(',')[0]}
                      </span>
                    </div>
                    
                    {/* Mini Card 4: Avg High Bid */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-note)', textTransform: 'uppercase', fontWeight: 600 }}>Avg High Bid</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                        {primaryCurrency === 'USD' ? formatCurrency(avgHighBid, 'USD') : formatCurrency(avgHighBid * (project.fx_rate_usd_idr || 16400), 'IDR').split(',')[0]}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--border-light)', margin: '4px 0 8px 0' }} />

                  {[1, 3, 6, 8, 12, 24].map(h => {
                    const p = projections?.find(proj => proj.horizon_months === h);
                    if (!p) return null;
                    const isCurrent = selectedHorizon === h;
                    const pctOfMax = p24 && p24.revenue_usd > 0 ? Math.round((p.revenue_usd / p24.revenue_usd) * 100) : 0;
                    const fullVal = primaryCurrency === 'USD'
                      ? formatCurrency(p.revenue_usd, 'USD')
                      : formatCurrency(p.revenue_idr, 'IDR').split('.')[0];

                    return (
                      <div key={h} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '11px', 
                          fontWeight: 600,
                          color: isCurrent ? 'var(--ypym-blue)' : 'var(--text-note)'
                        }}>
                          <span>{h} Month{h > 1 ? 's' : ''} Proj.</span>
                          <span>
                            {pctOfMax}% <span style={{ fontWeight: 500, fontSize: '10px', color: 'var(--text-muted)' }}>({fullVal})</span>
                          </span>
                        </div>
                        <div style={{ height: '5px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${pctOfMax}%`, 
                            height: '100%', 
                            background: isCurrent ? 'var(--ypym-blue)' : '#C7D4FF', 
                            borderRadius: '3px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ),
              footerText: primaryCurrency === 'USD'
                ? `Expect Rp ${selectedProj ? formatNumber(selectedProj.revenue_idr) : '-'} total business return`
                : `Expect ${selectedProj ? formatCurrency(selectedProj.revenue_usd, 'USD') : '-'} total business return`,
            },
            // Card 2: Investment
            {
              category: 'SEO Investment',
              dropdown: `${selectedHorizon}-Month Proj.`,
              label: 'SEO Investment',
              value: selectedProj ? (primaryCurrency === 'USD' ? formatCurrency(selectedProj.recommended_service_fee_usd, 'USD') : formatCurrency(selectedProj.recommended_service_fee_idr, 'IDR')) : '-',
              subValue: selectedProj ? (primaryCurrency === 'USD' ? formatCurrency(selectedProj.recommended_service_fee_idr, 'IDR') : formatCurrency(selectedProj.recommended_service_fee_usd, 'USD')) : '-',
              arrowClass: 'blue',
              showArrow: false,
              isSpecial: true,
              trendRow: `${serviceFeePct}% of total return`,
              visual: null,
              footerText: `SEO fee represents ${serviceFeePct}% of return`,
            },
            // Card 3: Keyword Ideas
            {
              category: 'Keywords',
              dropdown: 'Raw Ideas',
              label: 'Total Keyword Ideas',
              value: formatNumber(project.raw_keyword_count),
              subValue: 'Seed & suggestion lists',
              arrowClass: 'blue',
              visual: (() => {
                const countIdeas = keywords ? keywords.filter(kw => kw.source === 'seed').length : 0;
                const countSuggestions = keywords ? keywords.filter(kw => kw.source === 'autocomplete').length : 0;
                const countTop = keywords ? keywords.filter(kw => kw.source === 'trends_top').length : 0;
                const countRising = keywords ? keywords.filter(kw => kw.source === 'trends_rising').length : 0;
                
                const total = (countIdeas + countSuggestions + countTop + countRising) || 1;
                
                const pctIdeas = Math.round((countIdeas / total) * 100);
                const pctSuggestions = Math.round((countSuggestions / total) * 100);
                const pctTop = Math.round((countTop / total) * 100);
                const pctRising = 100 - (pctIdeas + pctSuggestions + pctTop);

                // Data for RadialBarChart
                const chartData = [
                  { name: 'Rising', uv: Math.max(5, pctRising), fill: '#10B981' },
                  { name: 'Top', uv: Math.max(5, pctTop), fill: '#F59E0B' },
                  { name: 'Suggestions', uv: Math.max(5, pctSuggestions), fill: '#3B82F6' },
                  { name: 'Ideas', uv: Math.max(5, pctIdeas), fill: '#8B5CF6' }
                ].reverse(); // Inner to outer

                return (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '110px', gap: '8px' }}>
                    {/* Left: Labels list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-note)', lineHeight: 1.1 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#8B5CF6', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>Ideas: {pctIdeas}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-note)', lineHeight: 1.1 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>Suggestions: {pctSuggestions}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-note)', lineHeight: 1.1 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>Top Trends: {pctTop}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--text-note)', lineHeight: 1.1 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>Rising Trends: {pctRising}%</span>
                      </div>
                    </div>
                    {/* Right: Radial Chart (Pure SVG, No Clipping) */}
                    <div style={{ width: '110px', height: '110px', position: 'relative', flexShrink: 0 }}>
                      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                        {/* Track 1 (Rising: Green, r=43) */}
                        <circle cx="50" cy="50" r="43" fill="none" stroke="#F1F5F9" strokeWidth={5.5} />
                        <circle cx="50" cy="50" r="43" fill="none" stroke="#10B981" strokeWidth={5.5}
                          strokeDasharray={270.18}
                          strokeDashoffset={270.18 - (270.18 * Math.max(2, pctRising)) / 100}
                          strokeLinecap="round"
                        />

                        {/* Track 2 (Top: Yellow, r=33) */}
                        <circle cx="50" cy="50" r="33" fill="none" stroke="#F1F5F9" strokeWidth={5.5} />
                        <circle cx="50" cy="50" r="33" fill="none" stroke="#F59E0B" strokeWidth={5.5}
                          strokeDasharray={207.35}
                          strokeDashoffset={207.35 - (207.35 * Math.max(2, pctTop)) / 100}
                          strokeLinecap="round"
                        />

                        {/* Track 3 (Suggestions: Blue, r=23) */}
                        <circle cx="50" cy="50" r="23" fill="none" stroke="#F1F5F9" strokeWidth={5.5} />
                        <circle cx="50" cy="50" r="23" fill="none" stroke="#3B82F6" strokeWidth={5.5}
                          strokeDasharray={144.51}
                          strokeDashoffset={144.51 - (144.51 * Math.max(2, pctSuggestions)) / 100}
                          strokeLinecap="round"
                        />

                        {/* Track 4 (Ideas: Purple, r=13) */}
                        <circle cx="50" cy="50" r="13" fill="none" stroke="#F1F5F9" strokeWidth={5.5} />
                        <circle cx="50" cy="50" r="13" fill="none" stroke="#8B5CF6" strokeWidth={5.5}
                          strokeDasharray={81.68}
                          strokeDashoffset={81.68 - (81.68 * Math.max(2, pctIdeas)) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })(),
              footerText: `${formatNumber(project.raw_keyword_count)} unique search variations`,
            },

            // Card 5: Traffic/Leads
            {
              category: 'Traffic',
              dropdown: `${selectedHorizon}-Month Proj.`,
              label: 'Est. Leads (Traffic)',
              value: selectedProj ? formatNumber(Math.round(selectedProj.total_leads)) : '-',
              subValue: `Avg. ${formatNumber(Math.round((selectedProj?.total_leads || 0) / selectedHorizon))} / month`,
              arrowClass: 'blue',
              showArrow: false,
              visual: (
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={sparklineData.filter(p => p.month <= selectedHorizon)} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="leads" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                  </AreaChart>
                </ResponsiveContainer>
              ),
              footerText: `Pool SV: ${formatNumber(project.raw_sv_pool)} | Effective: ${formatNumber(project.effective_sv_pool)}`,
            },
            // Card 6: Trends Chart
            {
              category: 'Demand Trend',
              dropdown: '5-Year Index',
              label: 'Demand Historical Index',
              value: trends?.monthly_index_5y ? '5-Year Index' : '-',
              subValue: 'Seasonal search index',
              arrowClass: 'blue',
              visual: (
                <div style={{ width: '100%', height: '80px' }}>
                  {trends?.monthly_index_5y && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trends.monthly_index_5y.slice(-24)} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
                        <defs>
                          <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--ypym-blue)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--ypym-blue)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="var(--ypym-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ),
              footerText: 'Demand index history over last 24 months',
            }
          ];

          return (
            <>
              {/* Desktop Grid Layout (3 Columns x 2 Rows) */}
              <div id="dashboard-cards-container" className="desktop-cards-grid">
                {cards.map((c, idx) => (
                  <div 
                    key={idx} 
                    className={`ref-card ${c.isSpecial ? 'ref-card-blue' : ''}`}
                    style={idx === 0 ? { gridRow: 'span 2' } : {}}
                  >
                    <div className="ref-card-header">
                      <span className="ref-card-category">{c.category}</span>
                      <span className="ref-card-dropdown">{c.dropdown}</span>
                    </div>
                    <div className="ref-card-body">
                      <div>
                        <div className="ref-card-label">{c.label}</div>
                        <div className="ref-card-value-row">
                          <span className="ref-card-value">{c.value}</span>
                          {c.showArrow !== false && <span className={`ref-card-trend-arrow ${c.arrowClass}`}>↗</span>}
                        </div>
                        {c.subValue && (
                          <div style={{ fontSize: '12px', color: c.isSpecial ? 'rgba(255,255,255,0.7)' : 'var(--text-note)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                            {c.subValue}
                          </div>
                        )}
                        {c.trendRow && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: c.isSpecial ? '#ffffff' : '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: c.isSpecial ? 'var(--ypym-blue)' : '#ffffff',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              lineHeight: 1
                            }}>↗</div>
                            <span style={{ color: c.isSpecial ? '#ffffff' : '#10B981', fontSize: '13px', fontWeight: 600 }}>{c.trendRow}</span>
                          </div>
                        )}
                      </div>
                      {c.visual && (
                        <div className="ref-card-visual" style={{ marginTop: '14px' }}>
                          {c.visual}
                        </div>
                      )}
                    </div>
                    <div className="ref-card-footer">
                      <span>{c.footerText}</span>
                      <div className="ref-card-footer-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
                          <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile View: Horizontal Carousel Slider */}
              <div className="mobile-cards-slider" onScroll={handleSliderScroll}>
                {cards.map((c, idx) => (
                  <div key={idx} className={`ref-card ${c.isSpecial ? 'ref-card-blue' : ''}`}>
                    <div className="ref-card-header">
                      <span className="ref-card-category">{c.category}</span>
                      <span className="ref-card-dropdown">{c.dropdown}</span>
                    </div>
                    <div className="ref-card-body">
                      <div>
                        <div className="ref-card-label">{c.label}</div>
                        <div className="ref-card-value-row">
                          <span className="ref-card-value">{c.value}</span>
                          {c.showArrow !== false && <span className={`ref-card-trend-arrow ${c.arrowClass}`}>↗</span>}
                        </div>
                        {c.subValue && (
                          <div style={{ fontSize: '12px', color: c.isSpecial ? 'rgba(255,255,255,0.7)' : 'var(--text-note)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                            {c.subValue}
                          </div>
                        )}
                        {c.trendRow && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: c.isSpecial ? '#ffffff' : '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: c.isSpecial ? 'var(--ypym-blue)' : '#ffffff',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              lineHeight: 1
                            }}>↗</div>
                            <span style={{ color: c.isSpecial ? '#ffffff' : '#10B981', fontSize: '13px', fontWeight: 600 }}>{c.trendRow}</span>
                          </div>
                        )}
                      </div>
                      {c.visual && (
                        <div className="ref-card-visual" style={{ marginTop: '14px' }}>
                          {c.visual}
                        </div>
                      )}
                    </div>
                    <div className="ref-card-footer">
                      <span>{c.footerText}</span>
                      <div className="ref-card-footer-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style={{ fill: 'currentColor' }}>
                          <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </>
          );
        })()}
      </div>

      {/* Main Grid: Projections on left, Assumptions on right */}
      <div className="dashboard-grid-container" style={{ gridTemplateColumns: '1fr' }}>
        
        {/* Left Side: Projections + Cost Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Projections Table / Cards */}
          <div className="card">
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1.5rem' }}>
              Business Projection: 1 / 3 / 6 / 8 / 12 / 24 Months
            </h3>
            
            <div className="dashboard-projections-grid">
              {projections.map((p, idx) => (
                <div key={idx} style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  background: p.horizon_months === 24 ? 'rgba(26, 75, 255, 0.02)' : 'transparent',
                  borderColor: p.horizon_months === 24 ? 'rgba(26, 75, 255, 0.15)' : 'var(--border-subtle)'
                }}>
                  <div className="font-mono" style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-muted)',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Horizon</span>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{p.horizon_months} Months</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Est. Leads (Traffic)</span>
                      <div className="font-display" style={{ fontWeight: 600, fontSize: '18px', color: 'var(--ypym-black)' }}>
                        {formatNumber(p.total_leads)}
                      </div>
                    </div>

                    <div>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Est. Conversions</span>
                      <div className="font-display" style={{ fontWeight: 600, fontSize: '18px', color: 'var(--ypym-black)' }}>
                        {formatNumber(p.total_conversions)}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Est. Revenue Value</span>
                      <CurrencyDisplay usdAmount={p.revenue_usd} idrAmount={p.revenue_idr} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '11px', color: 'var(--text-note)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
              * Exchange Rate: 1 USD = Rp {project.fx_rate_usd_idr?.toLocaleString('en-US')} ({project.fx_rate_source || 'open.er-api.com'}) on {project.fx_rate_fetched_at ? new Date(project.fx_rate_fetched_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
            </div>
          </div>
        </div>

        {/* Floating Scenario & Audit Panel */}
        <div className={`floating-scenario-panel ${panelVisible ? 'visible' : ''} ${!panelExpanded ? 'collapsed' : ''}`}>
          <form onSubmit={handleReproject}>
            <div className="floating-header" onClick={() => setPanelExpanded(!panelExpanded)}>
              <h3>
                <span>📊</span> Audit & Scenario Testing
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
                <button 
                  type="submit" 
                  className="btn-header-recalc"
                  disabled={recalculating}
                >
                  {recalculating ? 'Recalculating...' : 'Recalculate ROI'}
                </button>
                <button 
                  type="button" 
                  className="toggle-btn" 
                  onClick={() => setPanelExpanded(!panelExpanded)}
                  aria-label="Toggle Panel"
                >
                  {panelExpanded ? '−' : '+'}
                </button>
              </div>
            </div>
            <div className="floating-body">
              <div className="floating-inner">
                <div className="floating-inputs-grid">
                  <div className="floating-input-group">
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
                    />
                  </div>

                  <div className="floating-input-group">
                    <label htmlFor="conversionRate">Conversion Rate (%)</label>
                    <input
                      type="number"
                      id="conversionRate"
                      value={conversionRate}
                      onChange={(e) => setConversionRate(e.target.value)}
                      min="0.1"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="floating-input-group">
                    <label htmlFor="valuePerSale">Value per Sale ({valueCurrency})</label>
                    <input
                      type="number"
                      id="valuePerSale"
                      value={valuePerSale}
                      onChange={(e) => setValuePerSale(e.target.value)}
                      min="0"
                      required
                    />
                  </div>

                  <div className="floating-input-group">
                    <label htmlFor="rampUpMonths">Ramp-Up (Months)</label>
                    <input
                      type="number"
                      id="rampUpMonths"
                      value={rampUpMonths}
                      onChange={(e) => setRampUpMonths(e.target.value)}
                      min="1"
                      max="36"
                      required
                    />
                  </div>

                  <div className="floating-input-group">
                    <label htmlFor="serviceFeePct">Service Fee (%)</label>
                    <input
                      type="number"
                      id="serviceFeePct"
                      value={serviceFeePct}
                      onChange={(e) => setServiceFeePct(e.target.value)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>

                  <div className="floating-input-group">
                    <label htmlFor="overlapDiscount">Overlap Discount</label>
                    <input
                      type="number"
                      id="overlapDiscount"
                      value={overlapDiscount}
                      onChange={(e) => setOverlapDiscount(e.target.value)}
                      min="0"
                      max="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

      </div>

      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid #DADCE0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--ypym-black)' }}>
            Keyword Ideas & Value Metrics Breakdown
          </h3>
          <span style={{ padding: '4px 10px', background: 'rgba(0,102,204,0.06)', border: '1px solid rgba(0,102,204,0.12)', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--ypym-blue)' }}>
            Sector: {project.sector || 'General'}
          </span>
        </div>

        {/* Filters bar */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '12px 20px',
          alignItems: 'center',
          background: '#f8fafc',
          borderBottom: '1px solid #DADCE0'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <input 
              type="text" 
              placeholder="Search keywords..." 
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '4px', border: '1px solid #DADCE0', fontSize: '13px' }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8F90A6', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
          </div>

          <select 
            value={intentFilter} 
            onChange={(e) => setIntentFilter(e.target.value)}
            style={{ width: '160px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #DADCE0', fontSize: '13px', background: '#ffffff' }}
          >
            <option value="">All Intents</option>
            <option value="transactional">Transactional</option>
            <option value="commercial">Commercial</option>
            <option value="informational">Informational</option>
            <option value="navigational">Navigational</option>
          </select>

          <select 
            value={sourceFilter} 
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{ width: '160px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #DADCE0', fontSize: '13px', background: '#ffffff' }}
          >
            <option value="">All Sources</option>
            <option value="seed">Seed Keyword</option>
            <option value="autocomplete">Autocomplete</option>
            <option value="trends_top">Trends Top</option>
            <option value="trends_rising">Trends Rising</option>
          </select>
        </div>

        {/* Google Ads style status / filter display */}
        {(() => {
          const allChecked = sortedKeywords.length > 0 && sortedKeywords.every(k => !!selectedKeywords[k.keyword]);
          const handleToggleAll = () => {
            if (allChecked) {
              setSelectedKeywords({});
            } else {
              const next = {};
              sortedKeywords.forEach(k => {
                next[k.keyword] = true;
              });
              setSelectedKeywords(next);
            }
          };
          const handleToggleOne = (keyword) => {
            setSelectedKeywords(prev => ({
              ...prev,
              [keyword]: !prev[keyword]
            }));
          };

          const keywordsProvided = sortedKeywords.filter(kw => kw.source === 'seed');
          const keywordIdeas = sortedKeywords.filter(kw => kw.source !== 'seed');

          const renderRow = (kw, idx) => {
            const isChecked = !!selectedKeywords[kw.keyword];
            const cpcLow = kw.low_bid_micros ? kw.low_bid_micros / 1000000 : 0;
            const cpcHigh = kw.high_bid_micros ? kw.high_bid_micros / 1000000 : 0;
            const displayLow = primaryCurrency === 'USD' 
              ? formatCurrency(cpcLow / (project.fx_rate_usd_idr || 16400), 'USD') 
              : formatCurrency(cpcLow, 'IDR').split(',')[0];
            const displayHigh = primaryCurrency === 'USD' 
              ? formatCurrency(cpcHigh / (project.fx_rate_usd_idr || 16400), 'USD') 
              : formatCurrency(cpcHigh, 'IDR').split(',')[0];

            return (
              <tr 
                key={idx} 
                style={{ 
                  background: isChecked ? '#E8F0FE' : (kw.is_cluster_primary ? 'transparent' : '#fcfcfd'),
                  borderBottom: '1px solid #E0E0E0',
                  transition: 'background 0.15s ease'
                }}
                className="google-ads-row"
              >
                <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                  <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={() => handleToggleOne(kw.keyword)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: kw.is_cluster_primary ? 600 : 400, color: '#3c4043' }}>{kw.keyword}</span>
                    {kw.is_cluster_primary && <span style={{ padding: '2px 6px', background: 'rgba(0,102,204,0.06)', borderRadius: '4px', fontSize: '9px', fontWeight: 600, color: 'var(--ypym-blue)' }}>Cluster Primary</span>}
                  </div>
                </td>
                <td className="text-right font-mono" style={{ padding: '10px 16px', verticalAlign: 'middle', color: '#3c4043' }}>
                  <div style={{ fontWeight: 600 }}>{getGoogleAdsSvRange(kw.avg_monthly_sv)}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-note)' }}>({formatNumber(kw.avg_monthly_sv)})</div>
                </td>
                <td className="text-right font-mono" style={{ 
                  padding: '10px 16px', 
                  verticalAlign: 'middle',
                  color: kw.three_month_change > 0 ? '#137333' : kw.three_month_change < 0 ? '#c5221f' : '#3c4043',
                  fontWeight: 500
                }}>
                  {kw.three_month_change > 0 ? '+' : ''}{kw.three_month_change}%
                </td>
                <td className="text-right font-mono" style={{ 
                  padding: '10px 16px', 
                  verticalAlign: 'middle',
                  color: kw.yoy_change > 0 ? '#137333' : kw.yoy_change < 0 ? '#c5221f' : '#3c4043',
                  fontWeight: 500
                }}>
                  {kw.yoy_change > 0 ? '+' : ''}{kw.yoy_change}%
                </td>
                <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: kw.competition === 'HIGH' ? '#c5221f' : kw.competition === 'MEDIUM' ? '#b06000' : '#137333',
                    background: kw.competition === 'HIGH' ? '#fce8e6' : kw.competition === 'MEDIUM' ? '#fef7e0' : '#e6f4ea',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {kw.competition.toLowerCase()}
                  </span>
                </td>
                <td className="text-right font-mono" style={{ padding: '10px 16px', verticalAlign: 'middle', color: '#5f6368' }}>
                  —
                </td>
                <td className="text-right font-mono" style={{ padding: '10px 16px', verticalAlign: 'middle', color: '#3c4043' }}>
                  {displayLow}
                </td>
                <td className="text-right font-mono" style={{ padding: '10px 16px', verticalAlign: 'middle', color: '#3c4043' }}>
                  {displayHigh}
                </td>
                <td style={{ padding: '10px 16px', verticalAlign: 'middle' }}>
                  <span style={{ textTransform: 'capitalize', fontSize: '11px', fontWeight: 500 }} className={`badge ${
                    kw.intent === 'transactional' ? 'badge-success' : 
                    kw.intent === 'commercial' ? 'badge-info' : 
                    kw.intent === 'informational' ? 'badge-warning' : 'badge-neutral'
                  }`}>
                    {kw.intent}
                  </span>
                </td>
                <td className="text-right font-mono" style={{ padding: '10px 16px', verticalAlign: 'middle', color: '#3c4043' }}>
                  {kw.difficulty_score}
                </td>
                <td className="text-right font-mono" style={{ padding: '10px 16px', verticalAlign: 'middle', color: 'var(--ypym-blue)', fontWeight: 600 }}>
                  {kw.capture_rate_effective}%
                </td>
              </tr>
            );
          };

          return (
            <>
              {/* Google Ads Filter Info Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: '#ffffff', borderBottom: '1px solid #DADCE0', flexWrap: 'wrap' }}>
                <span style={{ color: '#5f6368', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px 2px 12px', background: '#F1F3F4', borderRadius: '16px', fontSize: '12px', color: '#3C4043' }}>
                  <span>Exclude adult ideas</span>
                  <span style={{ cursor: 'pointer', marginLeft: '6px', fontWeight: 'bold' }}>✕</span>
                </div>
                <div style={{ width: '1px', height: '16px', background: '#DADCE0', margin: '0 8px' }} />
                <span style={{ fontSize: '13px', color: '#3c4043', fontWeight: 500 }}>
                  {sortedKeywords.length.toLocaleString('en-US')} keyword ideas available
                </span>
                
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button style={{ background: 'transparent', border: 'none', color: '#5f6368', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                    Columns
                  </button>
                  <button style={{ background: 'transparent', border: 'none', color: '#5f6368', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    Keyword view
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"></path></svg>
                  </button>
                </div>
              </div>

              {/* Table representation */}
              <div className="table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#ffffff', borderBottom: '2px solid #DADCE0' }}>
                      <th style={{ width: '40px', padding: '12px 16px' }}>
                        <input 
                          type="checkbox" 
                          checked={allChecked} 
                          onChange={handleToggleAll} 
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th className="sortable" onClick={() => handleSort('keyword')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Keyword (by relevance) {getSortIcon('keyword')}
                      </th>
                      <th className="sortable text-right" onClick={() => handleSort('avg_monthly_sv')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Avg. monthly searches {getSortIcon('avg_monthly_sv')}
                      </th>
                      <th className="sortable text-right" onClick={() => handleSort('three_month_change')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Three month change {getSortIcon('three_month_change')}
                      </th>
                      <th className="sortable text-right" onClick={() => handleSort('yoy_change')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        YoY change {getSortIcon('yoy_change')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('competition')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Competition {getSortIcon('competition')}
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Ad impression share
                      </th>
                      <th className="sortable text-right" onClick={() => handleSort('low_bid_micros')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Top of page bid (low range) {getSortIcon('low_bid_micros')}
                      </th>
                      <th className="sortable text-right" onClick={() => handleSort('high_bid_micros')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Top of page bid (high range) {getSortIcon('high_bid_micros')}
                      </th>
                      <th className="sortable" onClick={() => handleSort('intent')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Intent {getSortIcon('intent')}
                      </th>
                      <th className="sortable text-right" onClick={() => handleSort('difficulty_score')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Difficulty {getSortIcon('difficulty_score')}
                      </th>
                      <th className="sortable text-right" onClick={() => handleSort('capture_rate_effective')} style={{ padding: '12px 16px', fontSize: '12px', color: '#3c4043', fontWeight: 600 }}>
                        Capture Rate {getSortIcon('capture_rate_effective')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No keywords match the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      <>
                        {/* Keywords you provided */}
                        {keywordsProvided.length > 0 && (
                          <>
                            <tr style={{ background: '#f1f3f4', borderBottom: '1px solid #DADCE0' }}>
                              <td colSpan={12} style={{ fontSize: '11px', fontWeight: 700, color: '#3c4043', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Keywords you provided
                              </td>
                            </tr>
                            {keywordsProvided.map((kw, idx) => renderRow(kw, `provided-${idx}`))}
                          </>
                        )}

                        {/* Keyword ideas */}
                        {keywordIdeas.length > 0 && (
                          <>
                            <tr style={{ background: '#f1f3f4', borderBottom: '1px solid #DADCE0' }}>
                              <td colSpan={12} style={{ fontSize: '11px', fontWeight: 700, color: '#3c4043', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Keyword ideas
                              </td>
                            </tr>
                            {keywordIdeas.map((kw, idx) => renderRow(kw, `ideas-${idx}`))}
                          </>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </section>

      {/* Email Modal Overlay */}
      {emailModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(11, 15, 65, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 50px rgba(11, 15, 65, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'var(--ypym-black)' }}>Send Report via Email</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-note)', lineHeight: 1.4 }}>
              The appraisal report will be compiled into a vector PDF document and emailed to the recipient.
            </p>
            <form onSubmit={handleSendEmailSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipient Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. client@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  disabled={emailSending}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="btn btn-light btn-sm"
                  style={{ height: '34px', padding: '0 16px' }}
                  disabled={emailSending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-solid btn-sm"
                  style={{ height: '34px', padding: '0 16px', background: 'var(--ypym-black)' }}
                  disabled={emailSending}
                >
                  {emailSending ? 'Generating & Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {emailSuccessMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--ypym-black)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <span style={{ color: '#10B981', fontSize: '16px' }}>✓</span>
          <span>{emailSuccessMessage}</span>
        </div>
      )}
    </div>
  );
}
