/**
 * @format
 */

import '../app.scss';
import { useQuery } from '@apollo/react-hooks';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  ActionList,
  Avatar,
  Disclosure,
  Grid,
  Header,
  Heading,
  HelpButton,
  Input,
  Page,
  Popover,
  Stack,
  Tabs,
  TeamNavigation,
  TeamSkillsDisplay,
  TextStyle,
  Toggle,
  TopBar
} from '../../client/components';
import { GET_TEAM } from '../../client/graphql/team';
import { ensureAccess } from '../../client/util/accessControl';
import { resolveQuery } from '../../client/util/graphqlHelpers';
import { teamAvatarUrl } from '../../client/util/profile';
import {
  resolveSkillAreas,
  resolveSkillTypes
} from '../../client/utilities/skills';
import { withApollo } from '../../lib/apollo';
import { TeamInfo, ResolvedUserSkill } from '../../shared/types';

function TeamPage() {
  const router = useRouter();

  const { data, error } = useQuery(GET_TEAM, {
    variables: { alias: router.query.alias }
  });

  ensureAccess(error);

  const team = useMemo(resolveQuery<TeamInfo | null>(data, 'team', null), [
    data
  ]);

  const skillTypes = resolveSkillTypes(team);
  const skillAreas = resolveSkillAreas(team);

  const [selectedSkillType, setSelectedSkillType] =
    useState<string | undefined>();

  const [selectedSkillArea, setSelectedSkillArea] =
    useState<string | undefined>();

  const [textFilter, setTextFilter] = useState('');
  const [textFilterDelayed, setTextFilterDelayed] = useState('');
  const [weightSkillsBy, setWeightSkillsBy] = useState('strength');
  const [fullscreen, setFullscreen] = useState(false);
  const [skillAreaPopoverActive, setSkillAreaPopoverActive] = useState(false);

  const [setTextFilterDebounced] = useDebouncedCallback(
    setTextFilterDelayed,
    500
  );

  useEffect(() => {
    if (!team) {
      return;
    }

    function selectFirstSkillType() {
      const value = skillTypes[0].value as string;
      handleSkillTypeChange(value);
    }

    const value = window.localStorage.getItem('skillTypeValue');
    if (value) {
      const skillType = skillTypes.find((st) => st.value === value);
      if (skillType) {
        setSelectedSkillType(skillType.value);
      } else {
        selectFirstSkillType();
      }
    } else {
      selectFirstSkillType();
    }
  }, [team, skillTypes]);

  function handleSkillTypeChange(value: string) {
    window.localStorage.setItem('skillTypeValue', value);

    setSelectedSkillType(value);
  }

  function updateTextFilter(value: string) {
    setTextFilter(value);
    setTextFilterDebounced(value);
  }

  function showSkill(userSkill: ResolvedUserSkill) {
    router.push(`/team/${team?.alias}/skill/${userSkill.skill.id}`);
  }

  function toggleFullscreen(skillArea: string | undefined) {
    setFullscreen((fullscreen) => !fullscreen);
    setSelectedSkillArea(skillArea);
  }

  function toggleSkillAreaPopover() {
    setSkillAreaPopoverActive((active) => !active);
  }

  function renderSkills(skillArea?: string, index?: number) {
    if (!team) {
      return null;
    }

    const label = allSkillAreas.find((sa) => sa.value === skillArea)?.label;

    const isFullscreen = fullscreen && skillArea === selectedSkillArea;

    return (
      <TeamSkillsDisplay
        key={index}
        team={team}
        skillType={selectedSkillType}
        skillArea={skillArea}
        textFilter={textFilterDelayed}
        weigthBy={weightSkillsBy}
        label={label}
        fullscreen={isFullscreen}
        scale={isFullscreen ? 1.5 : 1.0}
        onFullscreenToggle={toggleFullscreen}
        onSkillClick={showSkill}
      />
    );
  }

  const allSkillAreas = [
    { value: undefined, label: 'Everyone' },
    ...skillAreas
  ];

  return (
    <>
      <Head>
        <title>{team?.name + ' on Tests'}</title>
      </Head>

      <TopBar />

      {team && (
        <>
          <Header compressed={fullscreen}>
            <Header.Section>
              <Stack wrap={false} alignment="center">
                <Stack.Item>
                  <Avatar
                    url={teamAvatarUrl(team)}
                    border={true}
                    size={fullscreen ? 'medium' : 'large'}
                  />
                </Stack.Item>

                <Stack.Item fill={true}>
                  <Stack vertical={true} spacing="tight">
                    <Link href={`/team/${team.alias}`}>
                      <a>
                        <Heading>{team.name}</Heading>
                      </a>
                    </Link>

                    {!fullscreen &&
                      ['owner', 'admin'].includes(team.myRole as string) && (
                        <Link href={`/team/${team.alias}/settings`}>
                          <a>
                            <button className="btn-slim edit-btn">
                              Edit team
                            </button>
                          </a>
                        </Link>
                      )}
                  </Stack>
                </Stack.Item>
              </Stack>
            </Header.Section>

            {team.about && !fullscreen && (
              <Header.Section>
                <TextStyle subdued={true}>{team.about}</TextStyle>
              </Header.Section>
            )}

            {fullscreen && (
              <Header.Section>
                <Stack spacing="tight" alignment="center">
                  <Stack.Item>
                    <TextStyle subdued={true}>Viewing</TextStyle>
                  </Stack.Item>

                  <Stack.Item fill={true}>
                    <Popover
                      active={skillAreaPopoverActive}
                      activator={
                        <Disclosure
                          label={
                            allSkillAreas.find(
                              (sa) => sa.value === selectedSkillArea
                            )?.label
                          }
                          size="medium"
                          onClick={toggleSkillAreaPopover}
                        />
                      }
                      placement="bottom-start"
                      onClose={toggleSkillAreaPopover}
                    >
                      <ActionList
                        items={allSkillAreas.map((skillArea) => ({
                          content: skillArea.label,
                          active: skillArea.value === selectedSkillArea,
                          onClick: () => setSelectedSkillArea(skillArea.value)
                        }))}
                        onClickAnyItem={toggleSkillAreaPopover}
                      />
                    </Popover>
                  </Stack.Item>
                </Stack>
              </Header.Section>
            )}

            <Header.Section fill={true}>
              <TeamNavigation team={team} />
            </Header.Section>
          </Header>

          <Header slim={true}>
            <Header.Section>
              <div className="skill-availability-legend">
                <div className="marker" style={{ backgroundColor: '#000' }} />
                <div className="label">Available</div>
                <div
                  className="marker"
                  style={{ backgroundColor: '#F8D247' }}
                />
                <div className="label">Unavailable</div>
              </div>
            </Header.Section>

            <Header.Section fill={true} spacing="none">
              <Tabs
                items={skillTypes.map((skillType) => ({
                  content: skillType.label as string,
                  active: selectedSkillType === skillType.value,
                  onClick: () =>
                    handleSkillTypeChange(skillType.value as string)
                }))}
              />
            </Header.Section>

            <Header.Section>
              <Stack wrap={false} alignment="center">
                <Stack.Item fill={true}>
                  <Input
                    placeholder="Search Skills"
                    value={textFilter}
                    appearance="border"
                    prefix={
                      <img width={14} height={14} src="/icons/search.svg" />
                    }
                    onChange={(value) => updateTextFilter(value)}
                  />
                </Stack.Item>

                <Stack.Item>
                  <Toggle
                    items={[
                      {
                        icon:
                          weightSkillsBy === 'strength'
                            ? 'heartsRed'
                            : 'heartsGray',
                        selected: weightSkillsBy === 'strength',
                        onClick: () => setWeightSkillsBy('strength')
                      },
                      {
                        icon:
                          weightSkillsBy === 'userCount'
                            ? 'peopleBlue'
                            : 'peopleGray',
                        selected: weightSkillsBy === 'userCount',
                        onClick: () => setWeightSkillsBy('userCount')
                      }
                    ]}
                  />
                </Stack.Item>
              </Stack>
            </Header.Section>
          </Header>

          <Page>
            {fullscreen ? (
              renderSkills(selectedSkillArea)
            ) : (
              <Grid equalHeight={true} columns="three">
                {allSkillAreas.map((skillArea, index) =>
                  renderSkills(skillArea.value, index)
                )}
              </Grid>
            )}
          </Page>
        </>
      )}

      <HelpButton />
    </>
  );
}

export default withApollo(TeamPage);
