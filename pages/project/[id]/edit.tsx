import { withApollo } from '../../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/react-hooks';
import ReactTagInput from '@pathofdev/react-tag-input';

import '../../app.scss';
import { HelpButton, TopBar } from '../../../client/components';
import { ProjectInfo, UserInfo } from '../../../shared/types';
import AvailableCredentialsInput from '../../../client/components/AvailableCredentialsInput';
import { UPDATE_PROJECT_DATA, GET_PROJECT } from '../../../client/graphql/project';
import { GET_USER } from '../../../client/graphql/user';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { GET_TEAM } from '../../../client/graphql/team';
import { ensureAccess } from '../../../client/util/accessControl';
import DateRangePicker from '../../../client/components/basic/DateRangePicker';
import { TeamNameMaxLength, DescriptionMaxLength } from '../../../shared/sharedConfig';
import LimitedTextArea from '../../../client/components/basic/LimitedTextArea';
import Head from 'next/head';

const EditProjectPage = () => {
  const router = useRouter();

  const [ projectData, setProjectData ] = useState<ProjectInfo>({ name: '', about: '' });
  const [ updateProjectData, { } ] = useMutation(UPDATE_PROJECT_DATA);

  const isNew = router.query.id === 'new';
  const { data, error } = useQuery(GET_PROJECT, {
    variables: { id: router.query.id },
    skip: isNew,
  });
  ensureAccess(error);
  const projectInfo = useMemo(resolveQuery<ProjectInfo | null>(data, 'project', null), [data]);

  useEffect(
    () => {
      if(!projectInfo)
        return;

      setProjectData({
        id: projectInfo.id,
        name: projectInfo.name,
        startTime: projectInfo.startTime,
        endTime: projectInfo.endTime,
        about: projectInfo.about,
        tags: projectInfo.tags,
        references: projectInfo.references,
      });
    },
    [projectInfo]
  );

  const saveProject = async (evt : React.FormEvent) => {
    evt.preventDefault();

    if(projectData.name.length < 1 || (projectData.about?.length || 0) < 1) {
      return;
    }

    let vars : object = { data: projectData };
    if(isNew)
      vars = { ...vars, team: router.query.team };
    const res = await updateProjectData({
      variables: vars,
      refetchQueries: [
        {
          query: GET_PROJECT,
          variables: { id: router.query.id },
        },
        {
          query: GET_TEAM,
          variables: { alias: projectInfo?.team?.alias },
        },
      ],
    });

    Router.push(`/project/${res.data.updateProjectData.id}/skills/edit`);
  };

  return (
    <>
      <Head>
        <title>Project settings</title>
      </Head>
      <TopBar />
      <form onSubmit={saveProject}>
        <div className="header">
          <div className="medium-container project-settings">
            <div className="input-group project-name">
              <input
                type='text'
                value={projectData.name}
                onChange={evt => setProjectData({ ...projectData, name: evt.target.value })}
                placeholder="Project name"
                maxLength={TeamNameMaxLength}
                required={true}
              />
              <div className="hint">e.g. Transport as a service app</div>
            </div>
            <button type="submit" className="btn save-btn" disabled={projectData.name.length < 1 || (projectData.about?.length || 0) < 1}>
              Select skills
            </button>
          </div>
        </div>
        <div className="medium-container project-settings">
          <div className="tile">
            <div className="extruded-surface">
              <h3 className="label" style={{ position: 'absolute', left: 'calc(50% + 20px)' }}>End date</h3>
              <h3 className="label" style={{ marginLeft: '0' }}>Start date</h3>
              <div className="separator" />
              <DateRangePicker
                startTime={projectData.startTime}
                endTime={projectData.endTime}
                onChange={({ startTime, endTime }) => {
                  setProjectData({
                    ...projectData,
                    startTime,
                    endTime,
                  });
                }}
                startDatePlaceholderText='mm/dd/yyyy'
                endDatePlaceholderText='mm/dd/yyyy'
              />
            </div>
          </div>

          <div className="tile">
            <div className="extruded-surface">
              <h3>Description</h3>
              <div className="input-group">
                <LimitedTextArea
                  value={projectData.about || ''}
                  rows={5}
                  maxLength={DescriptionMaxLength}
                  onChange={about => setProjectData({ ...projectData, about })}
                  placeholder="A short description of your project."
                  required={true}
                />
              </div>
            </div>
          </div>

          <div className="tile">
            <div className="extruded-surface">
              <h3>Tags</h3>
              <div className="input-group">
                <ReactTagInput
                  tags={projectData.tags || []}
                  onChange={(newTags) => setProjectData({ ...projectData, tags: newTags })}
                  placeholder="Add new tags"
                />
              </div>
            </div>
          </div>

          <div className="tile">
            <div className="extruded-surface">
              <h3>
                Project reference links
                <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '2px', textTransform: 'none', fontWeight: 'normal' }}>Press <strong>enter</strong> to add a link</div>
              </h3>
              <div className="input-group">
                <ReactTagInput
                  tags={projectData.references || []}
                  onChange={(newTags) => setProjectData({ ...projectData, references: newTags })}
                  placeholder="dropbox.com, drive.google.com"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <HelpButton />
    </>
  );
}

export default withApollo(EditProjectPage);
