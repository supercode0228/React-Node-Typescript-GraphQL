/**
 * @format
 */

import './app.scss';
import { useMutation, useQuery } from '@apollo/react-hooks';
import getConfig from 'next/config';
import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import AvailableCredentialsInput from '../client/components/AvailableCredentialsInput';
import { HelpButton, TopBar } from '../client/components';
import { UPDATE_TEAM_DATA } from '../client/graphql/team';
import { GET_USER, UPDATE_USER_DATA } from '../client/graphql/user';
import { withApollo } from '../lib/apollo';
import { TeamInfo } from '../shared/types';

const { publicRuntimeConfig } = getConfig();

const CreateTeamPage = () => {
  const { data } = useQuery(GET_USER);

  useEffect(() => {
    if (data && !data.user) {
      Router.push('/login');
    }
  }, [data]);

  const [teamData, setTeamData] = useState<TeamInfo>({ name: '', alias: '' });
  const [updateTeamData, {}] = useMutation(UPDATE_TEAM_DATA);
  const [updateUserData, {}] = useMutation(UPDATE_USER_DATA);

  const createTeam = async (evt: React.MouseEvent) => {
    evt.preventDefault();

    const res = await updateTeamData({
      variables: { data: teamData }
    });

    // Set the newly-created team as the active one
    await updateUserData({
      variables: {
        data: { activeTeam: (res.data.updateTeamData as TeamInfo).id }
      },
      refetchQueries: [
        {
          query: GET_USER
        }
      ]
    });

    Router.push(`/team/${teamData?.alias}/post-creation`);
  };

  return (
    <>
      <TopBar />
      <div className="slim-container">
        <div className="extruded-surface create-team-form stage-1">
          <div className="stage-number">1/2</div>
          <h2>Let’s make a team</h2>
          <div className="input-group">
            <div className="input-label">Your team/organisation name</div>
            <input
              type="text"
              value={teamData.name}
              onChange={(evt) =>
                setTeamData({ ...teamData, name: evt.target.value })
              }
              placeholder="Name your team"
            />
          </div>
          <AvailableCredentialsInput
            value={teamData.alias}
            onChange={(val) => setTeamData({ ...teamData, alias: val })}
            field="alias"
            placeholder="Alias"
            entityType="team"
            label="Team URL"
          />
          <div className="url-preview">
            Your team’s Tests URL:
            <br />
            {publicRuntimeConfig.RootUri}/team/{teamData.alias}
          </div>
          <input
            type="submit"
            className="btn centered"
            onClick={createTeam}
            value="Create a team"
          />

          <div className="join-note">
            Looking to join an existing team?
            <br />
            Ask a member to get invited
          </div>
        </div>
      </div>

      <HelpButton />
    </>
  );
};

export default withApollo(CreateTeamPage);
