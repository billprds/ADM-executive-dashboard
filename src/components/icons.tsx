/* Icon set — hand-picked, all 16px, 1.5px stroke, inherit currentColor.
   No icon library dependency; keeps bundle small and design consistent. */

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  };
}

export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="2" width="5" height="5" rx="0.5" />
    <rect x="9" y="2" width="5" height="5" rx="0.5" />
    <rect x="2" y="9" width="5" height="5" rx="0.5" />
    <rect x="9" y="9" width="5" height="5" rx="0.5" />
  </svg>
);

export const IconTimeline = (p: IconProps) => (
  <svg {...base(p)}>
    <line x1="2" y1="4" x2="14" y2="4" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="12" x2="14" y2="12" />
    <rect x="4" y="2.75" width="4" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
    <rect x="7" y="6.75" width="5" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
    <rect x="3" y="10.75" width="6" height="2.5" rx="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6" cy="5.5" r="2.25" />
    <path d="M2 13.25c0-2.2 1.79-4 4-4s4 1.8 4 4" />
    <circle cx="11.5" cy="6" r="1.75" />
    <path d="M9.5 10c.5-.35 1.24-.5 2-.5 1.66 0 3 1.34 3 3" />
  </svg>
);

export const IconEffort = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="2.5" width="12" height="11" rx="1" />
    <line x1="5" y1="5.5" x2="11" y2="5.5" />
    <line x1="5" y1="8" x2="11" y2="8" />
    <line x1="5" y1="10.5" x2="8.5" y2="10.5" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="7" cy="7" r="4.25" />
    <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" />
  </svg>
);

export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13.5 3v3.5h-3.5" />
    <path d="M2.5 13v-3.5h3.5" />
    <path d="M13 6.5A5.5 5.5 0 0 0 3 5" />
    <path d="M3 9.5A5.5 5.5 0 0 0 13 11" />
  </svg>
);

export const IconAlert = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 2l6 11H2L8 2z" />
    <line x1="8" y1="6.5" x2="8" y2="9.5" />
    <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8.5l3 3 7-7" />
  </svg>
);

export const IconDiamond = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 2l5 6-5 6-5-6 5-6z" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 3.5l4.5 4.5-4.5 4.5" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 6l4.5 4.5 4.5-4.5" />
  </svg>
);

export const IconCircle = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="5.5" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 5v3l2 1.5" />
  </svg>
);

export const IconRocket = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 2c2.5 0 4.5 2 5 4l-3.5 3.5-2-2L11 4l-3 3.5-2-2z" />
    <path d="M6 10l-2 2 2 2 2-2" />
  </svg>
);
