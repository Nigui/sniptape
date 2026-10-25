import type { SVGProps } from "react";

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function TrimStartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 10v4M6 8v8" opacity={0.35} />
      <path d="M12 4H9.5v16H12" />
      <path d="M15.5 8v8M19.5 6v12" />
    </svg>
  );
}

export function TrimEndIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 6v12M8.5 8v8" />
      <path d="M12 4h2.5v16H12" />
      <path d="M18 8v8M21 10v4" opacity={0.35} />
    </svg>
  );
}
