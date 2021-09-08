/**
 * @format
 */

import { useMutation, useQuery } from '@apollo/react-hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { TeamInfo, TeamSkillTypeInfo } from '../../../shared/types';
import {
  DELETE_TEAM_SKILL_TYPE_MUTATION,
  TEAM_SKILL_TYPES_QUERY,
  UPDATE_TEAM_SKILL_TYPE_MUTATION
} from '../../graphql/team';
import { resolveQuery } from '../../util/graphqlHelpers';
import { Form } from '../Form';
import { Input } from '../Input';
import { Link } from '../Link';
import { Select } from '../Select';
import { Stack } from '../Stack';
import { Item } from './components';
import styles from './CustomTeamSkillTypeList.module.scss';

export interface CustomTeamSkillTypeListProps {
  /** Team */
  team: TeamInfo;
  /** Selected team skill type */
  selectedTeamSkillType?: TeamSkillTypeInfo;
  /** Callback when team skill type is selected */
  onSelect: (teamSkillType: TeamSkillTypeInfo | undefined) => void;
}

export function CustomTeamSkillTypeList({
  team,
  selectedTeamSkillType,
  onSelect
}: CustomTeamSkillTypeListProps) {
  const { data } = useQuery(TEAM_SKILL_TYPES_QUERY, {
    variables: { teamId: team.id }
  });

  const teamSkillTypes = useMemo(
    resolveQuery<TeamSkillTypeInfo[]>(data, 'teamSkillTypes', []),
    [data]
  );

  const [updateTeamSkillType] = useMutation(UPDATE_TEAM_SKILL_TYPE_MUTATION);
  const [deleteTeamSkillType] = useMutation(DELETE_TEAM_SKILL_TYPE_MUTATION);

  const [adding, setAdding] = useState(false);

  const initialTeamSkillTypeInput: TeamSkillTypeInfo = {
    name: '',
    visualization: 'bubbles'
  };

  const [teamSkillTypeInput, setTeamSkillTypeInput] = useState<
    TeamSkillTypeInfo
  >(initialTeamSkillTypeInput);

  useEffect(() => {
    if (!teamSkillTypes) {
      return;
    }

    selectTeamSkillType(teamSkillTypes[0]);
  }, []);

  function selectTeamSkillType(teamSkillType: TeamSkillTypeInfo | undefined) {
    onSelect(teamSkillType);
  }

  async function save() {
    const result = await updateTeamSkillType({
      variables: { teamId: team.id, input: teamSkillTypeInput },
      refetchQueries: [
        {
          query: TEAM_SKILL_TYPES_QUERY,
          variables: { teamId: team.id }
        }
      ]
    });

    selectTeamSkillType(result.data.updateTeamSkillType);

    closeForm();
  }

  function closeForm() {
    setAdding(false);
    setTeamSkillTypeInput(initialTeamSkillTypeInput);
  }

  async function removeTeamSkillType(teamSkillType: TeamSkillTypeInfo) {
    await deleteTeamSkillType({
      variables: { teamId: team.id, id: teamSkillType.id },
      refetchQueries: [
        {
          query: TEAM_SKILL_TYPES_QUERY,
          variables: { teamId: team.id }
        }
      ]
    });

    selectTeamSkillType(undefined);
  }

  return (
    <div className={styles.CustomTeamSkillTypeList}>
      <div className={styles.Container}>
        {teamSkillTypes.map((teamSkillType, index) => {
          const selected = selectedTeamSkillType?.id === teamSkillType.id;

          return (
            <Item
              key={index}
              teamSkillType={teamSkillType}
              selected={selected}
              onSelect={selectTeamSkillType}
              onRemove={removeTeamSkillType}
            />
          );
        })}
      </div>

      {adding ? (
        <div className={styles.FormContainer}>
          <Stack vertical={true}>
            <div className={styles.Form}>
              <Form>
                <Input
                  label="New Skill Type"
                  placeholder="Enter desired skill type"
                  value={teamSkillTypeInput.name}
                  appearance="white"
                  onChange={(name) =>
                    setTeamSkillTypeInput({ ...teamSkillTypeInput, name })
                  }
                />

                <Select
                  label="Visualize As"
                  value={teamSkillTypeInput.visualization}
                  options={[
                    { value: 'bubbles', label: 'Bubble chart' },
                    { value: 'sector', label: 'Sector chart' }
                  ]}
                  appearance="white"
                  onChange={(visualization) =>
                    setTeamSkillTypeInput({
                      ...teamSkillTypeInput,
                      visualization
                    })
                  }
                />
              </Form>
            </div>

            <Stack alignment="center" distribution="trailing">
              <a className={styles.Cancel} onClick={closeForm}>
                Cancel
              </a>

              <button className="btn-slim dark" onClick={save}>
                Save
              </button>
            </Stack>
          </Stack>
        </div>
      ) : (
        <Link onClick={() => setAdding(true)}>
          <strong>+ Custom Skill Type</strong>
        </Link>
      )}
    </div>
  );
}
