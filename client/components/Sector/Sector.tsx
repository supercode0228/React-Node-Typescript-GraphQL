/**
 * @format
 */

import React, { useRef } from 'react';
import { useGesture } from 'react-use-gesture';
import { maybeClipStr } from '../../../shared/util/str';
import Tooltip from '../basic/Tooltip';
import styles from './Sector.module.scss';

export interface SectorData {
  name: string;
  angleStart: number;
  angleLength: number;
  level: number;
  r: number;
  color: string;
  icon: string;
}

export interface SectorProps extends SectorData {
  root: React.RefObject<SVGSVGElement>;
  onClick: () => void;
  onScale: (delta: number) => void;
  onIconClick: () => void;
  scale?: number;
}

export function Sector({
  root,
  name,
  angleStart,
  angleLength,
  r,
  color,
  icon,
  onClick,
  onScale,
  onIconClick,
  scale = 1.0
}: SectorProps) {
  const ref = useRef<SVGPathElement>(null);

  function renderIcon() {
    const size = 32;
    const r = 180 * scale;
    const x = r * Math.cos(angleStart + angleLength / 2) - size / 2;
    const y = r * Math.sin(angleStart + angleLength / 2) - size / 2;

    return (
      <foreignObject width={size} height={size} x={x} y={y}>
        <Tooltip tooltip={name} hideArrow={true} trigger="hover">
          <div
            className="software-skill-sector-icon"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundImage: `url("data:image/png;base64,${icon}")`,
              backgroundSize: 'contain'
            }}
            onClick={() => onIconClick()}
          />
        </Tooltip>
      </foreignObject>
    );
  }

  function renderLabel() {
    const dotSize = 5;
    const dotR = 165 * scale;
    const dotX = dotR * Math.cos(angleStart + angleLength / 2) - dotSize / 2;
    const dotY = dotR * Math.sin(angleStart + angleLength / 2) - dotSize / 2;

    const labelWidth = 80;
    const labelHeight = 40;
    const labelX = dotX < -10 ? dotX - 85 : dotX + 10;
    const labelY = dotY - 8;

    return (
      <>
        <foreignObject width={dotSize} height={dotSize} x={dotX} y={dotY}>
          <div className={styles.Dot} />
        </foreignObject>

        <foreignObject
          width={labelWidth}
          height={labelHeight}
          x={labelX}
          y={labelY}
        >
          <div
            className={styles.Label}
            style={{ textAlign: dotX < -10 ? 'right' : 'left' }}
            onClick={onClick}
          >
            {maybeClipStr(name, 25)}
          </div>
        </foreignObject>
      </>
    );
  }

  const bind = useGesture(
    {
      onDrag: ({ down, first, last, xy, movement: [mx, my], memo, event }) => {
        if (last && Math.abs(mx) < 2 && Math.abs(my) < 2) {
          onClick();
        }

        if (!root.current) {
          return first ? r : memo;
        }

        if (!down) {
          return first ? r : memo;
        }

        const [cx, cy] = [
          ((root.current?.getBoundingClientRect().right || 0) +
            (root.current?.getBoundingClientRect().left || 0)) /
            2,
          ((root.current?.getBoundingClientRect().top || 0) +
            (root.current?.getBoundingClientRect().bottom || 0)) /
            2
        ];

        const centerDist = Math.sqrt(
          Math.pow(xy[0] - cx, 2) + Math.pow(xy[1] - cy, 2)
        );

        const dist = Math.abs(mx) > 2 || Math.abs(my) > 2 ? centerDist : r;
        if (!first) {
          onScale(dist);
        }

        if (!last) {
          event?.preventDefault();
        }

        return dist;
      }
    },
    {
      domTarget: ref.current,
      event: { passive: false }
    }
  );

  const arcPath = `A ${r} ${r} 0 ${angleLength > Math.PI ? 1 : 0} 1 ${
    r * Math.cos(angleStart + angleLength)
  } ${r * Math.sin(angleStart + angleLength)}`;

  return (
    <>
      <path
        ref={ref}
        {...bind()}
        fill={color}
        filter={`url(#drop-shadow)`}
        d={`M0 0 ${r * Math.cos(angleStart)} ${
          r * Math.sin(angleStart)
        }${arcPath}`}
      />
      {icon ? renderIcon() : renderLabel()}
    </>
  );
}
