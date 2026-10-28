/* ===== NexusPrimer — İlerleme Göstergesi ===== */

interface ProgressBarProps {
  current: number; // 1, 2, 3
  total: number;
  labels?: string[];
}

export default function ProgressBar({ current, total, labels }: ProgressBarProps) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      id="progress-bar"
    >
      {steps.map((step, idx) => {
        const isCompleted = step < current;
        const isActive = step === current;
        const stepClass = isCompleted
          ? 'progress-step progress-step--completed'
          : isActive
            ? 'progress-step progress-step--active'
            : 'progress-step';

        const label = labels?.[idx];

        return (
          <span key={step} style={{ display: 'contents' }}>
            <div className={stepClass}>
              <div className="progress-step__row">
                <div className="progress-circle">
                  {isCompleted ? '✓' : step}
                </div>
              </div>
              {label && (
                <span className="progress-label">{label}</span>
              )}
              {!label && (
                <span className="progress-label">{step}/{total}</span>
              )}
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`progress-line ${
                  isCompleted
                    ? 'progress-line--completed'
                    : isActive
                      ? 'progress-line--active'
                      : ''
                }`}
                style={{ marginBottom: label ? '16px' : '0' }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
