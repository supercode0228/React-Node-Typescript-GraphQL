/**
 * @format
 */

import '../../app.scss';
import { useMutation, useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { Slide, ToastContainer, toast } from 'react-toastify';
import {
  Card,
  Form,
  Heading,
  HelpButton,
  Input,
  Label,
  Layout,
  Link,
  Page,
  PlacesAutocomplete,
  Stack,
  Tag,
  TagInput,
  TeamSettingsHeader,
  TeamSettingsNavigation,
  TopBar,
  TextStyle,
  UnlockFeature
} from '../../../client/components';
import {
  GET_TEAM,
  UPDATE_TEAM_DATA,
  DELETE_TEAM
} from '../../../client/graphql/team';
import { ensureAccess } from '../../../client/util/accessControl';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { withApollo } from '../../../lib/apollo';
import { DescriptionMaxLength } from '../../../shared/sharedConfig';
import { TeamInfo } from '../../../shared/types';
import { isPro } from '../../../shared/util/plan';

function TeamSettingsPage() {
  const router = useRouter();

  const { data, error } = useQuery(GET_TEAM, {
    variables: { alias: router.query.alias }
  });

  ensureAccess(error);

  const team = useMemo(resolveQuery<TeamInfo | null>(data, 'team', null), [
    data
  ]);

  const [updateTeamData] = useMutation(UPDATE_TEAM_DATA);
  const [deleteTeam] = useMutation(DELETE_TEAM);

  const [teamData, setTeamData] = useState<TeamInfo | undefined>(undefined);
  const [skillAreaValue, setSkillAreaValue] = useState('');
  const [teamDeletionRequested, setTeamDeletionRequested] = useState(false);

  useEffect(() => {
    if (!team) {
      return;
    }

    const { id, locations, about, website, skillAreas } = team;
    setTeamData({ id, locations, about, website, skillAreas });
  }, [team]);

  useEffect(() => {
    if (team && teamData) {
      const locationsChanged = team.locations !== teamData.locations;
      const skillAreasChanged = team.skillAreas !== teamData.skillAreas;

      if (locationsChanged || skillAreasChanged) {
        save(false);
      }
    }
  }, [team, teamData]);

  async function save(notify: boolean = true) {
    await updateTeamData({ variables: { data: teamData } });

    if (notify) {
      toast('Your settings were updated');
    }
  }

  async function requestTeamDeletion() {
    await deleteTeam({ variables: { id: team?.id } });

    setTeamDeletionRequested(true);
  }

  return (
    <>
      <Head>
        <title>Team Settings</title>
      </Head>

      <TopBar />

      {team && teamData && (
        <>
          <TeamSettingsHeader team={team} onSave={save} />

          <Page>
            <Layout>
              <Layout.Section secondary={true}>
                <TeamSettingsNavigation team={team} activeItemId="settings" />
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <Card.Header>
                    <Heading>Team Settings</Heading>
                  </Card.Header>

                  <Card.Section>
                    <Form>
                      <PlacesAutocomplete
                        label="Location/s"
                        placeholder="Your team location/s"
                        value={teamData.locations}
                        multiple={true}
                        onChange={(locations) => {
                          setTeamData({
                            ...teamData,
                            locations: locations as string[]
                          });
                        }}
                      />

                      <Input
                        label="Team Description"
                        placeholder="Write a brief description here for the benefit of those joining"
                        value={teamData.about}
                        multiline={true}
                        maxLength={DescriptionMaxLength}
                        onChange={(about) =>
                          setTeamData({ ...teamData, about })
                        }
                      />

                      <Input
                        label="Website"
                        placeholder="Your homepage, blog or company website"
                        value={teamData.website}
                        onChange={(website) =>
                          setTeamData({ ...teamData, website })
                        }
                      />

                      {isPro(team.plan) ? (
                        <TagInput
                          label="Departments"
                          placeholder="Your team departments"
                          value={skillAreaValue}
                          tags={teamData.skillAreas}
                          onChange={(value) => setSkillAreaValue(value)}
                          onTagAdded={(skillAreas) => {
                            setTeamData({
                              ...teamData,
                              skillAreas: skillAreas
                            });

                            setSkillAreaValue('');
                          }}
                          onTagRemoved={(skillAreas) =>
                            setTeamData({ ...teamData, skillAreas: skillAreas })
                          }
                        />
                      ) : (
                        <Stack vertical={true} spacing="tight">
                          <Label>Departments</Label>

                          <UnlockFeature description="Create custom departments for your team" />

                          <Stack spacing="tight">
                            {team.skillAreas?.map((skillArea) => (
                              <Tag color="gray" subdued={true}>
                                {skillArea}
                              </Tag>
                            ))}
                          </Stack>
                        </Stack>
                      )}
                    </Form>
                  </Card.Section>

                  <Card.Section>
                    <Stack alignment="center">
                      <Stack.Item fill={true}>
                        <Stack vertical={true} spacing="extraTight">
                          <strong>Delete Team</strong>

                          <TextStyle subdued={true}>
                            Deletes and erases only team & project data
                          </TextStyle>
                        </Stack>
                      </Stack.Item>

                      <Stack.Item>
                        <Link destructive={true} onClick={requestTeamDeletion}>
                          Close Account
                        </Link>
                      </Stack.Item>
                    </Stack>

                    {teamDeletionRequested && (
                      <div className="panel danger">
                        <div className="row">
                          <div className="message-container">
                            <div className="caption">
                              You are attempting to delete this team
                            </div>
                            <div className="message">
                              Check your email for a confirmation link to delete
                              this team permanently.
                              <br />
                              <strong>If this was a mistake,</strong> 🙏 just
                              ignore the email that was sent.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card.Section>
                </Card>
              </Layout.Section>

              <Layout.Section secondary={true} />
            </Layout>
          </Page>
        </>
      )}

      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar={true}
        enableMultiContainer={true}
        transition={Slide}
        closeButton={false}
        pauseOnHover={false}
      />

      <HelpButton />
    </>
  );
}

export default withApollo(TeamSettingsPage);
