import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { dispatchTourRestart } from './useTour';

export type FaqEntry = {
  q: string;
  a: string;
  keywords: string[];
  related?: string[];
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  faqMatch?: { score: number; entry: FaqEntry } | null;
};

interface HelpChatbotProps {
  /** 현재 페이지 키 (예: 'data', 'cq'). 라우트 -> pageKey 매핑은 호출자가 결정 */
  pageKey: string;
  /** 페이지 한글 라벨 (예: '데이터 현황'). 환영 메시지에 노출 */
  pageLabel: string;
  /** 페이지별 FAQ 엔트리 5~8개 */
  faqs: FaqEntry[];
  /** 챗봇 활성화 (라우트 무관 전역이지만 v0.1 라우트에선 끔) */
  enabled?: boolean;
}

/**
 * F053: 페이지 컨텍스트 인식 도움말 챗봇.
 * - 우하단 플로팅 토글 ❓ 버튼 + 패널 (320px / 모바일 풀스크린)
 * - FAQ 룰베이스 키워드 매칭 (점수순)
 * - LLM fallback 토글 (기본 OFF, ON 시 /api/chat 호출, KV rate-limit 세션 3회)
 * - F046 a11y 패턴: focus trap + Esc + body scroll lock (모바일만, 데스크탑은 옆 패널이라 scroll 허용)
 * - 답변 끝에 SpotlightTour 재시작 안내 링크
 */
const PANEL_W = 360;
const SESSION_ID_KEY = 'koami:chat:sid';
const LLM_TOGGLE_KEY = 'koami:chat:llm';

function ensureSessionId(): string {
  if (typeof window === 'undefined') return 'srv';
  try {
    const existing = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const sid = 'koami-' + Math.random().toString(36).slice(2, 10);
    window.sessionStorage.setItem(SESSION_ID_KEY, sid);
    return sid;
  } catch {
    return 'anon';
  }
}

function loadLlmToggle(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(LLM_TOGGLE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveLlmToggle(on: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LLM_TOGGLE_KEY, on ? '1' : '0');
  } catch {
    /* noop */
  }
}

/** 키워드 점수 매칭. 정확 일치 가중치 ↑, 부분 포함 ↓ */
function matchFaq(query: string, faqs: FaqEntry[]): { score: number; entry: FaqEntry } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  // 한국어 + 영어 토큰: 공백·구두점 분리
  const qTokens = q.split(/[\s,.?!·~\-_/()[\]{}]+/).filter((t) => t.length > 1);
  if (qTokens.length === 0) return null;

  let best: { score: number; entry: FaqEntry } | null = null;
  for (const entry of faqs) {
    let score = 0;
    const kws = entry.keywords.map((k) => k.toLowerCase());
    const haystack = (entry.q + ' ' + entry.keywords.join(' ')).toLowerCase();
    for (const t of qTokens) {
      // 키워드 정확 일치 = 5
      if (kws.includes(t)) score += 5;
      // 키워드 부분 포함 = 2
      else if (kws.some((k) => k.includes(t) || t.includes(k))) score += 2;
      // 질문 본문에 토큰 등장 = 1
      else if (haystack.includes(t)) score += 1;
    }
    if (score > 0 && (best == null || score > best.score)) {
      best = { score, entry };
    }
  }
  return best;
}

export function HelpChatbot({ pageKey, pageLabel, faqs, enabled = true }: HelpChatbotProps): JSX.Element | null {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [llmOn, setLlmOn] = useState(loadLlmToggle);
  const [llmLoading, setLlmLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();
  const sessionId = useMemo(ensureSessionId, []);

  // 페이지 바뀔 때 환영 메시지 리셋
  useEffect(() => {
    if (!enabled) return;
    setMessages([
      {
        id: 'welcome-' + pageKey,
        role: 'assistant',
        content: `안녕하세요, GIVC 온톨로지 데모 도우미예요. **${pageLabel}** 페이지 사용법을 안내해드릴게요. 자주 묻는 질문이나 궁금한 점을 입력해보세요.`,
      },
    ]);
  }, [pageKey, pageLabel, enabled]);

  // open 시 input focus + scroll bottom
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      const prev = previousFocusRef.current;
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [open]);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // Esc 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const submit = useCallback(async () => {
    const q = input.trim();
    if (!q) return;
    const userMsg: ChatMessage = { id: 'u-' + Date.now(), role: 'user', content: q };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    // 1) FAQ 매칭 우선
    const match = matchFaq(q, faqs);
    if (match) {
      const relatedHint = match.entry.related && match.entry.related.length > 0
        ? `\n\n_관련 질문: ${match.entry.related.join(' · ')}_`
        : '';
      const tourHint = '\n\n_더 자세한 안내는 우상단 ❓ "도움말" 버튼으로 가이드 투어를 다시 볼 수 있어요._';
      setMessages((m) => [
        ...m,
        {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content: match.entry.a + relatedHint + tourHint,
          faqMatch: match,
        },
      ]);
      return;
    }

    // 2) FAQ miss + LLM OFF -> 안내 메시지
    if (!llmOn) {
      setMessages((m) => [
        ...m,
        {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content:
            '죄송해요, 그 질문은 도우미 답변 범위 밖이에요. 우상단 ❓ "도움말" 버튼으로 가이드 투어를 보시거나, 패널 하단의 "실 LLM 호출" 토글을 켜주세요 (세션당 3회 한도).',
        },
      ]);
      return;
    }

    // 3) LLM ON -> /api/chat 호출
    setLlmLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
        },
        body: JSON.stringify({
          query: `[현재 페이지: ${pageLabel}] ${q}`,
        }),
      });
      if (res.status === 429) {
        setMessages((m) => [
          ...m,
          {
            id: 'a-' + Date.now(),
            role: 'assistant',
            content: '실 LLM 호출 한도(세션당 3회)에 도달했어요. 페이지 새로고침 후 다시 시도하거나 FAQ를 활용해주세요.',
          },
        ]);
        return;
      }
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            id: 'a-' + Date.now(),
            role: 'assistant',
            content: '실 LLM 응답에 실패했어요. 잠시 후 다시 시도해주세요.',
          },
        ]);
        return;
      }
      const data: { result?: { response?: string } } = await res.json();
      const reply = data?.result?.response ?? '응답을 받지 못했어요.';
      setMessages((m) => [
        ...m,
        {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content: reply + '\n\n_실 LLM 응답 (Cloudflare Workers AI · 세션당 3회 한도)_',
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: 'a-' + Date.now(),
          role: 'assistant',
          content: '네트워크 오류로 실 LLM 호출이 실패했어요.',
        },
      ]);
    } finally {
      setLlmLoading(false);
    }
  }, [input, faqs, llmOn, pageLabel, sessionId]);

  const handleLlmToggle = useCallback((on: boolean) => {
    setLlmOn(on);
    saveLlmToggle(on);
  }, []);

  const handleTourLink = useCallback(() => {
    dispatchTourRestart(pageKey);
  }, [pageKey]);

  if (!enabled) return null;

  return (
    <>
      {/* 우하단 플로팅 토글 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? '도움말 챗봇 닫기' : '도움말 챗봇 열기'}
        aria-expanded={open}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--op-brand, #E60012)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: 22,
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(230, 0, 18, 0.35)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          style={{
            position: 'fixed',
            bottom: 92,
            right: 24,
            width: PANEL_W,
            maxWidth: 'calc(100vw - 32px)',
            height: 'min(520px, calc(100vh - 140px))',
            background: 'var(--op-bg-card, #fff)',
            borderRadius: 'var(--op-radius, 8px)',
            boxShadow: 'var(--op-shadow-lg, 0 8px 32px rgba(0,0,0,0.16))',
            border: '1px solid var(--op-border, #E2E5EA)',
            zIndex: 1199,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--op-border, #E2E5EA)', background: 'var(--op-bg-subtle, #FAFBFC)' }}>
            <h3 id={titleId} style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--op-text-primary, #0B0D10)', letterSpacing: '-0.01em' }}>
              GIVC 도우미
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: 11.5, color: 'var(--op-text-tertiary, #9AA0A7)' }}>
              {pageLabel} 페이지 · {faqs.length}개 자주 묻는 질문
            </p>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'var(--op-brand, #E60012)' : 'var(--op-bg-subtle, #F4F5F7)',
                  color: m.role === 'user' ? '#fff' : 'var(--op-text-primary, #0B0D10)',
                  padding: '8px 11px',
                  borderRadius: 'var(--op-radius, 8px)',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}
            {llmLoading && (
              <div style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--op-text-tertiary, #9AA0A7)', fontStyle: 'italic' }}>
                실 LLM 응답 생성 중...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* suggested faq quick chips */}
          {messages.length === 1 && faqs.length > 0 && (
            <div style={{ padding: '0 14px 8px 14px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {faqs.slice(0, 3).map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInput(f.q);
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: 'var(--op-bg-subtle, #F4F5F7)',
                    border: '1px solid var(--op-border, #E2E5EA)',
                    borderRadius: 14,
                    padding: '3px 9px',
                    fontSize: 11,
                    color: 'var(--op-text-secondary, #565D66)',
                    cursor: 'pointer',
                  }}
                >
                  {f.q}
                </button>
              ))}
            </div>
          )}

          {/* input + LLM toggle */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--op-border, #E2E5EA)' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!llmLoading) submit();
              }}
              style={{ display: 'flex', gap: 6 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="궁금한 점을 입력하세요"
                disabled={llmLoading}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid var(--op-border, #E2E5EA)',
                  borderRadius: 'var(--op-radius-sm, 4px)',
                  fontSize: 13,
                  color: 'var(--op-text-primary, #0B0D10)',
                  outline: 'none',
                  background: 'var(--op-bg-card, #fff)',
                }}
              />
              <button
                type="submit"
                disabled={llmLoading || !input.trim()}
                style={{
                  background: 'var(--op-brand, #E60012)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--op-radius-sm, 4px)',
                  padding: '0 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: llmLoading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: llmLoading || !input.trim() ? 0.5 : 1,
                }}
              >
                전송
              </button>
            </form>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11, color: 'var(--op-text-tertiary, #9AA0A7)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={llmOn}
                  onChange={(e) => handleLlmToggle(e.target.checked)}
                  style={{ margin: 0 }}
                />
                실 LLM 호출 (세션당 3회)
              </label>
              <button
                type="button"
                onClick={handleTourLink}
                style={{ background: 'none', border: 'none', color: 'var(--op-text-tertiary, #9AA0A7)', cursor: 'pointer', fontSize: 11, padding: 0, textDecoration: 'underline' }}
              >
                투어 다시보기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
