import { withApollo } from '../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Modal from 'react-modal';
import noScroll from 'no-scroll';

import { resolveQuery } from '../util/graphqlHelpers';
import { GET_TEAM } from '../graphql/team';
import { TeamInfo } from '../../shared/types';
import TeamInviteDialog from '../components/TeamInviteDialog';
import { teamAvatarUrl } from '../util/profile';
import { responsiveShrinkOrClipStr } from '../util/responsive';

interface Props {
  alias : string;
};

const TeamHeader = ({ alias } : Props) => {
  const router = useRouter();

  // FIXME: should only be viewable by the team members

  const { data } = useQuery(GET_TEAM, {
    variables: { alias },
  });
  const teamInfo = useMemo(resolveQuery<TeamInfo | null>(data, 'team', null), [data]);

  const [ inviting, setInviting ] = useState(false);

  // Modal.setAppElement('body');

  return (
    <>
      {teamInfo &&
      <>
        <div className="header team-header">
          <div className="container">
            <div className="block-left">
              <div
                className="avatar"
                style={{
                  backgroundImage: `url(${teamAvatarUrl(teamInfo)})`,
                  backgroundSize: 'cover'
                }}
              />
              <div className="info">
                <Link href={`/team/${teamInfo.alias}`}>
                  <a>
                    <div className="name" title={teamInfo.name}>
                      {responsiveShrinkOrClipStr(teamInfo.name!, 16, 48)}
                    </div>
                  </a>
                </Link>
                {teamInfo.myRole === 'owner' &&
                  <Link href={`/team/${teamInfo.alias}/settings`}>
                    <a><button className="btn-slim edit-btn">Edit team</button></a>
                  </Link>
                }
              </div>
            </div>

            <div className="block-center">
              <div className="aligner">
                <div className="stats">
                  <div className="stat">
                    <Link href={`/team/${teamInfo.alias}/members`}>
                      <a>
                        <span className="value">{teamInfo.users?.length || 0}</span>
                        <span className="label"> Members</span>
                      </a>
                    </Link>
                  </div>

                  <div className="stat">
                    <Link href={`/team/${teamInfo.alias}/projects`}>
                      <a>
                        <span className="value">{teamInfo.projects?.length || 0}</span>
                        <span className="label"> Projects</span>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="block-right">

              {['owner', 'admin'].includes(teamInfo.myRole || '') &&
                <button className="btn save-btn" onClick={evt => { setInviting(true); noScroll.on(); }}>
                  Invite
                </button>
              }
              <Modal
                isOpen={inviting}
                // onRequestClose={(evt) => { setInviting(false); noScroll.off() }}
                style={{
                  content : {
                    top                   : '50%',
                    left                  : '50%',
                    right                 : 'auto',
                    bottom                : 'auto',
                    marginRight           : '-50%',
                    transform             : 'translate(-50%, -50%)',
                    position: 'relative',
                    width: 'fit-content',
                    border: '0',
                    borderRadius: '10px',
                    padding: '30px 15px',
                    maxHeight: '100vh',
                  },
                  overlay: {
                    background: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                contentLabel="Invite"
                ariaHideApp={false}
              >
                <img className="close" src="/icons/cross-big.svg" onClick={evt => { setInviting(false); noScroll.off(); }} />
                {teamInfo &&
                  <TeamInviteDialog
                    team={teamInfo}
                  />
                }
              </Modal>
            </div>
          </div>
        </div>
      </>
      }
    </>
  );
}

export default TeamHeader;
