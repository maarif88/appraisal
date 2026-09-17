import React, { useState, useEffect } from 'react';

export default function CookieConsent({ isId = false }) {
  const [visible, setVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [perfConsent, setPerfConsent] = useState(true);
  const [funcConsent, setFuncConsent] = useState(false);
  const [mktgConsent, setMktgConsent] = useState(false);

  const t = {
    heading: isId ? 'Pilihan Privasi & Cookie' : 'Privacy & Cookie Choices',
    body: isId
      ? 'Kami menggunakan cookie untuk memastikan keandalan sistem dan analitik performa anonim. Anda memegang kendali penuh atas privasi Anda.'
      : 'We use cookies to maintain system reliability and anonymous performance analytics. You have full control over your preferences.',
    allowAll: isId ? 'Izinkan Semua' : 'Allow All',
    decline: isId ? 'Tolak Non-Esensial' : 'Decline Non-Essential',
    customize: isId ? 'Atur Pilihan' : 'Customize Preferences',
    hideSettings: isId ? 'Sembunyikan Pengaturan' : 'Hide Preferences',
    save: isId ? 'Simpan Pilihan' : 'Save Preferences',
    policyLink: isId ? 'Kebijakan Cookie' : 'Cookie Policy',
    alwaysActive: isId ? 'Selalu Aktif' : 'Always Active',
    closeAria: isId ? 'Tutup dialog cookie' : 'Close cookie dialog',

    catRequired: isId ? 'Wajib & Esensial' : 'Strictly Necessary',
    catRequiredDesc: isId
      ? 'Diperlukan untuk keamanan, autentikasi sesi, dan fungsionalitas dasar platform.'
      : 'Required for core security, session authentication, and basic functions.',

    catPerf: isId ? 'Kinerja & Analitik' : 'Performance & Analytics',
    catPerfDesc: isId
      ? 'Membantu kami memahami interaksi pengunjung secara anonim untuk peningkatan kecepatan.'
      : 'Helps us measure anonymous site performance to improve speed and stability.',

    catFunc: isId ? 'Fungsional' : 'Functional',
    catFuncDesc: isId
      ? 'Mengingat preferensi bahasa dan konfigurasi tampilan antarmuka Anda.'
      : 'Remembers language preferences and UI configurations.',

    catMktg: isId ? 'Pemasaran & Wawasan' : 'Marketing & Insights',
    catMktgDesc: isId
      ? 'Membantu menyampaikan wawasan industri yang relevan dengan kebutuhan Anda.'
      : 'Enables relevant industry insights and communication tailored to your needs.',
  };

  const CONSENT_KEY = 'ypym-cookie-consent';

  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search || '' : '';
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';

    if (search.includes('cookie') || search.includes('reset-cookie') || hash.includes('cookie')) {
      try {
        localStorage.removeItem(CONSENT_KEY);
      } catch (e) {}
      const timer = setTimeout(() => {
        setVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }

    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
      if (saved) {
        setPerfConsent(!!saved.performance);
        setFuncConsent(!!saved.functional);
        setMktgConsent(!!saved.marketing);
      } else {
        const timer = setTimeout(() => {
          setVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {}

    const handleOpen = () => setVisible(true);
    const handleClose = () => setVisible(false);

    window.addEventListener('ypym:open-cookie-consent', handleOpen);
    window.addEventListener('ypym:close-cookie-consent', handleClose);

    return () => {
      window.removeEventListener('ypym:open-cookie-consent', handleOpen);
      window.removeEventListener('ypym:close-cookie-consent', handleClose);
    };
  }, []);

  const saveConsent = (consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('ypym:consent-updated', { detail: consent }));
    setPerfConsent(consent.performance);
    setFuncConsent(consent.functional);
    setMktgConsent(consent.marketing);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      id="ypym-cookie-banner"
      className={`ypym-cookie-banner ${visible ? 'is-visible' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="ypym-cookie-title"
    >
      <div className="ypym-cookie-card">
        {/* Pull handle bar (Mobile) */}
        <div className="ypym-cookie-handle" aria-hidden="true"></div>

        {/* Header bar */}
        <div className="ypym-cookie-header">
          <div className="ypym-cookie-badge-title">
            <span className="ypym-cookie-icon-wrapper" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                <circle cx="8.5" cy="8.5" r="1" fill="currentColor"/>
                <circle cx="7.5" cy="15.5" r="1" fill="currentColor"/>
                <circle cx="16.5" cy="15.5" r="1" fill="currentColor"/>
              </svg>
            </span>
            <h3 id="ypym-cookie-title" className="ypym-cookie-title">{t.heading}</h3>
          </div>
          <button
            type="button"
            className="ypym-cookie-close-btn"
            id="ypym-cookie-close"
            aria-label={t.closeAria}
            onClick={() => setVisible(false)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11"/>
            </svg>
          </button>
        </div>

        {/* Concise Description */}
        <p className="ypym-cookie-desc">{t.body}</p>

        {/* Expandable Detailed Preferences (Accordion) */}
        {detailsOpen && (
          <div id="ypym-cookie-details" className="ypym-cookie-details">
            <div className="ypym-cookie-cat-list">
              {/* 1. Strictly Necessary */}
              <div className="ypym-cookie-cat-item">
                <div className="ypym-cookie-cat-info">
                  <span className="ypym-cookie-cat-title">{t.catRequired}</span>
                  <span className="ypym-cookie-cat-desc">{t.catRequiredDesc}</span>
                </div>
                <div className="ypym-cookie-cat-action">
                  <span className="ypym-cookie-always-badge">{t.alwaysActive}</span>
                </div>
              </div>

              {/* 2. Performance & Analytics */}
              <div className="ypym-cookie-cat-item">
                <div className="ypym-cookie-cat-info">
                  <label htmlFor="ypym-ck-perf" className="ypym-cookie-cat-title">{t.catPerf}</label>
                  <span className="ypym-cookie-cat-desc">{t.catPerfDesc}</span>
                </div>
                <div className="ypym-cookie-cat-action">
                  <label className="ypym-toggle-switch" aria-label={t.catPerf}>
                    <input
                      type="checkbox"
                      id="ypym-ck-perf"
                      checked={perfConsent}
                      onChange={(e) => setPerfConsent(e.target.checked)}
                    />
                    <span className="ypym-toggle-track">
                      <span className="ypym-toggle-knob"></span>
                    </span>
                  </label>
                </div>
              </div>

              {/* 3. Functional */}
              <div className="ypym-cookie-cat-item">
                <div className="ypym-cookie-cat-info">
                  <label htmlFor="ypym-ck-func" className="ypym-cookie-cat-title">{t.catFunc}</label>
                  <span className="ypym-cookie-cat-desc">{t.catFuncDesc}</span>
                </div>
                <div className="ypym-cookie-cat-action">
                  <label className="ypym-toggle-switch" aria-label={t.catFunc}>
                    <input
                      type="checkbox"
                      id="ypym-ck-func"
                      checked={funcConsent}
                      onChange={(e) => setFuncConsent(e.target.checked)}
                    />
                    <span className="ypym-toggle-track">
                      <span className="ypym-toggle-knob"></span>
                    </span>
                  </label>
                </div>
              </div>

              {/* 4. Marketing */}
              <div className="ypym-cookie-cat-item">
                <div className="ypym-cookie-cat-info">
                  <label htmlFor="ypym-ck-mktg" className="ypym-cookie-cat-title">{t.catMktg}</label>
                  <span className="ypym-cookie-cat-desc">{t.catMktgDesc}</span>
                </div>
                <div className="ypym-cookie-cat-action">
                  <label className="ypym-toggle-switch" aria-label={t.catMktg}>
                    <input
                      type="checkbox"
                      id="ypym-ck-mktg"
                      checked={mktgConsent}
                      onChange={(e) => setMktgConsent(e.target.checked)}
                    />
                    <span className="ypym-toggle-track">
                      <span className="ypym-toggle-knob"></span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save preferences button */}
            <div className="ypym-cookie-details-actions">
              <button
                type="button"
                id="ypym-cookie-save"
                className="ypym-btn-save"
                onClick={() =>
                  saveConsent({
                    necessary: true,
                    performance: perfConsent,
                    functional: funcConsent,
                    marketing: mktgConsent,
                  })
                }
              >
                {t.save}
              </button>
            </div>
          </div>
        )}

        {/* Actions & Links Footer */}
        <div className="ypym-cookie-footer">
          <div className="ypym-cookie-actions">
            <button
              type="button"
              id="ypym-cookie-allow"
              className="ypym-btn ypym-btn-primary"
              onClick={() =>
                saveConsent({ necessary: true, performance: true, functional: true, marketing: true })
              }
            >
              {t.allowAll}
            </button>
            <button
              type="button"
              id="ypym-cookie-decline"
              className="ypym-btn ypym-btn-secondary"
              onClick={() =>
                saveConsent({ necessary: true, performance: false, functional: false, marketing: false })
              }
            >
              {t.decline}
            </button>
          </div>
          <div className="ypym-cookie-links">
            <button
              type="button"
              id="ypym-cookie-toggle-details"
              className="ypym-link-customize"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen(!detailsOpen)}
            >
              <svg className="ypym-settings-gear-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>{detailsOpen ? t.hideSettings : t.customize}</span>
              <svg className={`ypym-chevron-icon ${detailsOpen ? 'is-rotated' : ''}`} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4"/>
              </svg>
            </button>
            <span className="ypym-link-sep" aria-hidden="true">•</span>
            <a
              href={isId ? 'https://ypym.app/id-id/company/cookie-policy' : 'https://ypym.app/company/cookie-policy'}
              className="ypym-link-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.policyLink}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
