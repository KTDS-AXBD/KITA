import type { ReactNode, SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

interface InternalProps extends IconProps {
  d?: string;
  paths?: ReactNode;
}

function I({ d, paths, size = 16, ...rest }: InternalProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths ?? (d ? <path d={d} /> : null)}
    </svg>
  );
}

export const ArrowRight = (p: IconProps): JSX.Element => (
  <I {...p} paths={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} />
);
export const ChevronRight = (p: IconProps): JSX.Element => <I {...p} d="M9 18l6-6-6-6" />;
export const ChevronDown = (p: IconProps): JSX.Element => <I {...p} d="M6 9l6 6 6-6" />;
export const Check = (p: IconProps): JSX.Element => <I {...p} d="M20 6L9 17l-5-5" />;
export const X = (p: IconProps): JSX.Element => (
  <I {...p} paths={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />
);
export const Search = (p: IconProps): JSX.Element => (
  <I {...p} paths={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
);
export const Send = (p: IconProps): JSX.Element => (
  <I {...p} paths={<><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>} />
);
export const Sparkles = (p: IconProps): JSX.Element => (
  <I {...p} d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
);
export const Info = (p: IconProps): JSX.Element => (
  <I {...p} paths={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>} />
);
export const AlertTriangle = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    }
  />
);
export const Database = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </>
    }
  />
);
export const Activity = (p: IconProps): JSX.Element => <I {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />;
export const TrendingUp = (p: IconProps): JSX.Element => (
  <I {...p} paths={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>} />
);
export const TrendingDown = (p: IconProps): JSX.Element => (
  <I {...p} paths={<><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>} />
);
export const Filter = (p: IconProps): JSX.Element => <I {...p} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
export const Settings = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    }
  />
);
export const Layers = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </>
    }
  />
);
export const Network = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <line x1="12" y1="7" x2="6" y2="17" />
        <line x1="12" y1="7" x2="18" y2="17" />
        <line x1="7" y1="19" x2="17" y2="19" />
      </>
    }
  />
);
export const FileText = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    }
  />
);
export const ExternalLink = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </>
    }
  />
);
export const Beaker = (p: IconProps): JSX.Element => (
  <I {...p} d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3M6 14h12" />
);
export const Cpu = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </>
    }
  />
);
export const Globe = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    }
  />
);
export const Eye = (p: IconProps): JSX.Element => (
  <I
    {...p}
    paths={
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    }
  />
);
