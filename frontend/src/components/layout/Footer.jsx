import React, { useState, useEffect } from 'react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [leavingIcon, setLeavingIcon] = useState(-1);
  const [labelState, setLabelState] = useState('slide-in'); // 'slide-in' | 'slide-out' | 'slide-prep'

  const labels = [
    '15-Min Virtual Meeting',
    'Get correct SEO question?',
    'Start Appraisal',
    'Email for Immediate Response'
  ];

  useEffect(() => {
    let timer;
    const runCycle = () => {
      const dur = 5000 + Math.random() * 5000;
      timer = setTimeout(() => {
        setLeavingIcon(currentIcon);
        const nextIcon = (currentIcon + 1) % 4;
        setCurrentIcon(nextIcon);

        // Clear leaving icon after transition completes
        setTimeout(() => {
          setLeavingIcon(-1);
        }, 600);

        // Slide out text
        setLabelState('slide-out');
        setTimeout(() => {
          setLabelState('slide-prep');
          setTimeout(() => {
            setLabelState('slide-in');
          }, 50);
        }, 300);

        runCycle();
      }, dur);
    };

    runCycle();
    return () => clearTimeout(timer);
  }, [currentIcon]);

  return (
    <>
      {/* ─── CTA SECTION ─── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-avatars">
              <div className="cta-avatar-row">
                <div className="cta-av" style={{ background: '#ffffff' }}>RH</div>
                <div className="cta-av" style={{ background: '#ffffff' }}>AS</div>
                <div className="cta-av" style={{ background: '#ffffff' }}>BW</div>
                <div className="cta-av" style={{ background: '#ffffff' }}>MT</div>
                <div className="cta-av" style={{ background: '#ffffff' }}>DK</div>
              </div>
              <div className="cta-trust">
                <span className="cta-trust-dot"></span>
                20+ enterprise brands trust YPYM
              </div>
            </div>
            <h2 className="cta-title">If you are looking for the most precise process, <em>this is where it starts.</em></h2>
            <p className="cta-desc">We do not promise rankings. We build the conditions in which rankings become structurally inevitable. The engagement begins with a diagnostic.</p>
            <a href="https://calendar.app.google/qxnKQSRehtsBW4S76" className="cta-btn" target="_blank" rel="noopener noreferrer">
              15-30 min Virtual Meeting?
            </a>
          </div>
        </div>
      </section>

      {/* ─── LENS ON DOMINANCE STRIP ─── */}
      <section className="lens-strip">
        <div className="container">
          <p className="lens-text">LENS ON DOMINANCE</p>
        </div>
      </section>

      {/* ─── SITE FOOTER ─── */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <img src="/ypym-icon-light.png" alt="YPYM" width="24" height="24" style={{ objectFit: 'contain', display: 'block' }} />
                YPYM
              </div>
              <p className="footer-ypym-sub">Your Page Your Money</p>
              <p className="footer-tagline">
                A marketing-technology ecosystem operating across organic marketing services, in-house martech platforms, and a venture studio.
              </p>
              <div className="footer-social">
              <a href="https://linkedin.com/company/ypym" className="footer-social-btn" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://x.com/ypymhq" className="footer-social-btn" aria-label="Twitter / X" target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.instagram.com/ypymhq" className="footer-social-btn" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@ypymhq" className="footer-social-btn" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              </div>
            </div>

            {/* Solutions */}
            <div className="footer-col">
              <p className="footer-col-title">Solutions</p>
              <ul>
                <li><a href="https://ypym.app/business" target="_blank" rel="noopener noreferrer">Business Oriented SEO</a></li>
                <li><a href="https://ypym.app/technical" target="_blank" rel="noopener noreferrer">Technical Oriented SEO</a></li>
                <li><a href="https://ypym.app/digital-brand-experience" target="_blank" rel="noopener noreferrer">Digital Brand Experience</a></li>
                <li><a href="https://ypym.app/venture-studio/" target="_blank" rel="noopener noreferrer">YPYM Venture Studio</a></li>
              </ul>
            </div>

            {/* Products */}
            <div className="footer-col">
              <p className="footer-col-title">Products</p>
              <ul>
                <li><a href="https://query-mapping.ypym.app" target="_blank" rel="noopener noreferrer">Query Mapping</a></li>
                <li><a href="https://web-sitemap.ypym.app" target="_blank" rel="noopener noreferrer">Web Sitemap</a></li>
                <li><a href="https://flow.ypym.app" target="_blank" rel="noopener noreferrer">Flow</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-col">
              <p className="footer-col-title">Resources</p>
              <ul>
                <li><a href="https://ypym.app/article" target="_blank" rel="noopener noreferrer">Articles</a></li>
                <li><a href="https://ypym.app/sector" target="_blank" rel="noopener noreferrer">Sector Intelligence</a></li>
                <li><a href="https://ypym.app/indonesia/exporter" target="_blank" rel="noopener noreferrer">Indonesia Exporter Directory</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-col">
              <p className="footer-col-title">Company</p>
              <ul>
                <li><a href="https://ypym.app/company" target="_blank" rel="noopener noreferrer">About Us</a></li>
                <li><a href="https://ypym.app/career" target="_blank" rel="noopener noreferrer">Careers</a></li>
                <li><a href="https://ypym.app/investment/get-quote" target="_blank" rel="noopener noreferrer">Get a Quote</a></li>
                <li><a href="https://ypym.app/company/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a></li>
                <li><a href="https://ypym.app/company/acceptable-use-policy" target="_blank" rel="noopener noreferrer">Acceptable Use Policy</a></li>
                <li><a href="https://ypym.app/company/press-release" target="_blank" rel="noopener noreferrer">Press Release</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright & secondary links */}
          <div className="footer-bottom">
            <span className="footer-copy">&copy; {currentYear} YPYM Company. All rights reserved. Jakarta, Indonesia.</span>
            <div className="footer-links">
              <a href="https://ypym.app/company/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy</a>
              <a href="https://ypym.app/company/terms-of-use" target="_blank" rel="noopener noreferrer">Terms</a>
              <a href="https://ypym.app/sitemap.xml" target="_blank" rel="noopener noreferrer">Sitemap</a>
            </div>
          </div>

          {/* Footer Legal disclosures */}
          <div className="footer-legal">
            <div className={`footer-legal-text ${isExpanded ? 'is-expanded' : ''}`}>
              <p>PT ADI TJANDRA TEKNOLOGI (YPYM Company) is a marketing-technology ecosystem incorporated in Indonesia, operating across three lines of business: advanced organic marketing services, in-house martech platform development, and a venture studio. We engineer search and AI-answer-engine authority, build and operate martech platforms (YPYM Flow, YPYM Web Sitemap, YPYM Query Mapping), and run full marketing operations for selected portfolio companies under our venture studio model. Our registered office is located at Indonesia Stock Exchange Tower 1, Level 3, Unit 304, Jl. Jenderal Sudirman Kav. 52–53, Senayan, Kebayoran Baru, Jakarta Selatan 12190, Indonesia. NIB: 1003260083966.</p>
              <p>YPYM is committed to protecting your privacy. We collect only the information necessary to deliver our professional services and fulfil contractual obligations. We do not sell, trade, or transfer your personal data to third parties without your explicit consent, except where required by applicable law. All data submitted through our contact forms, service agreements, and analytics platforms is handled in accordance with Indonesia’s Personal Data Protection Law (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi). For our complete privacy policy and data processing practices, visit <a href="https://ypym.app/company/privacy-policy" target="_blank" rel="noopener noreferrer">ypym.app/company/privacy-policy</a>.</p>
              <p>YPYM’s professional services, spanning organic marketing for search engines and AI answer engines, martech platform development, and venture studio engagements, are B2B service offerings and do not constitute financial, legal, investment, or other regulated advice. Performance figures, case study benchmarks, and organic ROI projections referenced on this website represent historical outcomes from specific client engagements and are not guaranteed results. Individual outcomes depend on client industry, competitive landscape, implementation quality, and market conditions outside YPYM’s control. All service engagements are governed by Indonesian commercial law and the terms set forth in YPYM’s Master Service Agreement.</p>
            </div>
            <button
              type="button"
              className="footer-expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Show all'}
            </button>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING CONTACT CARD WIDGET ─── */}
      <div className={`fc-dim-overlay ${isCardOpen ? 'active' : ''}`} onClick={() => setIsCardOpen(false)}></div>

      <button
        className="fc-trigger"
        type="button"
        aria-label="Contact us"
        onClick={(e) => {
          e.stopPropagation();
          setIsCardOpen(!isCardOpen);
        }}
      >
        <div className="fc-icon-carousel">
          <div className={`fc-icon-face ${currentIcon === 0 ? 'active' : ''} ${leavingIcon === 0 ? 'leaving' : ''}`} data-icon="cal">
            <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/><rect x="7" y="12" width="2" height="2"/><rect x="11" y="12" width="2" height="2"/><rect x="15" y="12" width="2" height="2"/><rect x="7" y="16" width="2" height="2"/><rect x="11" y="16" width="2" height="2"/></svg>
          </div>
          <div className={`fc-icon-face ${currentIcon === 1 ? 'active' : ''} ${leavingIcon === 1 ? 'leaving' : ''}`} data-icon="di">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
          </div>
          <div className={`fc-icon-face ${currentIcon === 2 ? 'active' : ''} ${leavingIcon === 2 ? 'leaving' : ''}`} data-icon="apr">
            <svg viewBox="0 0 24 24"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
          </div>
          <div className={`fc-icon-face ${currentIcon === 3 ? 'active' : ''} ${leavingIcon === 3 ? 'leaving' : ''}`} data-icon="mail">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
        </div>
        <div className="fc-label">
          <span className={`fc-label-text ${labelState === 'slide-out' ? 'slide-out' : labelState === 'slide-prep' ? 'slide-in-prep' : ''}`}>
            {labels[currentIcon]}
          </span>
        </div>
      </button>

      <div className={`fc-card ${isCardOpen ? 'is-open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="fc-card-title">Get in touch</div>
        <div className="fc-card-sub">Choose the fastest way to reach us</div>

        <a className="fc-item" href="https://calendar.app.google/qxnKQSRehtsBW4S76" target="_blank" rel="noopener noreferrer">
          <div className="fc-item-icon fc-item-icon--cal">
            <svg viewBox="0 0 24 24" fill="#4285F4"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/><rect x="7" y="12" width="2" height="2"/><rect x="11" y="12" width="2" height="2"/><rect x="15" y="12" width="2" height="2"/><rect x="7" y="16" width="2" height="2"/><rect x="11" y="16" width="2" height="2"/></svg>
          </div>
          <div className="fc-item-text">
            <strong>15 Min Virtual Meeting</strong>
            <span>Pick a time on Google Calendar</span>
          </div>
        </a>

        <a className="fc-item" href="https://ypym.app/decision-intelligence" target="_blank" rel="noopener noreferrer">
          <div className="fc-item-icon fc-item-icon--di">
            <svg viewBox="0 0 24 24" fill="#1A4BFF"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
          </div>
          <div className="fc-item-text">
            <strong>Get correct SEO question?</strong>
            <span>Diagnose your business challenge</span>
          </div>
        </a>

        <a className="fc-item" href="https://appraisal.ypym.app/" target="_blank" rel="noopener noreferrer">
          <div className="fc-item-icon fc-item-icon--apr">
            <svg viewBox="0 0 24 24" fill="#0284C7"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
          </div>
          <div className="fc-item-text">
            <strong>Start Appraisal</strong>
            <span>Free instant SEO appraisal tool</span>
          </div>
        </a>

        <div className="fc-divider"></div>
        <div className="fc-card-sub" style={{ marginBottom: '8px', marginTop: '0' }}>For immediate feedback</div>

        <a className="fc-item" href="mailto:sales@ypym.app?subject=SEO%20Inquiry&body=Hi%20YPYM%20Team%2C%0A%0AI%E2%80%99d%20like%20to%20discuss%20..." target="_blank" rel="noopener noreferrer">
          <div className="fc-item-icon fc-item-icon--mail">
            <svg viewBox="0 0 24 24" fill="#EA4335"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <div className="fc-item-text">
            <strong>Email Us</strong>
            <span>We reply under 60 minutes</span>
          </div>
        </a>
        <div className="fc-footer">sales@ypym.app &middot; Response &lt; 60 min</div>
      </div>
    </>
  );
}
