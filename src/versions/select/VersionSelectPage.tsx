import { navigate } from '@/shell';
import { VERSIONS, getLatestVersion } from '../registry';

// 독립 스플래시 화면 — 버전 테마에 의존하지 않는 명시 색상 (data-version 무관)
const C = {
  bg: '#0b0d12',
  surface: '#14161c',
  border: '#262a33',
  title: '#ffffff',
  text: '#e8eaed',
  secondary: '#aeb4bd',
  tertiary: '#767b85',
};

export function VersionSelectPage(): JSX.Element {
  const latestId = getLatestVersion().meta.id;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: C.bg,
        color: C.text,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#ff5a67',
            border: '1px solid rgba(230,0,18,0.45)',
            borderRadius: 999,
            padding: '4px 12px',
            marginBottom: 18,
          }}
        >
          KOAMI · KT DS AX컨설팅팀
        </span>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.25, color: C.title }}>
          버전을 선택하세요
        </h1>
        <p style={{ fontSize: 14, color: C.secondary, margin: 0, maxWidth: 560 }}>
          GIVC × 온톨로지 PoC는 버전별로 다른 디자인 시스템으로 제공됩니다. 보고 싶은 버전을 선택하면 해당 화면으로 이동합니다.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          width: '100%',
          maxWidth: 880,
          marginTop: 36,
        }}
      >
        {VERSIONS.map((v) => {
          const m = v.meta;
          const isLatest = m.id === latestId;
          return (
            <button
              key={m.id}
              onClick={() => navigate(m.home)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderTop: `3px solid ${m.accent}`,
                borderRadius: 14,
                padding: '26px 26px 24px',
                color: C.text,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 12px 32px -12px ${m.accent}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#fff',
                    background: m.accent,
                    borderRadius: 6,
                    padding: '3px 10px',
                  }}
                >
                  {m.badge}
                </span>
                {isLatest && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: '#0b0d12',
                      background: '#e8eaed',
                      borderRadius: 999,
                      padding: '2px 8px',
                    }}
                  >
                    최신
                  </span>
                )}
                <span style={{ fontSize: 12, color: C.tertiary }}>{m.subtitle}</span>
              </div>

              <div>
                <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 6, color: C.title }}>{m.title}</div>
                <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.5 }}>{m.desc}</div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {m.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: C.secondary }}>
                    <span style={{ color: m.accent, fontWeight: 700, lineHeight: 1.4 }}>·</span>
                    <span style={{ lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: m.accent,
                }}
              >
                {m.cta ?? '열기'}
                <span aria-hidden>→</span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 40, fontSize: 11.5, color: C.tertiary }}>
        데이터 100% Mock · ⭐ 실 / △ 추정 / ※ 가상 출처 표기
      </div>
    </div>
  );
}
