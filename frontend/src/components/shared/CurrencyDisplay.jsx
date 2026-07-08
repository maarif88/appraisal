import React from 'react';
import { formatCurrency } from '../../utils/api.js';

export default function CurrencyDisplay({ usdAmount, idrAmount, displayMode = 'both' }) {
  if (displayMode === 'usd') {
    return <span className="currency-usd">{formatCurrency(usdAmount, 'USD')}</span>;
  }
  
  if (displayMode === 'idr') {
    return <span className="currency-usd" style={{ color: 'var(--ypym-black)' }}>{formatCurrency(idrAmount, 'IDR')}</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span className="currency-usd">{formatCurrency(usdAmount, 'USD')}</span>
      <span className="currency-idr">{formatCurrency(idrAmount, 'IDR')}</span>
    </div>
  );
}
