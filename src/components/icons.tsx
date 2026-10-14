import type { SVGProps } from 'react';
export interface IconProps extends SVGProps<SVGSVGElement> { size?: number; }
function base({ size = 16, ...rest }: IconProps) {
  return { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...rest };
}
export const IconGrid      = (p: IconProps) => <svg {...base(p)}><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg>;
export const IconTimeline  = (p: IconProps) => <svg {...base(p)}><path d="M1.5 4h13M1.5 8h8M1.5 12h10"/></svg>;
export const IconUsers     = (p: IconProps) => <svg {...base(p)}><circle cx="6" cy="5" r="2.5"/><path d="M1 13.5c0-2.5 2-4 5-4s5 1.5 5 4"/><circle cx="12" cy="5" r="2"/><path d="M14.5 13c0-2-1.4-3.2-3.5-3.5"/></svg>;
export const IconEffort    = (p: IconProps) => <svg {...base(p)}><rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path d="M5 8h6M8 5v6"/></svg>;
export const IconSettings  = (p: IconProps) => <svg {...base(p)}><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v1.75M8 12.75V14.5M1.5 8h1.75M12.75 8H14.5M3.2 3.2l1.24 1.24M11.56 11.56l1.24 1.24M3.2 12.8l1.24-1.24M11.56 4.44l1.24-1.24"/></svg>;
export const IconSearch    = (p: IconProps) => <svg {...base(p)}><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>;
export const IconRefresh   = (p: IconProps) => <svg {...base(p)}><path d="M13.5 2.5A6.5 6.5 0 1 1 6 1.5H9M9 1.5L6.5 4M9 1.5L6.5-1"/></svg>;
export const IconChevronRight = (p: IconProps) => <svg {...base(p)}><path d="M6 12l4-4-4-4"/></svg>;
export const IconDiamond   = (p: IconProps) => <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 1.5L14.5 8 8 14.5 1.5 8z"/></svg>;
export const IconAlert     = (p: IconProps) => <svg {...base(p)}><path d="M8 2L14.5 13H1.5L8 2z"/><path d="M8 7v3M8 11.5v.5"/></svg>;
export const IconMoon      = (p: IconProps) => <svg {...base(p)}><path d="M12 12.5A6 6 0 0 1 5.5 4a6 6 0 1 0 6.5 8.5z"/></svg>;
export const IconSun       = (p: IconProps) => <svg {...base(p)}><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7"/></svg>;
export const IconEdit      = (p: IconProps) => <svg {...base(p)}><path d="M11 2.5l2.5 2.5-8 8H3V10.5l8-8z"/></svg>;
