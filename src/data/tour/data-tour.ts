import type { TourStep } from '@/components/platform';

/**
 * /platform/data 데이터 현황 페이지 투어.
 * ⭐ 사용자(서민원) 검토 필요 - 영업 화법 정제 포인트
 */
export const dataTourSteps: TourStep[] = [
  {
    target: '[data-tour-id="kpi-total"]',
    title: '한눈에 보는 데이터 자산',
    body: 'GIVC가 보유한 27건 데이터를 신뢰성 등급으로 분류했어요. 실데이터 19건이 핵심 자산이고, 추정·유료는 확장 후보예요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="kpi-real"]',
    title: '실데이터 비중 70%',
    body: '관세청 무역통계·DART 재무·산업부 정책DB 등 공공원천에서 직접 수집한 19건이 데모의 신뢰성 근거예요.',
    placement: 'bottom',
  },
  {
    target: '[data-tour-id="source-table"]',
    title: '27건 출처 카탈로그',
    body: '각 데이터의 소스·갱신 주기·접근성·라이선스를 한 줄로 정리했어요. 추가 확보를 검토할 데이터가 있다면 이 표를 우선 보세요.',
    placement: 'top',
  },
  {
    target: '[data-tour-id="status-dot"]',
    title: '신뢰도 시그널',
    body: '초록(검증)·노랑(임시)·회색(대기) 점으로 데이터별 운영 상태를 표시했어요. 시연 시 모두 검증 상태인지 확인하세요.',
    placement: 'left',
  },
  {
    target: '[data-tour-id="survey-cta"]',
    title: '회신 의향이 있으시다면',
    body: '추가로 제공 가능한 데이터가 있으시면 시연 후 의향 설문에 회신해주세요. KOAMI 다음 단계 합의의 출발점이 돼요.',
    placement: 'top',
  },
];
