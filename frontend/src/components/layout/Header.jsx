import { useState, useEffect } from 'react';
import CookieConsent from './CookieConsent';
import './Header.css';

// SVG flags
const svgGlobe = `<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" style="display:inline-block;vertical-align:middle;"><circle cx="8" cy="8" r="6.5"/><ellipse cx="8" cy="8" rx="2.5" ry="6.5"/><line x1="1.5" y1="8" x2="14.5" y2="8"/></svg>`;
const svgID = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="7" fill="#CE1126"/><rect y="7" width="20" height="7" fill="#fff"/></svg>`;
const svgCH = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#FF0000"/><rect x="8.5" y="3" width="3" height="8" fill="#fff"/><rect x="5.5" y="5.5" width="9" height="3" fill="#fff"/></svg>`;
const svgNL = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="4.67" fill="#AE1C28"/><rect y="4.67" width="20" height="4.66" fill="#fff"/><rect y="9.33" width="20" height="4.67" fill="#21468B"/></svg>`;
const svgHK = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#DE2910"/><circle cx="10" cy="7" r="3.8" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" fill="none" stroke-dasharray="2.8 2.8"/></svg>`;
const svgCN = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#DE2910"/><polygon points="4.5,1.8 5.3,4.3 7.8,4.3 5.8,5.7 6.6,8.2 4.5,6.7 2.4,8.2 3.2,5.7 1.2,4.3 3.7,4.3" fill="#FFDE00"/><circle cx="8.5" cy="1.6" r="0.9" fill="#FFDE00"/><circle cx="9.8" cy="3.3" r="0.9" fill="#FFDE00"/><circle cx="9.8" cy="5.6" r="0.9" fill="#FFDE00"/><circle cx="8.5" cy="7.0" r="0.9" fill="#FFDE00"/></svg>`;
const svgKR = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="3" fill="#CD2E3A"/><path d="M10 4a3 3 0 010 6" fill="#003478"/></svg>`;
const svgJP = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#fff"/><circle cx="10" cy="7" r="3.5" fill="#BC002D"/></svg>`;
const svgMY = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#CC0001"/><rect y="1" width="20" height="1" fill="#fff"/><rect y="3" width="20" height="1" fill="#fff"/><rect y="5" width="20" height="1" fill="#fff"/><rect width="9" height="7" fill="#003399"/><circle cx="3.5" cy="3.5" r="2" fill="#FFCC00"/></svg>`;
const svgGB = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#00247D"/><line x1="0" y1="0" x2="20" y2="14" stroke="#fff" stroke-width="3"/><line x1="0" y1="0" x2="20" y2="14" stroke="#CF142B" stroke-width="1.5"/><rect x="8.5" width="3" height="14" fill="#fff"/><rect y="5.5" width="20" height="3" fill="#fff"/><rect x="9" width="2" height="14" fill="#CF142B"/><rect y="6" width="20" height="2" fill="#CF142B"/></svg>`;
const svgUS = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#B22234"/><rect y="1.08" width="20" height="1.08" fill="#fff"/><rect y="3.23" width="20" height="1.08" fill="#fff"/><rect width="8" height="7.54" fill="#3C3B6E"/></svg>`;
const svgDE = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="4.67" fill="#000"/><rect y="4.67" width="20" height="4.66" fill="#D00"/><rect y="9.33" width="20" height="4.67" fill="#FFCE00"/></svg>`;
const svgIL = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#fff"/><rect y="2" width="20" height="2" fill="#0038B8"/><rect y="10" width="20" height="2" fill="#0038B8"/></svg>`;
const svgMC = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="7" fill="#CE1126"/><rect y="7" width="20" height="7" fill="#fff"/></svg>`;
const svgNO = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="14" fill="#EF2B2D"/><rect x="5" width="3" height="14" fill="#fff"/><rect y="5.5" width="20" height="3" fill="#fff"/><rect x="5.7" width="1.6" height="14" fill="#002868"/><rect y="6.2" width="20" height="1.6" fill="#002868"/></svg>`;
const svgSG = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="7" fill="#EF3340"/><rect y="7" width="20" height="7" fill="#fff"/><path d="M4.5 3.5 A2.5 2.5 0 1 0 4.5 6.5 A1.8 1.8 0 1 1 4.5 3.5Z" fill="#fff"/></svg>`;
const svgQA = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="5" height="14" fill="#fff"/><path d="M5 0 L7 1.4 L5 2.8 L7 4.2 L5 5.6 L7 7 L5 8.4 L7 9.8 L5 11.2 L7 12.6 L5 14 L20 14 L20 0 Z" fill="#8D1B3D"/></svg>`;
const svgCA = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="5" height="14" fill="#FF0000"/><rect x="15" width="5" height="14" fill="#FF0000"/><rect x="5" width="10" height="14" fill="#fff"/><path d="M10 3.5 L10.8 5.8 L13.2 5.8 L11.2 7.2 L12 9.5 L10 8.1 L8 9.5 Z" fill="#FF0000" transform="scale(0.8) translate(2.5,1)"/></svg>`;
const svgLU = `<svg width="18" height="12" viewBox="0 0 20 14" style="border-radius:2px;display:inline-block;vertical-align:middle;"><rect width="20" height="4.67" fill="#EF3340"/><rect y="4.67" width="20" height="4.66" fill="#fff"/><rect y="9.33" width="20" height="4.67" fill="#00A1DE"/></svg>`;

const countries = [
  { name: "Global EN", flag: svgGlobe, url: "https://ypym.app/", active: true },
  { name: "Indonesia", flag: svgID, url: "https://ypym.app/id-id/" },
  { name: "Switzerland", flag: svgCH, url: "https://ypym.app/en-ch/" },
  { name: "Netherlands", flag: svgNL, url: "https://ypym.app/en-nl/" },
  { name: "Hong Kong", flag: svgHK, url: "https://ypym.app/en-hk/" },
  { name: "China (简体中文)", flag: svgCN, url: "https://ypym.app/zh-cn/" },
  { name: "Korea (한국어)", flag: svgKR, url: "https://ypym.app/ko-kr/" },
  { name: "Japan (日本語)", flag: svgJP, url: "https://ypym.app/ja-jp/" },
  { name: "Malaysia", flag: svgMY, url: "https://ypym.app/en-my/" },
  { name: "United Kingdom", flag: svgGB, url: "https://ypym.app/en-gb/" },
  { name: "United States", flag: svgUS, url: "https://ypym.app/en-us/" },
  { name: "Germany", flag: svgDE, url: "https://ypym.app/en-de/" },
  { name: "Israel", flag: svgIL, url: "https://ypym.app/en-il/" },
  { name: "Monaco", flag: svgMC, url: "https://ypym.app/en-mc/" },
  { name: "Norway", flag: svgNO, url: "https://ypym.app/en-no/" },
  { name: "Singapore", flag: svgSG, url: "https://ypym.app/en-sg/" },
  { name: "Qatar", flag: svgQA, url: "https://ypym.app/en-qa/" },
  { name: "Canada", flag: svgCA, url: "https://ypym.app/en-ca/" },
  { name: "Luxembourg", flag: svgLU, url: "https://ypym.app/en-lu/" },
  { name: "Indonesia (English)", flag: svgID, url: "https://ypym.app/en-id/" }
];

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeSolDesc, setActiveSolDesc] = useState('sol-desc-bisnis');
  const [activeMarDesc, setActiveMarDesc] = useState('mar-desc-flow');
  const [langSearch, setLangSearch] = useState('');
  const [rotatorIndex, setRotatorIndex] = useState(0);
  const [bottomNavVisible, setBottomNavVisible] = useState(false);
  const [ctaPopupOpen, setCtaPopupOpen] = useState(false);

  const isId = typeof window !== 'undefined' && (window.location.pathname.includes('/id-id') || window.location.hostname.includes('.id'));

  // 3D Flip cycle for Contact / Region button
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // 5 seconds delay before showing the bottom nav bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setBottomNavVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (!bottomNavVisible) return;
      const bottomNavEl = document.getElementById('mweb-bottom-nav');
      if (!bottomNavEl) return;
      if (mobileMenuOpen) return; // don't hide if drawer is open
      
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        bottomNavEl.style.transform = 'translateX(-50%) translateY(90px)';
        bottomNavEl.style.opacity = '0';
      } else {
        bottomNavEl.style.transform = 'translateX(-50%) translateY(0)';
        bottomNavEl.style.opacity = '1';
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bottomNavVisible, mobileMenuOpen]);

  // Rotator effect
  useEffect(() => {
    if (activeDropdown !== 'solusi') return;
    const interval = setInterval(() => {
      setRotatorIndex((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeDropdown]);

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <header id="main-header-v2" className="ypym-header-v2">
      <div className="header-inner">
        {/* Logo Group */}
        <a href="https://ypym.app/" className="logo-group">
          <img src="https://ypym.app/ypym-icon-light.png" alt="YPYM Icon" className="logo-icon" />
          <span className="logo-text"><span className="logo-text-bold">YPYM</span> <span className="logo-text-suffix">Appraisal</span></span>
        </a>

        {/* Navigation Menu */}
        <nav className="nav-links" aria-label="Main Navigation">
          {/* Dropdown: Solutions */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'solusi' ? 'is-open' : ''}`}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onMouseEnter={() => setActiveDropdown('solusi')} onClick={() => toggleDropdown('solusi')}>
              Solutions
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'solusi' ? 'is-open' : ''}`} onMouseEnter={() => setActiveDropdown('solusi')}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>Search solutions designed to adapt and scale with your market.</h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <a href="https://ypym.app/solutions" className="ypym-cta-btn ypym-cta-btn--solid-black" style={{ margin: 0 }}>View Services</a>
                    <a href="https://appraisal.ypym.app/" className="ypym-cta-btn ypym-cta-btn--outline-black" style={{ margin: 0 }}>
                      Start Appraisal
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 12L12 2M12 2H6M12 2v6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                </div>
                <div className="drawer-right">
                  <div className="solusi-grid">
                    <div className="drawer-link-list">
                      <a href="https://ypym.app/business" className="drawer-link-item" onMouseEnter={() => setActiveSolDesc('sol-desc-bisnis')}>Business Solutions, Enterprise SEO</a>
                      <a href="https://ypym.app/technical" className="drawer-link-item" onMouseEnter={() => setActiveSolDesc('sol-desc-teknis')}>Technical Solutions, SEO</a>
                      <a href="https://ypym.app/digital-brand-experience" className="drawer-link-item" onMouseEnter={() => setActiveSolDesc('sol-desc-brand-exp')}>Digital Brand Experience</a>
                      <a href="https://ypym.app/venture-studio" className="drawer-link-item" onMouseEnter={() => setActiveSolDesc('sol-desc-venture')}>Venture Studio<span className="menu-dot"></span></a>
                    </div>
                    <div className="sol-details-col">
                      {activeSolDesc === 'sol-desc-bisnis' && (
                        <div className="sol-desc-item active">
                          <h3 className="sol-desc-title">Business Solutions, Enterprise SEO</h3>
                          <p className="sol-desc-text">Business-oriented SEO services designed specifically to boost brand authority, capture high-value industry keywords, and convert organic traffic into net profit. This solution focuses on measurable, long-term business ROI.</p>
                        </div>
                      )}
                      {activeSolDesc === 'sol-desc-teknis' && (
                        <div className="sol-desc-item active">
                          <h3 className="sol-desc-title">Technical Solutions, SEO</h3>
                          <p className="sol-desc-text">Advanced web technical infrastructure optimization to ensure flawless crawling and indexing by search engines. Includes Core Web Vitals, headless architecture, JavaScript rendering, and compliance with modern security standards.</p>
                        </div>
                      )}
                      {activeSolDesc === 'sol-desc-brand-exp' && (
                        <div className="sol-desc-item active">
                          <h3 className="sol-desc-title">Digital Brand Experience</h3>
                          <p className="sol-desc-text">Engineering cohesive, authority-grade digital brand experiences for enterprises across every customer touchpoint and market.</p>
                        </div>
                      )}
                      {activeSolDesc === 'sol-desc-venture' && (
                        <div className="sol-desc-item active">
                          <h3 className="sol-desc-title">Venture Studio</h3>
                          <p className="sol-desc-text">Strategic partnership to design, build, and accelerate new digital platforms from scratch. We integrate innovative products, top-tier technology teams, and advanced organic growth strategies to lead new markets.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rotator Section */}
              <div className="drawer-highlight-section">
                <div className="rotator-progress-bar-wrap">
                  <div key={rotatorIndex} className="rotator-progress-bar"></div>
                </div>
                <div className="drawer-highlight-container">
                  <div className="rotator-row-1">
                    <span className="highlight-label">ADAPTIVE SEARCH OPTIMIZATION FRAMEWORKS</span>
                  </div>
                  <div className="rotator-window">
                    <div className={`rotator-item ${rotatorIndex === 0 ? 'active' : ((rotatorIndex - 1 + 5) % 5 === 0 ? 'exited' : '')}`}>
                      <div className="rotator-item-grid">
                        <div className="rotator-item-left">
                          <h3 className="rotator-term-title"><span className="rotator-term">SEO</span> (Search Engine Optimization)</h3>
                          <p className="rotator-info-text">Optimizing website structure, semantic markup, and crawl budgets to secure high organic visibility on traditional crawling indexers.</p>
                        </div>
                        <div className="rotator-item-right">
                          <span className="platform-list-title">Target Platforms</span>
                          <div className="platform-vertical-list">
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-google-logo.svg" alt="Google Search" />
                              <span>Google Search</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-bing-logo.svg" alt="Bing Search" />
                              <span>Bing Search</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`rotator-item ${rotatorIndex === 1 ? 'active' : ((rotatorIndex - 1 + 5) % 5 === 1 ? 'exited' : '')}`}>
                      <div className="rotator-item-grid">
                        <div className="rotator-item-left">
                          <h3 className="rotator-term-title"><span className="rotator-term">ASO</span> (App Store Optimization)</h3>
                          <p className="rotator-info-text">Maximizing application discoverability, conversion rates, and localized rankings directly inside native store ecosystems.</p>
                        </div>
                        <div className="rotator-item-right">
                          <span className="platform-list-title">Target Platforms</span>
                          <div className="platform-vertical-list">
                            <div className="platform-list-item">
                              <svg className="platform-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.25 2.5l14 9.5l-14 9.5z" fill="#00C6FF"/><path d="M3.25 2.5l9 9.5l-9 9.5z" fill="#00E676"/><path d="M3.25 2.5v19z" fill="#FFD600"/></svg>
                              <span>Google Play</span>
                            </div>
                            <div className="platform-list-item">
                              <svg className="platform-logo" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/></svg>
                              <span>App Store</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-google-logo.svg" alt="Google Mobile" />
                              <span>Google Mobile</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-bing-logo.svg" alt="Bing Mobile" />
                              <span>Bing Mobile</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`rotator-item ${rotatorIndex === 2 ? 'active' : ((rotatorIndex - 1 + 5) % 5 === 2 ? 'exited' : '')}`}>
                      <div className="rotator-item-grid">
                        <div className="rotator-item-left">
                          <h3 className="rotator-term-title"><span className="rotator-term">AEO</span> (Answer Engine Optimization)</h3>
                          <p className="rotator-info-text">Structuring database nodes, schema graphs, and context engines to feed direct answer boxes and search-bot knowledge panels.</p>
                        </div>
                        <div className="rotator-item-right">
                          <span className="platform-list-title">Target Platforms</span>
                          <div className="platform-vertical-list">
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-google-logo.svg" alt="Google Search AI Overview" />
                              <span>Google Search AI Overview</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-microsoft-copilot-logo.svg" alt="Bing Copilot" />
                              <span>Bing Copilot</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`rotator-item ${rotatorIndex === 3 ? 'active' : ((rotatorIndex - 1 + 5) % 5 === 3 ? 'exited' : '')}`}>
                      <div className="rotator-item-grid">
                        <div className="rotator-item-left">
                          <h3 className="rotator-term-title"><span className="rotator-term">GEO</span> (Generative Engine Optimization)</h3>
                          <p className="rotator-info-text">Structuring website data for AI agents, large language models (LLMs), and retrieval-augmented generation pipelines (RAG).</p>
                        </div>
                        <div className="rotator-item-right">
                          <span className="platform-list-title">Target Platforms</span>
                          <div className="platform-vertical-list">
                            <div className="platform-list-item">
                              <img className="platform-logo" style={{ transform: 'scale(1.35)', marginRight: '8px', marginLeft: '2px' }} src="https://ypym.app/logos/ypym-perplexity-ai-logo.svg" alt="Perplexity AI" />
                              <span>Perplexity AI</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" style={{ transform: 'scale(0.8)' }} src="https://ypym.app/logos/ypym-chatgpt-logo.svg" alt="ChatGPT" />
                              <span>OpenAI ChatGPT</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-gemini-logo.svg" alt="Google Gemini" />
                              <span>Google Gemini</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-claude-ai-logo.svg" alt="Claude AI" />
                              <span>Anthropic Claude</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" style={{ transform: 'scale(1.35)', marginRight: '8px', marginLeft: '2px' }} src="https://ypym.app/logos/ypym-deepseek-logo.svg" alt="DeepSeek" />
                              <span>DeepSeek</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-grok-ai-logo.svg" alt="Grok AI" />
                              <span>Grok AI</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-microsoft-copilot-logo.svg" alt="Microsoft Bing Copilot" />
                              <span>Microsoft Bing Copilot</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-meta-ai-logo.svg" alt="Meta AI" />
                              <span>Meta AI</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`rotator-item ${rotatorIndex === 4 ? 'active' : ((rotatorIndex - 1 + 5) % 5 === 4 ? 'exited' : '')}`}>
                      <div className="rotator-item-grid">
                        <div className="rotator-item-left">
                          <h3 className="rotator-term-title"><span className="rotator-term">Local SEO</span> (Local Search Engine Optimization)</h3>
                          <p className="rotator-info-text">Optimizing geographic presence, digital maps, and local directories to command map packs and localized proximity-based search queries.</p>
                        </div>
                        <div className="rotator-item-right">
                          <span className="platform-list-title">Target Platforms</span>
                          <div className="platform-vertical-list">
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-google-logo.svg" alt="Google Maps" />
                              <span>Google Business Profile</span>
                            </div>
                            <div className="platform-list-item">
                              <img className="platform-logo" src="https://ypym.app/logos/ypym-bing-logo.svg" alt="Bing Places" />
                              <span>Bing Places</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

           {/* Dropdown: Software & APIs */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'martech' ? 'is-open' : ''}`}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onMouseEnter={() => setActiveDropdown('martech')} onClick={() => toggleDropdown('martech')}>
              Software & APIs
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'martech' ? 'is-open' : ''}`} onMouseEnter={() => setActiveDropdown('martech')}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>Software and API infrastructure supporting organic growth.</h2>
                  <a href="https://hub.ypym.app/platform/query-mapping" className="ypym-cta-btn ypym-cta-btn--solid-black" style={{ margin: 0 }}>Product &amp; Research</a>
                </div>
                <div className="drawer-right">
                  <div className="martech-grid">
                    <div className="drawer-link-list">
                      <a href="https://ypym.app/radius" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-radius')}>Radius (API)</a>
                      <a href="https://web-sitemap.ypym.app" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-sitemap')}>Web Sitemap</a>
                      <a href="https://query-mapping.ypym.app" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-query')}>Appraisal</a>
                      <a href="https://flow.ypym.app" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-flow')}>Flow</a>
                      <div className="drawer-divider"></div>
                      <a href="https://ypym.app/stack-management" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-managed')}>Managed Services <span style={{ fontSize: '11px', opacity: 0.65, fontWeight: 'normal' }}>(for Organic Marketing Infra)</span></a>
                      <a href="https://ypym.app/stack-management/integrations" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-integrations')}>Integrate with us</a>
                    </div>
                    <div className="mar-details-col">
                      {activeMarDesc === 'mar-desc-radius' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Radius (API)</h3>
                          <p className="mar-desc-text">Autonomous organic search visibility engine and enterprise MarTech intelligence API.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-sitemap' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Web Sitemap</h3>
                          <p className="mar-desc-text">Smart sitemap generator that manages crawl priority and indexing of large-scale dynamic web pages. Guarantees search engines crawl your latest pages instantly.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-query' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Appraisal</h3>
                          <p className="mar-desc-text">Advanced analytics tool to map user search intent with your site's information architecture. Automatically discovers keyword gaps and recommends internal linking structures.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-flow' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Flow</h3>
                          <p className="mar-desc-text">Unified marketing automation workflow platform to design, test, and launch massive B2B campaigns. Equipped with predictive analytics and real-time data integration.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-managed' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Managed Services</h3>
                          <p className="mar-desc-text">Dedicated managed operations and technical governance for enterprise organic search & AI discovery infrastructure.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-integrations' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Integrate with us</h3>
                          <p className="mar-desc-text">Connect your CMS, custom stack, and internal data pipelines directly with YPYM martech infrastructure.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

           {/* Dropdown: Company */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'perusahaan' ? 'is-open' : ''}`}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onMouseEnter={() => setActiveDropdown('perusahaan')} onClick={() => toggleDropdown('perusahaan')}>
              Company
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'perusahaan' ? 'is-open' : ''}`} onMouseEnter={() => setActiveDropdown('perusahaan')}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>Building the mechanisms behind organic search authority.</h2>
                  <a href="https://ypym.app/company" className="ypym-cta-btn ypym-cta-btn--solid-black" style={{ margin: 0 }}>Company</a>
                </div>
                <div className="drawer-right">
                  <div className="drawer-link-list">
                    <a href="https://ypym.app/company/about-us" className="drawer-link-item">About YPYM</a>
                    <a href="https://ypym.app/company/contact-us" className="drawer-link-item">Contact Us</a>
                    <a href="https://ypym.app/career" className="drawer-link-item">Careers</a>
                    <a href="https://ypym.app/investment/bill-of-quantity" className="drawer-link-item">Bill of Quantity (BoQ)<span className="menu-dot"></span></a>
                    <a href="https://ypym.app/investment/get-quote" className="drawer-link-item">Get a Quote<span className="menu-dot"></span></a>
                    <a href="https://ypym.app/company/acceptable-use-policy" className="drawer-link-item">Acceptable Use Policy</a>
                    <a href="https://ypym.app/company/press" className="drawer-link-item">Press Release<span className="menu-dot"></span></a>
                  </div>
                </div>
              </div>
            </div>
          </div>

           {/* Dropdown: Sectors */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'sektor' ? 'is-open' : ''}`}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onMouseEnter={() => setActiveDropdown('sektor')} onClick={() => toggleDropdown('sektor')}>
              Sectors
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'sektor' ? 'is-open' : ''}`} onMouseEnter={() => setActiveDropdown('sektor')}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>20 sectors. One organic search authority framework.</h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <a href="https://ypym.app/sector" className="ypym-cta-btn ypym-cta-btn--solid-black" style={{ margin: 0 }}>View All Sectors</a>
                    <a href="https://ypym.app/decision-intelligence" className="ypym-cta-btn ypym-cta-btn--outline-black" style={{ margin: 0 }}>
                      Decision Intelligence
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 12L12 2M12 2H6M12 2v6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                </div>
                <div className="drawer-right">
                  <div className="drawer-link-list">
                    <a href="https://ypym.app/sector/finance" className="drawer-link-item">Finance</a>
                    <a href="https://ypym.app/sector/technology-services" className="drawer-link-item">Technology Services</a>
                    <a href="https://ypym.app/sector/process-industries" className="drawer-link-item">Process Industries</a>
                    <a href="https://ypym.app/sector/communications" className="drawer-link-item">Communications</a>
                    <a href="https://ypym.app/sector/health-services" className="drawer-link-item">Health Services</a>
                    <a href="https://ypym.app/sector/utilities" className="drawer-link-item">Utilities</a>
                    <a href="https://ypym.app/sector/transportation" className="drawer-link-item">Transportation</a>
                    <a href="https://ypym.app/sector/retail-trade" className="drawer-link-item">Retail Trade</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Link: Article */}
          <a href={isId ? "https://ypym.app/id-id/blog" : "https://ypym.app/article"} className="nav-link">
            {isId ? 'Blog' : 'Article'}
          </a>
        </nav>

        {/* Right Group (Pricing + Contact Flip CTA + 2-line Hamburger) */}
        <div className="header-right">
          <a
            href={isId ? "https://ypym.app/id-id/investment/get-quote" : "https://ypym.app/investment/get-quote"}
            className="header-pricing-link"
          >
            Pricing
          </a>

          <div
            className="header-contact-flip-box"
            id="contact-flip-box"
            onMouseLeave={() => {
              if (isFlipped) {
                setTimeout(() => setIsFlipped(false), 1200);
              }
            }}
          >
            <div className={`header-contact-flipper ${isFlipped ? 'is-flipped' : ''}`} id="contact-flipper">
              {/* Front Face: Contact CTA */}
              <button
                type="button"
                onClick={() => setCtaPopupOpen(true)}
                className="header-contact-pill header-contact-pill--front contact-popup-trigger"
                id="desktop-cta-trigger"
              >
                <span className="cta-pill-label" id="cta-pill-label">Contact Us</span>
              </button>

              {/* Back Face: Language / Region Switcher Trigger */}
              <button
                type="button"
                className="header-contact-pill header-contact-pill--back"
                id="header-lang-flip-btn"
                aria-label={isId ? "Pilih Bahasa dan Wilayah" : "Choose Language and Region"}
                onClick={() => setLangModalOpen(true)}
              >
                <svg className="lang-pill-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="8" cy="8" r="6.5"/>
                  <ellipse cx="8" cy="8" rx="2.5" ry="6.5"/>
                  <line x1="1.5" y1="8" x2="14.5" y2="8"/>
                </svg>
                <span className="lang-pill-label" id="lang-pill-label">{isId ? "ID / Bahasa" : "Region"}</span>
              </button>
            </div>
          </div>

          <button
            className="hamburger-btn hamburger-2line"
            id="ham-trigger"
            aria-label="Navigation Menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg className="ham-icon-open" width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="1" y1="2" x2="17" y2="2"/>
              <line x1="1" y1="10" x2="17" y2="10"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Dimmed Background Overlay */}
      <div className={`nav-backdrop ${activeDropdown ? 'is-open' : ''}`} onClick={() => setActiveDropdown(null)}></div>

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <a href="https://ypym.app/" className="logo-group">
            <img src="https://ypym.app/ypym-icon-light.png" alt="YPYM Icon" className="logo-icon" />
            <span className="logo-text"><span className="logo-text-bold">YPYM</span> <span className="logo-text-suffix">Appraisal</span></span>
          </a>
          <button className="close-btn" onClick={() => setMobileMenuOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="mobile-drawer-body">
          <nav className="mobile-accordion-nav">
            <div className="accordion-item">
              <span className="accordion-trigger-label">Solutions</span>
              <div className="accordion-links">
                <a href="https://ypym.app/business">Business Solutions, Enterprise SEO</a>
                <a href="https://ypym.app/technical">Technical Solutions, SEO</a>
                <a href="https://ypym.app/digital-brand-experience">Digital Brand Experience</a>
                <a href="https://ypym.app/venture-studio">Venture Studio<span className="menu-dot"></span></a>
                <a href="https://appraisal.ypym.app/" style={{ color: '#1A4BFF', fontWeight: 600 }}>Start Appraisal</a>
              </div>
            </div>
            <div className="accordion-item">
              <span className="accordion-trigger-label">Software & APIs</span>
              <div className="accordion-links">
                <a href="https://ypym.app/radius">Radius (API)</a>
                <a href="https://web-sitemap.ypym.app">Web Sitemap</a>
                <a href="https://query-mapping.ypym.app">Appraisal</a>
                <a href="https://flow.ypym.app">Flow</a>
                <div className="accordion-divider"></div>
                <a href="https://ypym.app/stack-management">Managed Services</a>
                <a href="https://ypym.app/stack-management/integrations">Integrate with us</a>
              </div>
            </div>
            <div className="accordion-item">
              <span className="accordion-trigger-label">Company</span>
              <div className="accordion-links">
                <a href="https://ypym.app/company/about-us">About YPYM</a>
                <a href="https://ypym.app/company/contact-us">Contact Us</a>
                <a href="https://ypym.app/career">Careers</a>
                <a href="https://ypym.app/investment/bill-of-quantity">Bill of Quantity (BoQ)<span className="menu-dot"></span></a>
                <a href="https://ypym.app/investment/get-quote">Get a Quote<span className="menu-dot"></span></a>
                <a href="https://ypym.app/company/acceptable-use-policy">Acceptable Use Policy</a>
                <a href="https://ypym.app/company/press">Press Release<span className="menu-dot"></span></a>
              </div>
            </div>
            <div className="accordion-item">
              <span className="accordion-trigger-label">Sectors</span>
              <div className="accordion-links">
                <a href="https://ypym.app/sector/finance">Finance</a>
                <a href="https://ypym.app/sector/technology-services">Technology Services</a>
                <a href="https://ypym.app/sector/process-industries">Process Industries</a>
                <a href="https://ypym.app/sector/communications">Communications</a>
                <a href="https://ypym.app/sector/health-services">Health Services</a>
                <a href="https://ypym.app/sector/utilities">Utilities</a>
                <a href="https://ypym.app/sector/transportation">Transportation</a>
                <a href="https://ypym.app/sector/retail-trade">Retail Trade</a>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', width: '100%' }}>
                  <a href="https://ypym.app/sector" className="see-overview-pill" style={{ flex: 1, textAlign: 'center', margin: 0 }}>View All Sectors</a>
                  <a href="https://ypym.app/decision-intelligence" className="see-overview-pill primary" style={{ flex: 1, textAlign: 'center', margin: 0 }}>Decision Intelligence</a>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="mobile-drawer-footer">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setCtaPopupOpen(true); }}
            className="mobile-cta-btn"
            style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'block', textAlign: 'center' }}
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* GLOBAL SEARCHABLE REGION & LANGUAGE MODAL */}
      <div
        className={`lang-modal-backdrop ${langModalOpen ? 'is-open' : ''}`}
        id="lang-modal-backdrop"
        hidden={!langModalOpen}
        onClick={() => setLangModalOpen(false)}
      ></div>
      <div
        className={`lang-modal-dialog ${langModalOpen ? 'is-open' : ''}`}
        id="v2-lang-wrap"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
        hidden={!langModalOpen}
      >
        <div className="lang-modal-card">
          <div className="lang-modal-header">
            <div className="lang-modal-title-group">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="8" cy="8" r="6.5"/>
                <ellipse cx="8" cy="8" rx="2.5" ry="6.5"/>
                <line x1="1.5" y1="8" x2="14.5" y2="8"/>
              </svg>
              <h3 id="lang-modal-title" className="lang-modal-title">
                {isId ? "Wilayah & Bahasa" : "Region & Language"}
              </h3>
            </div>
            <button
              type="button"
              className="lang-modal-close-btn"
              id="lang-modal-close"
              aria-label={isId ? "Tutup" : "Close"}
              onClick={() => setLangModalOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="lang-search-wrapper">
            <svg className="lang-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              className="lang-search-input"
              id="v2-lang-search"
              placeholder={isId ? "Cari negara atau bahasa..." : "Search country or language..."}
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="lang-list-container" id="v2-lang-list">
            {filteredCountries.map((c) => (
              <a key={c.name} href={c.url} className={`lang-list-item ${c.active ? 'active' : ''}`}>
                <span dangerouslySetInnerHTML={{ __html: c.flag }} />
                <span>{c.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* MODERN FLOATING COOKIE CONSENT BANNER */}
      <CookieConsent isId={isId} />

      {/* MOBILE BOTTOM FLOATING NAVIGATION BAR */}
      <nav className={`mweb-bottom-nav ${bottomNavVisible ? 'is-visible' : ''}`} id="mweb-bottom-nav" aria-label="Mobile Navigation">
        <a href="https://ypym.app/" className="mweb-nav-tab" id="mweb-tab-home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </a>

        <a href="https://ypym.app/solutions" className="mweb-nav-tab" id="mweb-tab-services">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
          <span>Solutions</span>
        </a>

        <a href="https://ypym.app/hub/" className="mweb-nav-tab" id="mweb-tab-docs">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
            <path d="M6 6h10M6 10h10"/>
          </svg>
          <span>Chapters</span>
        </a>

        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); setCtaPopupOpen(true); }}
          className="mweb-nav-tab" 
          id="mweb-tab-contact"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span>Contact</span>
        </button>

        <button type="button" className="mweb-nav-tab mweb-menu-btn" id="mweb-tab-menu" onClick={() => setMobileMenuOpen(prev => !prev)}>
          <div className="mweb-menu-icon-bg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
        </button>
      </nav>

      {/* FULLSCREEN CONTACT POPUP OVERLAY */}
      {ctaPopupOpen && (
        <div 
          className="cta-popup-overlay is-active"
          style={{ display: 'flex' }}
          onClick={(e) => {
            if (e.target.classList.contains('cta-popup-overlay')) {
              setCtaPopupOpen(false);
            }
          }}
        >
          <button 
            className="cta-popup-close-btn" 
            type="button" 
            onClick={() => setCtaPopupOpen(false)}
            aria-label="Close popup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div className="cta-popup-content">
            <h2 className="cta-popup-title">Contact Us</h2>
            <p className="cta-popup-subtitle">Choose the communication channel that best suits your business needs.</p>
            
            <div className="cta-popup-grid">
              {/* Card 1: WhatsApp Call */}
              <a href="https://wa.me/6282139008060" target="_blank" rel="noopener noreferrer" className="cta-popup-card">
                <div className="cta-card-icon-wrap wa-icon-wrap">
                  <svg className="cta-card-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="cta-card-text">
                  <div className="cta-card-title">WhatsApp Call</div>
                  <div className="cta-card-desc">Direct chat & calls for quick response</div>
                </div>
              </a>
              
              {/* Card 2: Virtual Meeting */}
              <a href="https://calendar.app.google/qxnKQSRehtsBW4S76" target="_blank" rel="noopener noreferrer" className="cta-popup-card">
                <div className="cta-card-icon-wrap meeting-icon-wrap">
                  <svg className="cta-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <path d="M12 14h.01M16 14h.01M8 14h.01M12 18h.01M16 18h.01M8 18h.01"/>
                  </svg>
                </div>
                <div className="cta-card-text">
                  <div className="cta-card-title">Virtual Meeting</div>
                  <div className="cta-card-desc">Schedule a video call in Google Calendar</div>
                </div>
              </a>
              
              {/* Card 3: Email */}
              <a href="mailto:sales@ypym.app" className="cta-popup-card">
                <div className="cta-card-icon-wrap email-icon-wrap">
                  <svg className="cta-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="cta-card-text">
                  <div className="cta-card-title">Send Email</div>
                  <div className="cta-card-desc">Send offers or proposals to sales@ypym.app</div>
                </div>
              </a>
              
              {/* Card 4: Contact Form */}
              <a href="https://ypym.app/company/contact-us" className="cta-popup-card">
                <div className="cta-card-icon-wrap form-icon-wrap">
                  <svg className="cta-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div className="cta-card-text">
                  <div className="cta-card-title">Contact Form</div>
                  <div className="cta-card-desc">Fill in the online form for detailed B2B requests</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { Header, Header as YpymNavbar };
