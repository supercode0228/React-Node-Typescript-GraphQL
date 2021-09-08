import React, { useEffect, useState, useRef, useMemo } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import danGroups from '../../shared/data/skillDanGroups.json';
import { ResolvedUserSkill } from '../../shared/types';
import SkillDanIllustration from './SkillDanIllustration';
import skillColorMap from '../../shared/data/skillColorMap.json';

interface Props {
  skill : ResolvedUserSkill;
  onChange : (skill : ResolvedUserSkill) => void;
  onDone : () => void;
  onRemove : () => void;
};

const SkillDanEditor = ({ skill, onChange, onDone, onRemove } : Props) => {
  const [ showingInfo, setShowingInfo ] = useState(false);

  const onLevelChanged = (level : number) => {
    onChange({
      ...skill,
      strength: level,
    });
  };

  const levelSelected = skill.strength >= 0;
  const levelColor = levelSelected ? skillColorMap[skill.strength] : '#fff';
  const bgColor = levelSelected ? '#fff' : '#fff';

  return (
    <div
      className={classNames(
        'skill-dan-editor',
        { unselected: !levelSelected }
      )}
    >
      <div className="skill-name">{skill.skill.name}</div>
      <div className="skill-level-date">
        {skill.strength >= 0 ?
          <>
            { danGroups[Math.floor(skill.strength / 3)].name } since&nbsp;
            { moment(skill.modifiedTime).format('MMM YYYY') }
          </>
        :
        <>
          Skill level not set
        </>
        }
      </div>
      {levelSelected && 
        <img className="remove-skill" src="/icons/trash.svg" onClick={evt => onRemove() } title="Remove skill" />
      }
      <SkillDanIllustration selected={levelSelected} beltColor={levelColor} />
      <div 
        className="belt-color-list"
        style={{
          // backgroundColor: levelColor,
          // boxShadow: `0px 3px 8px ${levelColor}`,
          border: `2px solid ${levelColor}`,
        }}
      >
        {danGroups.map((g, i) =>
          <div key={i} className="belt-color-group">
            <div
              className="belt-group-name"
              style={{
                // color: skill.strength < 6 ? '#000' : '',
              }}
            >
              {g.name}
            </div>
            <div className="belt-colors">
              {g.skillLevels.map((l, j) =>
                <div 
                  key={j} 
                  className={classNames(
                    'belt-color',
                  )}
                  onClick={onLevelChanged.bind(null, l)}
                >
                  <div 
                    className={classNames(
                      'circle',
                      { selected: l === skill.strength },
                    )}
                    style={{
                      backgroundColor: skillColorMap[l],
                      // borderColor: (skill.strength !== l) ? levelColor : '',
                      // borderColor: (skill.strength === l) ? skillColorMap[l] : bgColor,
                    }}
                    onClick={onLevelChanged.bind(null, l)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <img 
          className="info-icon" 
          src="/icons/info.png" 
          onMouseEnter={evt => setShowingInfo(true)}
          onMouseLeave={evt => setShowingInfo(false)}
        />
        {showingInfo &&
          <div className="info">
            Just like in martial arts, you earn your skills.<br/>
            <strong>Pick the color</strong> that you believe represents
            your current skill level.<br/>
            <br/>
            Start at <span style={{ background: '#F6E39E', fontWeight: 'bold' }}>Beginner</span>, move on to <span style={{ background: '#B7FEE4', fontWeight: 'bold' }}>Intermediate</span><br/> 
            and finally land at <span style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>Expert</span>. 
          </div>
        }
      </div>
      <div 
        className="btn done-btn" 
        style={{ visibility: skill.strength >= 0 ? 'visible' : 'hidden' }}
        onClick={evt => onDone()}
      >
        Done
      </div>
    </div>
  );
};

export default SkillDanEditor;
