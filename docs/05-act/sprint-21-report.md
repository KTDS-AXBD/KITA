---
id: KOAMI-RPRT-021
type: report
sprint: 21
features: [F038]
created: 2026-05-27
match_rate: 100
test_count: 79
status: done
---

## Sprint 21 — F038 S21분 (GraphRepositoryReal D1 연결) 완료 리포트

### 요약

| 항목 | 내용 |
|------|------|
| Sprint | 21 |
| Feature | F038 S21분 — GraphRepositoryReal real D1 통합 |
| Match Rate | **100%** |
| Tests | 76 → **79 PASS** (+3 GraphRepositoryReal 신규) |
| 번들 | 메인 327KB / cytoscape chunk 445KB (변화 없음) |
| Typecheck | 0 error |
| Build | PASS |

### 구현 내용

#### 1. Worker 엔드포인트 추가 (`src/worker/index.ts`)

`GET /api/givc/cyto-graph` 신규 엔드포인트:
- D1 `graph_nodes` 전체 조회 → `NodeType → CytoNodeType` 매핑
- D1 `graph_edges` 단방향 dedup (`src < dst`)
- `{ domain: 'sobujiang', nodes[], edges[] }` CytoGraph JSON 반환

NodeType 매핑표:
| D1 type | CytoNodeType |
|---------|-------------|
| rnd | RnDProject |
| hscode | Product |
| metric | Product |
| country | Country |
| company | Company |

#### 2. `GraphRepositoryReal` 구현 (`src/data/repository/GraphRepository.ts`)

```
sobujiang → fetch('/api/givc/cyto-graph') → CytoGraph
hormuz    → super.getGraph() [Mock 픽스처 fallback]
fetch 실패 → super.getGraph() [Mock fallback]
```

#### 3. 테스트 3건 추가

- sobujiang fetch 성공 → API 응답 반환 검증
- hormuz Mock fallback 검증 (40노드+)
- sobujiang fetch 실패 → Mock fallback 검증 (30노드+)

### 다음 단계

- **S22 (F039)**: 전체 빌드 → koami.minu.best 배포 (Master 수동 실행)
  - `pnpm deploy:cf` + versions list 확인 + `wrangler versions deploy <id> @100%`
  - VITE_DATA_SOURCE=real 빌드로 D1 실데이터 확인은 Master 인증브라우저 필요

### 알려진 제약

- hormuz 도메인 D1 데이터 없음 → Mock fallback (설계 의도)
- 라이브 smoke (`/api/givc/cyto-graph` curl) — CF Access 인증 필요, Master 수동 확인
- `VITE_DATA_SOURCE=real` 빌드 시 `GraphRepositoryReal` 인스턴스화 → cytoscape가 positions 없이 cose 자동 레이아웃 처리
