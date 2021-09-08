import { withApollo } from '../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDebouncedCallback } from 'use-debounce/lib';
import ReactTagInput from "@pathofdev/react-tag-input";
import validator from 'validator';
import Formsy from 'formsy-react';

import './app.scss';
import { resolveQuery } from '../client/util/graphqlHelpers';
import { GET_USER, CHECK_CREDENTIALS_AVAILABLE, UPDATE_USER_DATA, DELETE_ACCOUNT } from '../client/graphql/user';
import { HelpButton, TopBar } from '../client/components';
import { UserInfo } from '../shared/types';
import AvailableCredentialsInput from '../client/components/AvailableCredentialsInput';
import Checkbox from '../client/components/basic/Checkbox';
import FileUpload from '../client/components/basic/FileUpload';
import { postMultipart, httpDelete, post } from '../client/api';
import SocialLinkListEditor from '../client/components/SocialLinkListEditor';
import ValidatedInput from '../client/components/basic/ValidatedInput';
import { PasswordPattern } from '../shared/config';
import { ensureAccess } from '../client/util/accessControl';
import Head from 'next/head';

const ResetPassword = () => {
  const router = useRouter();

  const [ passwordChangeError, setPasswordChangeError ] = useState<string | undefined>();
  const [ passwordChanged, setPasswordChanged ] = useState(false);

  const tryResetPassword = async (data : any) => {
    setPasswordChangeError(undefined);

    if(data.newPassword !== data.newPassword2) {
      setPasswordChangeError('The passwords do not match');
      return;
    }

    await post('/resetPassword', { key: router.query.key, newPassword: data.newPassword });
    setPasswordChanged(true);

    window.location.href = '/dashboard';
  };

  return (
    <>
      <Head>
        <title>Password reset — Tests</title>
      </Head>
      <TopBar />
      <div className="container settings">
        <div className="block-left">
        </div>
        <div className="block-center">
          <div className="tile">
            <div className="extruded-surface" style={{ marginTop: '100px', paddingTop: '50px' }}>

              <div className="account-settings" style={{ paddingBottom: '10px' }}>
                <h2>Reset Password</h2>
                <div style={{ width: '100%', textAlign: 'center', marginTop: '-20px', marginBottom: '40px' }}>Please choose a new password</div>

                <Formsy onValidSubmit={tryResetPassword}>
                  <div className="input-group">
                    <div className="input-label">New Password</div>
                    <ValidatedInput
                      name="newPassword"
                      type='password'
                      required={true}
                      validations={{ '': (_ : any, val : string) => !val || validator.matches(val, PasswordPattern) }}
                      validationError="Password should be at least 6 symbols long and contain an uppercase letter and a digit"
                    />
                  </div>

                  <div className="input-group">
                    <div className="input-label">Confirm Password</div>
                    <ValidatedInput
                      name="newPassword2"
                      type='password'
                      required={true}
                      validations={{ '': (_ : any, val : string) => !val || validator.matches(val, PasswordPattern) }}
                      manualError={passwordChangeError != null}
                      validationError={passwordChangeError}
                    />
                  </div>

                  <input type="submit" className="btn centered" value="Save new password & Log in" style={{ height: 'auto', marginTop: '40px', whiteSpace: 'normal' }} />
                  {/* {passwordChanged &&
                    <div className="submit-success">Password changed</div>
                  } */}

                <div style={{ marginTop: '120px', fontSize: '12px', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
                  <span style={{ width: 'fit-content'}}>Already have an account?&nbsp;</span>
                  <Link href="/login">
                    <a style={{
                      display: 'inline-block', width: 'fit-content', fontSize: '12px', fontWeight: 'bold', color: '#527AAA'
                    }}>
                      Log in
                    </a>
                  </Link>
              </div>
                </Formsy>
              </div>
            </div>
          </div>
        </div>
        <div className="block-right">
        </div>
      </div>

      <HelpButton />
    </>
  );
}

export default withApollo(ResetPassword);
