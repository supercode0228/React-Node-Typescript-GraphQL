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
import Head from 'next/head';

interface AuthRes {
  authed : boolean,
  error? : string;
};

const Login = () => {
  const router = useRouter();
  const { data } = useQuery(GET_USER);
  const userInfo = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [data]);
  if(typeof window !== 'undefined' && userInfo && userInfo.me)
    router.push(`/dashboard`);

  const [ requestResetPassword, { } ] = useMutation(REQUEST_RESET_PASSWORD);

  const [ loginError, setLoginError ] = useState<string | undefined>();
  const [ passError, setPassError ] = useState<string | undefined>();
  const [ forgotPassword, setForgotPassword ] = useState(false);
  const [ loggingIn, setLoggingIn ] = useState(false);
  const tryLogin = async (data : any) => {
    // evt.preventDefault();
    setLoggingIn(true);
    setLoginError(undefined);
    setPassError(undefined);

    const authRes : AuthRes = await post('/login', { login: data.login, pass: data.pass });
    console.log('authRes', authRes);
    if(authRes.error === 'INCORRECT_USERNAME')
      setLoginError('No account with this email exists');
    if(authRes.error === 'INCORRECT_PASSWORD')
      setPassError('The password is incorrect');
    if(authRes.authed) {
      // Router.push('/dashboard');
      window.location.href = '/dashboard';
    }

    setLoggingIn(false);
  };


  const resetPassword = async (data : any) => {
    setLoggingIn(true);
    setLoginError(undefined);

    try {
      await requestResetPassword({
        variables: { email: data.login },
      });

      Router.push('/passwordResetRequested');
    } catch(e) {
      if(e.graphQLErrors?.[0]?.message === 'Cannot find the user record') {
        setLoginError('No account with this email exists');
      }
      console.log('e', JSON.stringify(e))
    }

    setLoggingIn(false);
  };

  return (
    <>
      <Head>
        <title>Log in — Tests</title>
        <meta name="title" content="Tests Log in"/>
        <meta name="description" content="Login to your Tests account to view your visualized skills and skill sets"/>
      </Head>
      <TopBar />
      <div className="slim-container">
        <div className="extruded-surface login-form">

          <h1>Log in</h1>

          <div className="input-group">
            <a className="link oauth-link" href="/auth/google">
              <button className="btn-inv use-auth-provider">
                <img className="icon" src="/icons/authProvider-google.svg" />
                <span>Log in with Google</span>
              </button>
            </a>
          </div>

          <div className="login-separator"><div /><span>or</span><div /></div>

          <Formsy onValidSubmit={forgotPassword ? resetPassword : tryLogin}>
            <div className="input-group">
              <ValidatedInput
                name="login"
                type='email'
                required={true}
                manualError={loginError != null}
                validationError={loginError}
                placeholder="Email"
              />
            </div>
            {!forgotPassword &&
              <div className="input-group">
                <ValidatedInput
                  name="pass"
                  type='password'
                  required={true}
                  manualError={passError != null}
                  validationError={passError}
                  placeholder="Password"
                />
              </div>
            }
            <div className="input-group">
              <input className="btn" type="submit" disabled={loggingIn} value={forgotPassword ? "Send reset link" : "Log in"} />
            </div>
            {!forgotPassword ?
              <div className="forgot-password-notice" style={{ marginTop: '30px', fontSize: '12px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
                <span style={{ width: 'fit-content'}}>Forgot password?&nbsp;</span>
                <a className="link" onClick={evt => setForgotPassword(true)} style={{
                  display: 'inline-block', width: 'fit-content', fontSize: '12px', fontWeight: 'bold', color: '#527AAA'
                }}>
                  Click here
                </a>
              </div>
            :
              <div style={{ marginTop: '30px', fontSize: '12px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
                <span style={{ width: 'fit-content'}}>Suddenly remembered your password?&nbsp;</span>
                <a className="link" onClick={evt => setForgotPassword(false)} style={{
                  display: 'inline-block', width: 'fit-content', fontSize: '12px', fontWeight: 'bold', color: '#527AAA'
                }}>
                  Log in
                </a>
              </div>
            }

            <div className="terms-privacy">
              <span>
                By clicking “Log in with Google/Log in” above, you acknowledge that you have read and understood, and agree to Test’s&nbsp;
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

export default withApollo(Login);
