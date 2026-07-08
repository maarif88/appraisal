import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function AppShell({ children }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Header />
      <main className="page-content container" style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
