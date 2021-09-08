/**
 * @format
 */

import { useApolloClient, useMutation } from '@apollo/react-hooks';
import React, { useEffect, useState } from 'react';
import getConfig from 'next/config';
import { httpDelete, postMultipart } from '../../api';
import { GET_TEAM, UPDATE_TEAM_DATA } from '../../graphql/team';
import { teamAvatarUrl } from '../../util/profile';
import { TeamInfo } from '../../../shared/types';
import { Avatar } from '../Avatar';
import { CredentialAvailabilityInput } from '../CredentialAvailabilityInput';
import { FileUpload } from '../FileUpload';
import { Header } from '../Header';
import { Input } from '../Input';
import { Link } from '../Link';
import { Stack } from '../Stack';
import { Tag } from '../Tag';
import { TextStyle } from '../TextStyle';

const { publicRuntimeConfig } = getConfig();

export interface TeamSettingsHeaderProps {
  /** Team */
  team: TeamInfo;
  /** Callback when save button is clicked */
  onSave?: () => void;
}

export function TeamSettingsHeader({ team, onSave }: TeamSettingsHeaderProps) {
  const client = useApolloClient();

  const [updateTeamData] = useMutation(UPDATE_TEAM_DATA);

  const [teamData, setTeamData] = useState<TeamInfo>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const { id, name, alias } = team;

    setTeamData({ id, name, alias });
  }, [team]);

  async function save() {
    await updateTeamData({ variables: { data: teamData } });

    onSave?.();
  }

  async function updateAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) {
      return;
    }

    setUploading(true);

    await postMultipart(`/team/${team.alias}/avatar`, {
      avatar: event.target.files[0]
    });

    setUploading(false);

    refetch();
  }

  async function removeAvatar() {
    await httpDelete(`/team/${team.alias}/avatar`);

    refetch();
  }

  function refetch() {
    client.query({ query: GET_TEAM, variables: { id: team.id } });
  }

  return (
    <Header>
      <Header.Section>
        <Stack wrap={false} alignment="center">
          <Stack.Item>
            <Avatar
              url={teamAvatarUrl(team)}
              border={true}
              size="large"
              loading={uploading}
            />
          </Stack.Item>

          <Stack.Item fill={true}>
            <Stack vertical={true} spacing="extraTight">
              <Stack.Item>
                <Stack vertical={true} spacing="none">
                  {team.plan && (
                    <Tag size="small" color="blue">
                      {team.plan.charAt(0).toUpperCase() + team.plan.slice(1)}
                    </Tag>
                  )}

                  <Input
                    placeholder="Team Name"
                    value={teamData?.name}
                    size="title"
                    onChange={(name) => setTeamData({ ...teamData, name })}
                  />
                </Stack>
              </Stack.Item>

              <Stack.Item>
                <Stack distribution="equalSpacing">
                  {uploading ? (
                    <TextStyle color="blue">Uploading...</TextStyle>
                  ) : (
                    <FileUpload accept="image/*" onChange={updateAvatar}>
                      Upload Logo
                    </FileUpload>
                  )}

                  <Link destructive={true} onClick={removeAvatar}>
                    Remove Logo
                  </Link>
                </Stack>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
      </Header.Section>

      <Header.Section fill={true}>
        <Stack vertical={true} spacing="tight">
          <CredentialAvailabilityInput
            label="Team URL"
            value={teamData?.alias}
            prefix="/"
            entityType="team"
            entityId={team.id}
            field="alias"
            onChange={(alias) => setTeamData({ ...teamData, alias })}
          />

          <TextStyle subdued={true}>
            Your team's Tests URL: {publicRuntimeConfig.RootUri}
            /team/<strong>{teamData?.alias}</strong>
          </TextStyle>
        </Stack>
      </Header.Section>

      <Header.Section action={true}>
        <button className="btn save-btn" onClick={save}>
          Save
        </button>
      </Header.Section>
    </Header>
  );
}
