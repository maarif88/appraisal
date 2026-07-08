import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProjects } from '../utils/api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';

const keywordsPool = [
  { id: 1, text: 'jasa seo jakarta', sv: '1.2k', intent: 'Transactional', initial: 'JS', time: '1hr ago' },
  { id: 2, text: 'car rental bali', sv: '8.4k', intent: 'Commercial', initial: 'CB', time: '2hr ago' },
  { id: 3, text: 'buy baby clothes', sv: '12.5k', intent: 'Transactional', initial: 'BC', time: '3hr ago' },
  { id: 4, text: 'best gaming laptop', sv: '45.0k', intent: 'Commercial', initial: 'GL', time: '1d ago' },
  { id: 5, text: 'sewa printer bulanan', sv: '880', intent: 'Transactional', initial: 'SP', time: '5m ago' },
  { id: 6, text: 'indonesian food recipe', sv: '90.5k', intent: 'Informational', initial: 'IR', time: '12m ago' },
  { id: 7, text: 'jasa pembuatan website', sv: '2.9k', intent: 'Transactional', initial: 'JW', time: '20m ago' },
  { id: 8, text: 'hotel murah bandung', sv: '22.2k', intent: 'Transactional', initial: 'HM', time: '35m ago' },
  { id: 9, text: 'bumbu rendang instan', sv: '5.4k', intent: 'Transactional', initial: 'BR', time: '45m ago' },
  { id: 10, text: 'best sunscreen for acne', sv: '18.1k', intent: 'Commercial', initial: 'BS', time: '2hr ago' },
  { id: 11, text: 'digital marketing agency', sv: '3.6k', intent: 'Commercial', initial: 'DM', time: '4hr ago' },
  { id: 12, text: 'software erp terbaik', sv: '1.5k', intent: 'Commercial', initial: 'SE', time: '5hr ago' },
  { id: 13, text: 'belajar coding gratis', sv: '6.6k', intent: 'Informational', initial: 'BG', time: '6hr ago' },
  { id: 14, text: 'jual baju gamis', sv: '14.8k', intent: 'Transactional', initial: 'JG', time: '8hr ago' },
  { id: 15, text: 'honda civic bekas', sv: '27.1k', intent: 'Commercial', initial: 'HC', time: '12hr ago' },
  { id: 16, text: 'coworking space jakarta', sv: '4.2k', intent: 'Commercial', initial: 'CS', time: '15hr ago' },
  { id: 17, text: 'suplemen fitnes bpom', sv: '2.2k', intent: 'Transactional', initial: 'SF', time: '18hr ago' },
  { id: 18, text: 'cara membuat cv', sv: '33.1k', intent: 'Informational', initial: 'CC', time: '23hr ago' },
  { id: 19, text: 'jasa ekspedisi cargo', sv: '7.5k', intent: 'Transactional', initial: 'JE', time: '1d ago' },
  { id: 20, text: 'coffee shop terdekat', sv: '110k', intent: 'Navigational', initial: 'CS', time: '2d ago' },
];

function HeroSliderWidget() {
  const [slots, setSlots] = useState([
    { keyword: keywordsPool[0], isBlue: false, staticRot: '-1deg' },
    { keyword: keywordsPool[1], isBlue: false, staticRot: '1deg' },
    { keyword: keywordsPool[2], isBlue: false, staticRot: '-0.5deg' },
    { keyword: keywordsPool[3], isBlue: false, staticRot: '0.5deg' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Choose a random slot to update (0 to 3)
      const slotIndex = Math.floor(Math.random() * 4);

      // Get current displayed IDs
      const displayedIds = slots.map(s => s.keyword.id);

      // Get available keywords
      const availableKeywords = keywordsPool.filter(k => !displayedIds.includes(k.id));

      if (availableKeywords.length === 0) return;

      const nextKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];

      setSlots(prevSlots => {
        // Count how many cards are currently blue (excluding the slot we're updating)
        const currentBlueCount = prevSlots.filter((s, idx) => s.isBlue && idx !== slotIndex).length;

        // Give a 20% chance of being blue IF currentBlueCount < 2.
        const shouldBeBlue = currentBlueCount < 2 && Math.random() < 0.20;

        return prevSlots.map((slot, idx) => {
          if (idx === slotIndex) {
            return {
              ...slot,
              keyword: nextKeyword,
              isBlue: shouldBeBlue
            };
          }
          return slot;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [slots]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '450px',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <style>{`
        @keyframes cardWobble {
          0% { transform: scale(0.9) rotate(0deg); opacity: 0; }
          30% { transform: scale(1.05) rotate(-4deg); opacity: 0.8; }
          60% { transform: scale(0.97) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(var(--static-rot)); opacity: 1; }
        }
        .wobble-card-enter {
          animation: cardWobble 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}</style>

      {/* Card Slot 0 */}
      <CardItem slot={slots[0]} key={slots[0].keyword.id + '-' + slots[0].isBlue} />

      {/* Date separator 1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle)' }}>
        <span>TODAY</span>
        <span>08 JULY</span>
      </div>

      {/* Card Slot 1 */}
      <CardItem slot={slots[1]} key={slots[1].keyword.id + '-' + slots[1].isBlue} />

      {/* Card Slot 2 */}
      <CardItem slot={slots[2]} key={slots[2].keyword.id + '-' + slots[2].isBlue} />

      {/* Date separator 2 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle)' }}>
        <span>YESTERDAY</span>
        <span>07 JULY</span>
      </div>

      {/* Card Slot 3 */}
      <CardItem slot={slots[3]} key={slots[3].keyword.id + '-' + slots[3].isBlue} />
    </div>
  );
}

function CardItem({ slot }) {
  const { keyword, isBlue, staticRot } = slot;
  
  const bg = isBlue ? 'var(--ypym-blue)' : '#ffffff';
  const textColor = isBlue ? '#ffffff' : 'var(--ypym-black)';
  const subColor = isBlue ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-note)';
  const timeColor = isBlue ? 'rgba(255, 255, 255, 0.6)' : '#8F90A6';
  const border = isBlue ? '1px solid var(--ypym-blue)' : '1px solid #EAF0FA';
  const shadow = isBlue ? '0 8px 24px rgba(26, 75, 255, 0.25)' : '0 8px 20px rgba(11,15,65,0.02)';
  const avatarBg = isBlue ? 'rgba(255, 255, 255, 0.15)' : '#F0F4FF';
  const avatarColor = isBlue ? '#ffffff' : 'var(--ypym-blue)';

  return (
    <div
      className="wobble-card-enter"
      style={{
        background: bg,
        borderRadius: '16px',
        padding: '16px 20px',
        border: border,
        boxShadow: shadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
        '--static-rot': staticRot,
        transform: `rotate(${staticRot})`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: avatarBg,
          color: avatarColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'background-color 0.4s, color 0.4s'
        }}>
          {keyword.initial}
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: textColor, margin: 0, transition: 'color 0.4s' }}>
            {keyword.text}
          </h4>
          <p style={{ fontSize: '12px', color: subColor, margin: '4px 0 0 0', transition: 'color 0.4s' }}>
            {keyword.sv} SV | {keyword.intent}
          </p>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: timeColor, fontFamily: 'var(--font-mono)', transition: 'color 0.4s' }}>
        {keyword.time}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('audit');

  const tabData = {
    audit: {
      left: {
        tag: "v1.0.0",
        title: "Asset Audit & Cost Analysis",
        description: "Review current operational and indexing expenses. Identify cost leaks in search volume tracking and underutilized API keys.",
        tags: ["Better-SQLite3", "Cost Ledger", "Local Cache"],
        status: "3 cost leaks resolved",
        actionText: "Read documentation"
      },
      right: {
        title: "Margin Protection Shield",
        description: "Define custom target profit margins and client service fees. The system automatically recalculates thresholds to protect your gross revenue.",
        subtext: "v1.0.2 margin rules active",
        statusText: "Margin Secured",
        buttonText: "Audit Ledger"
      }
    },
    predict: {
      left: {
        tag: "v1.1.2",
        title: "Non-Linear S-Curve Projections",
        description: "Model organic traffic acquisition dynamically. Avoid flat growth rates by using logistic growth S-Curves built on actual difficulty parameters.",
        tags: ["Logistic Growth", "S-Curve", "24-Month Projection"],
        status: "98.2% forecast accuracy",
        actionText: "View math model"
      },
      right: {
        title: "Organic Traffic Simulation",
        description: "Simulate dynamic search visibility ramp-up. Factor in Google index latency, early velocity, and target capture rate ceilings.",
        subtext: "v1.1.5 ramp model updated",
        statusText: "Simulation Ready",
        buttonText: "Simulate Growth"
      }
    },
    scale: {
      left: {
        tag: "v2.0.1",
        title: "Token-Similarity Keyword Clustering",
        description: "Deduplicate search volume pools using Jaccard token-similarity. Cluster overlapping terms and identify primary focus keywords.",
        tags: ["Jaccard Similarity", "Deduplication", "Cluster Primary"],
        status: "4.2x targeting efficiency",
        actionText: "Check Jaccard scale"
      },
      right: {
        title: "Dynamic Capture Penalties",
        description: "Apply automatic capture rate penalties to high-difficulty keywords. Focus marketing budgets on low-difficulty transaction intent clusters.",
        subtext: "v2.0.3 intent rules active",
        statusText: "Optimizer Active",
        buttonText: "Scale Projections"
      }
    }
  };

  useEffect(() => {
    listProjects()
      .then(res => {
        setRecentProjects(res.projects.slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%' }}>
      {/* Brand New Hero Section (Light & Elegant Style) */}
      <section className="section" style={{ padding: '4rem 0 2rem 0', background: 'transparent' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '48px',
          flexWrap: 'wrap'
        }}>
          {/* Left Column */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 3.8rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              color: 'var(--ypym-black)',
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem'
            }}>
              Fuelling growth <span style={{ color: '#FF5E3A', fontFamily: 'sans-serif' }}>↗</span><br />
              with every keyword
            </h1>

            <p style={{
              fontSize: '16px',
              color: 'var(--text-note)',
              lineHeight: '1.5',
              maxWidth: '480px',
              marginBottom: '2.5rem'
            }}>
              From keyword trends to cost analysis, we calculate SEO projections and organic ROI on autopilot.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '3rem' }}>
              <Link to="/projects/new" className="btn btn-solid" style={{
                background: 'var(--ypym-black)',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: '99px',
                padding: '14px 28px',
                height: 'auto',
                fontSize: '14px',
                boxShadow: '0 8px 24px rgba(11,15,65,0.18)',
                border: 'none',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                Start projection now
              </Link>
              <a href="#how-it-works-ref" onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works-ref')?.scrollIntoView({ behavior: 'smooth' });
              }} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ypym-black)',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none'
              }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>▷</span>
                Learn more
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: '#FFB800', fontSize: '18px' }}>★</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {['RM', 'YM', 'AS', 'LD'].map((initials, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: ['#1A4BFF', '#0B0F41', '#30FFFC', '#DAFF01'][idx],
                      color: idx === 3 ? 'var(--ypym-black)' : '#ffffff',
                      border: '2px solid #ffffff',
                      marginLeft: idx === 0 ? 0 : '-10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  >
                    {initials}
                  </div>
                ))}
                <span style={{ fontSize: '13px', color: 'var(--text-note)', marginLeft: '12px', fontWeight: 500 }}>
                  Trusted by 50+ marketing teams
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (Dynamic Wobble/Flip Keyword Slider) */}
          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <HeroSliderWidget />
          </div>
        </div>
      </section>

      {/* Recent Projections Section */}
      <section className="section" style={{ padding: '1rem 0 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Recent Projections</h2>
          <Link to="/projects" style={{ fontSize: '14px', fontWeight: 600 }}>View All</Link>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ fontFamily: 'var(--font-mono)' }}>Loading history...</p>
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-note)', marginBottom: '1.5rem' }}>No SEO projections have been generated yet.</p>
            <Link to="/projects/new" className="btn btn-solid">Generate First Projection</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentProjects.map(p => {
              const kwSlug = encodeURIComponent((p.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              const projectUrl = `/projects/${p.id}${kwSlug ? '/' + kwSlug : ''}`;
              return (
                <div key={p.id} className="card" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{p.seed_keyword}</h3>
                      <span style={{ padding: '2px 8px', background: 'rgba(0,102,204,0.06)', border: '1px solid rgba(0,102,204,0.12)', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: 'var(--ypym-blue)' }}>
                        {p.sector || 'General'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Locale: {p.locale_language}-{p.locale_country} | Created: {new Date(p.created_at).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {p.status === 'completed' && (
                      <div style={{ textAlign: 'right' }}>
                        <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Effective SV Pool:
                        </span>
                        <div className="font-display" style={{ fontWeight: 600, color: 'var(--ypym-blue)', fontSize: '16px' }}>
                          {p.effective_sv_pool.toLocaleString('en-US')} / mo
                        </div>
                      </div>
                    )}
                    <StatusBadge status={p.status} />
                    <Link to={projectUrl} className="btn btn-ghost btn-sm">
                      View Dashboard
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="section" style={{ padding: '2rem 0' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>How It Works</h2>
        <div className="grid-3">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(26,75,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ypym-blue)'
            }}>
              <span className="font-display" style={{ fontWeight: 700 }}>1</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Autocomplete & Trends</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-note)' }}>
              The system retrieves dozens of search queries via Google Autocomplete API and enriches search interest data with a 5-year Google Trends model.
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(26,75,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ypym-blue)'
            }}>
              <span className="font-display" style={{ fontWeight: 700 }}>2</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Clustering & Intent</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-note)' }}>
              De-duplicates overlapping search volume using Jaccard token-similarity clustering, then automatically classifies search intent (informational, transactional, commercial, navigational).
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(26,75,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ypym-blue)'
            }}>
              <span className="font-display" style={{ fontWeight: 700 }}>3</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Ramp-Up S-Curve</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-note)' }}>
              We do not assume flat growth. Organic traffic acquisition is projected dynamically using a logistic S-Curve ramp-up model.
            </p>
          </div>
        </div>
      </section>

      {/* Smarter Valuations Section */}
      <section className="section" id="how-it-works-ref" style={{ padding: '2rem 0 4rem 0' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Ecosystem Capabilities</h2>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid var(--border-light)',
          padding: '40px',
          boxShadow: '0 12px 40px rgba(11,15,65,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <h2 style={{ fontSize: '26px', fontWeight: 600, margin: 0, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ color: '#8F90A6', fontWeight: 400 }}>Smarter valuations find opportunity</span>
              <span style={{ color: 'var(--ypym-black)' }}>— and Capture ROI</span>
            </h2>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              background: '#F4F5F9',
              borderRadius: '99px',
              padding: '4px',
              gap: '4px'
            }}>
              {['audit', 'predict', 'scale'].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? 'var(--ypym-black)' : '#6E7191',
                      borderRadius: '99px',
                      border: 'none',
                      padding: '8px 20px',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '14px',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isActive && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#ff6b00',
                        display: 'inline-block',
                        marginRight: '8px'
                      }} />
                    )}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Content */}
          <div style={{
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {/* Left Card: Light Gray */}
            <div style={{
              flex: '1 1 450px',
              background: '#F8F9FC',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ypym-black)', margin: 0 }}>
                  {tabData[activeTab].left.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-note)', lineHeight: 1.45, margin: 0 }}>
                  {tabData[activeTab].left.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '20px 0 0 0' }}>
                  {tabData[activeTab].left.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '99px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        color: '#4A4A68',
                        fontWeight: 500
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #E8EBF2',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <span style={{ fontSize: '13px', color: '#8F90A6', fontFamily: 'var(--font-mono)' }}>
                  {tabData[activeTab].left.status}
                </span>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ypym-blue)', textDecoration: 'underline' }}>
                  {tabData[activeTab].left.actionText}
                </a>
              </div>
            </div>

            {/* Right Card: Dark Blue/Black */}
            <div style={{
              flex: '1 1 450px',
              background: '#131835',
              borderRadius: '20px',
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px',
              color: '#ffffff',
              boxShadow: '0 12px 32px rgba(11,15,65,0.12)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  {tabData[activeTab].right.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45, margin: 0 }}>
                  {tabData[activeTab].right.description}
                </p>
              </div>

              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', margin: '20px 0 0 0' }}>
                {tabData[activeTab].right.subtext}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(76, 175, 80, 0.12)',
                  border: '1px solid rgba(76, 175, 80, 0.25)',
                  borderRadius: '99px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  color: '#81C784',
                  fontWeight: 500
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '6px' }}>
                    <path d="M10 3L4.5 8.5L2 6" stroke="#81C784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {tabData[activeTab].right.statusText}
                </span>

                <button
                  style={{
                    background: '#ffffff',
                    color: '#131835',
                    borderRadius: '99px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {tabData[activeTab].right.buttonText} &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
