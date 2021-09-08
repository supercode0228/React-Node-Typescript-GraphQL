// TODO: Format

import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import skillColorMap from '../../../shared/data/skillColorMap.json';
import { ResolvedUserSkill, UserInfo } from '../../../shared/types';
import { userAvatarUrl } from '../../util/profile';
import { classNames } from '../../utilities/css';
import { Sector, SectorData } from '../Sector';
import styles from './SectorSkillsDisplay.module.scss';

export interface SectorSkillsDisplayProps {
  /** Skills to display */
  skills: ResolvedUserSkill[];
  /** User */
  user?: UserInfo | null;
  /** Scale */
  scale?: number;
  /** Whether or not the skills view is large */
  large?: boolean;
  /** Callback when skills changes */
  onChange?: (skills: ResolvedUserSkill[], immediate?: boolean) => void;
  /** Callback when a skill is clicked */
  onClick?: (skill: ResolvedUserSkill) => void;
}

export function SectorSkillsDisplay({
  skills,
  user,
  scale,
  large,
  onChange,
  onClick
}: SectorSkillsDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const nSkillLevels = skillColorMap.length;
  const axisCircleStartR = 70 * (scale || 1.0);
  const axisCircleR = 140 * (scale || 1.0);
  const axisLineR = 170 * (scale || 1.0);
  const skillRStep = (axisCircleR - axisCircleStartR) / nSkillLevels;

  const skillsToSectors = (skills: ResolvedUserSkill[]) => {
    return skills.map((s, a) => {
      return {
        name: s.skill.name,
        angleStart: -Math.PI / 2 + (a / skills.length) * Math.PI * 2,
        angleLength: Math.min(
          (1 / skills.length) * Math.PI * 2,
          Math.PI * 2 - 1e-4
        ),
        level: s.strength,
        r: axisCircleStartR + (s.strength + 1) * skillRStep,
        color: skillColorMap[s.strength],
        icon: s.skill.icon || ''
      };
    });
  };

  const [sectors, setSectors] = useState<SectorData[]>(skillsToSectors(skills));

  useEffect(() => {
    setSectors(skillsToSectors(skills));
  }, [skills]);

  useEffect(() => {
    function handleResize() {
      const svgTag = svgRef.current
      if (svgTag) {
        const gTag = svgTag.children[1];
        const scale = isMobile ? 0.8 : 1.0;
        gTag?.setAttribute('style', `transform: translate(${svgTag.clientWidth / 2}px, 50%) scale(${scale})`)
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  const onSectorClicked = (idx: number) => {
    onClick?.(skills[idx]);
  };

  const onSectorScaled = (idx: number, scaleR: number) => {
    if (!onChange) return;
    const newSectors = sectors.slice();
    newSectors[idx].level = Math.max(
      Math.min(
        Math.round((scaleR - axisCircleStartR) / skillRStep),
        nSkillLevels - 1
      ),
      0
    );
    newSectors[idx].r =
      axisCircleStartR + (newSectors[idx].level + 1) * skillRStep;
    newSectors[idx].color = skillColorMap[newSectors[idx].level];
    setSectors([...newSectors]);
    onChange(
      skills.map((s, i) => ({
        ...s,
        strength: newSectors[i].level
      }))
    );
  };

  const removeSkill = (idx: number) => {
    if (!onChange) return;
    const newSkills = skills.slice();
    newSkills.splice(idx, 1);
    const newSectors = sectors.slice();
    newSectors.splice(idx, 1);
    onChange(
      newSkills.map((s, i) => ({
        ...s,
        strength: newSectors[i].level
      })),
      true
    );
  };

  const svgClassName = classNames(styles.Svg, large && styles['Svg-large']);

  return (
    <div className={styles.SectorSkillsDisplay}>
      <svg ref={svgRef} className={svgClassName}>
        <defs>
          <filter
            id="drop-shadow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            {/* <feOffset result="offOut" in="SourceGraphic" dx="3" dy="5" /> */}
            <feOffset result="offOut" in="SourceAlpha" dx="3" dy="5" />
            <feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" />
            {/* <feBlend in="SourceGraphic" in2="blurOut" mode="normal" /> */}
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g>
          {_.range(
            axisCircleStartR,
            axisCircleR,
            (axisCircleR - axisCircleStartR) / nSkillLevels
          )
            .slice(1)
            .map((r, i) => (
              <circle
                key={r}
                className="axis-line"
                r={r}
                strokeDasharray="4 4"
              />
            ))}
          <circle className="axis-line" r={axisCircleR} />
          {sectors.map((s, i) => (
            <line
              key={i}
              className="axis-line"
              x1={0}
              y1={0}
              x2={axisLineR * Math.cos(s.angleStart)}
              y2={axisLineR * Math.sin(s.angleStart)}
            />
          ))}
          {sectors
            .slice()
            .reverse()
            .map((s, i) => (
              <Sector
                key={sectors.length - i - 1}
                root={svgRef}
                {...s}
                onClick={onSectorClicked.bind(null, sectors.length - i - 1)}
                onScale={onSectorScaled.bind(null, sectors.length - i - 1)}
                onIconClick={onSectorClicked.bind(null, sectors.length - i - 1)}
                scale={scale}
              />
            ))}
          <mask id="avatarMask">
            <circle r={19} x={0} y={0} style={{ fill: '#fff' }} />
          </mask>
          {user && (
            <>
              <circle r={21} x={0} y={0} style={{ fill: '#000' }} />
              <circle r={19} x={0} y={0} style={{ fill: '#fff' }} />
              <foreignObject width={38} height={38} x={-19} y={-19}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: `url(${userAvatarUrl(user)})`,
                    backgroundSize: 'cover',
                    borderRadius: '100%'
                  }}
                />
              </foreignObject>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
