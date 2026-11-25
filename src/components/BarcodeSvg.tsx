import React from 'react';

interface BarcodeSvgProps {
  code: string;
  height?: number;
  className?: string;
}

/**
 * Deterministic crisp Code128-style barcode SVG for in-store POS presentation.
 */
export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  code,
  height = 84,
  className = 'w-full max-w-[340px]',
}) => {
  const seed = code || 'FR-2025-0849-5510';
  const bars: Array<{ x: number; w: number }> = [];
  let cursor = 8;

  // Start guard bars
  bars.push({ x: cursor, w: 3 });
  cursor += 5;
  bars.push({ x: cursor, w: 2 });
  cursor += 5;

  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    const w1 = ((ch >> 0) % 3) + 1.5;
    const g1 = ((ch >> 2) % 2) + 1.5;
    const w2 = ((ch >> 3) % 3) + 1;
    const g2 = ((ch >> 5) % 2) + 1.5;
    bars.push({ x: cursor, w: w1 });
    cursor += w1 + g1;
    bars.push({ x: cursor, w: w2 });
    cursor += w2 + g2;
  }

  // End guard bars
  bars.push({ x: cursor, w: 2 });
  cursor += 4;
  bars.push({ x: cursor, w: 3.5 });
  cursor += 11;

  return (
    <svg
      viewBox={`0 0 ${Math.ceil(cursor)} ${height}`}
      className={className}
      role="img"
      aria-label={`POSバーコード ${code}`}
    >
      <rect x="0" y="0" width={Math.ceil(cursor)} height={height} fill="#ffffff" />
      {bars.map((b, idx) => (
        <rect
          key={idx}
          x={b.x}
          y={4}
          width={b.w}
          height={height - 8}
          fill="#111c2d"
        />
      ))}
    </svg>
  );
};
