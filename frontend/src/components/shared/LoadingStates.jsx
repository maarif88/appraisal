import React from 'react';

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      gap: '1rem'
    }}>
      <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-note)' }}>{message}</p>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      {Array.from({ length: cols }).map((_, idx) => (
        <div key={idx} className="skeleton" style={{
          flex: 1,
          height: '20px',
          opacity: 1 - idx * 0.15
        }}></div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="skeleton" style={{ width: '40%', height: '16px' }}></div>
      <div className="skeleton" style={{ width: '80%', height: '32px' }}></div>
      <div className="skeleton" style={{ width: '60%', height: '14px' }}></div>
    </div>
  );
}
