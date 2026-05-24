import { useState, type ReactNode } from 'react';
import type { WhatIfPrompt } from '@/types';
import { Sparkles, Send } from '../icons';

interface WhatIfChatProps {
  prompts: WhatIfPrompt[];
}

/**
 * 정적 prompt 한정 markdown (**bold**, `code`) → React 노드 빌더.
 * dangerouslySetInnerHTML을 피해 XSS 위험을 원천 차단 (Plan §5.5, S2/F009에서도 DOMPurify 불요).
 */
function renderMini(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let cursor = 0;
  let i = 0;
  for (const match of text.matchAll(re)) {
    const start = match.index ?? 0;
    if (start > cursor) out.push(text.slice(cursor, start));
    const bold = match[1];
    const code = match[2];
    if (bold !== undefined) {
      out.push(<strong key={`b${i}`}>{bold}</strong>);
    } else if (code !== undefined) {
      out.push(
        <code
          key={`c${i}`}
          style={{
            fontFamily: 'var(--axis-font-mono)',
            background: 'rgba(255,255,255,0.1)',
            padding: '1px 4px',
            borderRadius: 3,
          }}
        >
          {code}
        </code>,
      );
    }
    cursor = start + match[0].length;
    i += 1;
  }
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export function WhatIfChat({ prompts }: WhatIfChatProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [thinking, setThinking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [askedQ, setAskedQ] = useState<string | null>(null);

  const ask = (q: string): void => {
    setQuery(q);
    setAskedQ(q);
    setThinking(true);
    setAnswer(null);
    window.setTimeout(() => {
      const match =
        prompts.find((p) => q.includes(p.q.slice(0, 8))) ?? prompts.find((p) => p.q === q);
      const ans = match
        ? match.a
        : '질문을 받았습니다. 본 시연 환경은 LLM 가짜 응답 모드입니다 — Sprint 2에서 사내 LLM(또는 OpenAI) 연결 후, GIVC 컨텍스트와 함께 실제 응답을 생성합니다. (`/api/chat` 엔드포인트)';
      setAnswer(ans);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="whatif">
      <div className="whatif-head">
        <Sparkles size={14} />
        <span className="whatif-title">What-If · 자연어 질의</span>
        <span className="whatif-tag">LLM Mock</span>
      </div>
      <div className="whatif-input">
        <input
          type="text"
          placeholder="예: 예산이 10억으로 늘면 추천이 어떻게 바뀌나요?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) ask(query);
          }}
        />
        <button
          onClick={() => query.trim() && ask(query)}
          disabled={!query.trim() || thinking}
        >
          <Send size={12} /> 물어보기
        </button>
      </div>
      <div className="whatif-suggested">
        {prompts.map((p, i) => (
          <button key={i} onClick={() => ask(p.q)}>
            {p.q}
          </button>
        ))}
      </div>
      {(askedQ || thinking || answer) && (
        <div className="whatif-answer">
          {askedQ && (
            <div style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
              Q: {askedQ}
            </div>
          )}
          {thinking ? (
            <span className="ans-thinking">
              분석 중{' '}
              <span className="dot-pulse">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </span>
          ) : (
            <span>{renderMini(answer ?? '')}</span>
          )}
        </div>
      )}
    </div>
  );
}
