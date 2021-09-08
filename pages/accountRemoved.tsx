import { withApollo } from '../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';

import './app.scss';
import { HelpButton, TopBar } from '../client/components';

const AccountRemoved = () => {
  return (
    <>
      <TopBar />
      <div className="container">
        <div className="block-left"></div>
        <div className="block-center">
          <div className="tile" style={{ marginTop: '70px' }}>
            <div className="extruded-surface account-removed">
              <h2>😢</h2>
              <h2 style={{ fontSize: '26px', marginBottom: '10px' }}>
                We are sad to see you leave
              </h2>

              <span className="centered" style={{ textAlign: 'center', marginTop: '10px' }}>
                But you're always welcome back for we will always be your fans
              </span>

              <div className="panel info" style={{ marginTop: '30px' }}>
                <div className="row">
                  <div className="message-container">
                    <div className="message" style={{ color: '#527AAA', fontSize: '14px' }}>
                      If there’s anything we can help you with, <br className="desktop" />write to us at <strong>wow@Tests.com</strong>
                    </div>
                  </div>
                  <div className="actions">
                    <a href="mailto:wow@Tests.com">
                      <button className="btn-slim">Send email</button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HelpButton />
    </>
  );
};

export default withApollo(AccountRemoved);
