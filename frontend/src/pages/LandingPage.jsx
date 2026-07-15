import React, { useEffect, useState, useRef } from 'react';
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

function ChatSimulator() {
  const chatMessages = [
    { sender: 'client', text: 'Kalian bisa kerjakan jasa SEO untuk enterprise level?' },
    { sender: 'agency', text: 'Bisa banget, Pak! Kami terbiasa handle enterprise scale.' },
    { sender: 'client', text: 'Keren. Bisa present credentials perusahaan sore ini?' },
    { sender: 'agency', text: 'Safe, Pak! Kami sudah jadwalkan di Google Calendar jam 16.15 ya. See you!' },
    { sender: 'client', text: 'Thank you, see you!' },
    { sender: 'system', text: '— 3 hours later (Meeting Room) —' },
    { sender: 'client', text: 'Hi, thanks for your time. Silakan presentasikan SEO agency kalian.' },
    { sender: 'agency', text: 'Yes Pak, ini list portfolio dan client case studies kami. We have high success rates.' },
    { sender: 'client', text: 'Amazing, portfolio kalian banyak juga ya. But wait, ini ROI-nya seperti apa? Terutama untuk target keywords "executive search" dan "eor"?' },
    { sender: 'agency', text: 'Hmm... 🤔 Untuk details ROI, kami butuh waktu untuk assess dulu ya Pak. Kami kabari 2 hari lagi, atau selambatnya akhir minggu ini...' },
    { sender: 'client', text: 'Okay, no problem. I\'ll continue to the second question: Berapa SEO investment-nya? Range dulu aja.' },
    { sender: 'agency', text: 'Hmm... 😅 Actually kami butuh hitung difficulty-nya dulu Pak. Tapi kasarnya sekitar 30-50 juta per bulan.' },
    { sender: 'client', text: 'Wait, 30-50 juta per bulan? Itu 360 juta per tahun. Sejauh yang kami check, estimasi revenue tahunan dari target keywords "executive search" dan "eor" itu nggak sampai 200 juta per tahun. Kalau budget-nya 360 juta per tahun, logically itu nggak make sense buat bisnis kami.' },
    { sender: 'agency', text: '...' },
    { sender: 'system', text: '💡 Brand managers today are smart. They don\'t buy outdated guesswork anymore.' },
    { sender: 'narrator', text: 'That\'s why both brands and agencies need YPYM Appraisal. We give you instant, accurate, data-backed ROI and pricing estimates. Completely Free.' },
    { sender: 'system', text: '✉️ Keyword not available? Contact us at sales@ypym.app' }
  ];

  const [visibleCount, setVisibleCount] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    if (visibleCount < chatMessages.length) {
      const delay = chatMessages[visibleCount - 1].sender === 'system' ? 2000 : 4000;
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const isActive = visibleCount < chatMessages.length;

  return (
    <div 
      className={isActive ? "chat-pulse-active" : ""}
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto 2.5rem',
        background: '#ffffff',
        border: '1px solid #EAF0FA',
        borderRadius: '20px',
        boxShadow: isActive ? 'none' : '0 12px 36px rgba(11, 15, 65, 0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '420px',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
      }}
    >
      {/* Chat header */}
      <div style={{
        background: '#0B0F41',
        padding: '12px 20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1A4BFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🤝
            </div>
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', border: '2px solid #0B0F41' }} />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'block' }}>Pitch Meeting Simulator</span>
            <span style={{ fontSize: '10px', color: '#30FFFC', fontWeight: 600 }}>Active Dialogue Simulation</span>
          </div>
        </div>
        <button 
          onClick={() => setVisibleCount(1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '11px',
            opacity: 0.8,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Reset Simulation</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" style={{ fill: '#ffffff' }}><path d="M18 2H7c-1.103 0-2 .897-2 2v3c0 1.103.897 2 2 2h11c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2z"></path><path d="M13 15v-2c0-1.103-.897-2-2-2H4V5c-1.103 0-2 .897-2 2v4c0 1.103.897 2 2 2h7v2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z"></path></svg>
        </button>
      </div>

      {/* Chat messages area */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          scrollBehavior: 'smooth'
        }}
      >
        {chatMessages.slice(0, visibleCount).map((msg, i) => {
          if (msg.sender === 'system') {
            return (
              <div key={i} style={{ textAlign: 'center', margin: '8px 0', fontSize: '11px', color: 'var(--text-note)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {msg.text}
              </div>
            );
          }

          if (msg.sender === 'narrator') {
            return (
              <div key={i} style={{
                background: 'rgba(26, 75, 255, 0.05)',
                borderLeft: '4px solid var(--ypym-blue)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--ypym-black)',
                fontWeight: 600,
                lineHeight: '1.5',
                margin: '8px 0',
                textAlign: 'left'
              }}>
                {msg.text}
              </div>
            );
          }

          const isClient = msg.sender === 'client';
          return (
            <div 
              key={i} 
              style={{
                display: 'flex',
                justifyContent: isClient ? 'flex-start' : 'flex-end',
                width: '100%',
                animation: 'phoneSlideIn 0.3s ease-out',
                textAlign: 'left'
              }}
            >
              <div style={{
                maxWidth: '85%',
                background: isClient ? '#0B0F41' : '#1A4BFF',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: isClient ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                fontSize: '13px',
                lineHeight: '1.4',
                fontWeight: 500,
                boxShadow: isClient ? '0 8px 24px rgba(11,15,65,0.06)' : '0 8px 24px rgba(26,75,255,0.1)'
              }}>
                <span style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>
                  {isClient ? 'Brand Manager (Client)' : 'SEO Agency PIC'}
                </span>
                {msg.text}
              </div>
            </div>
          );
        })}
        {visibleCount === chatMessages.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', animation: 'phoneSlideIn 0.3s ease-out' }}>
            <button 
              onClick={() => setVisibleCount(1)}
              style={{
                borderRadius: '99px',
                padding: '8px 20px',
                background: 'var(--ypym-blue)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(26, 75, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Play Again</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style={{ fill: '#ffffff' }}><path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PhoneScreen1() {
  return (
    <div className="phone-frame animate-slide">
      <div className="phone-island" />
      <div className="phone-status-bar">
        <span>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="12" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20V2z"/></svg>
          <svg width="12" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
          <svg width="16" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="5" width="18" height="14" rx="2" ry="2"></rect><line x1="22" y1="9" x2="22" y2="15"></line></svg>
        </div>
      </div>
      
      {/* App Content */}
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'hidden' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ypym-blue)' }}>YPYM</span>
            <span style={{ fontSize: '10px', color: 'var(--text-note)', background: '#F1F3F4', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>appraisal</span>
          </div>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0B0F41', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
            YA
          </div>
        </div>

        {/* Main Card */}
        <div style={{ background: '#0B0F41', borderRadius: '16px', padding: '16px', color: '#ffffff', boxShadow: '0 8px 24px rgba(11,15,65,0.12)' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Projected SEO Revenue</span>
          <div style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', fontFamily: 'var(--font-display)' }}>$247,650</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: 'rgba(48, 255, 252, 0.15)', color: '#30FFFC', padding: '1px 6px', borderRadius: '12px', fontSize: '9px', fontWeight: 600 }}>+26.5% ROI</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>12 months campaign</span>
          </div>
        </div>

        {/* Mini stats cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: '#F8F9FC', border: '1px solid #EAF0FA', borderRadius: '12px', padding: '10px 12px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-note)', display: 'block' }}>Investment</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ypym-black)', marginTop: '2px', display: 'block' }}>$26.5k</span>
          </div>
          <div style={{ background: '#F8F9FC', border: '1px solid #EAF0FA', borderRadius: '12px', padding: '10px 12px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-note)', display: 'block' }}>Net Profit</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ypym-blue)', marginTop: '2px', display: 'block' }}>$221.1k</span>
          </div>
        </div>

        {/* Explore features */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ypym-black)' }}>Audit Engine</span>
            <span style={{ fontSize: '10px', color: 'var(--ypym-blue)', fontWeight: 600 }}>v1.2.0</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Jaccard Deduplication', val: 'Jaccard Scale' },
              { label: 'S-Curve Forecasting', val: 'Logistic S-Curve' },
              { label: 'Intent Capture Rules', val: 'Intent Target' }
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #EAF0FA', borderRadius: '10px', padding: '8px 12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--ypym-black)', fontWeight: 500 }}>{f.label}</span>
                <span style={{ fontSize: '9px', background: '#F1F3F4', color: 'var(--text-note)', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>{f.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Home Indicator */}
      <div className="phone-home-indicator" />
    </div>
  );
}

function PhoneScreen2() {
  const datasets = [
    {
      sector: "Logistic & Supply Chain",
      total: "$312,000",
      items: [
        { label: 'Transactional', share: '50% allocation', val: '$156k', color: 'var(--ypym-blue)' },
        { label: 'Commercial', share: '30% allocation', val: '$94k', color: '#30FFFC' },
        { label: 'Informational', share: '20% allocation', val: '$62k', color: '#DAFF01' }
      ],
      gradient: 'conic-gradient(var(--ypym-blue) 0% 50%, #30FFFC 50% 80%, #DAFF01 80% 100%)'
    },
    {
      sector: "SaaS & FinTech Hub",
      total: "$580,000",
      items: [
        { label: 'Transactional', share: '60% allocation', val: '$348k', color: 'var(--ypym-blue)' },
        { label: 'Commercial', share: '20% allocation', val: '$116k', color: '#30FFFC' },
        { label: 'Informational', share: '20% allocation', val: '$116k', color: '#DAFF01' }
      ],
      gradient: 'conic-gradient(var(--ypym-blue) 0% 60%, #30FFFC 60% 80%, #DAFF01 80% 100%)'
    },
    {
      sector: "E-Commerce Retail",
      total: "$195,000",
      items: [
        { label: 'Transactional', share: '70% allocation', val: '$136.5k', color: 'var(--ypym-blue)' },
        { label: 'Commercial', share: '20% allocation', val: '$39k', color: '#30FFFC' },
        { label: 'Informational', share: '10% allocation', val: '$19.5k', color: '#DAFF01' }
      ],
      gradient: 'conic-gradient(var(--ypym-blue) 0% 70%, #30FFFC 70% 90%, #DAFF01 90% 100%)'
    }
  ];

  const [datasetIdx, setDatasetIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setDatasetIdx(prev => (prev + 1) % datasets.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = datasets[datasetIdx];

  return (
    <div className="phone-frame animate-slide">
      <div className="phone-island" />
      <div className="phone-status-bar">
        <span>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="12" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20V2z"/></svg>
          <svg width="12" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21l-12-18h24z"/></svg>
          <svg width="16" height="9" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="5" width="18" height="14" rx="2" ry="2"></rect><line x1="22" y1="9" x2="22" y2="15"></line></svg>
        </div>
      </div>

      {/* App Content */}
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'hidden' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ypym-black)', opacity: fade ? 1 : 0.6, transition: 'opacity 0.3s' }}>
            {current.sector}
          </span>
          <span style={{ fontSize: '10px', color: '#10B981', background: '#E6F4EA', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Live Data</span>
        </div>

        {/* Circular Donut Chart */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: current.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '4px auto',
          position: 'relative',
          transition: 'background 0.5s ease'
        }}>
          {/* Slowly spinning dashed overlay ring */}
          <div style={{
            position: 'absolute',
            width: '106%',
            height: '106%',
            borderRadius: '50%',
            border: '2px dashed rgba(26, 75, 255, 0.25)',
            animation: 'spinDonut 20s linear infinite',
            pointerEvents: 'none'
          }} />
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            opacity: fade ? 1 : 0.5,
            transition: 'opacity 0.3s'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ypym-black)' }}>{current.total}</span>
            <span style={{ fontSize: '9px', color: 'var(--text-note)' }}>Organic Value</span>
          </div>
        </div>

        {/* Assets Breakdown */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ypym-black)', marginBottom: '8px' }}>
            Search Intent Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: fade ? 1 : 0.5, transition: 'opacity 0.3s' }}>
            {current.items.map((item, idx) => (
              <div key={idx} style={{ background: '#F8F9FC', border: '1px solid #EAF0FA', borderRadius: '12px', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ypym-black)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ypym-black)' }}>{item.val}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--text-note)' }}>{item.share}</span>
                  <span style={{ fontSize: '9px', color: '#10B981', fontWeight: 600 }}>Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="phone-home-indicator" />
    </div>
  );
}

export default function LandingPage() {
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('audit');
  const [activePhoneSlide, setActivePhoneSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhoneSlide(prev => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const tabData = {
    audit: {
      left: {
        tag: "v1.0.0",
        title: "Asset Audit & Cost Analysis",
        description: "Review current operational and indexing expenses. Identify cost leaks in search volume tracking and underutilized API keys.",
        tags: ["Better-SQLite3", "Cost Ledger", "Local Cache"],
        status: "3 cost leaks resolved",
        actionText: "Read documentation",
        actionUrl: "https://hub.ypym.app/"
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
              <Link to="/query-planner/new" className="btn btn-solid" style={{
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
          <Link to="/query-planner" style={{ fontSize: '14px', fontWeight: 600 }}>View All</Link>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ fontFamily: 'var(--font-mono)' }}>Loading history...</p>
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-note)', marginBottom: '1.5rem' }}>No SEO projections have been generated yet.</p>
            <Link to="/query-planner/new" className="btn btn-solid">Generate First Projection</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentProjects.map(p => {
              const kwSlug = encodeURIComponent((p.seed_keyword || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              const projectUrl = `/query-planner/${p.id}${kwSlug ? '/' + kwSlug : ''}`;
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

      {/* Core Mission / Main Idea Section */}
      <section className="section core-mission-section" style={{ padding: '4rem 24px', borderRadius: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <span className="eyebrow" style={{ color: 'var(--ypym-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, fontSize: '12px' }}>
            Solving the Hardest Questions in SEO
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--ypym-black)', letterSpacing: '-0.02em' }}>
            Published to Answer the Trickiest Challenges in the Search Industry
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-note)', lineHeight: '1.6', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
            YPYM Appraisal acts as an independent audit instrument to provide transparent answers to the two most crucial questions often avoided by marketers and SEO agencies:
          </p>

          {/* Active dialogue pitch meeting chat simulator */}
          <ChatSimulator />

          {/* Phone simulation container */}
          <div className="phones-desktop-container">
            <PhoneScreen1 />
            <PhoneScreen2 />
          </div>

          <div className="phones-mobile-container">
            {activePhoneSlide === 0 ? <PhoneScreen1 /> : <PhoneScreen2 />}
            
            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '1.25rem' }}>
              {[0, 1].map(i => (
                <span
                  key={i}
                  onClick={() => setActivePhoneSlide(i)}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: activePhoneSlide === i ? 'var(--ypym-blue)' : '#DADCE0',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a 
              href="https://ypym.app/company/press/ypym-appraisal-framework" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ypym-blue)',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              className="press-release-link"
            >
              <span>Learn more about YPYM Appraisal Framework</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }} className="link-arrow"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
        <style>{`
          @keyframes shadowPulse {
            0% {
              box-shadow: 0 12px 36px rgba(26, 75, 255, 0.08), 0 0 0 0px rgba(26, 75, 255, 0.15);
            }
            50% {
              box-shadow: 0 20px 48px rgba(26, 75, 255, 0.15), 0 0 0 12px rgba(26, 75, 255, 0);
            }
            100% {
              box-shadow: 0 12px 36px rgba(26, 75, 255, 0.08), 0 0 0 0px rgba(26, 75, 255, 0);
            }
          }
          .chat-pulse-active {
            animation: shadowPulse 2.2s infinite ease-in-out;
            border-color: rgba(26, 75, 255, 0.25) !important;
          }
          .core-mission-section {
            background: transparent;
            border: 1px solid transparent;
            transition: all 0.4s ease;
          }
          .core-mission-section:hover {
            background: rgba(26, 75, 255, 0.02);
            border: 1px solid rgba(26, 75, 255, 0.06);
          }
          .press-release-link:hover {
            color: #0b228f;
          }
          .press-release-link:hover .link-arrow {
            transform: translateX(4px);
          }
          
          /* Phone mockups styles */
          .phone-frame {
            width: 290px;
            height: 560px;
            background: #ffffff;
            border: 10px solid #0B0F41;
            border-radius: 36px;
            box-shadow: 0 15px 40px rgba(11, 15, 65, 0.12);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            font-family: var(--font-body);
            user-select: none;
            text-align: left;
            box-sizing: border-box;
          }
          .phone-frame * {
            box-sizing: border-box;
          }
          .phone-island {
            width: 90px;
            height: 22px;
            background: #0B0F41;
            border-radius: 99px;
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
          }
          .phone-status-bar {
            height: 38px;
            padding: 10px 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            font-weight: 600;
            color: #0B0F41;
            background: #ffffff;
            z-index: 5;
          }
          .phone-home-indicator {
            width: 100px;
            height: 4px;
            background: #DADCE0;
            border-radius: 99px;
            position: absolute;
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10;
          }

          .phones-desktop-container {
            display: flex;
            justify-content: center;
            gap: 2.5rem;
            margin-bottom: 2.5rem;
            margin-top: 1.5rem;
          }
          .phones-mobile-container {
            display: none;
          }

          @keyframes phoneSlideIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-slide {
            animation: phoneSlideIn 0.4s ease-out forwards;
          }

          @media (max-width: 768px) {
            .phones-desktop-container {
              display: none !important;
            }
            .phones-mobile-container {
              display: flex !important;
              flex-direction: column;
              align-items: center;
              margin-bottom: 2.5rem;
              margin-top: 1.5rem;
              position: relative;
            }
          }
        `}</style>
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
          background: 'transparent',
          borderRadius: '0',
          border: 'none',
          padding: '0',
          boxShadow: 'none',
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
                {tabData[activeTab].left.actionUrl ? (
                  <a href={tabData[activeTab].left.actionUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ypym-blue)', textDecoration: 'underline' }}>
                    {tabData[activeTab].left.actionText}
                  </a>
                ) : (
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ypym-blue)', textDecoration: 'underline' }}>
                    {tabData[activeTab].left.actionText}
                  </a>
                )}
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
