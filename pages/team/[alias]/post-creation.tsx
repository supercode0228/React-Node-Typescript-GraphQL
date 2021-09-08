import { withApollo } from '../../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/react-hooks';
import getConfig from 'next/config';

import '../../app.scss';
import { HelpButton, TopBar } from '../../../client/components';
import { TeamInfo, UserInfo } from '../../../shared/types';
import AvailableCredentialsInput from '../../../client/components/AvailableCredentialsInput';
import { UPDATE_TEAM_DATA, GET_TEAM, TEAM_INVITE, TEAM_INVITE_LINK } from '../../../client/graphql/team';
import { UPDATE_USER_DATA, GET_USER } from '../../../client/graphql/user';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { ensureAccess } from '../../../client/util/accessControl';
import Head from 'next/head';

const { publicRuntimeConfig } = getConfig();

const TeamPostCreationPage = () => {
  const router = useRouter();

  const { data, error } = useQuery(GET_TEAM, {
    variables: { alias: router.query.alias },
  });
  ensureAccess(error);
  const teamInfo = useMemo(resolveQuery<TeamInfo | null>(data, 'team', null), [data]);

  const [ teamInvite, { } ] = useMutation(TEAM_INVITE);
  const [ teamInviteLink, { } ] = useMutation(TEAM_INVITE_LINK);
  const inviteLinkRef = useRef<HTMLDivElement>(null);

  const [ emails, setEmails ] = useState<string[]>([ '', '', '' ]);
  const [ inviteLink, setInviteLink ] = useState<string | null>();
  // const [ inviteHistory, setInviteHistory ] = useState<InviteHistoryItem[]>([]);

  const [ invitesSent, setInvitesSent ] = useState(false);

  const tryInvite = async () => {
    if(!teamInfo)
      return;
    // const inviteRes = await post(`/team/${teamAlias}/invite`, { emails });
    // setInviteHistory([ { email }, ...inviteHistory ]);
    // setEmail('');
    const inviteRes = await teamInvite({
      variables: { id: teamInfo.id, emails: emails.filter(e => e.length > 0) },
      refetchQueries: [
        {
          query: GET_TEAM,
          variables: { alias: teamInfo.alias },
        },
      ],
    })
    setInvitesSent(true);
    console.log('inviteRes', inviteRes);
  };

  const createInviteLink = async () => {
    if(!teamInfo)
      return;
    const inviteRes = await teamInviteLink({
      variables: { id: teamInfo.id },
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
      <Head>
        <title>{`${teamInfo?.name}'`}</title>
      </Head>
      <TopBar />
      <div className="slim-container">
        <div className="extruded-surface team-invite-dialog create-team-form stage-2">
          <div className="stage-number">2/2</div>
          <div className="invite-area">
            <img className="illustration" src={`/img/team-invite${invitesSent ? '-success' : ''}.png`} />
            {!invitesSent ?
              <h2>Invite others</h2>
            :
              <h2>Invitations sent</h2>
            }
            <div className="team-url">{publicRuntimeConfig.RootUri.replace(/^https?:\/\//, '')}/team/<strong>{teamInfo?.alias}</strong></div>
            {!invitesSent ?
              <>
                <div className="permission-note">Update user permissions in the team page later</div>
                {emails.map((email, i) =>
                  <div key={i} className="input-group">
                    <input
                      type="text"
                      value={email}
                      onChange={(evt) => {
                        const newEmails = emails.slice();
                        newEmails[i] = evt.target.value;
                        setEmails(newEmails);
                      }}
                      placeholder="Email"
                    />
                  </div>
                )}
                <a
                  className="link add-btn"
                  onClick={evt => setEmails([ ...emails, '' ])}
                >
                  + Add one more
                </a>
                <button className="btn" onClick={evt => tryInvite()}>Send invite/s</button>
                <div className="skip-note">
                  You can&nbsp;
                  <Link href={`/team/${teamInfo?.alias}`}>
                    <a>Skip</a>
                  </Link>
                  &nbsp;this step, but it’s always<br/>
                  more fun with your colleagues
                </div>
              </>
            :
              <>
                <div className="success-note">Invitation/s have been sent to your future team members</div>
                <Link href={`/team/${teamInfo?.alias}/members`}>
                  <a><button className="btn">View Sent invites</button></a>
                </Link>
              </>
            }
            {/* {inviteHistory.map((h, i) =>
              <div key={i}>
                Invited <strong>{h.email}</strong>
              </div>
            )} */}
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
      </div>

      <HelpButton />
    </>
  );
}

export default withApollo(TeamPostCreationPage);
