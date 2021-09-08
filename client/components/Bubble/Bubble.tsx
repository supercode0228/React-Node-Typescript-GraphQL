// TODO: Format

import React, { useMemo, useRef } from 'react';
import { useSpring, animated as a } from 'react-spring';
import { useGesture } from 'react-use-gesture';
import uniqid from 'uniqid';
import { maybeSplitLine } from '../../../shared/util/str';

export interface BubbleProps {
  availableClipId: string;
  unavailableClipId: string;
  name: string;
  x: number;
  y: number;
  r: number;
  icon?: string;
  skillType?: string;
  onClick?: () => void;
  onScale?: (delta: number) => void;
  count?: number;
  unavailableCount?: number;
  unavailabilityStyle?: { color: string; background: string };
}

export const baseBubbleR = 60;

export function Bubble({
  availableClipId,
  unavailableClipId,
  name,
  x,
  y,
  r,
  icon,
  skillType,
  onClick,
  onScale,
  count,
  unavailableCount,
  unavailabilityStyle
}: BubbleProps) {
  const selfRef = useRef<SVGGraphicsElement>(null);
  const uniqueId = uniqid();

  const animatedProps = useSpring({
    xyr: [x, y, r],
    config: { tension: 400 }
  });

  const bind = useGesture(
    {
      onDrag: ({
        down,
        first,
        last,
        xy,
        movement: [mx, my],
        delta: [dx, dy],
        memo,
        event
      }) => {
        if (last && Math.abs(mx) < 2 && Math.abs(my) < 2) onClick?.();
        if (!onScale) return;
        if (!down) return 0;
        const centerDist = Math.sqrt(
          Math.pow(xy[0] - x, 2) + Math.pow(xy[1] - y, 2)
        );
        if (!first) onScale(Math.pow(1.01, -dy));

        if (!last) event?.preventDefault();
        return centerDist;
      }
    },
    {
      domTarget: selfRef,
      event: { passive: false }
    }
  );

  const iconSize = 32;
  const scale = (r / baseBubbleR) * 1.0;

  const nameParts = useMemo(() => {
    let parts = maybeSplitLine(name, 10);
    if (parts.length > 3) parts = [...parts.slice(0, 2), parts[2] + '...'];
    return parts;
  }, [name]);
  const availableCount = count ? count - (unavailableCount || 0) : undefined;

  const baseLayer = (textColor: string, circleColor: string) => {
    return (
      <>
        {skillType === 'soft' && (
          <filter id="soft">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" colorInterpolationFilters="sRGB" />
          </filter>
        )}
        <circle
          r={baseBubbleR}
          style={{
            filter: skillType === 'soft' ? 'url(#soft)' : '',
            fill: circleColor
          }}
        />
        {icon ? (
          <>
            <text
              style={{
                fontSize: nameParts.length > 1 ? '10px' : '12px',
                fill: textColor
              }}
            >
              {nameParts.map((p, i) => (
                <tspan
                  key={i}
                  x={0}
                  y={`${
                    i -
                    nameParts.length / 2 +
                    0.8 +
                    (nameParts.length > 1 ? 4.2 : 3.5)
                  }em`}
                >
                  {p}
                </tspan>
              ))}
            </text>
          </>
        ) : (
          <text style={{ fill: textColor }} textAnchor="middle">
            {nameParts.map((p, i) => (
              <tspan key={i} x={0} y={`${i - nameParts.length / 2 + 0.8}em`}>
                {p}
              </tspan>
            ))}
          </text>
        )}
      </>
    );
  };

  return (
    <a.g
      {...bind()}
      className="dynamic-bubble"
      style={{
        transform: animatedProps.xyr.to(
          (x, y, r) => `translate(${x}px,${y}px) scale(${scale})`
        )
      }}
      ref={selfRef}
    >
      {(!availableCount && !unavailableCount) &&
        <>
          <g id={uniqueId}>
            {baseLayer('#fff', '#000')}
          </g>
          <use clipPath={`url(#${availableClipId})`} xlinkHref={`#${uniqueId}`} />
        </>
      }
      {availableCount && (
        <g clipPath={`url(#${availableClipId})`}>
          {baseLayer('#fff', '#000')}
        </g>
      )}
      {unavailableCount != null && (
        <g clipPath={`url(#${unavailableClipId})`}>
          {baseLayer(
            unavailabilityStyle?.color || '#A55454',
            unavailabilityStyle?.background || '#F8D247'
          )}
        </g>
      )}

      {icon && (
        <>
          <circle
            r={iconSize / 2 + 8}
            x={-iconSize / 2}
            y={-iconSize / 2}
            style={{ fill: '#fff' }}
          />
          <image
            width={iconSize}
            height={iconSize}
            x={-iconSize / 2}
            y={-iconSize / 2}
            href={'data:image/png;base64,' + icon}
          />
        </>
      )}
      {availableCount && (
        <g
          style={{
            transform: `translate(${
              (baseBubbleR * Math.sqrt(2)) / 2 - 0 * scale
            }px,${-((baseBubbleR * Math.sqrt(2)) / 2 - 0 * scale)}px) scale(${
              1.0 / scale
            })`
          }}
        >
          <circle r={11} x={-11} y={-11} style={{ fill: '#000' }} />
          <circle r={10} x={-10} y={-10} style={{ fill: '#fff' }} />
          <text style={{ fontSize: '10px', fill: '#000' }}>
            <tspan x={0} y={3}>
              {availableCount < 100 ? availableCount : '99+'}
            </tspan>
          </text>
        </g>
      )}
    </a.g>
  );
}
