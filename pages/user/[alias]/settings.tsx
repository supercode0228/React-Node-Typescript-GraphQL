import { withApollo } from '../../../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDebouncedCallback } from 'use-debounce/lib';
import ReactTagInput from "@pathofdev/react-tag-input";
import validator from 'validator';
import Formsy from 'formsy-react';
import getConfig from 'next/config';

import '../../app.scss';
import { resolveQuery } from '../../../client/util/graphqlHelpers';
import { GET_USER, CHECK_CREDENTIALS_AVAILABLE, UPDATE_USER_DATA, CHANGE_PASSWORD, DELETE_ACCOUNT } from '../../../client/graphql/user';
import { HelpButton, TopBar } from '../../../client/components';
import { UserInfo } from '../../../shared/types';
import AvailableCredentialsInput from '../../../client/components/AvailableCredentialsInput';
import Checkbox from '../../../client/components/basic/Checkbox';
import FileUpload from '../../../client/components/basic/FileUpload';
import { postMultipart, httpDelete } from '../../../client/api';
import SocialLinkListEditor from '../../../client/components/SocialLinkListEditor';
import ValidatedInput from '../../../client/components/basic/ValidatedInput';
import { PasswordPattern } from '../../../shared/config';
import { ensureAccess, onlyOwnerAccess } from '../../../client/util/accessControl';
import Head from 'next/head';

const { publicRuntimeConfig } = getConfig();

const UserSettingsPage = () => {
  const router = useRouter();

  const [ userData, setUserData ] = useState<UserInfo | undefined>(undefined);

  const { data, error, refetch } = useQuery(GET_USER, {
    variables: { alias: router.query.alias },
  });
  ensureAccess(error);
  const userInfo = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [data]);
  onlyOwnerAccess(userInfo);
  const [ updateUserData, { } ] = useMutation(UPDATE_USER_DATA);
  const [ changePassword, { } ] = useMutation(CHANGE_PASSWORD);
  const [ deleteAccount, { } ] = useMutation(DELETE_ACCOUNT);

  const [ passwordChangeError, setPasswordChangeError ] = useState<string | undefined>();
  const [ passwordChanged, setPasswordChanged ] = useState(false);
  const [ accountDeletionRequested, setAccountDeletionRequested ] = useState(false);

  useEffect(
    () => {
      if(!userInfo)
        return;

      setUserData({
        name: userInfo.name,
        // login: userInfo.login,
        // authProvider: userInfo.authProvider,
        alias: userInfo.alias,
        skillArea: userInfo.skillArea,
        publicProfile: userInfo.publicProfile,
        about: userInfo.about,
        jobTitle: userInfo.jobTitle,
        location: userInfo.location,
        links: userInfo.links,
        references: userInfo.references,
      });
    },
    [userInfo]
  );

  const saveData = async (evt : React.MouseEvent) => {
    evt.preventDefault();

    const res = await updateUserData({
      variables: { data: userData },
      refetchQueries: [
        {
          query: GET_USER,
          variables: { alias: router.query.alias },
        },
        {
          query: GET_USER,
        },
      ],
    });

    // console.log('res', res)
    Router.push(`/user/${userData?.alias}`);
  };

  const [ avatarHash, setAvatarHash ] = useState('');
  const updateAvatar = async (f : File) => {
    await postMultipart(`/user/${userInfo?.alias}/avatar`, { 'avatar': f });
    await refetch();
    setAvatarHash(Date.now().toString());
  }

  const removeAvatar = async () => {
    await httpDelete(`/user/${userInfo?.alias}/avatar`);
    await refetch();
    setAvatarHash(Date.now().toString());
  };

  const tryChangePassword = async (data : any) => {
    // evt : React.FormEvent<HTMLFormElement>
    // evt.preventDefault();
    console.log('data', data)

    setPasswordChangeError(undefined);

    try {
      const res = await changePassword({
        variables: { oldPassword: data.oldPassword, newPassword: data.newPassword },
      });
      setPasswordChanged(true);
    } catch(e) {
      setPasswordChangeError(e.graphQLErrors?.[0]?.message);
    }
  };

  const tryDeleteAccount = async () => {
    await deleteAccount();
    setAccountDeletionRequested(true);
  };

  return (
    <>
      <Head>
        <title>Account settings</title>
      </Head>
      <TopBar />
      {(userInfo && userInfo.me && userData) &&
      <>
        <div className="header">
          <div className="container">
            <div className="block-left">
              <div
                className="avatar"
                style={{
                  backgroundImage: `url(/static/user/${userInfo.id}/${userInfo.avatar}?${avatarHash})`,
                  backgroundSize: 'cover'
                }}
              />

              <div className="info">
                <div className="name">
                  <input
                    type='text'
                    value={userData.name}
                    onChange={evt => setUserData({ ...userData, name: evt.target.value })}
                  />
                </div>
                <a className="link remove-avatar" onClick={evt => removeAvatar()}>
                  Remove Image
                </a>
                <FileUpload
                  onChange={(f) => updateAvatar(f)}
                  label='Upload Image'
                />
              </div>
            </div>
            <div className="block-center shrink-mobile" style={{ borderRight: '0' }}>
              <div className="handle editable">
                <div className="title">
                  Personal handle
                </div>
                <div className="handle-input">
                  <AvailableCredentialsInput
                    value={userData.alias}
                    onChange={val => setUserData({ ...userData, alias: val })}
                    field='alias'
                    placeholder='Alias'
                  />
                </div>
                <div className="url small">
                  Your Tests URL: {publicRuntimeConfig.RootUri}/user/<strong>{userData.alias}</strong>
                </div>
              </div>
            </div>
            <div className="block-right shrink-mobile">
              <button className="btn save-btn" onClick={evt => saveData(evt)}>Save</button>
            </div>
          </div>
        </div>
        <div className="container">
            <div className="centered">
            </div>
        </div>

        <div className="container settings">
          <div className="block-left">
          </div>
          <div className="block-center">
            <div className="tile">
              <div className="extruded-surface">
                <div className="title">Login & Password</div>

                <div className="account-settings">
                  <div className="input-group">
                    <div className="input-label">Your email</div>
                    <div className="settings-login">
                      <div className="static-value">
                        {userInfo?.login}
                      </div>
                      {userInfo?.authProvider === 'google' &&
                        <div className="auth-provider">Managed by Google</div>
                      }
                    </div>
                  </div>

                  {!userData.authProvider &&
                  <Formsy onValidSubmit={tryChangePassword}>
                  {/* onValid={this.enableButton} onInvalid={this.disableButton} */}
                    <div className="input-group">
                      <div className="input-label">Old Password</div>
                      <ValidatedInput
                        name="oldPassword"
                        type='password'
                        required={true}
                        manualError={passwordChangeError != null}
                        validationError="Old password doesn't match"
                      />
                    </div>

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
                    <input type="submit" className="btn-slim dark" value="Save" style={{ marginTop: '40px' }} />
                    {passwordChanged &&
                      <div className="submit-success">Password changed</div>
                    }
                  </Formsy>
                  }
                </div>
                <div className="spacer" />

                <div className="delete-account">
                  <a className="link dangerous" onClick={evt => tryDeleteAccount()}>Close Account</a>
                  <div className="input-label">Delete Account</div>
                  <div className="input-desc">Deletes and erases your profile and all your skills data</div>
                  {accountDeletionRequested &&
                    <div className="panel danger">
                      <div className="row">
                        <div className="message-container">
                          <div className="caption">You are attempting to delete your account</div>
                          <div className="message">
                            Check your email for a confirmation link to delete your account permanently.<br/>
                            <strong>If this was a mistake,</strong> 🙏 just ignore the email that was sent.
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="block-right">
          </div>
        </div>
      </>
      }

      <HelpButton />
    </>
  );
}

export default withApollo(UserSettingsPage);
