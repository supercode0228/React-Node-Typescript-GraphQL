/**
 * @format
 */

import Link from 'next/link';
import React, { useState } from 'react';
import Modal from 'react-modal';
import { RemoveScroll } from 'react-remove-scroll';
import { TeamInfo } from '../../../shared/types';
import TeamInviteDialog from '../TeamInviteDialog';
import styles from './TeamNavigation.module.scss';

export interface TeamNavigationProps {
  /** Team */
  team: TeamInfo;
}

export function TeamNavigation({ team }: TeamNavigationProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className={styles.TeamNavigation}>
      <Link href={`/team/${team.alias}/members`}>
        <a className={styles.Item}>
          <span className={styles.ItemCount}>{team.users?.length || 0}</span>

          <span className={styles.ItemLabel}> Members</span>
        </a>
      </Link>

      <Link href={`/team/${team.alias}/projects`}>
        <a className={styles.Item}>
          <span className={styles.ItemCount}>{team.projects?.length || 0}</span>

          <span className={styles.ItemLabel}> Projects</span>
        </a>
      </Link>

      {['owner', 'admin'].includes(team.myRole || '') && (
        <div className={styles.Invite}>
          <button
            className="btn save-btn"
            onClick={() => setShowInviteModal(true)}
          >
            Invite
          </button>
        </div>
      )}

      <Modal
        isOpen={showInviteModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            position: 'relative',
            width: 'fit-content',
            border: '0',
            borderRadius: '10px',
            padding: '30px 15px',
            maxHeight: '100vh'
          },
          overlay: {
            background: 'rgba(0, 0, 0, 0.7)'
          }
        }}
        contentLabel="Invite"
        ariaHideApp={false}
      >
        <RemoveScroll enabled={showInviteModal}>
          <img
            className="close"
            src="/icons/cross-big.svg"
            onClick={() => setShowInviteModal(false)}
          />

          {team && <TeamInviteDialog team={team} />}
        </RemoveScroll>
      </Modal>
    </div>
  );
}
