import { Card } from '@/components/primitives';

export function AboutOntologyPage(): JSX.Element {
  return (
    <div className="article-wrap">
      <div className="article-eyebrow">About · Ontology</div>
      <h1>GIVC 위에 온톨로지를 얹는다는 것</h1>
      <p className="article-lead">
        GIVC는 산업부·산자부가 산업 현황을 분석하기 위해 만든 데이터 마트입니다.
        <strong style={{ color: 'var(--axis-text-primary)' }}> 온톨로지 레이어</strong>는 GIVC
        테이블 위에 "의미 통일(Schema 정합화)"과 "관계 추론(Relation inference)"을 더해, 단순
        조회를 의사결정 지원으로 끌어올립니다.
      </p>

      <h2>1 · 왜 필요한가</h2>
      <p>
        GIVC를 직접 쓰는 분석가는 한 화면에서 다음 작업을 모두 수행해야 합니다 — 분류체계 매핑,
        HS코드·기업코드 조인, 재무·R&D·특허 데이터 동기화, 그리고 인사이트 종합. 매번 SQL을 새로
        쓰고, 매번 의미가 달라집니다.
      </p>
      <p>
        온톨로지 레이어는 이 작업의 <strong>의미 단위</strong>를 미리 통일해 둡니다 — "톨루엔"이
        한 곳에서는 HS 290230, 다른 곳에서는 BTX의 하위 품목으로 등장하더라도{' '}
        <strong>같은 엔티티</strong>로 다룹니다.
      </p>

      <h2>2 · 본 PoC 데모가 보여주는 것</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, margin: '18px 0' }}>
        <Card title="S4 · R&D 적합 기업 추천">
          <div style={{ fontSize: 13, color: 'var(--axis-text-secondary)', lineHeight: 1.6 }}>
            산기평 R&D 공고가 떴을 때, <strong>"적합 기업 Top 5 + 근거 + 반대 추천"</strong>을 한
            화면에 자동 생성. 가중치 슬라이더 조작 시 결과·근거·반대 추천이 모두 실시간 재계산.
          </div>
        </Card>
        <Card title="S6 · 톨루엔 단일 품목">
          <div style={{ fontSize: 13, color: 'var(--axis-text-secondary)', lineHeight: 1.6 }}>
            톨루엔 하나만 보더라도 — HS코드·수입국·핵심기업·전후방을 한 화면 지식그래프로 통합.
            창을 띄웠다 끄는 페인을 단일 화면 통합만으로 해결.
          </div>
        </Card>
      </div>

      <h2>3 · 데이터 진화 단계</h2>
      <table className="article-table">
        <thead>
          <tr>
            <th style={{ width: 110 }}>Sprint</th>
            <th>데이터 상태</th>
            <th style={{ width: 200 }}>시연 가능성</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sprint 0~1</td>
            <td>100% Mock (JSON fixtures)</td>
            <td>내부 시연만</td>
          </tr>
          <tr>
            <td>Sprint 2</td>
            <td>GIVC 퓨샷 SQL을 변환한 정적 데이터 일부 + Mock</td>
            <td>내부·시니어 시연</td>
          </tr>
          <tr>
            <td>Sprint 3</td>
            <td>GIVC 일부 테이블 → 정적 export → 사이트 임베드</td>
            <td>
              <strong>Prototype 리뷰 시연</strong>
            </td>
          </tr>
          <tr>
            <td>본 사업화 v1</td>
            <td>GIVC API 또는 ETL pipeline 연동</td>
            <td>운영</td>
          </tr>
        </tbody>
      </table>

      <h2>4 · 본 데모의 한계와 확장 path</h2>
      <p>
        본 데모는 <strong>현재 GIVC 보유 데이터로 가능한 분석</strong>과{' '}
        <strong>추가 데이터 확보 시 가능해지는 분석</strong>을 나란히 보여줍니다 — 우측 영구 패널의
        "Data Expansion Hints"가 그 장치입니다.
      </p>
      <ul>
        <li>
          <strong>+ 산기평 공고 실데이터</strong> — 매칭 정확도 65% → 88%
        </li>
        <li>
          <strong>+ 특허청 API (특허 출원 트렌드)</strong> — 신뢰도 가중치 ±15%p
        </li>
        <li>
          <strong>+ 전후방 매핑 데이터</strong> — 후방 영향 분석 자동화
        </li>
        <li>
          <strong>+ 인력 이동·재직 데이터</strong> — 기업 R&D 지속성 신호
        </li>
        <li>
          <strong>+ 실시간 뉴스 (품목 단위)</strong> — 위험 알림 한 단계 깊이
        </li>
      </ul>

      <div
        style={{
          marginTop: 36,
          padding: 20,
          background: 'var(--axis-color-gray-50)',
          borderRadius: 12,
          border: '1px solid var(--axis-border-default)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--axis-text-tertiary)',
            marginBottom: 6,
          }}
        >
          다음 단계
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          본 데모 → 본 사업화 시 무엇이 바뀌는가
        </div>
        <div style={{ fontSize: 13, color: 'var(--axis-text-secondary)', lineHeight: 1.6 }}>
          Mock fixture → 실시간 GIVC API 연동. LLM 가짜 응답 → 사내 LLM(또는 OpenAI) + RAG over
          GIVC. 시연용 가상 노드 → 실 데이터 노드. 데이터 표기 규칙(⭐△※)은 유지.
        </div>
      </div>
    </div>
  );
}
