import { ConnectionLineComponentProps } from '@xyflow/react';

export function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
}: ConnectionLineComponentProps) {
  return (
    <g>
      <path
        d={`M ${fromX},${fromY} Q ${fromX + (toX - fromX) / 2},${fromY} ${toX},${toY}`}
        stroke="hsl(var(--primary))"
        strokeWidth={3}
        fill="none"
        strokeDasharray="5,5"
        className="animate-dash"
      />
      <circle
        cx={toX}
        cy={toY}
        r={4}
        fill="hsl(var(--primary))"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
}
