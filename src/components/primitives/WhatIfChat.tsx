import { useState, type ReactNode } from 'react';
import type { WhatIfPrompt } from '@/types';
import { Sparkles, Send } from '../icons';

interface WhatIfChatProps {
  prompts: WhatIfPrompt[];
}

/**
 * 정적 prompt / LLM 응답 markdown(**bold**, `code`) → React 노드 빌더.
 * raw HTML 직접 주입을 피해 XSS 위험을 원천 차단 (실 LLM 응답에도 동일 적용).
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

/** 세션 단위 rate-limit 키 (서버 X-Session-Id). 브라우저 세션 1개 = 3회 한도. */
function getSessionId(): string {
  const KEY = 'koami-sid';
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

export function WhatIfChat({ prompts }: WhatIfChatProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [thinking, setThinking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [askedQ, setAskedQ] = useState<string | null>(null);
  // F009 하이브리드: 기본 OFF=정적 Mock, ON=실 LLM(/api/chat). 오프라인/실패 시 자동 정적 fallback.
  const [liveMode, setLiveMode] = useState(false);

  const mockAnswer = (q: string): string => {
    const match =
      prompts.find((p) => q.includes(p.q.slice(0, 8))) ?? prompts.find((p) => p.q === q);
    return (
      match?.a ??
      '질문을 받았습니다. 정적 응답 모드입니다 — "실 LLM" 토글을 켜면 GIVC 컨텍스트로 실제 응답을 생성합니다. (`/api/chat`)'
    );
  };

  const ask = async (q: string): Promise<void> => {
    setQuery(q);
    setAskedQ(q);
    setThinking(true);
    setAnswer(null);

    if (!liveMode) {
      window.setTimeout(() => {
        setAnswer(mockAnswer(q));
        setThinking(false);
      }, 900);
      return;
    }

    // 실 LLM (CF Workers AI via /api/chat)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() },
        body: JSON.stringify({ query: q }),
      });
      if (res.status === 429) {
        setAnswer(`세션당 실 LLM 질의 한도(3회)를 초과했어요. 정적 응답으로 보여드릴게요.\n\n${mockAnswer(q)}`);
      } else if (!res.ok) {
        throw new Error(String(res.status));
      } else {
        const data = (await res.json()) as { answer?: string };
        setAnswer(data.answer?.trim() ? data.answer : mockAnswer(q));
      }
    } catch {
      setAnswer(`(실 LLM 연결 실패 — 시범 기능) 정적 응답으로 대체합니다.\n\n${mockAnswer(q)}`);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="whatif">
      <div className="whatif-head">
        <Sparkles size={14} />
        <span className="whatif-title">What-If · 자연어 질의</span>
        <button
          type="button"
          onClick={() => setLiveMode((v) => !v)}
          className="whatif-tag"
          title="실 LLM(CF Workers AI) 시범 기능 — 세션당 3회"
          style={{
            cursor: 'pointer',
            border: 0,
            background: liveMode ? 'var(--axis-color-blue-600)' : undefined,
            color: liveMode ? '#fff' : undefined,
          }}
        >
          {liveMode ? '실 LLM ●' : 'LLM Mock ○'}
        </button>
      </div>
      <div className="whatif-input">
        <input
          type="text"
          placeholder="예: 예산이 10억으로 늘면 추천이 어떻게 바뀌나요?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) void ask(query);
          }}
        />
        <button onClick={() => query.trim() && void ask(query)} disabled={!query.trim() || thinking}>
          <Send size={12} /> 물어보기
        </button>
      </div>
      <div className="whatif-suggested">
        {prompts.map((p, i) => (
          <button key={i} onClick={() => void ask(p.q)}>
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
              {liveMode ? '실 LLM 분석 중' : '분석 중'}{' '}
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
