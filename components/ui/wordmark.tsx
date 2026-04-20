import * as React from "react";

export function Wordmark({
  className,
  hideDot = false,
  fill = "#FFFFFF",
  dot = "#FF006E",
}: {
  className?: string;
  hideDot?: boolean;
  fill?: string;
  dot?: string;
}) {
  return (
    <svg viewBox="0 0 900 200" className={className} aria-label="XAKE">
      <g transform="translate(60, 30)">
        <path
          d="M 0 0 L 70 70 L 0 140"
          fill="none"
          stroke={fill}
          strokeWidth="22"
          strokeLinecap="square"
        />
        <path
          d="M 180 0 L 110 70 L 180 140"
          fill="none"
          stroke={fill}
          strokeWidth="22"
          strokeLinecap="square"
        />
      </g>
      <g fill={fill} fontFamily="Archivo" fontWeight="900" fontSize="180" letterSpacing="-4">
        <text x="300" y="170">A</text>
        <text x="470" y="170">K</text>
        <text x="640" y="170">E</text>
      </g>
      {!hideDot && <circle cx="150" cy="100" r="4" fill={dot} />}
    </svg>
  );
}

export function Monogram({
  className,
  fill = "#FFFFFF",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="XAKE">
      <path d="M 10 10 L 50 50 L 10 90 L 26 90 L 50 62 L 50 38 Z" fill={fill} />
      <path d="M 90 10 L 50 50 L 90 90 L 74 90 L 50 62 L 50 38 Z" fill={fill} />
    </svg>
  );
}
