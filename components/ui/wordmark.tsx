import * as React from "react";

/**
 * XAKE lockup — Terminal register.
 * Chevron prompt + lowercase JetBrains Mono + green cursor block.
 */
export function Wordmark({
  className,
  hideCursor = false,
  fill = "#F5F5F5",
  cursor = "#00FF66",
}: {
  className?: string;
  hideCursor?: boolean;
  fill?: string;
  cursor?: string;
}) {
  return (
    <svg viewBox="0 0 900 200" className={className} aria-label="xake">
      <g transform="translate(70, 55)">
        <path
          d="M 0 0 L 50 45 L 0 90"
          fill="none"
          stroke={fill}
          strokeWidth="20"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </g>
      <g
        fill={fill}
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontWeight="700"
        fontSize="140"
        letterSpacing="-4"
      >
        <text x="200" y="160">xake</text>
      </g>
      {!hideCursor && <rect x="620" y="52" width="42" height="110" fill={cursor} />}
    </svg>
  );
}

/** Monogram — chevron glyph with terminal cursor block. */
export function Monogram({
  className,
  fill = "#F5F5F5",
  cursor = "#00FF66",
}: {
  className?: string;
  fill?: string;
  cursor?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="xake">
      <path
        d="M 28 22 L 60 50 L 28 78"
        fill="none"
        stroke={fill}
        strokeWidth="14"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="68" y="42" width="14" height="16" fill={cursor} />
    </svg>
  );
}
