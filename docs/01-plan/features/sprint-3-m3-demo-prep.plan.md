# Sprint 3 — M3 시연 준비 (F010~F012) Planning Document

> **Summary**: 시연 실행 런북 완성 — F011 시연 스크립트(outline)·운영 매뉴얼·README 핸드오버. F010 About는 S1에서 충실 이송됨(미세 polish만), F012 Tweaks ✅(S1)·다국어 EN 보류(P2). 문서 중심 sprint.
>
> **Project**: KITA PoC · **Version**: 0.1.0 · **Author**: 서민원 + Claude Code · **Date**: 2026-05-24 · **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 빌드·배포·기능(S1·S2·F009)은 완성됐으나, **시연을 실제로 진행·인수인계할 런북**이 없음. 솔로 개발이라 핸드오버 문서가 리스크 완화 필수(PRD §6.3). |
| **Solution** | F011 **시연 스크립트(outline)**(25~35분 구간별 화면·메시지·고객 데이터 유도) + **운영 매뉴얼**(실행/장애대응/FAQ) + **README 핸드오버**. F010 About polish, F012 EN 보류. |
| **Function/UX Effect** | 발표자가 안정적으로 시연 진행, 타인도 인수 가능, 장애 시 즉시 대응. |
| **Core Value** | "시연 가능 프로덕션 PoC"의 마지막 조각 — 산출물이 실제 영업 무기가 되도록. |

---

## 1. Overview

### 1.1 Purpose

PoC를 **실제 시연·인수인계 가능 상태**로 마감. 코드가 아니라 *런북*을 완성한다.

### 1.2 Background (fs 실측, 2026-05-24)

- **F010 About**: S1에서 충실 이송 완료 — `AboutOntologyPage`(개념·데이터진화·확장path), `AboutDataPage`(⭐△※ 카탈로그 7실/1추정/4가상·가상처리 원칙). **신규 작성 불필요**, 미세 polish만(Ontology "Sprint 진화 표"가 dev sprint와 혼동 소지).
- **F012 Tweaks**: S1 완료(`TweaksPanel`+store+App 연결, flavor/theme 동작). **다국어 EN = stub**(subText 1줄만 분기) → P2·한국어 시연이라 **보류**.
- **F011**: README(90줄) 존재, `deploy-guide.md`·`qa-checklist.md`(S2) 존재. **시연 스크립트·운영 매뉴얼은 신규**.

### 1.3 Related Documents

- SSOT: `SPEC.md` F010~F012
- S2 산출: `docs/deploy-guide.md`·`docs/qa-checklist.md`
- S1 회귀: `docs/03-do/sprint-1-regression-checklist.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] **F011** `docs/demo-script.md` — 시연 스크립트(outline): 구간별 시간·화면·조작·핵심메시지·고객 데이터 유도 포인트(C1~C5)
- [ ] **F011** `docs/operations-manual.md` — 1페이지 운영 매뉴얼: 실행 순서·온/오프라인 전환·장애 대응·백업영상 녹화 가이드·FAQ
- [ ] **F011** `README.md` 핸드오버 강화 — 개요·실행·빌드·배포·구조·문서 인덱스
- [ ] **F010** About polish — Ontology "데이터 진화 표"의 sprint 혼동 표현 정리(데이터 성숙도 단계로 명확화)
- [ ] SPEC F010 ✅ / F011 ✅ / F012 (Tweaks ✅, 다국어 보류 명시)

### 2.2 Out of Scope

- **F011 백업 영상 녹화** — 서민원 수동(도구·5분 요약). 매뉴얼에 녹화 가이드만 제공
- **F012 다국어 EN 전체 i18n** — P2 보류(한국어 시연). stub 유지, 해외 시연 확정 시 별도
- 신규 기능/화면 — 전무 (M3는 준비만)

---

## 3. Requirements

| ID | Requirement | F-item | Priority | Status |
|----|-------------|--------|----------|--------|
| FR-01 | 시연 스크립트 — Landing→S4→S6→About 흐름, 25~35분, 구간별 메시지+데이터 유도 | F011 | High | Pending |
| FR-02 | 운영 매뉴얼 — 실행/전환/장애/FAQ 1페이지 | F011 | High | Pending |
| FR-03 | README 핸드오버 — 타인 인수 가능 수준 | F011 | Medium | Pending |
| FR-04 | About polish — sprint 혼동 표현 정리 | F010 | Low | Pending |
| FR-05 | SPEC F010/F011/F012 상태 마감 | - | Medium | Pending |

---

## 4. Success Criteria (DoD)

- [ ] `docs/demo-script.md` — 시연 흐름 outline + 데이터 유도 포인트 완비
- [ ] `docs/operations-manual.md` — 장애 대응·온/오프라인 전환 포함
- [ ] README — 실행·배포·구조·문서 인덱스로 타인 인수 가능
- [ ] About polish 반영
- [ ] tsc/lint/build 회귀 0 (코드 변경은 About polish뿐, 영향 최소)
- [ ] SPEC F010✅·F011✅ 마감, F012 다국어 보류 명시
- [ ] (서민원 수동) 백업 영상 녹화 + 리허설 2회 — 런북 항목

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 시연 스크립트가 실제 화면과 불일치 | Med | Low | 라이브 URL 기준 작성, S1 33회귀 체크리스트 연계 |
| 백업 영상 미준비로 장애 시 무방비 | High | Low | 매뉴얼에 녹화 가이드 + 오프라인 백업 이중화(PRD §5.4) |
| About polish가 다른 콘텐츠 깨뜨림 | Low | Low | 텍스트만 수정, build 회귀 확인 |
| 솔로 인수인계 공백 | Med | Med | README 핸드오버 + 운영 매뉴얼로 완화(PRD §6.3) |

---

## 6. Architecture / 구조

문서 sprint — 아키텍처 변경 없음. 산출물:
```
docs/
├─ demo-script.md          # F011 — 시연 스크립트(outline)
├─ operations-manual.md    # F011 — 운영 매뉴얼
├─ deploy-guide.md         # (S2)
└─ qa-checklist.md         # (S2)
README.md                  # F011 — 핸드오버 강화
src/features/about/AboutOntologyPage.tsx  # F010 polish (텍스트)
```

### 6.1 Key Decisions
| Decision | Selected |
|----------|----------|
| 시연 스크립트 깊이 | **핵심 흐름 outline** (사용자 결정) |
| 다국어 EN | **보류** (P2, 한국어 시연 — 사용자 결정) |
| F010 About | 신규 X, 미세 polish만 (S1 이송분 충실) |
| 백업 영상 | 서민원 수동(가이드만 제공) |

---

## 7. Convention

- 문서: 한국어 1순위, `docs/` 디렉토리. README는 핸드오버 표준(개요·실행·배포·구조).
- 데이터 표기 규칙(⭐△※)·소속 표기는 CLAUDE.md 준수.

---

## 8. Next Steps

1. [ ] (이 sprint) demo-script·operations-manual·README·About polish 작성
2. [ ] SPEC F010/F011/F012 마감
3. [ ] (서민원) 백업 영상 녹화 + 리허설 2회 + 시연 후 만료

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | 초안 — 문서 sprint(F011 신규), F010 polish·F012 EN 보류 확정, fs 실측 기반 스코프 축소 | 서민원 + Claude Code |
