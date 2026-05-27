import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// ① Base (전역 공유): 폰트 · 기본 --axis-* 토큰 · 다크모드
import './styles/colors_and_type.css';
// AXIS DS 플레이버(foundry/classic) + .axis-* 프리미티브 — v0.1 디자인 본체
import './styles/axis-styles.css';
// ② Version Themes (스코프: [data-version]) — App.tsx가 활성 버전 세팅
import './versions/v0_1/theme.css';
import './versions/v0_2/theme.css';
// ③ App shell 스타일 (스코프 토큰 소비)
import './styles/app.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('#root element missing in index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
