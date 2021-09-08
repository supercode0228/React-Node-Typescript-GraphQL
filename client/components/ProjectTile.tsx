import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import Link from 'next/link';
import classNames from 'classnames';

import styles from './ProjectTile.module.scss';
import { UserJobExperienceInfo, TeamInfo, UserTeamInfo, TeamProjectInfo, UserProjectInfo } from "../../shared/types";
import MonthPicker from "./basic/MonthPicker";
import { relativeTiming } from '../util/time';
import { userAvatarUrl } from '../util/profile';

interface Props {
  data : TeamProjectInfo;
  onRemove? : () => void;
  onLeaveProject? : (id : string) => void;
};

const ProjectTile = ({ data, onRemove, onLeaveProject } : Props) => {
  return (
    <div className={classNames("extruded-surface", styles.wrapper)}>
      <div className={styles.info}>
        <div className={styles.name}>
          <Link href={`/project/${data.project.id}`}>
            <a>{data.project.name || '<New project>'}</a>
          </Link>
        </div>
        {(data.project.draft && data.project.myRole === 'owner') &&
          <div className={styles.options}>
            <Dropdown>
              <DropdownTrigger>
                <img src="/icons/arrow-small-down.svg" />
              </DropdownTrigger>
              <DropdownContent>
                <ul>
                  <li>
                    <a className="link" onClick={evt => onRemove?.()}>Remove</a>
                  </li>
                </ul>
              </DropdownContent>
            </Dropdown>
          </div>
        }
        {(!data.project.draft && data.project.myRole !== 'owner' && onLeaveProject) &&
          <div className={styles.options}>
            <Dropdown>
              <DropdownTrigger>
                <img src="/icons/arrow-small-down.svg" />
              </DropdownTrigger>
              <DropdownContent>
                <ul>
                  <li>
                    <a className="link" onClick={evt => onLeaveProject(data.project.id || '')}>👋 Leave Project</a>
                  </li>
                </ul>
              </DropdownContent>
            </Dropdown>
          </div>
        }
        <div className={styles.timing}>
          {relativeTiming(data.project.startTime, data.project.endTime)}
        </div>
      </div>

      <div className="mobile wide-spacer" style={{ margin: '0' }} />

      <div className={styles.otherStuff}>
        <div className={styles.members}>
          {data.project.users?.map((u, j) =>
            <Link key={j}  href={`/user/${u.user.alias}`}>
            <a>
              <div
                key={j}
                className={styles.memberAvatar}
                style={{
                  backgroundImage: `url(${userAvatarUrl(u.user)})`,
                  backgroundSize: 'cover'
                }}
                title={u.user.name}
              />
            </a>
            </Link>
          )}
        </div>


        <div className={styles.operations}>
          <Link href={`/project/${data.project.id}`}>
            <a>{data.project.draft ? 'View draft' : 'View Project'}</a>
          </Link>
        </div>
      </div>
    </div>
  )
};

export default ProjectTile;
