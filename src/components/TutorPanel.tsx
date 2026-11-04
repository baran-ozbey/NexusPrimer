/* ===== NexusPrimer 2.0 — AI Tutor Paneli (ML Adaptif) ===== */
import { useState, useRef, useEffect } from 'react';
import type { TutorMessage, UserProfile } from '../types';
import { generateTutorResponse, validateTutorResponse } from '../services/tutor';
import type { MLPrediction } from '../services/mlModel';

interface TutorPanelProps {
  profile: UserProfile;
  currentDecision: number;
  messages: TutorMessage[];
  onAddMessage: (messages: TutorMessage[]) => void;
  mlPrediction?: MLPrediction | null;
  onFirstInteraction?: () => void;
}

export default function TutorPanel({
  profile,
  currentDecision,
  messages,
  onAddMessage,
  mlPrediction,
  onFirstInteraction,
}: TutorPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    onFirstInteraction?.();
    const userMsg: TutorMessage = { role: 'user', content: trimmed };

    // Tutor yanıtı oluştur ve doğrula (ML tahminiyle zenginleştirilmiş)
    const rawResponse = generateTutorResponse(trimmed, profile, currentDecision, mlPrediction);
    const { sanitized } = validateTutorResponse(rawResponse);

    const tutorContent = sanitized.reasoning_question
      ? `${sanitized.message}\n\n💭 ${sanitized.reasoning_question}`
      : sanitized.message;

    const tutorMsg: TutorMessage = { role: 'tutor', content: tutorContent };

    onAddMessage([userMsg, tutorMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="tutor-panel" id="tutor-panel" role="complementary" aria-label="AI Tutor">
      {/* Header — terminal style */}
      <div className="tutor-header">
        <div className="tutor-avatar" aria-hidden="true">🤖</div>
        <span className="tutor-title">&gt; AI_TUTOR v2.0 [ONNX_ADAPTIVE]</span>
        <span
          className="tutor-badge"
          id="tutor-mode-badge"
          data-cy="tutor-mode"
          style={{
            background: mlPrediction?.ipucu_gerekli ? '#ffcc00' : 'var(--color-primary)',
            color: '#000',
            fontWeight: 700,
          }}
        >
          {mlPrediction ? (mlPrediction.ipucu_gerekli ? 'MOD: DESTEK' : 'MOD: MEYDAN OKUMA') : 'ONLINE'}
        </span>
      </div>

      {/* Mesajlar */}
      <div className="tutor-messages" id="tutor-messages" aria-live="polite">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`tutor-msg tutor-msg--${msg.role} animate-slide-right`}
          >
            <span
              style={{
                color: msg.role === 'tutor' ? 'var(--color-primary)' : 'var(--color-secondary)',
                marginRight: '6px',
                opacity: 0.7,
                fontSize: '0.72rem',
              }}
            >
              {msg.role === 'tutor' ? '[TUTOR] >' : '[SEN]   >'}
            </span>
            {msg.content.split('\n').map((line, j) => (
              <span key={j}>
                {line}
                {j < msg.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input — terminal style */}
      <div className="tutor-input-area">
        <span className="tutor-input-prefix">$</span>
        <input
          type="text"
          className="tutor-input"
          id="tutor-input"
          placeholder="soru yaz... (Enter ile gönder)"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            onFirstInteraction?.();
          }}
          onKeyDown={handleKeyDown}
          aria-label="Tutor'a mesaj yaz"
          maxLength={300}
        />
        <button
          className="tutor-send-btn"
          id="tutor-send"
          onClick={handleSend}
          disabled={!input.trim()}
          type="button"
          aria-label="Gönder"
        >
          GÖNDER
        </button>
      </div>
    </div>
  );
}
