import { useState, useEffect, useRef } from 'react';
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
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState(null);
  const [cookieOpen, setCookieOpen] = useState(false);
  const [cookieScreen, setCookieScreen] = useState('main');
  const [perfConsent, setPerfConsent] = useState(false);
  const [funcConsent, setFuncConsent] = useState(false);
  const [mktgConsent, setMktgConsent] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);
  const [activeSolDesc, setActiveSolDesc] = useState('sol-desc-bisnis');
  const [activeMarDesc, setActiveMarDesc] = useState('mar-desc-flow');
  const [langSearch, setLangSearch] = useState('');
  const [rotatorIndex, setRotatorIndex] = useState(0);
  const [ctaPopupOpen, setCtaPopupOpen] = useState(false);

  const langRef = useRef(null);
  const isId = false;

  const toggleMobileAccordion = (name) => {
    setMobileExpandedItem(prev => prev === name ? null : name);
  };

  // Load consent on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ypym-cookie-consent') || 'null');
      if (saved) {
        setPerfConsent(!!saved.performance);
        setFuncConsent(!!saved.functional);
        setMktgConsent(!!saved.marketing);
      } else {
        const timer = setTimeout(() => {
          setCookieOpen(true);
          setCookieScreen('main');
        }, 10000);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, []);

  const saveConsent = (consent) => {
    try {
      localStorage.setItem('ypym-cookie-consent', JSON.stringify(consent));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('ypym:consent-updated', { detail: consent }));
    setPerfConsent(consent.performance);
    setFuncConsent(consent.functional);
    setMktgConsent(consent.marketing);
    setCookieOpen(false);
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setLangOpen(false);
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
          <span className="logo-text">YPYM <span style={{ fontWeight: 300 }}>Appraisal</span></span>
        </a>

        {/* Navigation Menu */}
        <nav className="nav-links" aria-label="Main Navigation">
          {/* Dropdown: Solutions */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'solusi' ? 'is-open' : ''}`}
            onMouseEnter={() => setActiveDropdown('solusi')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onClick={() => toggleDropdown('solusi')}>
              Solutions
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'solusi' ? 'is-open' : ''}`}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>Adaptive SEO, ASO, AEO, and GEO systems for various industries.</h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href="https://ypym.app/solutions" className="drawer-btn">View Services</a>
                    <a href="https://appraisal.ypym.app/" className="drawer-btn primary">Start Appraisal</a>
                  </div>
                </div>
                <div className="drawer-right">
                  <div className="solusi-grid">
                    <div className="drawer-link-list">
                      <a href="https://ypym.app/business" className="drawer-link-item" onMouseEnter={() => setActiveSolDesc('sol-desc-bisnis')}>Business Solutions, Enterprise SEO</a>
                      <a href="https://ypym.app/technical" className="drawer-link-item" onMouseEnter={() => setActiveSolDesc('sol-desc-teknis')}>Technical Solutions, SEO</a>
                      <a href="https://ypym.app/venture-studio" className="drawer-link-item" onMouseEnter={() => setActiveSolDesc('sol-desc-venture')}>Venture Studio</a>
                    </div>
                    <div className="sol-details-col">
                      {activeSolDesc === 'sol-desc-bisnis' && (
                        <div className="sol-desc-item active">
                          <h3 className="sol-desc-title">Business Solutions, Enterprise SEO</h3>
                          <p className="sol-desc-text">Business-oriented SEO services designed specifically to boost brand authority, dominate high-value industry keywords, and convert organic traffic into net profit. This solution focuses on measurable, long-term business ROI.</p>
                        </div>
                      )}
                      {activeSolDesc === 'sol-desc-teknis' && (
                        <div className="sol-desc-item active">
                          <h3 className="sol-desc-title">Technical Solutions, SEO</h3>
                          <p className="sol-desc-text">Advanced web technical infrastructure optimization to ensure flawless crawling and indexing by search engines. Includes Core Web Vitals, headless architecture, JavaScript rendering, and compliance with modern security standards.</p>
                        </div>
                      )}
                      {activeSolDesc === 'sol-desc-venture' && (
                        <div className="sol-desc-item active">
                          <h3 className="sol-desc-title">Venture Studio</h3>
                          <p className="sol-desc-text">Strategic partnership to design, build, and accelerate new digital platforms from scratch. We integrate innovative products, top-tier technology teams, and advanced organic growth strategies to dominate new markets.</p>
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
                    <div className={`rotator-item ${rotatorIndex === 0 ? 'active' : ''}`}>
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

                    <div className={`rotator-item ${rotatorIndex === 1 ? 'active' : ''}`}>
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

                    <div className={`rotator-item ${rotatorIndex === 2 ? 'active' : ''}`}>
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

                    <div className={`rotator-item ${rotatorIndex === 3 ? 'active' : ''}`}>
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

                    <div className={`rotator-item ${rotatorIndex === 4 ? 'active' : ''}`}>
                      <div className="rotator-item-grid">
                        <div className="rotator-item-left">
                          <h3 className="rotator-term-title"><span className="rotator-term">Local SEO</span> (Local Search Engine Optimization)</h3>
                          <p className="rotator-info-text">Optimizing geographic presence, digital maps, and local directories to dominate map packs and localized proximity-based search queries.</p>
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

           {/* Dropdown: Martech Platform */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'martech' ? 'is-open' : ''}`}
            onMouseEnter={() => setActiveDropdown('martech')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onClick={() => toggleDropdown('martech')}>
              Martech Platform
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'martech' ? 'is-open' : ''}`}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>Martech infrastructure supporting organic growth.</h2>
                  <a href="https://maarif88.github.io/ypym-company/index.html" className="drawer-btn">@github</a>
                </div>
                <div className="drawer-right">
                  <div className="martech-grid">
                    <div className="drawer-link-list">
                      <a href="https://flow.ypym.app" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-flow')}>YPYM Flow</a>
                      <a href="https://query-mapping.ypym.app" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-query')}>Query Mapping</a>
                      <a href="https://web-sitemap.ypym.app" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-sitemap')}>Web Sitemap</a>
                      <a href="https://tessera-notes.ypym.app" className="drawer-link-item" onMouseEnter={() => setActiveMarDesc('mar-desc-tessera')}>Tessera Notes</a>
                    </div>
                    <div className="mar-details-col">
                      {activeMarDesc === 'mar-desc-flow' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">YPYM Flow</h3>
                          <p className="mar-desc-text">Unified marketing automation workflow platform to design, test, and launch massive B2B campaigns. Equipped with predictive analytics and real-time data integration.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-query' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Query Mapping</h3>
                          <p className="mar-desc-text">Advanced analytics tool to map user search intent with your site's information architecture. Automatically discovers keyword gaps and recommends internal linking structures.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-sitemap' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Web Sitemap</h3>
                          <p className="mar-desc-text">Smart sitemap generator that manages crawl priority and indexing of large-scale dynamic web pages. Guarantees search engines crawl your latest pages instantly.</p>
                        </div>
                      )}
                      {activeMarDesc === 'mar-desc-tessera' && (
                        <div className="mar-desc-item active">
                          <h3 className="mar-desc-title">Tessera Notes</h3>
                          <p className="mar-desc-text">Collaborative workspace and internal knowledge base to efficiently record tactics, research, and organic SEO strategy documentation for your marketing team.</p>
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
            onMouseEnter={() => setActiveDropdown('perusahaan')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onClick={() => toggleDropdown('perusahaan')}>
              Company
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'perusahaan' ? 'is-open' : ''}`}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>Building the mechanisms behind organic search authority.</h2>
                  <a href="https://ypym.app/company" className="drawer-btn">Company</a>
                </div>
                <div className="drawer-right">
                  <div className="drawer-link-list">
                    <a href="https://ypym.app/company/about-us" className="drawer-link-item">About YPYM</a>
                    <a href="https://ypym.app/company/contact-us" className="drawer-link-item">Contact Us</a>
                    <a href="https://ypym.app/career" className="drawer-link-item">Careers</a>
                    <a href="https://ypym.app/investment/bill-of-quantity" className="drawer-link-item">Bill of Quantity (BoQ)</a>
                    <a href="https://ypym.app/investment/get-quote" className="drawer-link-item">Get a Quote</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

           {/* Dropdown: Sectors */}
          <div 
            className={`nav-item-dropdown ${activeDropdown === 'sektor' ? 'is-open' : ''}`}
            onMouseEnter={() => setActiveDropdown('sektor')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="nav-btn" onClick={() => toggleDropdown('sektor')}>
              Sectors
              <svg className="chevron" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div className={`dropdown-drawer ${activeDropdown === 'sektor' ? 'is-open' : ''}`}>
              <div className="drawer-inner">
                <div className="drawer-left">
                  <h2>20 sectors. One organic search authority framework.</h2>
                  <a href="https://ypym.app/sector" className="drawer-btn">View All Sectors</a>
                </div>
                <div className="drawer-right">
                  <div className="drawer-link-list">
                    <a href="https://ypym.app/sector/finance" className="drawer-link-item">Finance</a>
                    <a href="https://ypym.app/sector/technology-services" className="drawer-link-item">Technology Services</a>
                    <a href="https://ypym.app/sector/process-industries" className="drawer-link-item">Process Industries</a>
                    <a href="https://ypym.app/sector/communications" className="drawer-link-item">Communications</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Link: Ink & Thought */}
          <a href="https://ypym.app/article" className="nav-link">Ink & Thought</a>
        </nav>

        {/* Right Group */}
        <div className="header-right">
          {/* Language globe switcher */}
          <div className={`lang-switcher-wrap ${langOpen ? 'is-open' : ''}`} ref={langRef}>
            <button className="lang-globe-btn" onClick={() => setLangOpen(!langOpen)}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="8" cy="8" r="6.5"/>
                <ellipse cx="8" cy="8" rx="2.5" ry="6.5"/>
                <line x1="1.5" y1="8" x2="14.5" y2="8"/>
                <line x1="2.5" y1="5.3" x2="13.5" y2="5.3" strokeWidth="0.8" opacity="0.6"/>
                <line x1="2.5" y1="10.7" x2="13.5" y2="10.7" strokeWidth="0.8" opacity="0.6"/>
              </svg>
            </button>
            <div className={`lang-dropdown-v2 ${langOpen ? 'is-open' : ''}`}>
              <div className="lang-search-wrapper">
                <svg className="lang-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input 
                  type="text" 
                  className="lang-search-input" 
                  value={langSearch} 
                  onChange={(e) => setLangSearch(e.target.value)} 
                  placeholder="Search country..." 
                />
              </div>
              <div className="lang-list-container">
                {filteredCountries.map((c) => (
                  <a key={c.name} href={c.url} className={`lang-list-item ${c.active ? 'active' : ''}`}>
                    <span dangerouslySetInnerHTML={{ __html: c.flag }} />
                    <span>{c.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Cookie Preferences Trigger */}
          <button 
            type="button" 
            className={`ck-trigger-btn ${cookieOpen ? 'is-active' : ''}`}
            onClick={() => { setCookieOpen(prev => !prev); setCookieScreen('main'); }}
            aria-label={isId ? 'Preferensi Cookie' : 'Cookie preferences'}
            title={isId ? 'Preferensi Cookie' : 'Cookie preferences'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" strokeWidth="1.5"/>
              <circle cx="8.5" cy="9" r="1.5" fill="currentColor"/>
              <circle cx="14" cy="7.5" r="1" fill="currentColor"/>
              <circle cx="15.5" cy="13" r="1.5" fill="currentColor"/>
              <circle cx="9" cy="15.5" r="1" fill="currentColor"/>
            </svg>
          </button>

          {/* CTA Button */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setCtaPopupOpen(true); }}
            className="cta-pill-btn"
            style={{ background: '#1d1e20', border: 'none', cursor: 'pointer' }}
          >
            Contact Us
          </button>

          {/* Hamburger Mobile Menu Button */}
          <button className="hamburger-btn" onClick={() => setMobileMenuOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="17" y2="6"/>
              <line x1="3" y1="10" x2="17" y2="10"/>
              <line x1="3" y1="14" x2="17" y2="14"/>
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
            <span className="logo-text">YPYM Company</span>
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
            {/* Accordion: Solutions */}
            <div className={`accordion-item ${mobileExpandedItem === 'solutions' ? 'is-expanded' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleMobileAccordion('solutions')}>
                Solutions
                <svg className="chevron" width="12" height="12" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="accordion-content" style={{ maxHeight: mobileExpandedItem === 'solutions' ? '500px' : '0', transition: 'max-height 0.3s ease', overflow: 'hidden' }}>
                <div className="accordion-links">
                  <a href="https://ypym.app/business">Business Solutions, Enterprise SEO</a>
                  <a href="https://ypym.app/technical">Technical Solutions, SEO</a>
                  <a href="https://ypym.app/venture-studio">Venture Studio</a>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', width: '100%' }}>
                    <a href="https://ypym.app/business" className="see-overview-pill" style={{ flex: 1, textAlign: 'center', margin: 0 }}>View Services</a>
                    <a href="https://appraisal.ypym.app/" className="see-overview-pill primary" style={{ flex: 1, textAlign: 'center', margin: 0 }}>Start Appraisal</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion: Martech Platform */}
            <div className={`accordion-item ${mobileExpandedItem === 'martech' ? 'is-expanded' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleMobileAccordion('martech')}>
                Martech Platform
                <svg className="chevron" width="12" height="12" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="accordion-content" style={{ maxHeight: mobileExpandedItem === 'martech' ? '500px' : '0', transition: 'max-height 0.3s ease', overflow: 'hidden' }}>
                <div className="accordion-links">
                  <a href="https://flow.ypym.app">YPYM Flow</a>
                  <a href="https://query-mapping.ypym.app">Query Mapping</a>
                  <a href="https://web-sitemap.ypym.app">Web Sitemap</a>
                  <a href="https://tessera-notes.ypym.app">Tessera Notes</a>
                </div>
              </div>
            </div>

            {/* Accordion: Company */}
            <div className={`accordion-item ${mobileExpandedItem === 'company' ? 'is-expanded' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleMobileAccordion('company')}>
                Company
                <svg className="chevron" width="12" height="12" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="accordion-content" style={{ maxHeight: mobileExpandedItem === 'company' ? '500px' : '0', transition: 'max-height 0.3s ease', overflow: 'hidden' }}>
                <div className="accordion-links">
                  <a href="https://ypym.app/company/about-us">About YPYM</a>
                  <a href="https://ypym.app/company/contact-us">Contact Us</a>
                  <a href="https://ypym.app/career">Careers</a>
                  <a href="https://ypym.app/investment/bill-of-quantity">Bill of Quantity (BoQ)</a>
                  <a href="https://ypym.app/investment/get-quote">Get a Quote</a>
                  <a href="https://ypym.app/company" className="see-overview-pill">Company</a>
                </div>
              </div>
            </div>

            {/* Accordion: Sectors */}
            <div className={`accordion-item ${mobileExpandedItem === 'sectors' ? 'is-expanded' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleMobileAccordion('sectors')}>
                Sectors
                <svg className="chevron" width="12" height="12" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="accordion-content" style={{ maxHeight: mobileExpandedItem === 'sectors' ? '500px' : '0', transition: 'max-height 0.3s ease', overflow: 'hidden' }}>
                <div className="accordion-links">
                  <a href="https://ypym.app/sector/finance">Finance</a>
                  <a href="https://ypym.app/sector/technology-services">Technology Services</a>
                  <a href="https://ypym.app/sector/process-industries">Process Industries</a>
                  <a href="https://ypym.app/sector/communications">Communications</a>
                  <a href="https://ypym.app/sector/health-services">Health Services</a>
                  <a href="https://ypym.app/sector/utilities">Utilities</a>
                  <a href="https://ypym.app/sector/transportation">Transportation</a>
                  <a href="https://ypym.app/sector/retail-trade">Retail Trade</a>
                  <a href="https://ypym.app/sector" className="see-overview-pill">View All Sectors</a>
                </div>
              </div>
            </div>

            {/* Direct Link: Ink & Thought */}
            <div className="accordion-item no-dropdown">
              <a href="https://ypym.app/article" className="accordion-link-direct">Ink & Thought</a>
            </div>

            {/* Accordion: Language / Region */}
            <div className={`accordion-item ${mobileExpandedItem === 'language' ? 'is-expanded' : ''}`}>
              <button className="accordion-trigger" onClick={() => toggleMobileAccordion('language')}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <circle cx="8" cy="8" r="6.5"/>
                    <ellipse cx="8" cy="8" rx="2.5" ry="6.5"/>
                    <line x1="1.5" y1="8" x2="14.5" y2="8"/>
                  </svg>
                  Language / Region
                </span>
                <svg className="chevron" width="12" height="12" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="accordion-content" style={{ maxHeight: mobileExpandedItem === 'language' ? '500px' : '0', transition: 'max-height 0.3s ease', overflow: 'hidden' }}>
                <div className="accordion-links" style={{ gap: '6px', paddingBottom: '12px' }}>
                  <a href="https://ypym.app/" className="lang-list-item" style={{ textDecoration: 'none', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ display: 'inline-block', verticalAlign: 'middle' }}><circle cx="8" cy="8" r="6.5"/><ellipse cx="8" cy="8" rx="2.5" ry="6.5"/><line x1="1.5" y1="8" x2="14.5" y2="8"/></svg>
                    <span style={{ marginLeft: '8px' }}>Global EN</span>
                  </a>
                  <a href="https://ypym.app/id-id/" className="lang-list-item" style={{ textDecoration: 'none', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                    <svg width="18" height="12" viewBox="0 0 20 14" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}><rect width="20" height="7" fill="#CE1126"/><rect y="7" width="20" height="7" fill="#fff"/></svg>
                    <span style={{ marginLeft: '8px' }}>Indonesia</span>
                  </a>
                  <a href="https://ypym.app/en-id/" className="lang-list-item" style={{ textDecoration: 'none', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                    <svg width="18" height="12" viewBox="0 0 20 14" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}><rect width="20" height="7" fill="#CE1126"/><rect y="7" width="20" height="7" fill="#fff"/></svg>
                    <span style={{ marginLeft: '8px' }}>Indonesia (English)</span>
                  </a>
                  <a href="https://ypym.app/en-sg/" className="lang-list-item" style={{ textDecoration: 'none', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                    <svg width="18" height="12" viewBox="0 0 20 14" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}><rect width="20" height="7" fill="#EF3340"/><rect y="7" width="20" height="7" fill="#fff"/><path d="M4.5 3.5 A2.5 2.5 0 1 0 4.5 6.5 A1.8 1.8 0 1 1 4.5 3.5Z" fill="#fff"/></svg>
                    <span style={{ marginLeft: '8px' }}>Singapore</span>
                  </a>
                  <a href="https://ypym.app/en-ch/" className="lang-list-item" style={{ textDecoration: 'none', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                    <svg width="18" height="12" viewBox="0 0 20 14" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}><rect width="20" height="14" fill="#FF0000"/><rect x="8.5" y="3" width="3" height="8" fill="#fff"/><rect x="5.5" y="5.5" width="9" height="3" fill="#fff"/></svg>
                    <span style={{ marginLeft: '8px' }}>Switzerland</span>
                  </a>
                  <a href="https://ypym.app/en-mc/" className="lang-list-item" style={{ textDecoration: 'none', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                    <svg width="18" height="12" viewBox="0 0 20 14" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}><rect width="20" height="7" fill="#CE1126"/><rect y="7" width="20" height="7" fill="#fff"/></svg>
                    <span style={{ marginLeft: '8px' }}>Monaco</span>
                  </a>
                  <a href="https://ypym.app/en-hk/" className="lang-list-item" style={{ textDecoration: 'none', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '6px 8px' }}>
                    <svg width="18" height="12" viewBox="0 0 20 14" style={{ borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}><rect width="20" height="14" fill="#DE2910"/><circle cx="10" cy="7" r="3.8" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" fill="none" stroke-dasharray="2.8 2.8"/></svg>
                    <span style={{ marginLeft: '8px' }}>Hong Kong</span>
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="mobile-drawer-footer" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setCtaPopupOpen(true); }}
            className="mobile-cta-btn"
            style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'block', textAlign: 'center' }}
          >
            Contact Us
          </button>
          <button 
            type="button" 
            style={{ background: 'none', border: 'none', color: '#5f6368', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => { setMobileMenuOpen(false); setCookieOpen(true); setCookieScreen('main'); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="8.5" cy="9" r="1.5" fill="currentColor"/>
              <circle cx="14" cy="7.5" r="1" fill="currentColor"/>
              <circle cx="15.5" cy="13" r="1.5" fill="currentColor"/>
              <circle cx="9" cy="15.5" r="1" fill="currentColor"/>
            </svg>
            Cookie Preferences
          </button>
        </div>
      </div>

      {/* ════════ COOKIE CONSENT PANEL ════════ */}
      <div 
        id="ck-panel" 
        className={`ck-panel ${cookieOpen ? 'ck-panel--open' : ''}`} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="ck-panel-title"
        style={{ display: cookieOpen ? 'block' : 'none' }}
      >
        {cookieScreen === 'main' ? (
          /* SCREEN 1: Privacy Preference Center */
          <div id="ck-main" className="ck-screen">
            <button className="ck-close-btn" id="ck-close" type="button" aria-label="Close" onClick={() => setCookieOpen(false)}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </button>

            <h2 className="ck-heading" id="ck-panel-title">
              {isId ? 'Pusat Preferensi Privasi' : 'Privacy Preference Center'}
            </h2>

            <p className="ck-body">
              {isId
                ? 'PT ADI TJANDRA TEKNOLOGI (YPYM) adalah ekosistem marketing technology yang beroperasi pada tiga lini bisnis: layanan organic marketing tingkat lanjut, pengembangan platform martech in-house, dan venture studio. Saat Anda mengakses platform kami, kami dapat menyimpan atau mengambil data di perangkat Anda - termasuk cookie - untuk mengaktifkan fungsi inti, analitik, dan layanan yang dipersonalisasi. Dengan menggunakan platform dan mengirimkan data Anda, Anda mengakui praktik data kami yang mematuhi UU PDP No. 27/2022, PDPA, APPI, PIPA, dan GDPR. Anda mengendalikan data non-esensial yang kami kumpulkan.'
                : 'PT ADI TJANDRA TEKNOLOGI (YPYM) is a marketing-technology ecosystem operating across three lines of business: advanced organic marketing services, in-house martech platform development, and a venture studio. When you access our platforms, we may store or retrieve data on your device - including cookies - to enable core functionality, analytics, and personalised services. By using our platforms and submitting your data, you acknowledge our data practices in compliance with Indonesia\'s Personal Data Protection Law (UU PDP No. 27/2022), PDPA, APPI, PIPA, and GDPR. You control which non-essential data we collect.'}
            </p>

            <div className="ck-primary-actions">
              <button className="btn" id="ck-allow-all" type="button" onClick={() => saveConsent({ necessary: true, performance: true, functional: true, marketing: true })}>
                {isId ? 'Izinkan Semua' : 'Allow All'}
              </button>
              <button className="btn btn-secondary" id="ck-decline" type="button" onClick={() => saveConsent({ necessary: true, performance: false, functional: false, marketing: false })}>
                {isId ? 'Tolak yang tidak diperlukan' : 'Decline unnecessary cookies'}
              </button>
            </div>

            <button className="btn btn-outline" id="ck-manage-open" type="button" onClick={() => { setCookieScreen('manage'); setExpandedCat(null); }}>
              {isId ? 'Kelola Preferensi Cookie' : 'Manage Consent Preferences'}
            </button>

            <a href={isId ? 'https://ypym.app/id-id/company/cookie-policy' : 'https://ypym.app/company/cookie-policy'} target="_blank" rel="noopener noreferrer" className="ck-learn-link">
              {isId ? 'Pelajari Lebih Lanjut' : 'Learn More'}
            </a>
          </div>
        ) : (
          /* SCREEN 2: Manage Consent Preferences */
          <div id="ck-manage" className="ck-screen">
            <button className="ck-back-btn" id="ck-back" type="button" aria-label="Back" onClick={() => setCookieScreen('main')}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{isId ? 'Kembali' : 'Back'}</span>
            </button>

            <h2 className="ck-heading">
              {isId ? 'Kelola Preferensi Cookie' : 'Manage Consent Preferences'}
            </h2>

            <div className="ck-cats">
              {/* Strictly Necessary */}
              <div className="ck-cat">
                <div className="ck-cat-row" onClick={() => setExpandedCat(prev => prev === 'ck0' ? null : 'ck0')}>
                  <span className="ck-cat-expand-icon">{expandedCat === 'ck0' ? '−' : '+'}</span>
                  <span className="ck-cat-name">{isId ? 'Cookie yang Wajib Ada' : 'Strictly Necessary Cookies'}</span>
                  <span className="ck-always-active">{isId ? 'Selalu Aktif' : 'Always Active'}</span>
                </div>
                {expandedCat === 'ck0' && (
                  <div className="ck-cat-body">
                    <p>{isId ? 'Diperlukan untuk fungsi inti platform YPYM, termasuk sesi akun, pengiriman formulir pertanyaan layanan B2B, akses alat SEO & martech, serta kontrol keamanan. Tidak dapat dinonaktifkan tanpa merusak fungsionalitas kritis. Sesuai dengan UU PDP No. 27/2022.' : 'Essential for core YPYM platform functions including account sessions, B2B service enquiry form submissions, SEO & martech tool access, and security controls. These cannot be disabled without breaking critical functionality. Governed under UU PDP No. 27/2022.'}</p>
                  </div>
                )}
              </div>

              {/* Performance Cookies */}
              <div className="ck-cat">
                <div className="ck-cat-row" onClick={() => setExpandedCat(prev => prev === 'ck1' ? null : 'ck1')}>
                  <span className="ck-cat-expand-icon">{expandedCat === 'ck1' ? '−' : '+'}</span>
                  <span className="ck-cat-name">{isId ? 'Cookie Kinerja' : 'Performance Cookies'}</span>
                  <label className="ck-sw" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="ck-sw-input" checked={perfConsent} onChange={(e) => setPerfConsent(e.target.checked)} />
                    <span className="ck-sw-track"><span className="ck-sw-knob"></span></span>
                  </label>
                </div>
                {expandedCat === 'ck1' && (
                  <div className="ck-cat-body">
                    <p>{isId ? 'Memungkinkan YPYM mengukur performa platform, keterlibatan konten, dan penggunaan alat SEO & martech. Data dianonimkan dan digunakan untuk meningkatkan solusi B2B dan akurasi alat kami. Mematuhi ketentuan analitik UU PDP, PDPA, dan GDPR.' : 'Allow YPYM to measure platform performance, content engagement, and SEO & martech tool usage. Data is anonymised and used to improve our B2B solutions and tool accuracy. Complies with analytics provisions under UU PDP, PDPA, and GDPR.'}</p>
                  </div>
                )}
              </div>

              {/* Functional Cookies */}
              <div className="ck-cat">
                <div className="ck-cat-row" onClick={() => setExpandedCat(prev => prev === 'ck2' ? null : 'ck2')}>
                  <span className="ck-cat-expand-icon">{expandedCat === 'ck2' ? '−' : '+'}</span>
                  <span className="ck-cat-name">{isId ? 'Cookie Fungsional' : 'Functional Cookies'}</span>
                  <label className="ck-sw" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="ck-sw-input" checked={funcConsent} onChange={(e) => setFuncConsent(e.target.checked)} />
                    <span className="ck-sw-track"><span className="ck-sw-knob"></span></span>
                  </label>
                </div>
                {expandedCat === 'ck2' && (
                  <div className="ck-cat-body">
                    <p>{isId ? 'Mengaktifkan pengalaman yang dipersonalisasi di seluruh platform YPYM - termasuk preferensi bahasa, pengaturan antarmuka alat SEO, parameter pencarian tersimpan, dan input formulir yang diingat untuk pengguna B2B yang kembali.' : 'Enable personalised experiences across the YPYM platform - including language preferences, SEO tool interface settings, saved search parameters, and remembered form inputs for returning B2B users.'}</p>
                  </div>
                )}
              </div>

              {/* Marketing Cookies */}
              <div className="ck-cat">
                <div className="ck-cat-row" onClick={() => setExpandedCat(prev => prev === 'ck3' ? null : 'ck3')}>
                  <span className="ck-cat-expand-icon">{expandedCat === 'ck3' ? '−' : '+'}</span>
                  <span className="ck-cat-name">{isId ? 'Cookie Pemasaran' : 'Marketing Cookies'}</span>
                  <label className="ck-sw" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="ck-sw-input" checked={mktgConsent} onChange={(e) => setMktgConsent(e.target.checked)} />
                    <span className="ck-sw-track"><span className="ck-sw-knob"></span></span>
                  </label>
                </div>
                {expandedCat === 'ck3' && (
                  <div className="ck-cat-body">
                    <p>{isId ? 'Memungkinkan YPYM dan mitranya memahami keterlibatan konten di publikasi dan alat kami, serta menyampaikan komunikasi pemasaran B2B yang relevan. Cookie ini melacak interaksi di seluruh halaman layanan dan produk kami. Anda dapat memilih keluar tanpa memengaruhi akses platform, sesuai dengan hak subjek data berdasarkan UU PDP, PDPA, dan GDPR.' : 'Enable YPYM and its partners to understand content engagement across our publications and tools, and deliver relevant B2B marketing communications. These cookies track interactions across service and product pages. You may opt out without affecting platform access, in accordance with data subject rights under UU PDP, PDPA, and GDPR.'}</p>
                  </div>
                )}
              </div>
            </div>

            <button className="btn" id="ck-confirm" type="button" onClick={() => saveConsent({ necessary: true, performance: perfConsent, functional: funcConsent, marketing: mktgConsent })}>
              {isId ? 'Konfirmasi pilihan saya' : 'Confirm my choices'}
            </button>
          </div>
        )}
      </div>

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
              <a href="https://wa.me/6281806710862" target="_blank" rel="noopener noreferrer" className="cta-popup-card">
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
              <a href="https://ypym.app/company/contact-us" target="_blank" rel="noopener noreferrer" className="cta-popup-card">
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
