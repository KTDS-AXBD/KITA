import { useEffect } from 'react';

/**
 * 시나리오·데이터 확장 의견 수렴 설문 페이지.
 *
 * 09번 단독 HTML(`docs/spec/설문지/09_시나리오_질의서_페이지.html`)을 `public/survey-static.html`로
 * 복사하여 iframe 임베드한다(이식 설계서 B안). 폼 로직(localStorage 임시저장·미리보기 모달·
 * Google Form POST)은 정적 HTML 안에 그대로 보존되어 사이트 코드와 격리된다.
 *
 * ⚠️ 응답 수집 백엔드는 placeholder 상태. `public/survey-static.html`의 `GOOGLE_FORM` 매핑이
 * 채워지기 전까지 "Google Form으로 제출" 버튼은 미설정 안내를 띄우고, 클립보드/JSON 회신으로
 * 대체된다(이식 설계서 §2.5 Step 1~2: 실 폼 생성 후 entry.* ID 주입 시 활성화).
 */
export function SurveyPage(): JSX.Element {
  useEffect(() => {
    const prev = document.title;
    document.title = '시나리오 질의서 · KOAMI × KT DS';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <>
      <div className="page-band">
        <div className="page-band-inner">
          <div>
            <div className="label">의견 회신 · 설문</div>
            <h1 style={{ margin: '6px 0 0' }}>시나리오 · 데이터 확장 의견 수렴</h1>
            <div className="page-band-sub">
              시연을 보신 후 우선순위 · 데이터 확보 의향 · 일정 의견을 5분 내 회신 부탁드립니다.
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '20px 16px 40px' }}>
        <iframe
          src="/survey-static.html"
          title="시나리오 · 데이터 확장 의견 수렴 폼"
          style={{
            width: '100%',
            height: 'calc(100vh - 220px)',
            minHeight: 720,
            border: '1px solid var(--axis-line)',
            borderRadius: 12,
            background: 'var(--axis-paper-soft, #f9fafb)',
          }}
        />
      </div>
    </>
  );
}
