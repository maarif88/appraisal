import React, { useState, useEffect, useRef } from 'react';
import './MwebPreviewBanner.css';

const MWEB_PAGES = [
  { id: 0, title: 'Quote Studio MWeb', url: 'https://ypym.app/investment/get-quote/mweb' },
  { id: 1, title: 'Solutions', url: 'https://ypym.app/solutions' },
  { id: 2, title: 'SEO Pre-IPO', url: 'https://ypym.app/business/seo-for-pre-ipo' },
  { id: 3, title: 'Venture Studio Bali', url: 'https://ypym.app/venture-studio/bali' }
];

export default function MwebPreviewBanner({
  title = 'Ready to expand your organic market presence?',
  description = 'From technical audits and investment allocation calculations to enterprise search authority consulting—everything is ready to access quickly and flexibly on your mobile device.',
  consultText = 'Consult Now',
  consultHref = 'https://ypym.app/investment/get-quote'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setIsLoading(true);
        setCurrentIndex((prev) => (prev + 1) % MWEB_PAGES.length);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <section className="mweb-banner-section" id="mweb-banner">
      <div className="mweb-banner-card">
        {/* Ambient Gradient Overlay */}
        <div className="mweb-banner-overlay"></div>

        <div className="mweb-banner-inner">
          {/* LEFT: Submerged Mobile Mockup */}
          <div className="mweb-phone-col">
            <div
              className="mweb-phone-shell"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="mweb-phone-screen">
                <div className={`mweb-phone-loader ${isLoading ? 'is-loading' : ''}`}>
                  <svg
                    className="animate-spin"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#0B0F41"
                      strokeWidth="4"
                      strokeOpacity="0.25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="#0B0F41"
                    />
                  </svg>
                </div>
                <iframe
                  ref={iframeRef}
                  className="mweb-phone-iframe"
                  src={MWEB_PAGES[currentIndex].url}
                  title="YPYM Mobile Web Preview"
                  loading="lazy"
                  onLoad={handleIframeLoad}
                  style={{ opacity: isLoading ? 0.4 : 1 }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Human Copy & Single Solid CTA Button */}
          <div className="mweb-copy-col">
            <h2 className="mweb-banner-title">
              {title}
            </h2>
            <p className="mweb-banner-desc">
              {description}
            </p>
            <div className="mweb-btn-row">
              <a
                href={consultHref}
                className="ypym-cta-btn ypym-cta-btn--solid-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                {consultText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
