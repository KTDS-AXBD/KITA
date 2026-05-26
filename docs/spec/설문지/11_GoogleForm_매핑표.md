# Google Form 매핑표 — 설문 페이지 백엔드 연동 (v1)

> **목적**: `public/survey-static.html`(임베드 설문)의 35개 필드를 Google Form 질문과 1:1 매핑하여, "Google Form으로 제출" 버튼의 자동 수집(no-cors POST)을 활성화한다.
> **작성**: 2026-05-26 / F029 후속. 이식 설계서 `10_질의서_이식설계서_v1.md` §2.5 Step 1~4 구체화.
> **현 상태**: `GOOGLE_FORM.enabled = false`, `entry.*` 미설정(placeholder). 아래 절차로 폼 생성 후 ID 주입 시 활성화.

---

## ⚠️ 먼저 읽을 핵심 규칙 (POST 깨짐 방지)

임베드 폼은 응답자가 직접 보는 화면이고, **Google Form은 보이지 않는 수집 백엔드**다(`fetch ... mode:'no-cors'`). 따라서 다음을 반드시 지켜야 응답이 정상 기록된다.

1. **선택지 텍스트 = HTML 제출값과 정확히 일치해야 함.** Google Form의 객관식/체크박스/드롭다운 옵션 라벨이 HTML이 보내는 `value`와 글자 단위로 같아야 매칭된다. 다르면 Google Form이 그 응답을 버린다(‘기타’ 미허용 시).
2. **`data_*` 10개 항목의 제출값은 영문 코드** (`immediate`/`partial`/`later`/`no`). 화면엔 "즉시/일부/추후/불가"로 보이지만 실제 전송값은 영문이다 → **Google Form 옵션 라벨도 `immediate`·`partial`·`later`·`no`로** 만들어야 한다(응답 시트엔 영문으로 적힘, 응답자는 Google Form을 직접 안 보므로 무방). 한글로 만들면 매칭 실패.
3. **날짜(`resp_date`)는 Google Form "날짜형" 대신 "단답형"으로.** Google Form 날짜형은 `entry.N_year`/`_month`/`_day` 3개로 쪼개져 단일 entry 매핑이 깨진다. 단답형으로 만들면 `YYYY-MM-DD` 문자열이 단일 `entry.N`에 들어간다.
4. **그리드(객관식 그리드) 쓰지 말 것.** 우선순위(prio_*)·데이터의향(data_*)을 그리드로 묶으면 행마다 entry 파생 파라미터가 생겨 매핑이 복잡해진다. **각 항목을 개별 질문(flat)으로** 만든다(질문 수는 늘지만 매핑이 단순·안정).
5. **체크박스 복수 선택**(`ok_level`·`date_options`)은 같은 `entry.N`을 값마다 반복 전송한다. HTML이 이미 `v.forEach(append)`로 처리하므로, Google Form에서 해당 옵션만 정의돼 있으면 정상 기록된다.
6. **모든 질문 "필수 아님"** 으로. 임베드 폼은 일부 문항만 회신 가능(⭐ 4개 핵심만). 필수로 걸면 부분 응답이 거부된다.

---

## 매핑표 (35필드)

> `entry.ID` 열은 폼 생성 후 채운다(§추출 절차). 유형은 Google Form 질문 유형.

### 응답자 정보 (3)

| # | HTML name | 질문 제목(권장) | Google Form 유형 | 옵션(정확일치) | entry.ID |
|---|-----------|----------------|------------------|----------------|----------|
| 1 | `respondent` | 이름 · 소속 · 역할 | 단답형 | — | `entry.____` |
| 2 | `resp_date` | 응답 일자 (YYYY-MM-DD) | **단답형**(날짜형 금지) | — | `entry.____` |
| 3 | `rep` | 대표 회신자 (협업 응답 시) | 단답형 | — | `entry.____` |

### A · 시나리오 우선순위 ⭐ (11)

> 각 시나리오를 개별 드롭다운으로. 옵션은 `1`·`2`·`3` 셋만(빈 값 = 미선택, 전송 안 됨).

| # | HTML name | 질문 제목(권장) | 유형 | 옵션(정확일치) | entry.ID |
|---|-----------|----------------|------|----------------|----------|
| 4 | `prio_s1` | S1 나프타 공급망 영향도 — 순위 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 5 | `prio_s2` | S2 호르무즈 해협 지정학 리스크 — 순위 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 6 | `prio_s3` | S3 리튬·니켈 가격 폭등 — 순위 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 7 | `prio_s4` | S4 소부장 자립화 R&D 적합 기업 추천 (MAIN) — 순위 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 8 | `prio_s5` | S5 EWS 정책 대응안 — 순위 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 9 | `prio_s6` | S6 공작기계 가치사슬 가시화 (SUB) — 순위 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 10 | `prio_s7` | S7 한일 무역협정 영향 — 순위 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 11 | `crit_impact` | 선정 기준 — 산업부·기진회 의사결정 임팩트 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 12 | `crit_data` | 선정 기준 — 데이터 가용성·완성도 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 13 | `crit_ext` | 선정 기준 — 본 사업화 확장 가능성 | 드롭다운 | `1` `2` `3` | `entry.____` |
| 14 | `extra_scenario` | 위 후보 외 추가 시나리오 제안 | 장문형 | — | `entry.____` |

### B · 추가 데이터 확보 의향 ⭐ (12)

> ⚠️ 10개 항목 모두 객관식(단일선택), **옵션 라벨은 영문 코드** `immediate`/`partial`/`later`/`no` (= 즉시/일부/추후/불가). 그리드 금지.

| # | HTML name | 질문 제목(권장) | 유형 | 옵션(정확일치) | entry.ID |
|---|-----------|----------------|------|----------------|----------|
| 15 | `data_rnd_call` | 산기평 신규 R&D 공고 이력·과거 결과 | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 16 | `data_updown` | 품목 → 품목 전후방 매핑 | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 17 | `data_naphtha` | 나프타 종류별(경질·중질) 통계 | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 18 | `data_machine` | 공작기계 핵심 부품(감속기·CNC) 가치사슬 | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 19 | `data_chat_log` | ChatGIVC 비식별 로그 | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 20 | `data_faq` | 산업부 자주 묻는 질문 Top 10~20 | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 21 | `data_pol_card` | 정책 옵션 카드(과거 정책 이력) | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 22 | `data_screens` | GIVC 메뉴 트리·화면 캡처(대표) | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 23 | `data_schema` | 핵심 테이블 컬럼 사전(scmm_his_chart 등) | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 24 | `data_ews_rule` | EWS 위험 알림 알고리즘 명세 | 객관식 | `immediate` `partial` `later` `no` | `entry.____` |
| 25 | `external_data` | 외부 데이터 수집 분담 — KT DS 측 수집 가능 의견 | 장문형 | — | `entry.____` |
| 26 | `virtual_rule` | 가상 데이터 표기 규칙(⭐실·△추정·※가상) 의견 | 장문형 | — | `entry.____` |

### C · 산출물 OK 기준 ⭐ (3)

| # | HTML name | 질문 제목(권장) | 유형 | 옵션(정확일치) | entry.ID |
|---|-----------|----------------|------|----------------|----------|
| 27 | `ok_level` | OK 레벨 (복수 선택) | **체크박스** | `L1` `L2` `L3` `L4` `L5` | `entry.____` |
| 28 | `audience` | 청중 구성 | 장문형 | — | `entry.____` |
| 29 | `format` | 시연 형식 선호 | 객관식(단일) | `라이브 데모` `핸즈온` `사전 녹화 + 라이브 Q&A` `종합 보고서` | `entry.____` |

> ⭐ `ok_level` 옵션 라벨은 `L1`~`L5` 코드만(화면의 긴 설명 "L1 · 지식그래프 맵..."이 아니라 **value인 `L1`**). `format`은 화면 라벨과 value가 다르니 **value 기준**으로: `라이브 데모`, `핸즈온`, `사전 녹화 + 라이브 Q&A`, `종합 보고서`.

### D · 일정 · 진행 방식 ⭐ (4)

| # | HTML name | 질문 제목(권장) | 유형 | 옵션(정확일치) | entry.ID |
|---|-----------|----------------|------|----------------|----------|
| 30 | `date_options` | Prototype 리뷰 일정 후보 (복수 선택) | **체크박스** | `6/22(월)` `6/24(수)` `6/26(금)` `6/29(월)` `6/30(화)` `7월 초 선호` | `entry.____` |
| 31 | `time_slot` | 시간대 · 소요 시간 | 단답형 | — | `entry.____` |
| 32 | `bf_mode` | Back & Forward 진행 방식 | 객관식(단일) | `이메일 위주` `화상 회의` `대면 미팅 1회` `혼합` | `entry.____` |
| 33 | `new_pm` | 고객 측 신규 실무 PM 정보 | 장문형 | — | `entry.____` |

### E · 자유 의견 (2)

| # | HTML name | 질문 제목(권장) | 유형 | 옵션(정확일치) | entry.ID |
|---|-----------|----------------|------|----------------|----------|
| 34 | `free` | 본 추가 사업 우려·기대·자유 의견 | 장문형 | — | `entry.____` |
| 35 | `meeting_req` | 본 폼 외 별도 미팅 필요 영역 | 장문형 | — | `entry.____` |

---

## entry.ID 추출 절차

1. Google Form 생성 → 위 35개 질문을 표 순서대로 추가(유형·옵션 정확히). 전부 "필수 아님".
2. 우상단 **보내기 → 링크(🔗)** 또는 **미리보기(👁)** 로 응답용(viewform) URL 확보:
   `https://docs.google.com/forms/d/e/{FORM_ID}/viewform`
3. 미리보기 페이지에서 **개발자 도구(F12) → Network 탭** 열고, 아무 값이나 입력 후 **제출**.
4. `formResponse` 요청의 **Payload(form-data)** 에서 각 `entry.{숫자}` ↔ 입력한 값을 대조해 매핑 추출.
   - 더 빠른 방법: viewform 페이지 **소스 보기**에서 `FB_PUBLIC_LOAD_DATA_` 또는 각 질문 컨테이너의 `data-params` 안 `entry.{숫자}` 검색.
   - 브라우저 확장 "Get Google Form Field IDs" 사용 가능.
5. `{FORM_ID}` 와 35개 `entry.{숫자}` 를 아래 블록에 채운다.

---

## 채워 넣을 코드 (`public/survey-static.html` line ~997)

폼 생성·ID 추출 후 아래로 교체하면 자동 수집 활성화:

```js
const GOOGLE_FORM = {
  url: 'https://docs.google.com/forms/d/e/__FORM_ID__/formResponse',  // ← {FORM_ID} 채우기
  enabled: true,  // ← false에서 전환
  fields: {
    respondent:     'entry.____',
    resp_date:      'entry.____',
    rep:            'entry.____',
    prio_s1:        'entry.____',
    prio_s2:        'entry.____',
    prio_s3:        'entry.____',
    prio_s4:        'entry.____',
    prio_s5:        'entry.____',
    prio_s6:        'entry.____',
    prio_s7:        'entry.____',
    crit_impact:    'entry.____',
    crit_data:      'entry.____',
    crit_ext:       'entry.____',
    extra_scenario: 'entry.____',
    data_rnd_call:  'entry.____',
    data_updown:    'entry.____',
    data_naphtha:   'entry.____',
    data_machine:   'entry.____',
    data_chat_log:  'entry.____',
    data_faq:       'entry.____',
    data_pol_card:  'entry.____',
    data_screens:   'entry.____',
    data_schema:    'entry.____',
    data_ews_rule:  'entry.____',
    external_data:  'entry.____',
    virtual_rule:   'entry.____',
    ok_level:       'entry.____',
    audience:       'entry.____',
    format:         'entry.____',
    date_options:   'entry.____',
    time_slot:      'entry.____',
    bf_mode:        'entry.____',
    new_pm:         'entry.____',
    free:           'entry.____',
    meeting_req:    'entry.____',
  }
};
```

> ⚠️ `url`은 `viewform`이 아니라 **`formResponse`** 로 끝나야 한다.
> 활성화 후 `public/survey-static.html` 저장 → `pnpm deploy:cf` → `wrangler versions deploy <새버전> @100%` 로 재배포.

---

## 검증 (활성화 후)

1. 임베드 폼에서 테스트 응답 1건 입력 → "제출 · 미리보기" → "Google Form으로 제출" → "회신이 전송되었습니다" alert.
2. Google Form **응답 탭 / 연결된 스프레드시트** 에 해당 행이 들어왔는지 확인.
3. 선택지 값이 ‘기타’나 빈칸으로 빠지면 → 옵션 텍스트 불일치(위 §핵심 규칙 1·2 재점검).
4. (선택) 응답 시 Slack 알림: 이식 설계서 §2.5 Step 4 Apps Script `onFormSubmit` 트리거.

---

## 보안 · 운영 메모 (이식 설계서 §2.5 재확인)

- Google Form은 응답자 인증 없이 받음 → 봇·중복 가능. 회수 채널을 시연 직후 1:1 발송으로 한정해 위험 낮춤.
- 응답 시트는 KT DS 도메인 계정 소유로 생성, 기진회 측엔 결과 요약만 공유.
- 폼/시트에 PII(이름·연락처)가 쌓이므로 보관 기간·접근 권한 관리.
