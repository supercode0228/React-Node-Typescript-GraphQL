import { withApollo } from '../../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDebouncedCallback } from 'use-debounce/lib';
import ReactTagInput from "@pathofdev/react-tag-input";
import Link from 'next/link';

import '../../app.scss';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { GET_USER, CHECK_CREDENTIALS_AVAILABLE, UPDATE_USER_DATA } from '../../../client/graphql/user';
import { HelpButton, TopBar } from '../../../client/components';
import { UserInfo, TeamInfo, TeamInvitationInfo } from '../../../shared/types';
import AvailableCredentialsInput from '../../../client/components/AvailableCredentialsInput';
import Checkbox from '../../../client/components/basic/Checkbox';
import FileUpload from '../../../client/components/basic/FileUpload';
import { postMultipart } from '../../../client/api';
import { GET_TEAM, UPDATE_TEAM_DATA, GET_INVITATION_INFO } from '../../../client/graphql/team';
import { ensureAccess } from '../../../client/util/accessControl';
import { userAvatarUrl } from '../../../client/util/profile';
import Head from 'next/head';

const InvitationPage = () => {
  const router = useRouter();

  const { data, loading } = useQuery(GET_USER);
  const userInfo = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [data]);

  const { data: invitationData, loading: invitationLoading } = useQuery(GET_INVITATION_INFO, {
    variables: { key: router.query.key },
  });
  const invitationInfo = useMemo(resolveQuery<TeamInvitationInfo | null>(invitationData, 'invitationInfo', null), [invitationData]);
  // const [ acceptInvite, { } ] = useMutation(ACCEPT_INVITE);

  if(typeof window !== 'undefined'
    && !loading
    && !invitationLoading
    && userInfo === null) {
    // window.location.href = `/signup?inviteEmail=${invitationInfo?.email || ''}`;
    window.location.href = `/invite/${router.query.key}`;
  }

  return (
    <>
      <Head>
        <title>{`You're invited to ${invitationInfo?.team?.name}'`}</title>
      </Head>
      <TopBar />
      {(userInfo && invitationInfo) &&
      <>
        <div className="slim-container team-invitation">
          <div className="tile">
            <div className="extruded-surface">
              <h2>The team awaits you</h2>
              <div className="centered">
                You are about to join&nbsp;
                <strong>{invitationInfo.team.name}</strong>
              </div>
              <div className="info-container">
                <div
                  className="avatar"
                  style={{
                    backgroundImage: `url(${userAvatarUrl(userInfo)})`,
                    backgroundSize: 'cover'
                  }}
                />
                <div className="user-info">
                  <div className="name">
                    {userInfo.name}
                  </div>
                  <div className="email">
                    {userInfo.login}
                  </div>
                </div>
                <Link href={`/invite/${router.query.key}`}>
                  <a><button className="btn-slim dark">Continue & join</button></a>
                </Link>
              </div>

              {/* // TODO: save the `key` somewhere */}
              <Link href={'/logout'}>
                <a><button className="btn-slim centered">Log out and sign in as someone else</button></a>
              </Link>

              <div className="panel info">
                <div className="row">
                  <div className="message-container">
                    <div className="message" style={{ textAlign: 'center', fontSize: '10px' }}>
                      <strong>Someone else?</strong> Click or paste the shared URL once again after logging out to join <strong>{invitationInfo.team.name}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
      }

      <HelpButton />
    </>
  );
}

export default withApollo(InvitationPage);
