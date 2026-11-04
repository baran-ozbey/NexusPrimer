// ===== NexusPrimer 2.0 — Veri Toplama Modu Bileşeni =====
// src/components/DataCollectionPanel.tsx

import { useState } from 'react';
import type { SessionRow } from '../hooks/useDataCollection';

interface DataCollectionPanelProps {
  rows: SessionRow[];
  onExport: () => void;
  sessionId: string;
  isVisible: boolean;
  onToggle: () => void;
}

export default function DataCollectionPanel({
  rows,
  onExport,
  sessionId,
  isVisible,
  onToggle,
}: DataCollectionPanelProps) {
  const [copied, setCopied] = useState(false);

  const gercekRows = rows.filter((r) => r.kaynak === 'gercek');
  const isEligible = gercekRows.length >= 3; // En az 1 tam oturum (3 karar)

  const handleCopyId = () => {
    navigator.clipboard.writeText(sessionId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 1000,
      }}
    >
      {/* Toggle Butonu */}
      <button
        onClick={onToggle}
        type="button"
        data-cy="dc-toggle"
        style={{
          background: 'var(--color-primary)',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
          marginBottom: isVisible ? '8px' : '0',
          display: 'block',
          marginLeft: 'auto',
        }}
      >
        📊 VERİ TOPLAMA
      </button>

      {isVisible && (
        <div
          id="data-collection-panel"
          data-cy="dc-panel"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-primary)',
            borderRadius: '8px',
            padding: '12px',
            width: '300px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: '8px' }}>
            📊 VERİ TOPLAMA MODU
          </div>

          {/* Oturum ID */}
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-dim)' }}>Oturum ID: </span>
            <span
              id="session-id-display"
              data-cy="session-id"
              style={{ color: 'var(--color-secondary)', fontSize: '0.65rem' }}
            >
              {sessionId}
            </span>
            <button
              onClick={handleCopyId}
              type="button"
              style={{ marginLeft: '4px', fontSize: '0.6rem', padding: '1px 4px', cursor: 'pointer' }}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>

          {/* İstatistikler */}
          <div style={{ marginBottom: '8px', color: 'var(--color-text-light)' }}>
            <div data-cy="dc-row-count">Toplam kayıt: <span style={{ color: 'var(--color-primary)' }}>{rows.length}</span></div>
            <div data-cy="dc-gercek-count">Gerçek kayıt: <span style={{ color: 'var(--color-success)' }}>{gercekRows.length}</span></div>
          </div>

          {/* Durum */}
          {!isEligible && (
            <div
              data-cy="dc-incomplete-warning"
              style={{
                background: 'rgba(255,100,0,0.1)',
                border: '1px solid #ff6400',
                borderRadius: '4px',
                padding: '6px',
                marginBottom: '8px',
                color: '#ff6400',
                fontSize: '0.68rem',
              }}
            >
              ⚠ 1 tam oturum (3 karar) tamamlanmadan aktarım yapılamaz.
            </div>
          )}

          {/* Export Butonu */}
          <button
            onClick={onExport}
            disabled={!isEligible}
            type="button"
            id="dc-export-btn"
            data-cy="dc-export-btn"
            style={{
              width: '100%',
              padding: '6px',
              background: isEligible ? 'var(--color-primary)' : '#444',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: isEligible ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.72rem',
            }}
          >
            📥 CSV OLARAK DIŞA AKTAR
          </button>

          <div style={{ marginTop: '8px', color: 'var(--color-text-dim)', fontSize: '0.65rem' }}>
            🔒 KVKK: Gerçek isim / e-posta / konum toplanmaz
          </div>
        </div>
      )}
    </div>
  );
}

