// 지식그래프 픽스처 — 프로토타입 v0.32 initSobujiangGraph / initHormuzGraph 변환
// source 메타: real=실데이터, est=추정, paid=유료
import type { CytoNode, CytoEdge, CytoGraph, CytoDomain } from '@/types';

// ── 소부장 그래프 (37노드) ──────────────────────────────────────
const SOBUJIANG_NODES: CytoNode[] = [
  // R&D 공고
  { id: 's_rnd', label: 'R&D 공고\n(산기평)', type: 'Event', detail: '소부장 자립화 R&D 공고\nC2922 공작기계\n예산: 50억원', source: 'est', position: { x: 100, y: 400 } },
  // R&D 사례
  { id: 's_cat1', label: '사례 1\n고밀림 감속기\n국산화', type: 'RnDProject', detail: '2023년 · 산기평\n예산 5.2억 · 특허 14건', source: 'est', position: { x: 250, y: 250 } },
  { id: 's_cat2', label: '사례 2\n5축 머시닝센터\n정밀도 고도화', type: 'RnDProject', detail: '2024년 · 산기평\n예산 5.8억 · 진행중', source: 'est', position: { x: 250, y: 400 } },
  { id: 's_cat3', label: '사례 3\n산업용 로봇\n서보·정밀베어링\n자립화', type: 'RnDProject', detail: '2025년 · 산기평\n예산 4.5억 · 기획', source: 'est', position: { x: 250, y: 550 } },
  // 핵심 소부장 품목
  { id: 's_reducer', label: '정밀감속기\n(하모닉)', type: 'Product', detail: 'HS 8483.40\n일본 의존도 85%\n국산화율 15%', dataSource: 'GIVC', source: 'est', position: { x: 420, y: 180 } },
  { id: 's_servo', label: '서보모터', type: 'Product', detail: 'HS 8501.52\n일본 의존도 72%\n국산화율 28%', dataSource: 'GIVC', source: 'est', position: { x: 420, y: 280 } },
  { id: 's_bearing', label: '정밀베어링', type: 'Product', detail: 'HS 8482.10\n일본 의존도 68%\n국산화율 32%', dataSource: 'GIVC', source: 'est', position: { x: 420, y: 380 } },
  { id: 's_ballscrew', label: '볼스크류', type: 'Product', detail: 'HS 8483.40\n일본 의존도 75%\n국산화율 25%', dataSource: 'GIVC', source: 'est', position: { x: 420, y: 480 } },
  { id: 's_cnc', label: 'CNC 제어기', type: 'Product', detail: 'HS 9032.89\n일본/독일 의존\n국산화율 18%', dataSource: 'GIVC', source: 'est', position: { x: 420, y: 580 } },
  { id: 's_spindle', label: '스핀들', type: 'Product', detail: 'HS 8466.10\n스위스/일본\n국산화율 22%', dataSource: 'GIVC', source: 'est', position: { x: 560, y: 230 } },
  { id: 's_hydraulic', label: '유압밸브', type: 'Product', detail: 'HS 8481.20\n독일 의존도 55%\n국산화율 45%', dataSource: 'GIVC', source: 'est', position: { x: 560, y: 330 } },
  { id: 's_guide', label: '리니어가이드', type: 'Product', detail: 'HS 8482.80\n일본 의존도 71%\n국산화율 29%', dataSource: 'GIVC', source: 'est', position: { x: 560, y: 430 } },
  { id: 's_toolholder', label: '공구홀더', type: 'Product', detail: 'HS 8466.20\n독일/일본\n국산화율 35%', dataSource: 'GIVC', source: 'est', position: { x: 560, y: 530 } },
  { id: 's_chuck', label: '척 (Chuck)', type: 'Product', detail: 'HS 8466.20\n독일/대만\n국산화율 40%', dataSource: 'GIVC', source: 'est', position: { x: 560, y: 630 } },
  // 산업
  { id: 's_ind_mt', label: '공작기계', type: 'Industry', detail: '한국 생산 세계 5위\n내수 자급률 52%\n수출 $2.8B', dataSource: 'KOSIS', source: 'real', position: { x: 720, y: 280 } },
  { id: 's_ind_robot', label: '로봇', type: 'Industry', detail: '한국 로봇 밀도 세계 1위\n감속기·서보 핵심', dataSource: 'KOSIS', source: 'real', position: { x: 720, y: 400 } },
  { id: 's_ind_semi', label: '반도체장비', type: 'Industry', detail: '초정밀 베어링·스핀들\n핵심 부품 의존', dataSource: 'KOSIS', source: 'real', position: { x: 720, y: 520 } },
  { id: 's_ind_auto', label: '자동차부품', type: 'Industry', detail: '유압밸브·볼스크류\n생산라인 핵심', dataSource: 'KOSIS', source: 'real', position: { x: 720, y: 640 } },
  // 한국 기업 후보
  { id: 's_co_daehan', label: '대한정밀\n감속기', type: 'Company', detail: '매출 482억 · 창원\nR&D 26% · 특허 44건\n종합 0.69점 (1위)', dataSource: 'DART', source: 'est', scenarioRole: 'R&D 추천 1위', position: { x: 900, y: 180 } },
  { id: 's_co_hanil', label: '한일서보\n모션', type: 'Company', detail: '매출 312억 · 안산\nR&D 30% · 특허 49건\n종합 0.67점 (2위)', dataSource: 'DART', source: 'est', scenarioRole: 'R&D 추천 2위', position: { x: 900, y: 280 } },
  { id: 's_co_mirae', label: '미래기계\n소재', type: 'Company', detail: '매출 195억 · 천안\nR&D 25% · 특허 26건\n종합 0.52점 (3위)', dataSource: 'DART', source: 'est', position: { x: 900, y: 380 } },
  { id: 's_co_daejeon', label: '대전유압', type: 'Company', detail: '매출 178억 · 대전\nR&D 20% · 특허 31건\n종합 0.52점 (4위)', dataSource: 'DART', source: 'est', position: { x: 900, y: 480 } },
  { id: 's_co_seowon', label: '서원베어링\n테크', type: 'Company', detail: '매출 215억 · 경북\nR&D 18% · 특허 36건\n종합 0.51점 (5위)', dataSource: 'DART', source: 'est', position: { x: 900, y: 580 } },
  { id: 's_co_samik', label: '삼익THK', type: 'Company', detail: '매출 456억 · 대구\n리니어가이드 합작\nTHK 기술 도입', dataSource: 'DART', source: 'real', position: { x: 1000, y: 430 } },
  { id: 's_co_hwacheon', label: '화천기계', type: 'Company', detail: '매출 3,200억 · 광주\nCNC 선반 국내 1위', dataSource: 'DART', source: 'real', position: { x: 1000, y: 530 } },
  // 의존국
  { id: 's_japan', label: '일본', type: 'Country', detail: '소부장 최대 의존국\n감속기 85%\n서보 72%\n베어링 68%', dataSource: 'UNIPASS', source: 'real', position: { x: 1150, y: 250 } },
  { id: 's_germany', label: '독일', type: 'Country', detail: '유압 55%\n공구홀더·척\n보쉬렉스로스·쉐플러', dataSource: 'UNIPASS', source: 'real', position: { x: 1150, y: 400 } },
  { id: 's_china', label: '중국', type: 'Country', detail: '대체 수입선 후보\n가격 경쟁력\n품질 성장 중', dataSource: 'UNIPASS', source: 'real', position: { x: 1150, y: 530 } },
  { id: 's_taiwan', label: '대만', type: 'Country', detail: '볼스크류·척 대안\nHIWIN·CHICK\n가성비 우수', dataSource: 'UNIPASS', source: 'real', position: { x: 1150, y: 630 } },
  { id: 's_swiss', label: '스위스', type: 'Country', detail: '고정밀 스핀들\nFISCHER·IBAG\n최고급 시장', dataSource: 'UNIPASS', source: 'real', position: { x: 1150, y: 150 } },
  // 해외 경쟁사
  { id: 's_hd_jp', label: 'Harmonic\nDrive (JP)', type: 'Company', detail: '세계 1위 감속기\n시장점유 60%+\n한국 수입 85%', dataSource: 'UNIPASS', source: 'real', position: { x: 1300, y: 200 } },
  { id: 's_fanuc', label: 'FANUC (JP)', type: 'Company', detail: '세계 1위 CNC\n서보모터 내제\n한국 의존 핵심', dataSource: 'UNIPASS', source: 'real', position: { x: 1300, y: 300 } },
  { id: 's_thk', label: 'THK (JP)', type: 'Company', detail: '리니어가이드 세계 1위\n삼익THK 합작', dataSource: 'UNIPASS', source: 'real', position: { x: 1300, y: 430 } },
  { id: 's_bosch', label: 'Bosch\nRexroth (DE)', type: 'Company', detail: '유압 시스템 세계 1위\n한국 수입 핵심', dataSource: 'UNIPASS', source: 'real', position: { x: 1300, y: 530 } },
  // 지표 노드
  { id: 's_metric_rnd', label: 'R&D\n투자율', type: 'RiskIndicator', detail: '기업 R&D 투자 비중\n가중치 0.75\nGIVC scmm_his_chart', dataSource: 'GIVC', source: 'est', position: { x: 800, y: 100 } },
  { id: 's_metric_patent', label: '특허\n보유수', type: 'RiskIndicator', detail: '기업 보유 특허 건수\n가중치 0.65\nKIPRIS API', dataSource: 'KIPRIS', source: 'paid', position: { x: 950, y: 100 } },
  // 무역 기록
  { id: 's_tr_reducer', label: '감속기\n수입 $890M', type: 'TradeRecord', detail: 'HS 8483 수입\n2025년 · 일본 85%', dataSource: 'UNIPASS', source: 'real', position: { x: 300, y: 130 } },
  { id: 's_tr_servo', label: '서보모터\n수입 $620M', type: 'TradeRecord', detail: 'HS 8501 수입\n2025년 · 일본 72%', dataSource: 'UNIPASS', source: 'real', position: { x: 300, y: 670 } },
];

const SOBUJIANG_EDGES: CytoEdge[] = [
  { id: 'e_rnd_cat1', source: 's_rnd', target: 's_cat1', label: '과거 사례' },
  { id: 'e_rnd_cat2', source: 's_rnd', target: 's_cat2', label: '과거 사례' },
  { id: 'e_rnd_cat3', source: 's_rnd', target: 's_cat3', label: '과거 사례' },
  { id: 'e_rnd_reducer', source: 's_rnd', target: 's_reducer', label: '대상 품목', type: 'impact' },
  { id: 'e_rnd_servo', source: 's_rnd', target: 's_servo', label: '대상 품목', type: 'impact' },
  { id: 'e_rnd_bearing', source: 's_rnd', target: 's_bearing', label: '대상 품목', type: 'impact' },
  { id: 'e_rnd_ballscrew', source: 's_rnd', target: 's_ballscrew', label: '대상 품목', type: 'impact' },
  { id: 'e_rnd_cnc', source: 's_rnd', target: 's_cnc', label: '대상 품목', type: 'impact' },
  { id: 'e_cat1_reducer', source: 's_cat1', target: 's_reducer', label: '관련 품목' },
  { id: 'e_cat2_spindle', source: 's_cat2', target: 's_spindle', label: '관련 품목' },
  { id: 'e_cat2_cnc', source: 's_cat2', target: 's_cnc', label: '관련 품목' },
  { id: 'e_cat3_servo', source: 's_cat3', target: 's_servo', label: '관련 품목' },
  { id: 'e_cat3_bearing', source: 's_cat3', target: 's_bearing', label: '관련 품목' },
  { id: 'e_reducer_robot', source: 's_reducer', target: 's_ind_robot', label: '핵심 부품', type: 'impact' },
  { id: 'e_servo_robot', source: 's_servo', target: 's_ind_robot', label: '핵심 부품', type: 'impact' },
  { id: 'e_servo_mt', source: 's_servo', target: 's_ind_mt', label: '핵심 부품', type: 'impact' },
  { id: 'e_bearing_mt', source: 's_bearing', target: 's_ind_mt', label: '핵심 부품', type: 'impact' },
  { id: 'e_bearing_semi', source: 's_bearing', target: 's_ind_semi', label: '핵심 부품', type: 'impact' },
  { id: 'e_ballscrew_mt', source: 's_ballscrew', target: 's_ind_mt', label: '핵심 부품' },
  { id: 'e_cnc_mt', source: 's_cnc', target: 's_ind_mt', label: '제어', type: 'impact' },
  { id: 'e_spindle_mt', source: 's_spindle', target: 's_ind_mt', label: '핵심 부품' },
  { id: 'e_spindle_semi', source: 's_spindle', target: 's_ind_semi', label: '핵심 부품' },
  { id: 'e_hydraulic_mt', source: 's_hydraulic', target: 's_ind_mt', label: '구동' },
  { id: 'e_hydraulic_auto', source: 's_hydraulic', target: 's_ind_auto', label: '구동' },
  { id: 'e_guide_mt', source: 's_guide', target: 's_ind_mt', label: '이송' },
  { id: 'e_guide_semi', source: 's_guide', target: 's_ind_semi', label: '이송' },
  { id: 'e_toolholder_mt', source: 's_toolholder', target: 's_ind_mt', label: '가공' },
  { id: 'e_chuck_mt', source: 's_chuck', target: 's_ind_mt', label: '고정' },
  { id: 'e_reducer_daehan', source: 's_reducer', target: 's_co_daehan', label: '생산', type: 'impact' },
  { id: 'e_servo_hanil', source: 's_servo', target: 's_co_hanil', label: '생산', type: 'impact' },
  { id: 'e_bearing_seowon', source: 's_bearing', target: 's_co_seowon', label: '생산' },
  { id: 'e_hydraulic_daejeon', source: 's_hydraulic', target: 's_co_daejeon', label: '생산' },
  { id: 'e_toolholder_mirae', source: 's_toolholder', target: 's_co_mirae', label: '생산' },
  { id: 'e_guide_samik', source: 's_guide', target: 's_co_samik', label: '생산(합작)' },
  { id: 'e_cnc_hwacheon', source: 's_cnc', target: 's_co_hwacheon', label: '적용' },
  { id: 'e_japan_reducer', source: 's_japan', target: 's_reducer', label: '수입 85%', type: 'impact' },
  { id: 'e_japan_servo', source: 's_japan', target: 's_servo', label: '수입 72%', type: 'impact' },
  { id: 'e_japan_bearing', source: 's_japan', target: 's_bearing', label: '수입 68%', type: 'impact' },
  { id: 'e_japan_guide', source: 's_japan', target: 's_guide', label: '수입 71%', type: 'impact' },
  { id: 'e_germany_hydraulic', source: 's_germany', target: 's_hydraulic', label: '수입 55%', type: 'impact' },
  { id: 'e_swiss_spindle', source: 's_swiss', target: 's_spindle', label: '수입', type: 'impact' },
  { id: 'e_taiwan_ballscrew', source: 's_taiwan', target: 's_ballscrew', label: '대안 수입' },
  { id: 'e_china_alt', source: 's_china', target: 's_bearing', label: '대체 후보' },
  { id: 'e_hd_reducer', source: 's_hd_jp', target: 's_reducer', label: '공급', type: 'impact' },
  { id: 'e_fanuc_cnc', source: 's_fanuc', target: 's_cnc', label: '공급', type: 'impact' },
  { id: 'e_thk_guide', source: 's_thk', target: 's_guide', label: '공급(합작)' },
  { id: 'e_bosch_hydraulic', source: 's_bosch', target: 's_hydraulic', label: '공급' },
  { id: 'e_metric_rnd_daehan', source: 's_metric_rnd', target: 's_co_daehan', label: '평가 지표' },
  { id: 'e_metric_patent_daehan', source: 's_metric_patent', target: 's_co_daehan', label: '평가 지표' },
  { id: 'e_tr_reducer_japan', source: 's_tr_reducer', target: 's_japan', label: '수입국' },
  { id: 'e_tr_servo_japan', source: 's_tr_servo', target: 's_japan', label: '수입국' },
];

// ── 호르무즈 그래프 (핵심 노드 선별 60+) ─────────────────────────
const HORMUZ_NODES: CytoNode[] = [
  // 이벤트·지역
  { id: 'evt1', label: '호르무즈\n긴장 고조', type: 'Event', detail: '2026년 호르무즈 해협 군사적 긴장 고조로 원유 수송 리스크 증가', dataSource: '시나리오 정의', source: 'est', scenarioRole: '시나리오의 최초 트리거 이벤트', hormuz: true, position: { x: 100, y: 400 } },
  { id: 'reg1', label: '호르무즈\n해협', type: 'Region', detail: '세계 원유 수송의 약 20-25% 통과\n전략적 중요도: 5/5', dataSource: '한국석유공사 Petronet', source: 'real', hormuz: true, position: { x: 240, y: 400 } },
  // 산유국 (호르무즈 경유)
  { id: 'c_iran', label: '이란\n5.2%', type: 'Country', detail: '한국 원유 수입 비중 5.2%', dataSource: 'Petronet / UNIPASS', source: 'real', hormuz: true, position: { x: 380, y: 180 } },
  { id: 'c_saudi', label: '사우디\n28.1%', type: 'Country', detail: '한국 원유 수입 비중 28.1% (최대)', dataSource: 'Petronet / UNIPASS', source: 'real', hormuz: true, position: { x: 380, y: 310 } },
  { id: 'c_uae', label: 'UAE\n12.4%', type: 'Country', detail: '한국 원유 수입 비중 12.4%', dataSource: 'Petronet / UNIPASS', source: 'real', hormuz: true, position: { x: 380, y: 400 } },
  { id: 'c_iraq', label: '이라크\n8.7%', type: 'Country', detail: '한국 원유 수입 비중 8.7%', dataSource: 'Petronet / UNIPASS', source: 'real', hormuz: true, position: { x: 380, y: 500 } },
  { id: 'c_kuwait', label: '쿠웨이트\n9.3%', type: 'Country', detail: '한국 원유 수입 비중 9.3%', dataSource: 'Petronet / UNIPASS', source: 'real', hormuz: true, position: { x: 380, y: 620 } },
  // 비호르무즈 공급원
  { id: 'c_us', label: '미국', type: 'Country', detail: '한국 원유 수입 비중 8.1%', dataSource: 'Petronet', source: 'real', hormuz: false, position: { x: 160, y: 120 } },
  { id: 'c_russia', label: '러시아', type: 'Country', detail: '한국 원유 수입 비중 5.4%', dataSource: 'Petronet', source: 'real', hormuz: false, position: { x: 160, y: 220 } },
  { id: 'c_norway', label: '노르웨이', type: 'Country', detail: '한국 원유 수입 비중 2.1%', dataSource: 'Petronet', source: 'real', hormuz: false, position: { x: 160, y: 680 } },
  // 원자재·중간재
  { id: 'rm_oil', label: '원유\n(Crude Oil)', type: 'RawMaterial', detail: '호르무즈 통과 비중 63.7%\n현재 가격: $82/배럴', dataSource: 'Petronet / KOMIS', source: 'real', hormuz: true, position: { x: 540, y: 400 } },
  { id: 'rm_gas', label: '천연가스\n(LNG)', type: 'RawMaterial', detail: '나프타 대체 원료\n에탄 크래커 원료', dataSource: 'Petronet / KOMIS', source: 'real', hormuz: false, position: { x: 500, y: 200 } },
  { id: 'ig_naphtha', label: '나프타', type: 'IntermediateGoods', detail: 'HS 2710.12\n가격: $618/톤\n중동 의존도: 66%', dataSource: 'KOMIS / KPIA', source: 'real', hormuz: true, position: { x: 700, y: 400 } },
  { id: 'ig_ethylene', label: '에틸렌', type: 'IntermediateGoods', detail: 'HS 2901.21\n나프타 투입계수: 45.2%', dataSource: '산업연관표 2023 (한국은행)', source: 'real', hormuz: true, position: { x: 860, y: 250 } },
  { id: 'ig_propylene', label: '프로필렌', type: 'IntermediateGoods', detail: 'HS 2901.22\n나프타 투입계수: 28.1%', dataSource: '산업연관표 2023 (한국은행)', source: 'real', hormuz: true, position: { x: 860, y: 450 } },
  { id: 'ig_btx', label: 'BTX', type: 'IntermediateGoods', detail: '벤젠/톨루엔/자일렌\n나프타 투입계수: 18.5%', dataSource: '산업연관표 2023', source: 'real', hormuz: true, position: { x: 860, y: 620 } },
  // 주요 제품 (영향도 TOP5)
  { id: 'p_pe', label: 'PE\n(폴리에틸렌)', type: 'Product', detail: 'HS 3901\n국내 생산 450만톤/년\n에틸렌 투입 35.2%', dataSource: 'GIVC / KOSIS', source: 'real', scenarioRole: '영향도 1위', hormuz: true, position: { x: 1020, y: 150 } },
  { id: 'p_pp', label: 'PP\n(폴리프로필렌)', type: 'Product', detail: 'HS 3902\n자동차/포장\n프로필렌 투입 42.1%', dataSource: 'GIVC / KOSIS', source: 'real', scenarioRole: '영향도 2위', hormuz: true, position: { x: 1020, y: 400 } },
  { id: 'p_rubber', label: '합성고무', type: 'Product', detail: 'HS 4002\n타이어 원료\n프로필렌 투입 15.4%', dataSource: 'GIVC', source: 'real', scenarioRole: '영향도 3위', hormuz: true, position: { x: 1120, y: 440 } },
  { id: 'p_eg', label: 'EG\n(에틸렌글리콜)', type: 'Product', detail: 'HS 2905.31\n섬유 원료', dataSource: 'GIVC', source: 'real', scenarioRole: '영향도 4위', hormuz: true, position: { x: 1020, y: 230 } },
  { id: 'p_sm', label: 'SM\n(스티렌모노머)', type: 'Product', detail: 'HS 2902.50\n건설/포장재', dataSource: 'GIVC', source: 'real', scenarioRole: '영향도 5위', hormuz: true, position: { x: 1020, y: 310 } },
  { id: 'p_pvc', label: 'PVC', type: 'Product', detail: 'HS 3904\n건설 배관/창호', dataSource: 'GIVC', source: 'real', hormuz: true, position: { x: 1120, y: 190 } },
  { id: 'p_styrene', label: '스티렌', type: 'Product', detail: 'HS 2902.50\nBTX 투입 22.3%', dataSource: 'GIVC', source: 'real', hormuz: true, position: { x: 1020, y: 580 } },
  { id: 'p_capro', label: '카프로락탐', type: 'Product', detail: 'HS 2933.71\n나일론 원료\nBTX 투입 15.1%', dataSource: 'GIVC', source: 'real', hormuz: true, position: { x: 1020, y: 660 } },
  // 산업 (영향도별)
  { id: 'ind_petrochem', label: '석유화학', type: 'Industry', detail: '영향도: HIGH\n전파시간: 즉시\n생산지수 영향 -12~18%', dataSource: 'KOSIS 광공업 통계', source: 'real', hormuz: true, position: { x: 1280, y: 200 } },
  { id: 'ind_auto', label: '자동차', type: 'Industry', detail: '영향도: HIGH\n전파시간: 1~2주\nPP/합성고무 의존', dataSource: 'KOSIS', source: 'real', hormuz: true, position: { x: 1280, y: 320 } },
  { id: 'ind_construction', label: '건설', type: 'Industry', detail: '영향도: MEDIUM\n전파시간: 2~4주\nPVC/SM 의존', dataSource: 'KOSIS', source: 'real', hormuz: true, position: { x: 1280, y: 440 } },
  { id: 'ind_textile', label: '섬유', type: 'Industry', detail: '영향도: MEDIUM\n전파시간: 1~3주\nEG/카프로락탐 의존', dataSource: 'KOSIS', source: 'real', hormuz: true, position: { x: 1280, y: 560 } },
  // 주요 기업
  { id: 'co_lotte', label: '롯데케미칼', type: 'Company', detail: '매출 15.2조\nPE/PP 주요 생산\n나프타 의존도 68%', dataSource: 'GIVC / DART', source: 'real', hormuz: true, position: { x: 1170, y: 100 } },
  { id: 'co_lg', label: 'LG화학', type: 'Company', detail: '매출 20.1조\n에틸렌/ABS 주요 생산\n나프타 의존도 52%', dataSource: 'GIVC / DART', source: 'real', hormuz: true, position: { x: 1230, y: 140 } },
  { id: 'co_hanwha', label: '한화솔루션', type: 'Company', detail: '매출 9.8조\nPE/PVC 생산', dataSource: 'GIVC / DART', source: 'real', hormuz: true, position: { x: 1170, y: 340 } },
  { id: 'co_sk', label: 'SK지오센트릭', type: 'Company', detail: '매출 12.3조\nPP/SM 생산', dataSource: 'GIVC / DART', source: 'real', hormuz: true, position: { x: 1230, y: 390 } },
  { id: 'co_kumho', label: '금호타이어', type: 'Company', detail: '매출 3.2조\n합성고무 소비', dataSource: 'GIVC / DART', source: 'real', hormuz: true, position: { x: 1170, y: 480 } },
  { id: 'co_gs', label: 'GS칼텍스', type: 'Company', detail: '매출 28.5조\n정유/나프타 생산', dataSource: 'GIVC / DART', source: 'real', hormuz: false, position: { x: 620, y: 320 } },
  // EWS 경보
  { id: 'ews1', label: '원유\n가격경보', type: 'EWSAlert', detail: '경보수준: 경계\n발령일: 2026-05-15', dataSource: 'GIVC EWS', source: 'real', lastUpdated: '2026-05-15', hormuz: true, position: { x: 580, y: 250 } },
  { id: 'ews2', label: '나프타\n수급경보', type: 'EWSAlert', detail: '경보수준: 주의\n발령일: 2026-05-18', dataSource: 'GIVC EWS', source: 'real', lastUpdated: '2026-05-18', hormuz: true, position: { x: 740, y: 280 } },
  { id: 'ews3', label: 'PE\n가격경보', type: 'EWSAlert', detail: '경보수준: 관심\n발령일: 2026-05-20', dataSource: 'GIVC EWS', source: 'real', lastUpdated: '2026-05-20', hormuz: true, position: { x: 1070, y: 100 } },
  // 리스크 지표
  { id: 'ind_gpr', label: 'GPR\n지정학 리스크', type: 'RiskIndicator', detail: '지정학 리스크 지수\n원유 가격 2~4주 선행', dataSource: 'Caldara & Iacoviello', source: 'paid', scenarioRole: '사전 감지 선행 지표', hormuz: true, position: { x: 100, y: 250 } },
  { id: 'ind_ovx', label: 'OVX\n원유 변동성', type: 'RiskIndicator', detail: 'CBOE 원유 변동성 지수\nWTI 옵션 기반', dataSource: 'CBOE', source: 'paid', scenarioRole: '사전 감지 실시간 지표', hormuz: true, position: { x: 100, y: 550 } },
  { id: 'ind_gscpi', label: 'GSCPI\n공급망 압력', type: 'RiskIndicator', detail: 'NY Fed 공급망 압력 지수\n운송비·재고·납기 종합', dataSource: 'NY Fed / FRED', source: 'paid', hormuz: true, position: { x: 200, y: 700 } },
  // 대응 옵션
  { id: 'pol_diversify', label: '수입\n다변화', type: 'PolicyOption', detail: '실행가능성: 높음\n기간: 3~6개월\n효과: 의존도 63%→35%', dataSource: '추론', source: 'est', hormuz: false, position: { x: 1380, y: 750 } },
  { id: 'pol_stockpile', label: '비축\n확대', type: 'PolicyOption', detail: '실행가능성: 중간\n기간: 즉시\n효과: 14일→45일', dataSource: '추론 / 석유공사', source: 'est', hormuz: false, position: { x: 1380, y: 830 } },
  // R&D
  { id: 'rnd_bio', label: '바이오 나프타\nR&D', type: 'RnDProject', detail: '과제번호: RND-2025-001\n예산: 50억\n수행: 한국화학연구원', dataSource: 'NTIS', source: 'est', hormuz: false, position: { x: 770, y: 130 } },
  // 무역 기록
  { id: 'tr_naph_import', label: '나프타\n수입 $12.3B', type: 'TradeRecord', detail: '2025년 나프타 수입액\nHS 2710.12\n중동 66%', dataSource: 'UNIPASS', source: 'real', hormuz: false, position: { x: 600, y: 130 } },
];

const HORMUZ_EDGES: CytoEdge[] = [
  { id: 'h_evt_reg', source: 'evt1', target: 'reg1', label: 'DISRUPTS', type: 'impact' },
  { id: 'h_reg_iran', source: 'reg1', target: 'c_iran', label: '통과', type: 'impact' },
  { id: 'h_reg_saudi', source: 'reg1', target: 'c_saudi', label: '통과', type: 'impact' },
  { id: 'h_reg_uae', source: 'reg1', target: 'c_uae', label: '통과', type: 'impact' },
  { id: 'h_reg_iraq', source: 'reg1', target: 'c_iraq', label: '통과', type: 'impact' },
  { id: 'h_reg_kuwait', source: 'reg1', target: 'c_kuwait', label: '통과', type: 'impact' },
  { id: 'h_saudi_oil', source: 'c_saudi', target: 'rm_oil', label: '수출', type: 'impact' },
  { id: 'h_uae_oil', source: 'c_uae', target: 'rm_oil', label: '수출', type: 'impact' },
  { id: 'h_iraq_oil', source: 'c_iraq', target: 'rm_oil', label: '수출', type: 'impact' },
  { id: 'h_us_oil', source: 'c_us', target: 'rm_oil', label: '대체 수출' },
  { id: 'h_oil_naphtha', source: 'rm_oil', target: 'ig_naphtha', label: '정제', type: 'impact' },
  { id: 'h_oil_gas', source: 'rm_oil', target: 'rm_gas', label: '연관' },
  { id: 'h_naphtha_ethylene', source: 'ig_naphtha', target: 'ig_ethylene', label: 'INPUT_TO (45.2%)', type: 'impact' },
  { id: 'h_naphtha_propylene', source: 'ig_naphtha', target: 'ig_propylene', label: 'INPUT_TO (28.1%)', type: 'impact' },
  { id: 'h_naphtha_btx', source: 'ig_naphtha', target: 'ig_btx', label: 'INPUT_TO (18.5%)', type: 'impact' },
  { id: 'h_ethylene_pe', source: 'ig_ethylene', target: 'p_pe', label: 'INPUT_TO', type: 'impact' },
  { id: 'h_ethylene_eg', source: 'ig_ethylene', target: 'p_eg', label: 'INPUT_TO' },
  { id: 'h_ethylene_sm', source: 'ig_ethylene', target: 'p_sm', label: 'INPUT_TO' },
  { id: 'h_ethylene_pvc', source: 'ig_ethylene', target: 'p_pvc', label: 'INPUT_TO' },
  { id: 'h_propylene_pp', source: 'ig_propylene', target: 'p_pp', label: 'INPUT_TO', type: 'impact' },
  { id: 'h_propylene_rubber', source: 'ig_propylene', target: 'p_rubber', label: 'INPUT_TO', type: 'impact' },
  { id: 'h_btx_styrene', source: 'ig_btx', target: 'p_styrene', label: 'INPUT_TO' },
  { id: 'h_btx_capro', source: 'ig_btx', target: 'p_capro', label: 'INPUT_TO' },
  { id: 'h_pe_petrochem', source: 'p_pe', target: 'ind_petrochem', label: 'BELONGS_TO', type: 'impact' },
  { id: 'h_pp_auto', source: 'p_pp', target: 'ind_auto', label: 'BELONGS_TO' },
  { id: 'h_rubber_auto', source: 'p_rubber', target: 'ind_auto', label: 'BELONGS_TO', type: 'impact' },
  { id: 'h_pvc_construction', source: 'p_pvc', target: 'ind_construction', label: 'BELONGS_TO' },
  { id: 'h_pe_lotte', source: 'p_pe', target: 'co_lotte', label: '생산', type: 'impact' },
  { id: 'h_pe_lg', source: 'p_pe', target: 'co_lg', label: '생산' },
  { id: 'h_pe_hanwha', source: 'p_pe', target: 'co_hanwha', label: '생산' },
  { id: 'h_pp_sk', source: 'p_pp', target: 'co_sk', label: '생산' },
  { id: 'h_rubber_kumho', source: 'p_rubber', target: 'co_kumho', label: '원료' },
  { id: 'h_oil_gs', source: 'rm_oil', target: 'co_gs', label: '정제' },
  { id: 'h_ews1_oil', source: 'ews1', target: 'rm_oil', label: '모니터링', type: 'impact' },
  { id: 'h_ews2_naphtha', source: 'ews2', target: 'ig_naphtha', label: '모니터링', type: 'impact' },
  { id: 'h_ews3_pe', source: 'ews3', target: 'p_pe', label: '모니터링' },
  { id: 'h_gpr_evt', source: 'ind_gpr', target: 'evt1', label: '선행 지표', type: 'impact' },
  { id: 'h_ovx_oil', source: 'ind_ovx', target: 'rm_oil', label: '모니터링' },
  { id: 'h_gscpi_naphtha', source: 'ind_gscpi', target: 'ig_naphtha', label: '공급망 압력' },
  { id: 'h_tr_naph', source: 'tr_naph_import', target: 'ig_naphtha', label: '실적' },
  { id: 'h_pol_div_saudi', source: 'pol_diversify', target: 'c_saudi', label: '대응 옵션' },
  { id: 'h_rnd_bio', source: 'rnd_bio', target: 'ig_naphtha', label: '대체 기술' },
];

export const SOBUJIANG_GRAPH: CytoGraph = {
  domain: 'sobujiang',
  nodes: SOBUJIANG_NODES,
  edges: SOBUJIANG_EDGES,
};

export const HORMUZ_GRAPH: CytoGraph = {
  domain: 'hormuz',
  nodes: HORMUZ_NODES,
  edges: HORMUZ_EDGES,
};

export const GRAPH_BY_DOMAIN: Record<CytoDomain, CytoGraph> = {
  sobujiang: SOBUJIANG_GRAPH,
  hormuz: HORMUZ_GRAPH,
};
