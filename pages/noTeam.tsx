import { withApollo } from '../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';

import './app.scss';
import { HelpButton, TopBar } from '../client/components';

const NoTeam = () => {
  return (
    <>
      <TopBar />
      <div className="container">
        <div className="block-left"></div>
        <div className="block-center">
          <div className="tile" style={{ marginTop: '70px' }}>
            <div className="extruded-surface lone">
              <h2>No projects yet</h2>

              <img className="centered" src="/img/no-projects.png" style={{ width: '248px' }} />

              <span className="centered" style={{ textAlign: 'center', marginTop: '30px' }}>
                Create a team or get invited to a team to <br className="desktop" />
                start creating projects.
              </span>

              <Link href={`/team`}>
                <a><button className="btn centered" style={{ marginTop: '40px' }}>Create a team</button></a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <HelpButton />
    </>
  );
};

export default withApollo(NoTeam);
