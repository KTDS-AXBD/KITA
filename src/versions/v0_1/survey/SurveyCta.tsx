import { navigate } from '@/shell';

/**
 * 시연 페이지(S4 · S6) 하단에 노출하는 설문 회신 유도 CTA 카드.
 *
 * 헤더 네비에는 설문을 노출하지 않고(시연 흐름 보존, 이식 설계서 §3.4 결정), 시나리오 화면
 * 하단에서만 `#/survey`로 연결한다.
 */
export function SurveyCta(): JSX.Element {
  return (
    <a
      href="#/survey"
      className="card"
      onClick={(e) => {
        e.preventDefault();
        navigate('/survey');
      }}
      style={{
        display: 'block',
        marginTop: 24,
        textDecoration: 'none',
        color: 'inherit',
        borderColor: 'var(--brand-border, rgba(37,99,235,.35))',
        background: 'var(--brand-soft, rgba(37,99,235,.06))',
      }}
    >
      <div className="card-head">
        <h3>의견 회신 폼 열기 →</h3>
      </div>
      <div className="card-body" style={{ fontSize: 13, color: 'var(--axis-text-secondary)' }}>
        이 시연을 보신 후 5분만 시간 내어 시나리오 우선순위 · 데이터 확보 의향 · 일정 의견을 회신
        부탁드립니다.
      </div>
    </a>
  );
}
