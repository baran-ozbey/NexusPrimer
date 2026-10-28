/* ===== NexusPrimer — Zamanlayıcı Bileşeni ===== */
import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  duration: number; // saniye
  onTimeout: () => void;
  isActive: boolean;
}

export default function Timer({ duration, onTimeout, isActive }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const circumference = 2 * Math.PI * 30;
  const progress = (remaining / duration) * circumference;

  const strokeColor =
    remaining > 30
      ? '#66BB6A'
      : remaining > 10
        ? '#FDD835'
        : '#EF5350';

  const isDanger = remaining <= 10;

  const handleTimeout = useCallback(() => {
    onTimeoutRef.current();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    setRemaining(duration);
  }, [isActive, duration]);

  useEffect(() => {
    if (!isActive) return;
    if (remaining <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, remaining <= 0, handleTimeout]);

  if (!isActive) return null;

  return (
    <div className="timer-container" id="timer" role="timer" aria-label={`Kalan süre: ${remaining} saniye`}>
      <div className={`timer-circle ${isDanger ? 'timer--danger' : ''}`}>
        <svg viewBox="0 0 64 64">
          <circle className="timer-circle__bg" cx="32" cy="32" r="30" />
          <circle
            className="timer-circle__progress"
            cx="32"
            cy="32"
            r="30"
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        <span className="timer-circle__text" id="timer-value">{remaining}</span>
      </div>
      <span className="timer-label">⏱️ Karar süresi</span>
    </div>
  );
}
