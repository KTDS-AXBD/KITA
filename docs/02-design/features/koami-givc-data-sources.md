# koami-givc 데이터 수집 명세서 (Data Sources Manifest)

> koami-givc 실데이터 파이프라인의 **수집 대상 데이터 통합 목록**. Phase 1 = 비PII 공개데이터 S6 톨루엔 수직 슬라이스.
> 관련: [F013 Plan](../../01-plan/features/f013-m0-poc-gate.plan.md) · [F013 Design](f013-m0-poc-gate.design.md) · [게이트 리포트](../../05-act/f013-m0-gate-report.md)
> 출처표기: ⭐ real(GIVC/외부 실데이터) · △ est(추정) · ※ virt(가상). 화면 타입(`src/types/`)에 NOT NULL 강제.

---

## 1. 화면 컴포넌트 ↔ 데이터 ↔ 소스 매핑 (S6 톨루엔)

| # | 컴포넌트 (`src/features/toluene/`) | 도메인 타입 (필드) | 소스 | 신청/키 | provenance |
|---|------|------|------|:---:|:---:|
| 1 | `TradeChart` 수출입 추이 | `TradeSeries`(quarters·exports·imports) | 관세청 **15101609**(품목별 총량) | ✅ 승인 | ⭐ real |
| 2 | `S6Page` 그래프 국가노드·비중 | `GraphNode`(country) + 국가별 수출입 | 관세청 **15100475**(국가별) | ✅ 승인 | ⭐ real |
| 3 | `S6Page` 기업표·그래프 기업노드 | `TolueneCompany`(name·biz·sales·role) | **DART**(corpCode·company·fnlttSinglAcnt) | ✅ 키유효 | ⭐ real |
| 3b | 기업 점유율 | `TolueneCompany.share` | 직접 데이터 없음(매출 기반 산출) | — | △ est |
| 4 | `WordCloud` 뉴스 키워드 | `WordCloudCollection`(NewsWord w·s·t) | 뉴스빅데이터 메타데이터 / BIGKinds | ⏸ P1 | ⭐ real(메타)/△ est |
| 5 | `S6Page` 제품 기준정보 | `TolueneProduct`(name·hsCode·cas·category) | 공개 화학 표준(HS·CAS) | reference | ⭐ real |
| 6 | `AnomalyPanel` 무역 이상치 | `TradeAnomaly`(label) | #1/#2 시계열에서 산출(QoQ 급변) | — | △ est |
| 7 | `DataExpansionHints` | `TolueneHintCard` | 시연 시나리오(정적) | — | ※ virt |

---

## 2. 소스별 수집 명세

### 2.1 관세청 — 품목별 수출입실적 (총량) · data.go.kr 15101609 ✅
- **용도**: TradeChart 총 수출입(전 국가 합산, 분기). 국가합산보다 공식·정확.
- **endpoint**: `GET https://apis.data.go.kr/1220000/Itemtrade/getItemtradeList`
- **params**: `serviceKey`(필수, Encoding 키 raw) · `strtYymm`·`endYymm`(필수, 1년이내) · `hsSgn=290230`
- **응답(XML)**: `year`("YYYY.MM" 월단위) · `expDlr`(수출$) · `impDlr`(수입$) · `hsCd` · `expWgt`·`impWgt`
- **정규화**: 월 → 분기 집계(`scripts/ingest/poc-toluene.mjs`). 라이선스 **제한 없음(상업가능)**.

### 2.2 관세청 — 품목별 국가별 수출입실적 · data.go.kr 15100475 ✅
- **용도**: 그래프 국가노드(JP/CN/US…)·국가별 비중·교역 추이.
- **endpoint**: `GET https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList`
- **params**: `serviceKey` · `strtYymm`·`endYymm` · `hsSgn=290230` · `cntyCd`(국가코드, 예 JP/CN/US)
- **응답(XML)**: `year` · `statCdCntnKor1`(국가명) · `statCd`(국가코드) · `expDlr`·`impDlr` · `balPayments`(무역수지)
- **정규화**: 국가별 비중 = 국가 수입액 / 총수입액. 라이선스 **제한 없음**.

### 2.3 DART (OpenDART) — 기업 ✅ (키 유효, 활용신청 불필요)
- **용도**: 기업표(`TolueneCompany`)·그래프 기업노드. 키 1개(`OPENDART_KEY`)가 전 API 커버.
- **수집 순서**:
  1. `corpCode` — `GET https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=KEY` (zip→XML, corp_name↔corp_code 전체 매핑). 톨루엔 관련 석유화학사 선별.
  2. `기업개황` — `GET /api/company.json?crtfc_key=KEY&corp_code=...` → `corp_name`·`induty_code`(업종)·`ceo_nm`·`est_dt`·`adres` → `biz`/`role`.
  3. `재무(주요계정)` — `GET /api/fnlttSinglAcnt.json?crtfc_key=KEY&corp_code=...&bsns_year=2024&reprt_code=11011` → 매출액(`thstrm_amount`, account_nm="매출액") → `sales`.
- **대상 기업 후보**(톨루엔/BTX 밸류체인): 롯데케미칼 · 한화토탈에너지스 · S-Oil · GS칼텍스 · 금호석유화학 · 여천NCC · 대한유화 · SK지오센트릭. *(corp_code는 corpCode.xml에서 확정)*
- **점유율(share)**: DART에 직접 없음 → 매출/생산능력 기반 **△추정** 또는 ※가상 표기.

### 2.4 뉴스 (WordCloud) — P1 후순위
- **옵션 A**: 뉴스빅데이터 메타데이터(data.go.kr **fileData** 다운로드, 활용신청 불필요) — 키워드·빈도만.
- **옵션 B**: BIGKinds API — ⚠️ **풀텍스트 저작권(전재·복제·배포 금지)** → 키워드 메타만 사용.
- **fallback**: Phase 1은 ※가상 워드클라우드 유지(§5.5 범위 축소).

### 2.5 제품 기준정보 (TolueneProduct) — reference
- name=톨루엔(Toluene) · hsCode=**290230** · cas=**108-88-3** · category=방향족 탄화수소/BTX.
- 공개 화학 표준(HS 분류·CAS 등록번호) → 정적 reference, ⭐real.

---

## 3. 대상 엔티티 (수집 키)

| 축 | 값 |
|----|-----|
| HS코드 | **290230** (톨루엔, 6단위) |
| 기간 | 최근 ~2년 분기(예 2023Q1~2024Q4), API는 1년 단위 호출 |
| 국가 | JP·CN·US (+상위 교역국 확장 가능) |
| 기업 | 석유화학 BTX 밸류체인 5~8사(§2.3, corp_code corpCode.xml 확정) |

---

## 4. 수집 상태 체크리스트

- [x] 무역 총량 (15101609) 활용신청 승인 + 라이선스 제한없음
- [x] 무역 국가별 (15100475) 활용신청 승인 + 라이선스 제한없음
- [x] DART 키(OPENDART_KEY) 유효성 검증(status 013)
- [ ] 관세청 키 게이트웨이 전파(403→200) — **0d 라이브 블로커**(백그라운드 폴링 중)
- [ ] DART corpCode.xml → 대상 기업 corp_code 확정 (F014)
- [ ] 뉴스 메타데이터 소스 확정 (P1)
- [ ] 적재 스키마 매핑(공개데이터 필드 → 도메인 타입, 어댑터) (F014/F015)

---

## 5. Provenance 요약 (출처표기 누락 0 목표)

| provenance | 대상 | 소스 |
|:---:|------|------|
| ⭐ real | 무역통계·기업 기본/재무·제품 기준 | 관세청·DART·공개표준 |
| △ est | 점유율·무역 이상치 라벨 | 실데이터에서 산출/추정 |
| ※ virt | 데이터확장 힌트·미확보 항목 | 시연 시나리오 |

---

*수집 명세 v0.1 (2026-05-25). 적재 매핑·어댑터 상세는 F014/F015에서 확정.*
