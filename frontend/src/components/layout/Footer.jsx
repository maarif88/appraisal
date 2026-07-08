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
    'WhatsApp Chat',
    'Email for Immediate Response'
  ];

  useEffect(() => {
    let timer;
    const runCycle = () => {
      const dur = 5000 + Math.random() * 5000;
      timer = setTimeout(() => {
        setLeavingIcon(currentIcon);
        const nextIcon = (currentIcon + 1) % 3;
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
                <li><a href="https://hub.ypym.app" target="_blank" rel="noopener noreferrer">Console (Hub)</a></li>
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
          <div className={`fc-icon-face ${currentIcon === 1 ? 'active' : ''} ${leavingIcon === 1 ? 'leaving' : ''}`} data-icon="wa">
            <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.016a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.15 12.01C2.153 6.578 6.587 2.15 12.065 2.15a9.84 9.84 0 0 1 6.995 2.898 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.903 9.884zM12.05.15C5.495.15.15 5.46.15 12.01c0 2.104.549 4.16 1.595 5.977L.1 24.15l6.335-1.652A11.86 11.86 0 0 0 12.05 24.1c6.556 0 11.9-5.344 11.9-11.89 0-3.176-1.24-6.165-3.49-8.411A11.84 11.84 0 0 0 12.05.15z"/></svg>
          </div>
          <div className={`fc-icon-face ${currentIcon === 2 ? 'active' : ''} ${leavingIcon === 2 ? 'leaving' : ''}`} data-icon="mail">
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

        <a className="fc-item" href="https://wa.me/6281806710862" target="_blank" rel="noopener noreferrer">
          <div className="fc-item-icon fc-item-icon--wa">
            <svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.016a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.15 12.01C2.153 6.578 6.587 2.15 12.065 2.15a9.84 9.84 0 0 1 6.995 2.898 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.903 9.884zM12.05.15C5.495.15.15 5.46.15 12.01c0 2.104.549 4.16 1.595 5.977L.1 24.15l6.335-1.652A11.86 11.86 0 0 0 12.05 24.1c6.556 0 11.9-5.344 11.9-11.89 0-3.176-1.24-6.165-3.49-8.411A11.84 11.84 0 0 0 12.05.15z"/></svg>
          </div>
          <div className="fc-item-text">
            <strong>WhatsApp Us</strong>
            <span>Chat directly on WhatsApp</span>
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
