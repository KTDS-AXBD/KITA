import { navigate } from '@/shell';

interface VersionOption {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  accent: string;
  route: string;
  cta: string;
}

const VERSIONS: VersionOption[] = [
  {
    id: 'v01',
    badge: 'v0.1',
    title: '기존 PoC 데모',
    subtitle: 'GIVC × Ontology PoC',
    desc: '가중치 슬라이더 실시간 재계산 중심의 초기 시연 버전.',
    features: [
      'S4 · 소부장 자립화 R&D 적합 기업 추천 (가중치 슬라이더)',
      'S6 · 공작기계 핵심 품목 가치사슬 가시화',
      '온톨로지 개념 · 데이터 출처',
      '의견 회신 설문',
    ],
    accent: '#3B82F6',
    route: '/v1',
    cta: '기존 데모 열기',
  },
  {
    id: 'v02',
    badge: 'v0.2',
    title: 'GIVC Ontology Platform',
    subtitle: '온톨로지 엔지니어링 방법론 쇼케이스',
    desc: '데이터 → CQ → 온톨로지 → 그래프 → 시나리오 → 비교 → 계획, 7페이지 대시보드.',
    features: [
      '데이터 현황 · CQ 관리 · 온톨로지 정의',
      '지식그래프 (cytoscape) · 도메인 토글',
      '시나리오 분석 (5단계 그래프 추론)',
      '비교 검증 · 추진 계획',
    ],
    accent: '#E60012',
    route: '/platform/data',
    cta: '플랫폼 진입',
  },
];

// 독립 스플래시 화면 — 테마 토큰에 의존하지 않고 명시 색상으로 대비 보장
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
          GIVC × 온톨로지 PoC는 두 가지 배포 버전으로 제공됩니다. 보고 싶은 버전을 선택하면 해당 화면으로 이동합니다.
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
        {VERSIONS.map((v) => (
          <button
            key={v.id}
            onClick={() => navigate(v.route)}
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderTop: `3px solid ${v.accent}`,
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
              e.currentTarget.style.boxShadow = `0 12px 32px -12px ${v.accent}66`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#fff',
                  background: v.accent,
                  borderRadius: 6,
                  padding: '3px 10px',
                }}
              >
                {v.badge}
              </span>
              <span style={{ fontSize: 12, color: C.tertiary }}>{v.subtitle}</span>
            </div>

            <div>
              <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 6, color: C.title }}>{v.title}</div>
              <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.5 }}>{v.desc}</div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {v.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: C.secondary }}>
                  <span style={{ color: v.accent, fontWeight: 700, lineHeight: 1.4 }}>·</span>
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
                color: v.accent,
              }}
            >
              {v.cta}
              <span aria-hidden>→</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 40, fontSize: 11.5, color: C.tertiary }}>
        데이터 100% Mock · ⭐ 실 / △ 추정 / ※ 가상 출처 표기
      </div>
    </div>
  );
}
