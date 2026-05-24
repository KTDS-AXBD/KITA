// ============================================================
// Landing page — overview + scenario chooser
// ============================================================

const { Card, Badge, ProvenanceLegend } = window;
const { ArrowRight, Network, Beaker, Database, Layers, Cpu, Sparkles, FileText } = window.Icons;

// Mini preview SVGs for scenario cards
const MiniS4 = () => (
  <svg className="mini-preview" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet">
    <g stroke="rgba(255,255,255,0.4)" fill="none" strokeWidth="1">
      <line x1="160" y1="60" x2="60" y2="30" />
      <line x1="160" y1="60" x2="60" y2="90" />
      <line x1="160" y1="60" x2="260" y2="30" />
      <line x1="160" y1="60" x2="260" y2="90" />
      <line x1="160" y1="60" x2="160" y2="20" />
      <line x1="160" y1="60" x2="160" y2="100" />
    </g>
    <g>
      <circle cx="160" cy="60" r="16" fill="rgba(255,255,255,0.9)" />
      <text x="160" y="63" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1F2937">R&D</text>
      <circle cx="60" cy="30" r="11" fill="rgba(255,255,255,0.7)" />
      <circle cx="60" cy="90" r="11" fill="rgba(255,255,255,0.7)" />
      <circle cx="260" cy="30" r="11" fill="rgba(255,255,255,0.7)" />
      <circle cx="260" cy="90" r="11" fill="rgba(255,255,255,0.7)" />
      <circle cx="160" cy="20" r="8" fill="rgba(255,255,255,0.5)" />
      <circle cx="160" cy="100" r="8" fill="rgba(255,255,255,0.5)" />
    </g>
  </svg>
);
const MiniS6 = () => (
  <svg className="mini-preview" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet">
    <g stroke="var(--axis-color-gray-300)" fill="none" strokeWidth="1">
      <line x1="160" y1="60" x2="60" y2="30" />
      <line x1="160" y1="60" x2="60" y2="90" />
      <line x1="160" y1="60" x2="260" y2="30" />
      <line x1="160" y1="60" x2="260" y2="90" />
      <line x1="160" y1="60" x2="160" y2="20" />
      <line x1="160" y1="60" x2="160" y2="100" />
    </g>
    <g>
      <circle cx="160" cy="60" r="20" fill="var(--axis-color-blue-50)" stroke="var(--axis-color-blue-300)" strokeWidth="1.5"/>
      <text x="160" y="63" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--axis-text-primary)">톨루엔</text>
      <circle cx="60" cy="30" r="10" fill="var(--axis-color-green-50)" stroke="var(--axis-color-green-300)"/>
      <text x="60" y="33" textAnchor="middle" fontSize="8" fill="var(--axis-text-secondary)">JP</text>
      <circle cx="60" cy="90" r="10" fill="var(--axis-color-green-50)" stroke="var(--axis-color-green-300)"/>
      <text x="60" y="93" textAnchor="middle" fontSize="8" fill="var(--axis-text-secondary)">CN</text>
      <circle cx="260" cy="30" r="10" fill="var(--axis-color-blue-50)" stroke="var(--axis-color-blue-300)"/>
      <circle cx="260" cy="90" r="10" fill="var(--axis-color-blue-50)" stroke="var(--axis-color-blue-300)"/>
      <circle cx="160" cy="20" r="8" fill="var(--axis-color-orange-50)" stroke="var(--axis-color-orange-300)"/>
      <circle cx="160" cy="100" r="8" fill="var(--axis-color-gray-100)" stroke="var(--axis-color-gray-300)" strokeDasharray="2 2"/>
    </g>
  </svg>
);

const LandingPage = () => {
  return (
    <div className="landing-wrap">
      <section className="landing-hero">
        <span className="eyebrow">PoC Demo · v1 · 2026-05-24</span>
        <h1>GIVC 위에 온톨로지 레이어를 얹으면<br/>무엇이 가능한가.</h1>
        <p className="hero-sub">
          설문 대신 데모로 — 산업부·산자부 정책 의사결정에 필요한
          <strong style={{ color: 'var(--axis-text-primary)' }}> R&D 적합 기업 추천</strong>과
          <strong style={{ color: 'var(--axis-text-primary)' }}> 단일 품목 풀 가시화</strong>를
          현재 보유 데이터만으로 구현 가능한 수준에서 보여주고, 추가 데이터가 결합될 때의 확장 path까지 한 화면에 제시합니다.
        </p>
        <div className="hero-cta">
          <a href="#/scenario/rnd"
             onClick={(e) => { e.preventDefault(); window.navigate('/scenario/rnd'); }}
             className="btn btn-primary btn-lg">
            S4 메인 시연 시작 <ArrowRight size={16} />
          </a>
          <a href="#/about/ontology"
             onClick={(e) => { e.preventDefault(); window.navigate('/about/ontology'); }}
             className="btn btn-lg">
            온톨로지 개념 보기
          </a>
        </div>
      </section>

      <div style={{ marginBottom: 28 }}>
        <ProvenanceLegend />
      </div>

      <section>
        <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--axis-text-tertiary)', margin: '0 0 14px' }}>두 가지 시연 시나리오</h2>
        <div className="scenario-grid">

          <a href="#/scenario/rnd"
             onClick={(e) => { e.preventDefault(); window.navigate('/scenario/rnd'); }}
             className="scenario-card primary">
            <span className="sc-tag">MAIN · S4</span>
            <div className="sc-title">산기평 R&D 적합 기업 추천</div>
            <p className="sc-desc">
              산자부가 새 R&D 공고를 띄울 때, GIVC 위 온톨로지 레이어가
              <strong style={{ color: '#fff' }}> 적합 기업 Top 5 + 선정 근거 + 반대 추천</strong>을 자동 제시합니다.
              가중치를 바꾸면 결과가 실시간으로 재계산됩니다.
            </p>
            <div className="sc-meta">
              <span className="badge">Top 5 추천</span>
              <span className="badge">근거 지식그래프</span>
              <span className="badge">가중치 슬라이더</span>
              <span className="badge">반대 추천</span>
              <span className="badge">What-If LLM</span>
            </div>
            <div className="sc-mini-preview"><MiniS4 /></div>
            <span className="sc-cta">시연 시작 <ArrowRight size={14} /></span>
          </a>

          <a href="#/scenario/toluene"
             onClick={(e) => { e.preventDefault(); window.navigate('/scenario/toluene'); }}
             className="scenario-card">
            <span className="sc-tag">SUB · S6</span>
            <div className="sc-title">톨루엔 단일 품목 풀 가시화</div>
            <p className="sc-desc">
              복잡한 추천 로직 없이도 GIVC가 보유한 단일 품목 정보를 한 화면 지식그래프로 합치는 것만으로
              산업부의 "창 띄웠다 끄는" 페인이 해결됩니다.
            </p>
            <div className="sc-meta">
              <span className="badge">지식그래프</span>
              <span className="badge">무역 추이</span>
              <span className="badge">핵심·예비 기업</span>
              <span className="badge">뉴스 워드클라우드</span>
            </div>
            <div className="sc-mini-preview"><MiniS6 /></div>
            <span className="sc-cta">시연 시작 <ArrowRight size={14} /></span>
          </a>

        </div>
      </section>

      <section style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--axis-text-tertiary)', margin: '0 0 14px' }}>본 데모의 위치</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { icon: Layers, title: 'GIVC 위 온톨로지',
              body: 'mart.lnk0951a · scmm_his_chart · enp0111y 등 GIVC 12+ 테이블 위에 의미 통일·관계 추론 레이어를 얹어, 단순 검색에서 의사결정 지원으로 가속.' },
            { icon: Database, title: '실 / 추정 / 가상 데이터 혼합',
              body: '시연용 가상값은 ※ 점선 박스로 명시. GIVC 실데이터는 ⭐, 추정값은 △. 모든 노드·셀에 출처 tooltip 부착.' },
            { icon: Sparkles, title: '데이터 확장 path 시연',
              body: '"현재 → +산기평 공고 → +특허 트렌드 → +전후방"으로 단계별 분석 수준 향상을 우측 영구 패널로 노출.' }
          ].map((c, i) => (
            <div key={i} style={{ background: 'var(--axis-paper)', border: '1px solid var(--axis-border-default)', borderRadius: 'var(--axis-style-radius-card)', padding: 22, borderTop: '3px solid var(--axis-color-blue-600)' }}>
              <c.icon size={20} />
              <div style={{ fontWeight: 700, fontSize: 15, margin: '12px 0 8px', letterSpacing: '-0.01em' }}>{c.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--axis-text-secondary)', lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--axis-text-tertiary)', margin: '0 0 14px' }}>화면 구성 흐름</h2>
        <div style={{ background: 'var(--axis-paper)', border: '1px solid var(--axis-border-default)', borderRadius: 'var(--axis-style-radius-card)', overflow: 'hidden' }}>
          <table className="dtable">
            <thead>
              <tr><th style={{ width: 90 }}>구간</th><th>화면</th><th>설명</th></tr>
            </thead>
            <tbody>
              <tr><td><Badge kind="default">Intro</Badge></td><td>Landing</td><td>GIVC 위 온톨로지 레이어 개요</td></tr>
              <tr><td><Badge kind="info">Main</Badge></td><td>S4 R&D</td><td>R&D 적합 기업 추천 — 가중치 슬라이더 실시간 재계산</td></tr>
              <tr><td><Badge kind="warning">Hint</Badge></td><td>S4 우측</td><td>산기평 공고 데이터 연동 시 추천 정확도 65→88% 향상</td></tr>
              <tr><td><Badge kind="info">Sub</Badge></td><td>S6 톨루엔</td><td>단일 품목 한 화면 통합 가시화</td></tr>
              <tr><td><Badge kind="warning">Hint</Badge></td><td>S6 우측</td><td>전후방 데이터 연동 시 후방 영향 분석 활성화</td></tr>
              <tr><td><Badge kind="default">정리</Badge></td><td>About</td><td>데이터 출처·확장 방향</td></tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

Object.assign(window, { LandingPage });
