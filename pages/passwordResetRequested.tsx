import { withApollo } from '../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Formsy from 'formsy-react';

import { post } from '../client/api';
import './app.scss';
import { GET_USER, REQUEST_RESET_PASSWORD } from '../client/graphql/user';
import { resolveQuery } from '../client/util/graphqlHelpers';
import { UserInfo } from '../shared/types';
import ValidatedInput from '../client/components/basic/ValidatedInput';
import { HelpButton, TopBar } from '../client/components';

const PasswordResetRequested = () => {
  return (
    <>
      <TopBar />
      <div className="slim-container">
        <div className="extruded-surface login-form">

          <h2>Reset link sent</h2>

          <img src="/img/link-sent.png" style={{ width: '165px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />

          <div className="panel info" style={{ marginTop: '35px' }}>
            <div className="row">
              <div className="message-container">
                <div className="message" style={{ textAlign: 'center', color: '#527AAA' }}>Check your mailbox carefully for the link</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '110px', marginBottom: '110px', fontSize: '12px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
            Suddenly remembered your password?&nbsp;
            <Link href="/login">
              <a className="login-link" style={{ fontSize: '12px', fontWeight: 'bold', color: '#527AAA' }}>Log in</a>
            </Link>
          </div>
        </div>
      </div>

      <HelpButton />
    </>
  );
}

export default withApollo(PasswordResetRequested);
