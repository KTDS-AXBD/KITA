import type { BadgeVariant } from '@/components/platform';
import type { DotStatus } from '@/components/platform';

export type DataDomain = 'sobujiang' | 'hormuz' | 'both';

export interface DataSource {
  id: number;
  name: string;
  badge: BadgeVariant;
  source: string;
  usage: string;
  method: string;
  updated: string;
  status: DotStatus;
  domain: DataDomain;
}

export const DATA_SOURCES: DataSource[] = [
  // ── 실 데이터 (19건) — 소부장 우선 ──────────────────────────
  {
    id: 1, name: 'GIVC 품목-HS코드', badge: 'real',
    source: 'GIVC mart.lnk0951a',
    usage: 'Product 노드 기본키, 공작기계(HS 8457~8461) 및 석유화학 품목 식별',
    method: 'DB 직접 조회 (연동 완료)', updated: '2026-05', status: 'connected', domain: 'both',
  },
  {
    id: 2, name: '소부장넷 기업 DB', badge: 'real',
    source: 'GIVC enp0111y',
    usage: 'Company 노드, 약 2,400개 기업 매출/고용/산업분류',
    method: 'DB 직접 조회', updated: '2026-05', status: 'connected', domain: 'sobujiang',
  },
  {
    id: 3, name: 'R&D/리스크 시계열', badge: 'real',
    source: 'GIVC scmm_his_chart',
    usage: '대응 옵션 근거 (R&D 투자율, 부도율)',
    method: 'DB 직접 조회', updated: '2026-05', status: 'connected', domain: 'sobujiang',
  },
  {
    id: 4, name: 'EWS 경보', badge: 'real',
    source: 'GIVC EWS',
    usage: '이벤트 감지, 품목별 조기경보 (가격/수급/환율/물류)',
    method: 'DB 직접 조회', updated: '2026-05', status: 'connected', domain: 'both',
  },
  {
    id: 5, name: '산업동향 보고서', badge: 'real',
    source: 'GIVC 보고서 DB',
    usage: 'RAG 맥락 보강, 정성적 근거',
    method: 'RAG 색인 활용', updated: '2026-04', status: 'connected', domain: 'both',
  },
  {
    id: 6, name: 'GIVC 밸류체인 분류', badge: 'real',
    source: 'GIVC',
    usage: '공급망 계층 구조 (원소재→부품→장비)',
    method: 'DB 직접 조회', updated: '2026-05', status: 'connected', domain: 'sobujiang',
  },
  {
    id: 7, name: '관세청 수출입 통계', badge: 'real',
    source: '관세청 UNIPASS',
    usage: '공작기계 HS별 국가별 의존도 산출 (머시닝센터·감속기)',
    method: 'Open API', updated: '2026-04', status: 'connected', domain: 'sobujiang',
  },
  {
    id: 8, name: 'DART 기업 공시', badge: 'real',
    source: '금감원 DART',
    usage: '상장 기계사 10사 재무/원재료 비중',
    method: 'Open API', updated: '2026-03', status: 'connected', domain: 'sobujiang',
  },
  {
    id: 9, name: '공작기계 수급통계', badge: 'real',
    source: 'KOMMA',
    usage: '내수/수출/수입/생산 — 소부장 시장 규모 파악',
    method: '웹 다운로드', updated: '2026-04', status: 'collecting', domain: 'sobujiang',
  },
  {
    id: 10, name: '산업연관표 투입계수', badge: 'real',
    source: '한국은행 ECOS',
    usage: '381개 산업 간 투입 비중, INPUT_TO 엣지 가중치 핵심',
    method: 'Open API (인증키)', updated: '2023', status: 'collecting', domain: 'both',
  },
  {
    id: 11, name: '생산동향', badge: 'real',
    source: '통계청 KOSIS',
    usage: '산업별 생산/출하/재고/가동률',
    method: 'Open API', updated: '2026-04', status: 'collecting', domain: 'sobujiang',
  },
  {
    id: 12, name: '소재 수입의존도', badge: 'real',
    source: '관세청 UNIPASS',
    usage: '소부장 소재 국가별 의존도 분석',
    method: 'Open API', updated: '2026-04', status: 'collecting', domain: 'sobujiang',
  },
  {
    id: 13, name: '일본 공작기계 수출통계', badge: 'real',
    source: 'JMTBA',
    usage: '일본 공작기계 대한 수출 추이 (수입 대체 벤치마크)',
    method: '웹 다운로드', updated: '2026-03', status: 'collecting', domain: 'sobujiang',
  },
  {
    id: 14, name: '원유 수입 통계', badge: 'real',
    source: '한국석유공사 Petronet',
    usage: '국가별 원유 수입량, 호르무즈 통과 비중 63.7%',
    method: '웹 조회/다운로드', updated: '2026-04', status: 'collecting', domain: 'hormuz',
  },
  {
    id: 15, name: '원자재 가격', badge: 'real',
    source: 'KOMIS',
    usage: '나프타/에틸렌/PE/PP 가격 동향',
    method: '웹 다운로드', updated: '2026-05', status: 'collecting', domain: 'hormuz',
  },
  {
    id: 16, name: '석유화학 수급 통계', badge: 'real',
    source: 'KPIA',
    usage: '주요 제품별 내수/수출/수입/생산',
    method: '웹 다운로드', updated: '2025', status: 'collecting', domain: 'hormuz',
  },
  {
    id: 17, name: '원유 비축 현황', badge: 'real',
    source: '한국석유공사',
    usage: '국가 비축량/비축일수',
    method: '웹 조회', updated: '2026-04', status: 'collecting', domain: 'hormuz',
  },
  {
    id: 18, name: '기업 신용 등급 추이', badge: 'real',
    source: 'NICE/KIS',
    usage: '소부장 기업 신용위험 시계열',
    method: '웹 다운로드', updated: '2026-03', status: 'collecting', domain: 'sobujiang',
  },
  {
    id: 19, name: 'R&D 투자 동향', badge: 'real',
    source: '과학기술정보연구원 KISTI',
    usage: '산업별 R&D 투자율, 국산화 진행도',
    method: '웹 다운로드', updated: '2026-03', status: 'collecting', domain: 'sobujiang',
  },
  // ── 추정 데이터 (4건) ──────────────────────────────────────
  {
    id: 20, name: '특허 출원 동향', badge: 'estimate',
    source: 'KIPRIS',
    usage: '대체 소재/기술 특허 현황',
    method: 'API (일부 수동)', updated: '2026-05', status: 'unavailable', domain: 'sobujiang',
  },
  {
    id: 21, name: '국가 R&D 과제', badge: 'estimate',
    source: 'NTIS',
    usage: '정부 R&D 과제 검색',
    method: '웹 검색/다운로드', updated: '2026-05', status: 'unavailable', domain: 'sobujiang',
  },
  {
    id: 22, name: '뉴스 데이터', badge: 'estimate',
    source: '뉴스 API',
    usage: '이벤트 감지 트리거',
    method: 'RSS/API', updated: '실시간', status: 'unavailable', domain: 'both',
  },
  {
    id: 23, name: '글로벌 공작기계 시장', badge: 'estimate',
    source: 'Gardner Research',
    usage: '글로벌 시장 규모·점유율 추정',
    method: '보고서 구독 (부분)', updated: '2025', status: 'unavailable', domain: 'sobujiang',
  },
  // ── 유료 데이터 (4건) ──────────────────────────────────────
  {
    id: 24, name: '글로벌 무역 분석', badge: 'paid',
    source: 'ITC Trade Map',
    usage: '대체 수입선 글로벌 분석',
    method: '기관 구독', updated: '-', status: 'unavailable', domain: 'both',
  },
  {
    id: 25, name: '공작기계 가격 인덱스', badge: 'paid',
    source: 'S&P Global',
    usage: '정밀 가격/리스크',
    method: '기업 라이선스', updated: '-', status: 'unavailable', domain: 'sobujiang',
  },
  {
    id: 26, name: '기업 신용 DB', badge: 'paid',
    source: 'Bloomberg',
    usage: '기업 심층 재무·신용분석',
    method: '기업 라이선스', updated: '-', status: 'unavailable', domain: 'sobujiang',
  },
  {
    id: 27, name: '원유 선물', badge: 'paid',
    source: 'Reuters Eikon',
    usage: '유가 선물·파생 리스크',
    method: '기업 라이선스', updated: '-', status: 'unavailable', domain: 'hormuz',
  },
];
