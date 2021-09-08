import { withApollo } from '../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';
import Link from 'next/link';
import Formsy from 'formsy-react';
import validator from 'validator';

import { post } from '../client/api';
import './app.scss';
import { resolveQuery } from '../client/util/graphqlHelpers';
import AvailableCredentialsInput from '../client/components/AvailableCredentialsInput';
import ValidatedInput from '../client/components/basic/ValidatedInput';
import { PasswordPattern } from '../shared/config';
import { HelpButton, TopBar } from '../client/components';
import Head from 'next/head';
import { GET_USER } from '../client/graphql/user';
import { UserInfo } from '../shared/types';

interface RegisterRes {
  error? : string;
};

const Signup = () => {
  const router = useRouter();

  const { data } = useQuery(GET_USER);
  const userInfo = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [data]);
  if(typeof window !== 'undefined' && userInfo && userInfo.me)
    router.push(`/dashboard`);

  const [ login, setLogin ] = useState((router.query.inviteEmail as string) || '');
  // const [ pass, setPass ] = useState('');
  // const [ loginError, setLoginError ] = useState<string | undefined>();
  // const [ passError, setPassError ] = useState<string | undefined>();
  const [ loggingIn, setLoggingIn ] = useState(false);
  const tryRegister = async (data : any) => {
    // evt.preventDefault();
    setLoggingIn(true);

    const authRes : RegisterRes = await post('/register', { login, pass: data.pass });
    console.log('authRes', authRes);
    if(!authRes.error) {
      // Router.push('/finishSignup');
      window.location.href = '/finishSignup';
    }

    setLoggingIn(false);
  };

  return (
    <>
      <Head>
        <title>Sign up — Tests</title>
        <meta name="title" content="Tests Sign Up"/>
        <meta name="description" content="Sign up on Tests to visualize your skills and your team's. It's free for teams and individuals."/>
      </Head>
      <TopBar />
      <div className="slim-container">
        <div className="extruded-surface signup-form">
        <h1>Sign up</h1>

        <div className="input-group">
          <a className="link oauth-link" href="/auth/google">
            <button className="btn-inv use-auth-provider">
              <img className="icon" src="/icons/authProvider-google.svg" />
              <span>Sign up with Google</span>
            </button>
          </a>
        </div>

        <div className="login-separator"><div /><span>or</span><div /></div>

          <Formsy onValidSubmit={tryRegister}>
            <AvailableCredentialsInput
              value={login}
              onChange={val => setLogin(val)}
              field='login'
              placeholder='Email'
            />
            <div className="input-group">
              <ValidatedInput
                name="pass"
                type='password'
                required={true}
                validations={{ '': (_ : any, val : string) => !val || validator.matches(val, PasswordPattern) }}
                validationError="Password should be at least 6 symbols long and contain an uppercase letter and a digit"
                placeholder="Password"
              />
            </div>
            <div className="input-group">
              <input className="btn" type="submit" disabled={loggingIn} value="Create account" />
            </div>

            <div style={{ marginTop: '30px', fontSize: '12px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
              <span style={{ width: 'fit-content'}}>Already have an account?&nbsp;</span>
              <Link href="/login">
                <a style={{
                  display: 'inline-block', width: 'fit-content', fontSize: '12px', fontWeight: 'bold', color: '#527AAA'
                }}>
                  Log in
                </a>
              </Link>
            </div>

            <div className="terms-privacy">
              <span>
                By clicking “Sign up with Google/Create Account” above, you acknowledge that you have read and understood, and agree to Test’s&nbsp;
                <a href="https://www.Tests.com/legal/terms" target="_blank" rel="noopener noreferer">
                  Terms & Conditions
                </a>
                &nbsp;and&nbsp;
                <a href="https://www.Tests.com/legal/privacy" target="_blank" rel="noopener noreferer">
                  Privacy Policy
                </a>
              </span>
            </div>
          </Formsy>
        </div>
      </div>

      <HelpButton />
    </>
  );
}

export default withApollo(Signup);
