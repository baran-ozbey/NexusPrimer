/* ===== NexusPrimer — Durum Çubuğu Bileşeni ===== */
import { useState, useEffect } from 'react';

interface StatusBarProps {
  clock: string;
  systemStatus: string;
  waitingPatients: number;
}

export default function StatusBar({ clock, systemStatus, waitingPatients }: StatusBarProps) {
  const [tick, setTick] = useState(true);

  // Blink the alarm icon every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => !t), 1000);
    return () => clearInterval(id);
  }, []);

  const statusColor =
    systemStatus === 'Çökmüş'
      ? 'red'
      : systemStatus === 'Kısmi Çalışıyor'
        ? 'yellow'
        : 'green';

  const isCritical = systemStatus === 'Çökmüş';

  return (
    <div className="status-bar" role="banner" id="status-bar">
      {/* Sol: Kriz saati + alarm */}
      <div className="status-bar__item" style={{ gap: '6px' }}>
        <span style={{ opacity: tick ? 1 : 0.2, transition: 'opacity 0.1s', color: 'var(--color-secondary)' }}>
          ⚠
        </span>
        <span style={{ color: 'var(--color-text-light)' }}>KRİZ SAATİ</span>
        <span id="status-clock" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          {clock}
        </span>
      </div>

      {/* Orta: Sistem durumu */}
      <div className="status-bar__item">
        <span
          className={`status-dot status-dot--${statusColor}`}
          aria-hidden="true"
        />
        <span id="status-system" style={{ color: isCritical ? 'var(--color-secondary)' : 'var(--color-text-light)' }}>
          SYS: {systemStatus}
        </span>
      </div>

      {/* Sağ: Hasta sayısı + Kriz Seviyesi badge */}
      <div className="status-bar__item" style={{ gap: '8px' }}>
        <span style={{ color: 'var(--color-text-light)' }}>
          👥 <span id="status-patients">{waitingPatients} hasta</span>
        </span>
        <span className="status-bar__badge">KRİZ: KRİTİK</span>
      </div>
    </div>
  );
}
