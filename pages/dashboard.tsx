import { withApollo } from '../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';

import './app.scss';
import { resolveQuery } from '../client/util/graphqlHelpers';
import { GET_USER, GET_SUGGESTED_BLOGS } from '../client/graphql/user';
import { HelpButton, PersonalNoteForm, TopBar } from '../client/components';
import { UserInfo, BlogEntryInfo, ResolvedUserSkill } from '../shared/types';
import UserAvailabilityEditor from '../client/components/UserAvailabilityEditor';
import { GET_USER_SKILLS } from '../client/graphql/skills';
import OngoingProjectSummary from '../client/components/OngoingProjectSummary';
import { ensureAccess } from '../client/util/accessControl';

const Dashboard = () => {
  const { data, error } = useQuery(GET_USER);
  const userInfo = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [data]);
  ensureAccess(error);

  const { data: blogData } = useQuery(GET_SUGGESTED_BLOGS, {
    // variables: { alias: router.query.alias },
  });
  const blogs = useMemo(resolveQuery<BlogEntryInfo[] | null>(blogData, 'suggestedBlogs', []), [blogData]);


  // For personal stat calculation
  const earliestJobExperience = Math.min.apply(null, userInfo?.jobExperience?.map(je => je.startTime || 0) || [0]);
  const { data: jobSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: userInfo?.id, type: 'job' },
    skip: !userInfo,
  });
  const jobSkills = useMemo(resolveQuery<ResolvedUserSkill[]>(jobSkillData, 'userSkills', []), [jobSkillData]);

  const { data: softSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: userInfo?.id, type: 'soft' },
    skip: !userInfo,
  });
  const softSkills = useMemo(resolveQuery<ResolvedUserSkill[]>(softSkillData, 'userSkills', []), [softSkillData]);

  const { data: softwareSkillData } = useQuery(GET_USER_SKILLS, {
    variables: { userId: userInfo?.id, type: 'software' },
    skip: !userInfo,
  });
  const softwareSkills = useMemo(resolveQuery<ResolvedUserSkill[]>(softwareSkillData, 'userSkills', []), [softwareSkillData]);

  const ongoingProjects = userInfo?.projects?.filter(p => !p.project.draft && (p.project.startTime || 0) <= Date.now() && (p.project.endTime || 0) >= Date.now() && p.project.team?.id === userInfo.activeTeam);

  return (
    <>
      <Head>
        <title>{userInfo?.name + " on Tests"}</title>
        {/* Social media embedding info */}
        <meta name="title" content={userInfo?.name + " on Tests"}/>
        <meta name="description" content="Wow! Such amaze"/>
        <link rel="image_src" href="/favicon.png"/>
        <meta property="og:title" content={userInfo?.name + " on Tests"}/>
        <meta property="og:description" content="Wow! Such amaze"/>
        <meta property="og:image" content="/favicon.png"/>
        <meta property="twitter:title" content={userInfo?.name + " on Tests"}/>
        <meta property="twitter:description" content="Wow! Such amaze"/>
        <meta property="twitter:image" content="/favicon.png"/>
      </Head>
      <TopBar />
      {userInfo &&
      <>
        <div className="medium-container top-padded">
          <div className="tile">
            <div className="extruded-surface">
              <UserAvailabilityEditor />
            </div>
          </div>
          <div className="block-center">
            <div className="tile">
              <div className="extruded-surface">
                <PersonalNoteForm
                  label="Quick notes & goals"
                  onSave={() => Router.push(`/user/${userInfo?.alias}/edit`)}
                />
              </div>
            </div>
          </div>

          <div className="block-tiles">
            {ongoingProjects?.map((p, i) =>
              <div key={i} className="block-half">
                <OngoingProjectSummary id={p.project.id || ''} />
              </div>
            )}

            {blogs?.map((b, i) =>
              <div key={i} className="block-half blog-entry">
                <div className="tile">
                  <a target="_blank" rel="noopener noreferer" href={b.url}>
                    <div className="extruded-surface medium" style={{ backgroundColor: b.bgColor }}>
                        <div className="title">{b.name}</div>
                      <img className="thumb" src={b?.thumbnail?.url} />
                      <div className="summary">{b.summary}</div>
                    </div>
                  </a>
                </div>
              </div>
            )}

            <div className="block-half dashboard-personal-stats">
              <div className="tile">
                <div className="extruded-surface">
                  <div style={{ backgroundImage: 'url(/img/stat-total-skills.png)' }}>
                    <div className="stat">
                      <div className="value">{jobSkills.length + softSkills.length + softwareSkills.length}</div>
                      <div className="name">Total Skills<br/>&nbsp;</div>
                    </div>
                  </div>
                  <div style={{ backgroundImage: 'url(/img/stat-completed-projects.png)' }}>
                    <div className="stat">
                      <div className="value">{userInfo.projects?.filter(p => !p.project.draft && (p.project.endTime || 0) < Date.now()).length || 0}</div>
                      <div className="name">Completed<br/>Projects</div>
                    </div>
                  </div>
                  <div style={{ backgroundImage: 'url(/img/stat-expert-softwares.png)' }}>
                    <div className="stat">
                      <div className="value">{softwareSkills.filter(s => s.strength >= 6).length}</div>
                      <div className="name">Expert Technical skills</div>
                    </div>
                  </div>
                  <div style={{ backgroundImage: 'url(/img/stat-total-experience.png)' }}>
                    <div className="stat">
                      <div className="value">
                        {(userInfo.jobExperience && userInfo.jobExperience?.length > 0)
                          ? Math.round((Date.now() - earliestJobExperience) / (86400000 * 365))
                          : 0
                        }
                      </div>
                      <div className="name">Total years of experience</div>
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

export default withApollo(Dashboard);
