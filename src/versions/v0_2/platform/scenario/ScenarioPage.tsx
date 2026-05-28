import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { CypherBlock, Badge, SourceBadge } from '@/components/platform';
import {
  CQ2_TOP5_COMPANIES,
  CQ2_STEPS,
  CQ1_STEPS,
  CQ1_TOP5_ITEMS,
  DEPENDENCY_ITEMS,
  RND_CASES,
  MINI_IMPACT_NODES,
  MINI_IMPACT_EDGES,
} from '@/data/mock/scenarioResults';
import type { AnalysisStep } from '@/data/mock/scenarioResults';
import type { CytoGraph } from '@/types';
import { CQ_ITEMS as CQ_SSOT } from '../cq/cqData';

const GraphCanvas = lazy(() =>
  import('@/versions/v0_2/platform/graph/GraphCanvas').then(m => ({ default: m.GraphCanvas }))
);

type CqId = 'cq2' | 'cq1';
type AnalysisState = 'idle' | 'running' | 'done';

// F041 SSOT 파생: query/cypher는 cqData CQ_SSOT에서 가져온다.
// 이전엔 ScenarioPage가 자체 query/cypher 복사본을 들고 있어 cqData(F040 갱신)와
// 어긋나면 시연 중 같은 CQ인데 페이지마다 문구가 달랐다.
// PlanPage가 F040에서 폐기한 안티패턴을 ScenarioPage에서도 폐기.
function findCqOrThrow(id: string) {
  const found = CQ_SSOT.find((c) => c.id === id);
  if (!found) throw new Error(`CQ ${id} not in CQ_SSOT (F041 derivation)`);
  return found;
}
const CQ_SSOT_CQ2 = findCqOrThrow('CQ-002');
const CQ_SSOT_CQ1 = findCqOrThrow('CQ-001');

const CQ_CONFIG: Record<CqId, { label: string; query: string; cypher: string; steps: AnalysisStep[] }> = {
  cq2: {
    label: 'CQ-002: 소부장 자립화 R&D 적합 기업 추천',
    query: CQ_SSOT_CQ2.question,
    cypher: CQ_SSOT_CQ2.cypher,
    steps: CQ2_STEPS,
  },
  cq1: {
    label: 'CQ-001: 호르무즈 해협 봉쇄 시 영향 품목 분석',
    query: CQ_SSOT_CQ1.question,
    cypher: CQ_SSOT_CQ1.cypher,
    steps: CQ1_STEPS,
  },
};

const MINI_GRAPH: CytoGraph = {
  domain: 'hormuz' as never,
  nodes: MINI_IMPACT_NODES,
  edges: MINI_IMPACT_EDGES,
};

export function ScenarioPage(): JSX.Element {
  const [selectedCq, setSelectedCq] = useState<CqId>('cq2');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [showCypher, setShowCypher] = useState<boolean>(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cfg = CQ_CONFIG[selectedCq];

  function handleCqChange(cq: CqId) {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setSelectedCq(cq);
    setAnalysisState('idle');
    setCompletedSteps(0);
    setProgress(0);
    setShowCypher(false);
  }

  function runAnalysis() {
    if (analysisState === 'running') return;
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setAnalysisState('running');
    setCompletedSteps(0);
    setProgress(0);

    const steps = cfg.steps;
    const totalDuration = steps.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;

    steps.forEach((step, idx) => {
      elapsed += step.duration;
      const t = timerRefs.current[idx] = setTimeout(() => {
        setCompletedSteps(idx + 1);
        setProgress(Math.round((elapsed / totalDuration) * 100));
        if (idx === steps.length - 1) {
          setTimeout(() => setAnalysisState('done'), 300);
        }
      }, elapsed);
      void t;
    });
  }

  useEffect(() => () => { timerRefs.current.forEach(clearTimeout); }, []);

  return (
    <div className="op-page">
      <div className="op-section-header">
        <h2>시나리오 분석</h2>
        <p>Competency Question 기반 그래프 추론 및 의사결정 지원</p>
      </div>

      {/* CQ 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)', whiteSpace: 'nowrap' }}>CQ 선택</span>
        <select
          value={selectedCq}
          onChange={e => handleCqChange(e.target.value as CqId)}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 13, border: '1px solid var(--op-border)',
            borderRadius: 6, background: 'var(--op-bg-card)', color: 'var(--op-text-primary)',
            cursor: 'pointer',
          }}
        >
          <option value="cq2">{CQ_CONFIG.cq2.label}</option>
          <option value="cq1">{CQ_CONFIG.cq1.label}</option>
        </select>
      </div>

      {/* NL 질의 바 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
        <div style={{
          flex: 1, padding: '10px 14px', fontSize: 13,
          border: '1px solid var(--op-border)', borderRadius: 6,
          background: 'var(--op-bg-card)', color: 'var(--op-text-primary)',
          lineHeight: 1.5,
        }}>
          {cfg.query}
        </div>
        <button
          onClick={runAnalysis}
          disabled={analysisState === 'running'}
          style={{
            padding: '10px 18px', fontSize: 13, fontWeight: 700,
            background: analysisState === 'done' ? '#111' : 'var(--op-color-event)',
            color: '#fff', border: 'none', borderRadius: 6, cursor: analysisState === 'running' ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap', opacity: analysisState === 'running' ? 0.7 : 1,
            transition: 'opacity .2s',
          }}
        >
          {analysisState === 'running' ? '분석 중...' : analysisState === 'done' ? '분석 완료' : '분석 실행'}
        </button>
      </div>

      {/* Cypher 토글 */}
      <button
        onClick={() => setShowCypher(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: 'var(--op-text-secondary)',
          padding: '6px 0', marginBottom: 4,
        }}
      >
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2}
          style={{ transform: showCypher ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        Cypher 변환 보기
      </button>
      {showCypher && (
        <div style={{ marginBottom: 16 }}>
          <CypherBlock code={cfg.cypher} />
        </div>
      )}

      {/* 추론 단계 애니메이션 */}
      {analysisState !== 'idle' && (
        <AnalysisStepsPanel
          steps={cfg.steps}
          completedSteps={completedSteps}
          progress={progress}
          running={analysisState === 'running'}
        />
      )}

      {/* 결과 패널 */}
      {analysisState === 'done' && (
        <div style={{ marginTop: 24 }}>
          {selectedCq === 'cq2' ? <Cq002Results /> : <Cq001Results />}
        </div>
      )}
    </div>
  );
}

// ── 추론 단계 패널 ──

interface AnalysisStepsPanelProps {
  steps: AnalysisStep[];
  completedSteps: number;
  progress: number;
  running: boolean;
}

function AnalysisStepsPanel({ steps, completedSteps, progress, running }: AnalysisStepsPanelProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        height: 4, background: 'var(--op-border)', borderRadius: 2, marginBottom: 14, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: 'var(--op-color-event)',
          width: `${progress}%`, transition: 'width 0.4s ease',
          borderRadius: 2,
        }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.slice(0, Math.max(completedSteps, running ? completedSteps + 1 : 0)).map((step, idx) => {
          const isCompleted = idx < completedSteps;
          const isActive = !isCompleted && running;
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 14px', background: isCompleted ? '#FAFBFD' : 'var(--op-bg-card)',
              border: `1px solid ${isCompleted ? '#DDD' : 'var(--op-border)'}`,
              borderRadius: 6,
              opacity: isCompleted || isActive ? 1 : 0.5,
              transition: 'opacity .3s, border-color .3s',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                background: isCompleted ? '#111' : 'var(--op-color-event)',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>
                {isCompleted ? '✓' : isActive ? <SpinnerIcon /> : idx + 1}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--op-text-primary)', marginBottom: 2 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--op-text-secondary)', fontFamily: 'monospace' }}>
                  {step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .sp{animation:spin 0.8s linear infinite;transform-origin:center}`}</style>
      <circle className="sp" cx={12} cy={12} r={9} strokeDasharray="42 20" />
    </svg>
  );
}

// ── 섹션 헤더 ──

function SectionHeader({ badge, title }: { badge: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: '#111', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{badge}</div>
      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--op-text-primary)' }}>{title}</span>
    </div>
  );
}

function ResultSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--op-bg-card)', border: '1px solid var(--op-border)',
      borderRadius: 8, padding: 20, marginBottom: 16, ...style,
    }}>
      {children}
    </div>
  );
}

// ── CQ-002 결과 (소부장 기업 추천) ──

function Cq002Results() {
  return (
    <div>
      {/* 의존 구조 분석 */}
      <ResultSection>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
          의존 구조 분석 - 공작기계 핵심 부품 수입 의존도
        </div>
        {/* F044: 5컬럼 -> auto-fit minmax(140, 1fr) 반응형. 좁은 폭에서 2~3컬럼 wrap. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 0, border: '1px solid var(--op-border)', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
          {DEPENDENCY_ITEMS.map(item => (
            <div key={item.name} style={{ padding: '14px 10px', textAlign: 'center', background: item.bg, color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{item.pct}%</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{item.country} 의존</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#777', background: '#F8F9FA', padding: '10px 14px', borderRadius: 6, lineHeight: 1.7 }}>
          공작기계 핵심 부품 10개 중 <strong style={{ color: '#111' }}>7개가 일본 의존도 60% 이상</strong>. 2019년 일본 수출규제 사례를 감안할 때, 단일국 의존 구조는 구조적 취약점입니다.
        </div>
        {/* F041 출처 메타 */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--op-text-tertiary)' }}>
          <SourceBadge source={DEPENDENCY_ITEMS[0]!.source} variant="pill" />
          <span>{DEPENDENCY_ITEMS[0]!.sourceLabel}</span>
        </div>
      </ResultSection>

      {/* KPI 요약 - F044: F043의 .op-kpi-grid 클래스 재사용(auto-fit minmax 180px) */}
      <div className="op-kpi-grid" style={{ marginBottom: 16 }}>
        {[
          { label: '분석 후보군', value: '8', sub: '6 핵심 / 2 예비' },
          { label: 'TOP 5 매칭 정확도', value: '65.0%', sub: '가중치 변경 시 재계산' },
          { label: '실데이터 비중', value: '76%', sub: '실 4 / 추정 1 / 유료 1' },
          { label: '재계산 시간', value: '<50ms', sub: 'on-device' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: 'var(--op-bg-card)', border: '1px solid var(--op-border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* A. Top5 기업 테이블 */}
      <ResultSection>
        <SectionHeader badge="A" title="후보 기업 Top 5" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F4F6FB' }}>
                {['#', '회사 / 분야', '유형', 'R&D 투자율', '매출 성장', '특허', '부도율', '종합 점수'].map(h => (
                  <th key={h} style={{ padding: '10px 8px', textAlign: h === '회사 / 분야' ? 'left' : 'center', fontWeight: 600, borderBottom: '1px solid var(--op-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CQ2_TOP5_COMPANIES.map((co, i) => (
                <tr key={co.rank} style={{ background: i === 0 ? '#F5F5F7' : undefined }}>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid var(--op-border)' }}>{co.rank}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--op-border)' }}>
                    <strong>{co.name}</strong><br />
                    <span style={{ color: '#999', fontSize: 11 }}>{co.sub}</span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>
                    <Badge variant={co.type === '핵심' ? 'real' : 'pending'} label={co.type} />
                  </td>
                  {[co.rnd, co.sales, co.patent, co.risk].map((v, j) => (
                    <td key={j} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>{v}</td>
                  ))}
                  <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)', fontWeight: 700, fontSize: 14 }}>
                    {co.score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* F041 출처 메타 */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--op-text-tertiary)' }}>
          <SourceBadge source={CQ2_TOP5_COMPANIES[0]!.source} variant="pill" />
          <span>{CQ2_TOP5_COMPANIES[0]!.sourceLabel}</span>
        </div>
      </ResultSection>

      {/* B. 선정 근거 */}
      <ResultSection>
        <SectionHeader badge="B" title="선정 근거 - 1위 대한정밀감속기" />
        {/* F044: 1fr 1fr -> auto-fit minmax(280, 1fr) 반응형. 좁은 폭에서 1컬럼 wrap. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>점수 산출 근거</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#F4F6FB' }}>
                  {['항목', '원값', '가중치', '기여분'].map(h => (
                    <th key={h} style={{ padding: '8px', borderBottom: '1px solid var(--op-border)', textAlign: h === '항목' ? 'left' : 'center', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['R&D 투자율', '26.0%', '0.75', '0.195'],
                  ['매출 성장률', '19.0%', '0.65', '0.124'],
                  ['특허 보유 (정규화)', '44건', '0.65', '0.192'],
                  ['리스크 역수', '1.7%', '0.65', '0.179'],
                ].map(([label, val, weight, contrib]) => (
                  <tr key={label}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--op-border)' }}>{label}</td>
                    <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>{val}</td>
                    <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>{weight}</td>
                    <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)', fontWeight: 700 }}>{contrib}</td>
                  </tr>
                ))}
                <tr style={{ background: '#F4F6FB' }}>
                  <td colSpan={3} style={{ padding: '8px', fontWeight: 700 }}>종합 점수</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700, fontSize: 14 }}>0.69</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>기업 프로필</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8, background: '#F8F9FA', borderRadius: 8, padding: 14 }}>
              {[
                ['설립', '2008년'],
                ['매출', '482억원 (2025)'],
                ['종업원', '187명'],
                ['주요 제품', '하모닉 드라이브, 정밀 감속기'],
                ['인증', 'ISO 9001, 소부장 전문기업'],
                ['KSIC', 'C29221 (동력전달장치)'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--op-border)' }}>
                  <span style={{ color: '#999' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ResultSection>

      {/* C. 유사 과거 R&D 사례 */}
      <ResultSection>
        <SectionHeader badge="C" title="유사 과거 R&D 사례" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RND_CASES.map(c => {
            const bg = c.matchRate >= 85 ? '#111' : c.matchRate >= 75 ? '#444' : '#777';
            return (
              <div key={c.year} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--op-bg-card)', border: '1px solid var(--op-border)', borderRadius: 8 }}>
                <div>
                  <span style={{ color: '#999', fontSize: 11, marginRight: 8 }}>{c.year}</span>
                  <strong style={{ fontSize: 13 }}>{c.title}</strong><br />
                  <span style={{ fontSize: 11, color: '#777' }}>{c.org}</span>
                </div>
                <div style={{ background: bg, color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 12 }}>
                  {c.matchRate}%
                </div>
              </div>
            );
          })}
        </div>
        {/* F041 출처 메타 */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--op-text-tertiary)' }}>
          <SourceBadge source={RND_CASES[0]!.source} variant="pill" />
          <span>{RND_CASES[0]!.sourceLabel}</span>
        </div>
      </ResultSection>

      {/* D. 반대 추천 */}
      <ResultSection>
        <SectionHeader badge="D" title="반대 추천 (제외 사유)" />
        {/* F044: 3컬럼 -> auto-fit minmax(200, 1fr) 반응형. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { reason: '자격', name: 'OO중공업(대기업)', desc: '신청 자격 미달 - 중소·중견기업 대상 공고' },
            { reason: '리스크', name: '대성공업기기', desc: '최근 12개월 부도율 4.6%로 청구 대비 2.1배, R&D 투자 정체' },
            { reason: '데이터 부족', name: 'OO정밀(미상장)', desc: '재무공시 자료 부족 - 평가 불가' },
          ].map(item => (
            <div key={item.name} style={{ padding: 14, background: '#F8F9FA', borderRadius: 8, borderLeft: '3px solid #CCC' }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{item.reason}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </ResultSection>

      {/* 설명가능성 */}
      <ResultSection>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>분석 근거 - 설명가능성</div>
        {/* F044: 1fr 1fr -> auto-fit minmax(280, 1fr) 반응형. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>1위 선정 경로 - 대한정밀감속기</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
              {[
                'R&D 공고(C2922) → 품목 매칭: 정밀감속기 (HS 8483)',
                '정밀감속기 → 생산기업: 대한정밀감속기 (GIVC enp0111y)',
                'R&D 투자율 26% × 가중치 0.75 = 0.195',
                '매출 성장 19% × 가중치 0.65 = 0.124',
                '특허 44건(정규화) × 가중치 0.65 = 0.192',
                '부도율 1.7%(역수) × 가중치 0.65 = 0.179',
              ].map((line, i) => (
                <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid var(--op-border)' }}>{line}</div>
              ))}
              <div style={{ marginTop: 8, padding: '8px', background: '#E8ECF1', borderRadius: 4, fontWeight: 700, textAlign: 'center' }}>
                종합 = 0.69
              </div>
            </div>
          </div>
          <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>데이터 출처 및 신뢰도</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <tbody>
                {[
                  ['기업 매출/고용', 'GIVC enp0111y', 'real'],
                  ['R&D 투자율', 'GIVC scmm_his_chart', 'real'],
                  ['매출 성장률', 'GIVC salesGrowth', 'real'],
                  ['특허 보유수', 'KIPRIS API', 'est'],
                  ['부도율', 'GIVC itm_flt_implpd', 'real'],
                  ['수입 의존도', 'UNIPASS', 'real'],
                ].map(([label, src, type]) => (
                  <tr key={label}>
                    <td style={{ padding: '6px 0', borderBottom: '1px solid var(--op-border)' }}>{label}</td>
                    <td style={{ padding: '6px 0', borderBottom: '1px solid var(--op-border)', color: '#777' }}>{src}</td>
                    <td style={{ padding: '6px 0', borderBottom: '1px solid var(--op-border)' }}>
                      <Badge variant={type === 'real' ? 'real' : 'estimate'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 10, fontSize: 11, color: '#999', lineHeight: 1.6 }}>
              재현성: 동일 가중치 + 동일 데이터 → 동일 순위 보장<br />
              분석 ID: RND-2026-001 | 데이터 기준: 2026-05-27
            </div>
          </div>
        </div>
      </ResultSection>

      {/* E. 의사결정 지원 리포트 */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #111' }}>
          의사결정 지원 리포트 - 소부장 자립화 R&D 적합 기업 분석
        </h3>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>분석 기준일: 2026-05-27 | 분석 ID: RND-2026-001</div>
        <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 20, marginBottom: 24, borderLeft: '3px solid #111' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Executive Summary</div>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.8 }}>
            공작기계(C2922) 분야 소부장 자립화 R&D 공고에 대해, GIVC 기업 DB·R&D 시계열·특허·무역 데이터를 온톨로지로 연결하여
            <strong> 8개 후보 기업 중 Top 5</strong>를 선정하였습니다.
            <strong> 대한정밀감속기(0.69점)</strong>가 R&D 투자율(26%), 매출 성장(19%), 특허(44건), 낮은 부도율(1.7%)에서 종합 1위로 평가되었습니다.
            가중치를 변경하면 순위가 실시간으로 재계산되며, 유사 과거 R&D 사례 3건(매칭도 72~87%)이 참고 자료로 제시됩니다.
          </div>
        </div>

        {/* 선정 프레임워크 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>선정 프레임워크</div>
          {/* F044: 4컬럼 -> auto-fit minmax(150, 1fr). 외곽 border+overflow:hidden 유지(wrap 시 2x2 자연). */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 0, border: '1px solid var(--op-border)', borderRadius: 8, overflow: 'hidden' }}>
            {[
              { step: 'STEP 1', title: '후보 필터링', desc: 'KSIC 분류 기반\n8개 기업 추출', bg: '#111' },
              { step: 'STEP 2', title: '지표 산출', desc: 'R&D·매출·특허·리스크\n4축 정량 평가', bg: '#444' },
              { step: 'STEP 3', title: '가중 합산', desc: '정책 우선순위 반영\n가중치 조정 가능', bg: '#777' },
              { step: 'STEP 4', title: '근거 + 반대', desc: '선정 근거 제시\n제외 사유 명시', bg: '#AAA' },
            ].map(item => (
              <div key={item.step} style={{ padding: 14, textAlign: 'center', background: item.bg, color: '#fff' }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{item.step}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{item.title}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, whiteSpace: 'pre-line' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 핵심 인사이트 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>핵심 인사이트</div>
          {/* F044: 1fr 1fr -> auto-fit minmax(280, 1fr) 반응형. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { title: '1. 경남 창원 클러스터 집중', body: 'Top 5 중 3개 기업이 경남 창원 소재. 공작기계 산업의 지역 클러스터 효과가 R&D 역량과 상관관계가 높습니다.' },
              { title: '2. 하모닉 드라이브 자립화 기회', body: '1위 대한정밀감속기는 일본 하모닉드라이브 대체를 추진 중. 현재 국산화율 15% 수준이나 2023년 R&D 사례(87%)의 성과를 레버리지하면 가속 가능.' },
              { title: '3. 가중치 민감도', body: 'R&D 투자율 가중치를 0.75→0.50으로 낮추면 한일서보모션이 1위로 역전됩니다. 정책 우선순위에 따라 결과가 달라지므로 가중치 설정이 핵심 의사결정 포인트.' },
              { title: '4. 데이터 확장 효과', body: '산기평 공고 실데이터 연동 시 매칭 정확도 65%→88%로 향상 예상. 특허 출원 트렌드 추가 시 +15%p.' },
            ].map(item => (
              <div key={item.title} style={{ padding: 16, background: '#F8F9FA', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 20, background: '#111', color: '#fff', borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>종합 판단</div>
          <div style={{ fontSize: 12, lineHeight: 1.8, color: '#ccc' }}>
            소부장 자립화 R&D 기업 추천은 온톨로지의 <strong style={{ color: '#fff' }}>"관계 기반 다차원 평가"</strong> 역량을 보여주는 시나리오입니다.
            단순 재무 데이터 필터링이 아니라, 기업의 R&D·매출 성장·특허·재무 리스크를 <strong style={{ color: '#fff' }}>GIVC 품목 체계와 연결</strong>하여 선정합니다.
            가중치 조정에 따른 실시간 재계산, 유사 사례 매칭, 반대 추천까지 제시함으로써 <strong style={{ color: '#fff' }}>정책 담당자의 판단을 보조</strong>하되 대체하지 않는 구조입니다.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CQ-001 결과 (호르무즈 영향 품목) ──

function Cq001Results() {
  return (
    <div>
      {/* A. 영향 경로 시각화 (mini cytoscape) */}
      <ResultSection>
        <SectionHeader badge="A" title="영향 경로 시각화" />
        <div style={{ height: 320, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--op-border)' }}>
          <Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>그래프 로딩 중...</div>}>
            <GraphCanvas
              graph={MINI_GRAPH}
              nodeFilter="all"
              focusActive={false}
              onNodeSelect={() => undefined}
            />
          </Suspense>
        </div>
      </ResultSection>

      {/* B. 영향 품목 Top5 */}
      <ResultSection>
        <SectionHeader badge="B" title="영향 품목 Top 5" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#F4F6FB' }}>
                {['순위', '품목', 'HS코드', '산업', '영향도 점수', '전파시간', '인과 경로', '핵심 근거'].map(h => (
                  <th key={h} style={{ padding: '10px 8px', textAlign: h === '품목' || h === '인과 경로' || h === '핵심 근거' ? 'left' : 'center', fontWeight: 600, borderBottom: '1px solid var(--op-border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CQ1_TOP5_ITEMS.map((item, i) => (
                <tr key={item.rank}>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, borderBottom: '1px solid var(--op-border)', color: i < 2 ? '#111' : undefined }}>{item.rank}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 600, borderBottom: '1px solid var(--op-border)' }}>{item.name}</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 11, textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>{item.hs}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>{item.industry}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)', fontWeight: 700, color: item.scoreColor }}>{item.score}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)', whiteSpace: 'nowrap' }}>{item.duration}</td>
                  <td style={{ padding: '10px 8px', fontSize: 11, color: 'var(--op-text-secondary)', borderBottom: '1px solid var(--op-border)' }}>{item.path}</td>
                  <td style={{ padding: '10px 8px', fontSize: 11, color: 'var(--op-text-secondary)', borderBottom: '1px solid var(--op-border)' }}>{item.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* F041 출처 메타 */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--op-text-tertiary)' }}>
          <SourceBadge source={CQ1_TOP5_ITEMS[0]!.source} variant="pill" />
          <span>{CQ1_TOP5_ITEMS[0]!.sourceLabel}</span>
        </div>
      </ResultSection>

      {/* C. 설명가능성 */}
      <ResultSection>
        <SectionHeader badge="C" title="분석 근거 - 설명가능성 (Explainability)" />
        <div style={{ borderRadius: 8, border: '1px solid var(--op-border)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid var(--op-border)' }}>
            PE (폴리에틸렌) - 영향도 1위 상세 분석 근거
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#555' }}>C1. 인과 경로 상세</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: '#F4F6FB' }}>
                  {['단계', '관계', '가중치', '데이터 출처', '신뢰도'].map(h => (
                    <th key={h} style={{ padding: '8px', borderBottom: '1px solid var(--op-border)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['원유 → 나프타', 'REFINES_TO', '72.3%', '산업연관표 2023 (한국은행)', 'real'],
                  ['나프타 → 에틸렌', 'INPUT_TO', '45.2%', '산업연관표 2023', 'real'],
                  ['에틸렌 → PE', 'INPUT_TO', '35.2%', '산업연관표 2023', 'real'],
                ].map(([step, rel, weight, src, type]) => (
                  <tr key={step}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--op-border)' }}>{step}</td>
                    <td style={{ padding: '8px', fontWeight: 600, borderBottom: '1px solid var(--op-border)' }}>{rel}</td>
                    <td style={{ padding: '8px', fontWeight: 700, textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>{weight}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--op-border)' }}>{src}</td>
                    <td style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--op-border)' }}>
                      <Badge variant={type === 'real' ? 'real' : 'estimate'} />
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#F0F0F0' }}>
                  <td colSpan={2} style={{ padding: '8px', fontWeight: 700 }}>누적 투입계수</td>
                  <td style={{ padding: '8px', fontWeight: 700, textAlign: 'center', color: '#111' }}>11.4%</td>
                  <td style={{ padding: '8px' }}>계산값 (72.3% × 45.2% × 35.2%)</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}><Badge variant="real" /></td>
                </tr>
              </tbody>
            </table>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#555' }}>C2. 취약성 지표</div>
            {/* F044: 4컬럼 -> auto-fit minmax(140, 1fr) 반응형. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
              {[
                { label: '중동 의존도', value: '63.7%', risk: '위험', color: '#E74C3C', src: 'Petronet' },
                { label: '대체 수입선', value: '미국, 동남아', risk: '존재', color: '#27AE60', src: 'UNIPASS' },
                { label: '국내 생산 기업', value: '3사', risk: '롯데/LG/한화', color: '#666', src: 'GIVC' },
                { label: '비축 현황', value: '14일분', risk: '부족', color: '#E74C3C', src: '한국석유공사' },
              ].map(item => (
                <div key={item.label} style={{ background: '#F8F9FA', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: item.color }}>{item.risk}</div>
                  <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>출처: {item.src}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#555' }}>C3. 관련 EWS 경보</div>
            <div style={{ background: '#F8F9FA', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
              {[
                { level: '경계', label: '원유 가격경보', date: '2026-05-15 발령', color: '#E60012' },
                { level: '주의', label: '나프타 수급경보', date: '2026-05-18 발령', color: '#FF9F0A' },
                { level: '관심', label: 'PE 가격경보', date: '2026-05-20 발령', color: '#4A90D9' },
              ].map(ews => (
                <div key={ews.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--op-border)' }}>
                  <span style={{ background: ews.color, color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{ews.level}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{ews.label}</span>
                  <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto' }}>{ews.date}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#555' }}>C4. 재현성 보장</div>
            <div style={{ background: '#F0F4FA', borderRadius: 6, padding: '12px 14px', fontSize: 12, lineHeight: 1.8 }}>
              동일 데이터 기준으로 동일 질의를 실행하면 동일한 경로와 결과가 보장됩니다.<br />
              분석 ID: <code>HMZ-2026-001</code> · 데이터 기준일: <code>2026-05-26</code> · 그래프 버전: <code>v1.1 (161 nodes, 331 edges)</code>
            </div>
          </div>
        </div>
      </ResultSection>

      {/* D. 대응 옵션 */}
      <ResultSection>
        <SectionHeader badge="D" title="대응 옵션 비교 - PE (폴리에틸렌)" />
        {/* F044: 3컬럼 -> auto-fit minmax(220, 1fr) 반응형. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            {
              title: '수입 다변화', recommended: true,
              feasibility: 4, period: '3~6개월',
              effect: '중동 의존도 63.7% → 35.2%',
              desc: '미국 셰일가스 기반 PE 수출 증가 (UNIPASS), 동남아 NCC 신규 가동 (산업동향 보고서)',
              risk: '리스크: 물류비 증가 약 12%, 품질 차이 검증 필요',
            },
            {
              title: '비축 확대', recommended: false,
              feasibility: 3, period: '즉시 실행',
              effect: '비축일수 14일 → 45일',
              desc: '현재 비축 14일분 (한국석유공사), 확대 시 약 3개월 대응 가능',
              risk: '리스크: 비축 시설 확장 비용, 재고 관리 부담',
            },
            {
              title: '국산화 추진', recommended: false,
              feasibility: 2, period: '3~5년 (장기)',
              effect: '장기 자립도 향상',
              desc: '관련 특허 3건 (KIPRIS), 정부 R&D 2건 (NTIS), 바이오 나프타 기술 초기',
              risk: '리스크: 기술 성숙도 TRL 3~4, 상용화까지 대규모 투자 필요',
            },
          ].map(opt => (
            <div key={opt.title} style={{
              padding: 16, background: 'var(--op-bg-card)',
              border: `1px solid ${opt.recommended ? '#111' : 'var(--op-border)'}`,
              borderRadius: 8,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                {opt.title}
                {opt.recommended && <Badge variant="verified" label="추천" />}
              </div>
              <div style={{ fontSize: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#999' }}>실행가능성</span>
                  <span>{'●'.repeat(opt.feasibility)}{'○'.repeat(5 - opt.feasibility)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#999' }}>기간</span>
                  <span>{opt.period}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#999' }}>효과</span>
                  <span style={{ fontWeight: 600, color: '#111' }}>{opt.effect}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8, lineHeight: 1.6 }}>{opt.desc}</div>
              <div style={{ fontSize: 11, color: '#999' }}>{opt.risk}</div>
            </div>
          ))}
        </div>
      </ResultSection>

      {/* E. 의사결정 지원 리포트 */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #111' }}>
          의사결정 지원 리포트 - 호르무즈 해협 공급망 영향 분석
        </h3>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>분석 기준일: 2026-05-27 | 데이터 버전: v1.0 | 분석 ID: HMZ-2026-001</div>
        <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 20, marginBottom: 24, borderLeft: '3px solid #111' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Executive Summary</div>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.8 }}>
            호르무즈 해협 긴장 고조 시, 한국 원유 수입의 63.7%가 직접 영향권에 놓이며,
            석유화학 밸류체인 전반에 걸쳐 <strong>28개 품목, 5개 산업, 25개 기업</strong>이 영향을 받는 것으로 분석되었습니다.
            가장 심각한 영향은 PE·PP 생산에 집중되며, 자동차(합성고무·PP)와 섬유(EG) 산업으로 1~3주 내 전파됩니다.
          </div>
        </div>
        <div style={{ padding: 20, background: '#111', color: '#fff', borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>정책 권고사항</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 12px', fontSize: 12, lineHeight: 1.7 }}>
            {[
              ['단기 (즉시)', 'EWS 경보 임계치 하향 조정, 석유화학 주요 품목 일간 모니터링 전환, 나프타 재고 현황 일일 보고체계 구축'],
              ['중기 (1~6개월)', '미국·동남아 나프타 수입 계약 체결, 전략 비축유 방출 검토 (현재 14일분 → 45일분 목표)'],
              ['장기 (6개월+)', '에탄 크래커 투자 확대 지원, 바이오 나프타 R&D 가속화, 공급망 구조 다변화 FTA 활용 방안 수립'],
            ].map(([term, action]) => (
              <>
                <div key={term} style={{ fontWeight: 700, color: '#ccc', whiteSpace: 'nowrap' }}>{term}</div>
                <div key={action}>{action}</div>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
