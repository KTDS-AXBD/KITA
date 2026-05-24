import { useTweaksStore } from '@/store';
import type {
  Flavor,
  Theme,
  HintsPosition,
  Top5Layout,
  LangMode,
} from '@/types';
import './tweaks.css';

interface RadioOption<V extends string> {
  value: V;
  label: string;
}

function RadioRow<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: RadioOption<V>[];
  onChange: (v: V) => void;
}): JSX.Element {
  return (
    <div className="twk-row">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <div className="twk-seg">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`twk-seg-btn ${o.value === value ? 'on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectRow<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: RadioOption<V>[];
  onChange: (v: V) => void;
}): JSX.Element {
  return (
    <div className="twk-row">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <select
        className="twk-field"
        value={value}
        onChange={(e) => onChange(e.target.value as V)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TweaksPanel(): JSX.Element {
  const flavor = useTweaksStore((s) => s.flavor);
  const theme = useTweaksStore((s) => s.theme);
  const hintsPosition = useTweaksStore((s) => s.hintsPosition);
  const top5Layout = useTweaksStore((s) => s.top5Layout);
  const langMode = useTweaksStore((s) => s.langMode);
  const panelOpen = useTweaksStore((s) => s.panelOpen);
  const setTweak = useTweaksStore((s) => s.set);
  const togglePanel = useTweaksStore((s) => s.togglePanel);
  const reset = useTweaksStore((s) => s.reset);

  return (
    <>
      <button
        type="button"
        className="twk-fab"
        onClick={togglePanel}
        aria-label={panelOpen ? 'Tweaks 닫기' : 'Tweaks 열기'}
        title="Tweaks · 디자인 변형"
      >
        {panelOpen ? '×' : '⚙'}
      </button>

      {panelOpen && (
        <div className="twk-panel" role="dialog" aria-label="Tweaks 패널">
          <div className="twk-hd">
            <b>Tweaks · 디자인 변형</b>
            <button
              type="button"
              className="twk-x"
              onClick={() => reset()}
              title="기본값으로 초기화"
            >
              ↺
            </button>
          </div>
          <div className="twk-body">
            <div className="twk-sect">플레이버</div>
            <RadioRow<Flavor>
              label="AXIS Flavor"
              value={flavor}
              options={[
                { value: 'classic', label: 'Classic 블루' },
                { value: 'foundry', label: 'Foundry 옐로' },
              ]}
              onChange={(v) => setTweak('flavor', v)}
            />

            <div className="twk-sect">테마</div>
            <RadioRow<Theme>
              label="Theme"
              value={theme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              onChange={(v) => setTweak('theme', v)}
            />

            <div className="twk-sect">레이아웃</div>
            <SelectRow<HintsPosition>
              label="Data Expansion Hints 위치"
              value={hintsPosition}
              options={[
                { value: 'right', label: '우측 영구 (기획서)' },
                { value: 'bottom', label: '하단 띠' },
                { value: 'modal', label: '모달 (Hint 버튼)' },
              ]}
              onChange={(v) => setTweak('hintsPosition', v)}
            />
            <RadioRow<Top5Layout>
              label="Top 5"
              value={top5Layout}
              options={[
                { value: 'table', label: '표' },
                { value: 'card', label: '카드' },
              ]}
              onChange={(v) => setTweak('top5Layout', v)}
            />

            <div className="twk-sect">언어</div>
            <RadioRow<LangMode>
              label="Header 라벨"
              value={langMode}
              options={[
                { value: 'ko', label: '한국어' },
                { value: 'en', label: 'EN' },
              ]}
              onChange={(v) => setTweak('langMode', v)}
            />
            <div
              style={{
                fontSize: 11,
                color: 'var(--axis-text-tertiary)',
                lineHeight: 1.5,
                marginTop: 4,
              }}
            >
              시연 대상이 일본 등일 가능성 대비. 본 시연은 한국어가 기본.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
