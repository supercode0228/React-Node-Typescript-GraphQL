/**
 * @format
 */

import '../../app.scss';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import {
  Card,
  CustomTeamSkillsEditor,
  CustomTeamSkillTypeList,
  Grid,
  Heading,
  HelpButton,
  Image,
  Layout,
  Page,
  Stack,
  TeamSettingsHeader,
  TeamSettingsNavigation,
  TextStyle,
  TopBar,
  UnlockFeature
} from '../../../client/components';
import { GET_TEAM } from '../../../client/graphql/team';
import { ensureAccess } from '../../../client/util/accessControl';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { withApollo } from '../../../lib/apollo';
import { TeamInfo, TeamSkillTypeInfo } from '../../../shared/types';
import { isPro } from '../../../shared/util/plan';

function TeamSkillTypesPage() {
  const router = useRouter();

  const { data, error } = useQuery(GET_TEAM, {
    variables: { alias: router.query.alias }
  });

  ensureAccess(error);

  const team = useMemo(resolveQuery<TeamInfo | null>(data, 'team', null), [
    data
  ]);

  const [teamSkillType, setTeamSkillType] = useState<
    TeamSkillTypeInfo | undefined
  >();

  return (
    <>
      <Head>
        <title>Skill Types</title>
      </Head>

      <TopBar />

      {team && (
        <>
          <TeamSettingsHeader team={team} />

          <Page>
            <Layout>
              <Layout.Section secondary={true}>
                <TeamSettingsNavigation
                  team={team}
                  activeItemId="skill-types"
                />
              </Layout.Section>

              <Layout.Section>
                <Card>
                  <Card.Header>
                    <Stack vertical={true} spacing="tight">
                      <Heading>Manage Skills</Heading>

                      <TextStyle subdued={true}>
                        Default skill types: Job Focus, Soft Skills, Technical
                        Skills. Creating a new skill type will be visible to
                        everyone in your team
                      </TextStyle>
                    </Stack>
                  </Card.Header>

                  <Card.Section>
                    {isPro(team.plan) ? (
                      <Grid columns="two" spacing="none">
                        <CustomTeamSkillTypeList
                          team={team}
                          selectedTeamSkillType={teamSkillType}
                          onSelect={setTeamSkillType}
                        />

                        {teamSkillType && (
                          <CustomTeamSkillsEditor
                            team={team}
                            teamSkillType={teamSkillType}
                          />
                        )}
                      </Grid>
                    ) : (
                      <Stack vertical={true}>
                        <UnlockFeature description="Create custom skill types for your team" />

                        <Image source="/img/team-skill-types-placeholder.png" />
                      </Stack>
                    )}
                  </Card.Section>
                </Card>
              </Layout.Section>

              <Layout.Section secondary={true} />
            </Layout>
          </Page>
        </>
      )}

      <HelpButton />
    </>
  );
}

export default withApollo(TeamSkillTypesPage);
