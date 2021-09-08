/**
 * @format
 */

import { useMutation, useQuery } from '@apollo/react-hooks';
import { parse } from 'papaparse';
import React, { useMemo, useState } from 'react';
import { Skill, TeamInfo, TeamSkillTypeInfo } from '../../../shared/types';
import {
  CREATE_TEAM_SKILLS_MUTATION,
  DELETE_TEAM_SKILLS_MUTATION,
  FIND_SKILLS
} from '../../graphql/skills';
import { resolveQuery } from '../../util/graphqlHelpers';
import { classNames } from '../../utilities/css';
import { FileUpload } from '../FileUpload';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Link } from '../Link';
import { LoadingBar } from '../LoadingBar';
import { Stack } from '../Stack';
import { TextStyle } from '../TextStyle';
import { Truncate } from '../Truncate';
import styles from './CustomTeamSkillsEditor.module.scss';

export interface CustomTeamSkillsEditorProps {
  /** Team */
  team: TeamInfo;
  /** Team skill type */
  teamSkillType: TeamSkillTypeInfo;
}

export function CustomTeamSkillsEditor({
  team,
  teamSkillType
}: CustomTeamSkillsEditorProps) {
  const { data } = useQuery(FIND_SKILLS, {
    variables: { type: teamSkillType.id }
  });

  const skills = useMemo(resolveQuery<Skill[]>(data, 'skills', []), [data]);

  const [createTeamSkills] = useMutation(CREATE_TEAM_SKILLS_MUTATION);
  const [deleteTeamSkills] = useMutation(DELETE_TEAM_SKILLS_MUTATION);

  const [value, setValue] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key !== 'Enter') {
      return;
    }

    saveFromInput();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) {
      return;
    }

    parse(event.target.files[0], { complete: saveFromFile });
  }

  function saveFromInput() {
    if (!value.length) {
      return;
    }

    createSkills([value]);

    setValue('');
  }

  async function saveFromFile(result: any) {
    const { data } = result;

    if (!data) {
      return;
    }

    setUploading(true);

    const skills = data.flat();
    await createSkills(skills);

    setUploading(false);
  }

  async function createSkills(skills: string[]) {
    if (!skills.length) {
      return;
    }

    await createTeamSkills({
      variables: {
        teamId: team.id,
        input: { skills, type: teamSkillType.id }
      },
      refetchQueries: [
        {
          query: FIND_SKILLS,
          variables: { type: teamSkillType.id }
        }
      ]
    });
  }

  function selectSkill(id: string) {
    if (uploading) {
      return;
    }

    let ids = [...selectedIds];

    if (ids.includes(id)) {
      ids = ids.filter((i) => i !== id);
    } else {
      ids.push(id);
    }

    setSelectedIds(ids);
  }

  async function deleteSkills() {
    if (!selectedIds.length) {
      return;
    }

    await deleteTeamSkills({
      variables: {
        teamId: team.id,
        ids: selectedIds
      },
      refetchQueries: [
        {
          query: FIND_SKILLS,
          variables: { type: teamSkillType.id }
        }
      ]
    });

    setSelectedIds([]);
  }

  const suffixMarkup = (
    <a onClick={saveFromInput}>
      <Icon source="enter" />
    </a>
  );

  return (
    <div className={styles.CustomTeamSkillsEditor}>
      <Stack vertical={true} spacing="tight">
        <Stack.Item>
          <Stack wrap={false} spacing="tight" alignment="center">
            <Stack.Item fill={true}>
              <Truncate>
                <strong title={teamSkillType.name}>{teamSkillType.name}</strong>
              </Truncate>
            </Stack.Item>

            <Stack.Item>
              {selectedIds.length > 0 ? (
                <Link onClick={deleteSkills}>
                  <strong>Delete</strong>
                </Link>
              ) : (
                <>
                  {uploading ? (
                    <TextStyle color="blue">
                      <strong>Uploading...</strong>
                    </TextStyle>
                  ) : (
                    <FileUpload accept=".csv" onChange={handleFileChange}>
                      <strong>+ Upload CSV</strong>
                    </FileUpload>
                  )}
                </>
              )}
            </Stack.Item>
          </Stack>
        </Stack.Item>

        <Stack.Item>
          <Input
            placeholder="Type in or paste skills to add"
            value={value}
            disabled={uploading}
            appearance="white"
            suffix={suffixMarkup}
            onChange={(value) => setValue(value)}
            onKeyDown={handleKeyDown}
          />
        </Stack.Item>

        {uploading && (
          <Stack.Item>
            <LoadingBar />
          </Stack.Item>
        )}

        {skills.length && (
          <Stack.Item>
            {skills.map((skill, index) => {
              const itemClassName = classNames(
                styles.Item,
                selectedIds.includes(skill.id) && styles['Item-selected']
              );

              return (
                <p
                  key={index}
                  onClick={() => selectSkill(skill.id)}
                  className={itemClassName}
                >
                  {skill.name}
                </p>
              );
            })}
          </Stack.Item>
        )}
      </Stack>
    </div>
  );
}
