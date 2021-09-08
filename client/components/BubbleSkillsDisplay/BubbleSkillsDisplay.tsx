// TODO: Format

import {
  forceCenter,
  forceCollide,
  forceManyBody,
  forceSimulation
} from 'd3-force';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ResolvedUserSkill,
  ResolvedAggregatedSkill
} from '../../../shared/types';
import { randomStr } from '../../../shared/util/str';
import { classNames } from '../../utilities/css';
import { Bubble, baseBubbleR } from '../Bubble';
import styles from './BubbleSkillsDisplay.module.scss';

interface SkillNode {
  id: string;
  name: string;
  x: number;
  y: number;
  r: number;
  type: string;
  count?: number;
  unavailableCount?: number;
}

export interface BubbleSkillsDisplayProps {
  /** Skills to display */
  skills: (ResolvedUserSkill | ResolvedAggregatedSkill)[];
  /** Whether or not the skills are editable */
  editable?: boolean;
  /** Scale */
  scale?: number;
  /** Whether or not the skills view is large */
  large?: boolean;
  /** Override default unavailability style */
  unavailabilityStyle?: { color: string; background: string };
  /** Callback when skills changes */
  onChange?: (skills: ResolvedUserSkill[]) => void;
  /** Callback when a skill is clicked */
  onClick?: (skill: ResolvedUserSkill) => void;
}

export function BubbleSkillsDisplay({
  skills,
  editable,
  scale,
  large,
  unavailabilityStyle,
  onChange,
  onClick
}: BubbleSkillsDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const myId = useMemo(() => randomStr(8), []);

  const targetTotalR =
    Math.pow(Math.max(skills.length, 1), 0.5) * 90 * (scale || 1.0);

  const skillsToNodes = (
    skills: ResolvedUserSkill[],
    existingNodes?: SkillNode[]
  ) => {
    return skills.map((s, i) => {
      const angle = (i / skills.length) * Math.PI * 2;
      const existingNode = existingNodes
        ? existingNodes.find((n) => n.id === s.skill.id)
        : null;
      return {
        id: s.skill.id,
        name: s.skill.name,
        x: existingNode?.x || 130 * Math.cos(angle) + 290,
        y: existingNode?.y || 130 * Math.sin(angle) + 210,
        r:
          (s.strength * targetTotalR) /
          skills.reduce((a, b) => a + b.strength, 0),
        type: s.skill.type,
        count: (s as ResolvedAggregatedSkill).userCount,
        unavailableCount: (s as ResolvedAggregatedSkill).unavailableCount
      };
    }) as SkillNode[];
  };
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(
    skillsToNodes(skills)
  );
  const [simulation, setSimulation] = useState(forceSimulation(skillNodes));
  useEffect(() => {
    simulation.stop();
    const nodes = skillsToNodes(skills, skillNodes);
    normalizeSkillNodes(nodes);
    setSkillNodes(nodes);
    setSimulation(forceSimulation(nodes));
  }, [skills]);

  useEffect(() => {
    simulation
      .force('charge', forceManyBody().strength(100))
      .force(
        'collide',
        forceCollide((d: SkillNode) => d.r + 1)
      )
      .force(
        'center',
        forceCenter(
          (svgRef.current?.clientWidth || 100) / 2,
          (svgRef.current?.clientHeight || 100) / 2
        )
      )
      .force(
        'container',
        forceContainer([
          [0, 0],
          [svgRef.current?.clientWidth || 0, svgRef.current?.clientHeight || 0]
        ])
      )
      .on('tick', () => {
        const simNodes = simulation.nodes();
        if (skillNodes.length !== simNodes.length) return;
        skillNodes.forEach((n, i) => {
          n.x = simNodes[i].x;
          n.y = simNodes[i].y;
        });

        setSkillNodes([...skillNodes]);
      });
  }, [simulation, svgRef.current]);

  const baseMaxR = targetTotalR * 0.34;
  const dMaxR = targetTotalR * 0.32;
  const maxR = baseMaxR + dMaxR / Math.max(skills.length - 1.0, 1.0);
  const minR = targetTotalR * 0.05;
  const normalizeTotalNodeR = (skillNodes: SkillNode[]) => {
    const totalR = skillNodes.reduce((a, b) => a + b.r, 0);
    skillNodes.forEach((n, j) => {
      n.r *= targetTotalR / totalR;
    });
  };
  const normalizeSkillNodes = (skillNodes: SkillNode[]) => {
    normalizeTotalNodeR(skillNodes);
    // Apply size limits for the individual nodes
    skillNodes.forEach((n, j) => {
      n.r = Math.min(Math.max(n.r, minR), maxR);
    });
    normalizeTotalNodeR(skillNodes);
  };

  const bubbleClicked = (idx: number) => {
    if (!editable) return;
    skillNodes[idx].r = Math.min(skillNodes[idx].r * 1.15, maxR);
    normalizeSkillNodes(skillNodes);
    setSkillNodes([...skillNodes]);

    onChange?.(
      skills.map((s, i) => ({
        ...s,
        strength: skillNodes[i].r / targetTotalR
      }))
    );

    simulation.force(
      'collide',
      forceCollide((d: SkillNode) => d.r + 1)
    );
    simulation.alpha(0.5);
    simulation.restart();
  };

  const bubbleScaled = (idx: number, delta: number) => {
    if (!editable) return;
    skillNodes[idx].r = Math.min(skillNodes[idx].r * delta, maxR);
    normalizeSkillNodes(skillNodes);
    setSkillNodes([...skillNodes]);

    onChange?.(
      skills.map((s, i) => ({
        ...s,
        strength: skillNodes[i].r / targetTotalR
      }))
    );

    simulation.force(
      'collide',
      forceCollide((d: SkillNode) => d.r + 1)
    );
    simulation.alpha(0.5);
    simulation.restart();
  };

  const svgClassName = classNames(styles.Svg, large && styles['Svg-large']);

  return (
    <div className={styles.BubbleSkillsDisplay}>
      <svg ref={svgRef} className={svgClassName}>
        <defs>
          {skillNodes.map((s, i) => {
            if (s.unavailableCount == null)
              return <React.Fragment key={i}></React.Fragment>;
            const r = baseBubbleR * 1.3;
            const angleLength =
              Math.max(
                Math.min(
                  (s.unavailableCount || 0) / Math.max(s.count || 1, 1),
                  1.0 - 1e-6
                ),
                1e-6
              ) *
              Math.PI *
              2;
            const angleStart = -Math.PI / 4 + (Math.PI * 2 - angleLength) / 2;

            const availableArcPath = `A ${r} ${r} 0 ${
              Math.PI * 2 - angleLength > Math.PI ? 1 : 0
            } 0 ${r * Math.cos(angleStart + angleLength)} ${
              r * Math.sin(angleStart + angleLength)
            }`;
            const unavailableArcPath = `A ${r} ${r} 0 ${
              angleLength > Math.PI ? 1 : 0
            } 1 ${r * Math.cos(angleStart + angleLength)} ${
              r * Math.sin(angleStart + angleLength)
            }`;

            return (
              <React.Fragment key={i}>
                <clipPath id={`availability-clip-${myId}-${i}`}>
                  <path
                    // fill="#FFCFCF"
                    // style={{ filter: skillType === 'soft' ? "url(#soft)" : '' }}
                    d={`M0 0 ${r * Math.cos(angleStart)} ${
                      r * Math.sin(angleStart)
                    }${availableArcPath}`}
                  />
                </clipPath>
                <clipPath id={`unavailability-clip-${myId}-${i}`}>
                  <path
                    // fill="#FFCFCF"
                    // style={{ filter: skillType === 'soft' ? "url(#soft)" : '' }}
                    d={`M0 0 ${r * Math.cos(angleStart)} ${
                      r * Math.sin(angleStart)
                    }${unavailableArcPath}`}
                  />
                </clipPath>
              </React.Fragment>
            );
          })}
        </defs>
        {skillNodes.map((skill, i) => (
          <Bubble
            key={i}
            availableClipId={`availability-clip-${myId}-${i}`}
            unavailableClipId={`unavailability-clip-${myId}-${i}`}
            {...skill}
            skillType={skill.type}
            icon={i < skills.length ? skills[i].skill.icon : undefined}
            onClick={
              editable
                ? bubbleClicked.bind(null, i)
                : onClick?.bind(null, skills[i])
            }
            onScale={editable ? bubbleScaled.bind(null, i) : undefined}
            unavailabilityStyle={unavailabilityStyle}
          />
        ))}
      </svg>
    </div>
  );
}

function forceContainer(bbox: number[][]) {
  var nodes: SkillNode[];
  var strength = 1;

  if (!bbox || bbox.length < 2)
    bbox = [
      [0, 0],
      [100, 100]
    ];

  function force(alpha: number) {
    var i,
      n = nodes.length,
      node,
      x = 0,
      y = 0,
      r = 0;
    const padding = 20;

    for (i = 0; i < n; ++i) {
      (node = nodes[i]), (x = node.x), (y = node.y), (r = node.r + padding);

      if (x - r < bbox[0][0])
        (node as any).vx += (bbox[0][0] - (x - r)) * alpha;
      if (y - r < bbox[0][1])
        (node as any).vy += (bbox[0][1] - (y - r)) * alpha;
      if (x + r > bbox[1][0])
        (node as any).vx += (bbox[1][0] - (x + r)) * alpha;
      if (y + r > bbox[1][1])
        (node as any).vy += (bbox[1][1] - (y + r)) * alpha;
    }
  }

  force.initialize = function (_: SkillNode[]) {
    nodes = _;
  };

  force.bbox = function (_: number[][]) {
    return arguments.length ? ((bbox = _), force) : bbox;
  };
  force.strength = function (_: number) {
    return arguments.length ? ((strength = +_), force) : strength;
  };

  return force;
}
