import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';
import getConfig from 'next/config';

import { post } from '../api';
import { TEAM_INVITE, TEAM_INVITE_LINK, GET_TEAM } from '../graphql/team';
import { TeamInfo } from '../../shared/types';

const { publicRuntimeConfig } = getConfig();

interface Props {
  team : TeamInfo;
};

const TeamInviteDialog = ({ team } : Props) => {
  const [ teamInvite, { } ] = useMutation(TEAM_INVITE);
  const [ teamInviteLink, { } ] = useMutation(TEAM_INVITE_LINK);
  const inviteLinkRef = useRef<HTMLDivElement>(null);

  const [ emails, setEmails ] = useState('');
  const [ inviteLink, setInviteLink ] = useState<string | null>();
  
  const [ invitesSent, setInvitesSent ] = useState(false);

  const tryInvite = async () => {
    const inviteRes = await teamInvite({
      variables: { id: team.id, emails: emails.split(',').map(e => e.trim()) },
      refetchQueries: [
        {
          query: GET_TEAM,
          variables: { alias: team.alias },
        },
      ],
    })
    setInvitesSent(true);
    console.log('inviteRes', inviteRes);
  };

  const createInviteLink = async () => {
    const inviteRes = await teamInviteLink({
      variables: { id: team.id },
    })
    console.log('inviteRes', inviteRes);
    const link = inviteRes.data.teamInviteLink;
    setInviteLink(link);
  };

  const copyInviteLink = () => {
    if(!inviteLinkRef.current)
      return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(inviteLinkRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand('copy');
    // e.target.focus();
  }

  return (
    <>
      <div className="team-invite-dialog">
        <div className="invite-area">
          <img className="illustration" src={`/img/team-invite${invitesSent ? '-success' : ''}.png`} />
          {!invitesSent ?
            <h2>Invite others</h2>
          :
            <h2>Invitations sent</h2>
          }
          <div className="team-url">{publicRuntimeConfig.RootUri.replace(/^https?:\/\//, '')}/team/<strong>{team.alias}</strong></div>
          {!invitesSent ?
            <>
              <div className="permission-note">Update user permissions in the team page later</div>
              <div className="input-group">
                <textarea 
                  value={emails} 
                  onChange={(evt) => setEmails(evt.target.value)} 
                  placeholder="Emails"
                  rows={5}
                />
              </div>
              <div className="paste-note">Send multiple invites by copy-pasting the addresses here.<br/>Separate with commas</div>
              <button className="btn" onClick={evt => tryInvite()}>Send invite/s</button>
            </>
          :
            <>
              <div className="success-note">Invitation/s have been sent to your future team members</div>
              <Link href={`/team/${team.alias}/members`}>
                <a><button className="btn">View Sent invites</button></a>
              </Link>
            </>
          }
        </div>
        <div className="panel info">
          <div className="row">
            <img className="icon" src="/icons/link-big.svg" />
            <div className="message-container">
              {!inviteLink ?
                <div className="caption">Want to invite anyone to your team?</div>
              :
                <div className="caption">Unique team invite link</div>
              }
              <div className="message">Create a public invite link for up to 100 members.</div>
            </div>
            <div className="actions">
              {!inviteLink ?
                <button className="btn-slim" onClick={evt => createInviteLink()}>Create Invite Link</button>
              :
                <button className="btn-slim" onClick={evt => createInviteLink()}>Regenerate Link</button>
              }
            </div>
          </div>
          <div className="row">
            {inviteLink &&
              <>
                <div className="invite-link" ref={inviteLinkRef}>{inviteLink}</div>
                <div className="actions">
                  <button className="btn-slim copy-btn" onClick={evt => copyInviteLink()}>Copy URL</button>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamInviteDialog;
