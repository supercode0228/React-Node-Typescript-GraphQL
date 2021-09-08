import { withApollo } from '../lib/apollo';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Router from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Select from 'react-select';
import validator from 'validator';
import Formsy from 'formsy-react';

import './app.scss';
import { resolveQuery } from '../client/util/graphqlHelpers';
import { UPDATE_USER_DATA, GET_USER } from '../client/graphql/user';
import { UserInfo } from '../shared/types';
import skillAreas from '../shared/data/skillAreas.json';
import Checkbox from '../client/components/basic/Checkbox';
import AvailableCredentialsInput from '../client/components/AvailableCredentialsInput';
import { HelpButton, TopBar } from '../client/components';
import ValidatedInput from '../client/components/basic/ValidatedInput';
import Head from 'next/head';

interface RegisterRes {
  error? : string;
};

const FinishSignup = () => {
  const [ name, setName ] = useState('');
  const [ alias, setAlias ] = useState('');
  const [ skillArea, setSkillArea ] = useState('');
  const [ joinedMailingList, setJoinedMailingList ] = useState(false);
  const [ loggingIn, setLoggingIn ] = useState(false);

  const { data } = useQuery(GET_USER, {
    // variables: { },
  });
  const userInfo = useMemo(resolveQuery<UserInfo | null>(data, 'user', null), [data]);
  const [ updateUserData, { } ] = useMutation(UPDATE_USER_DATA);

  useEffect(
    () => {
      if(!userInfo)
        return;

      setName(userInfo.name);
      setAlias(userInfo.alias);
      setSkillArea(userInfo.skillArea);
    },
    [userInfo]
  );

  const saveData = async (data : any) => {
    // evt.preventDefault();
    setLoggingIn(true);

    const res = await updateUserData({
      variables: { data: { name: data.name, alias, skillArea, joinedMailingList } },
    })

    // console.log('res', res)
    Router.push(`/user/${alias}`);

    setLoggingIn(false);
  };

  const skillAreasList = [
    { value: '', label: 'What role best describes you?' },
    ...Object.keys(skillAreas).map(k => ({ value: k, ...(skillAreas as any)[k] }))
  ];

  return (
    <>
      <Head>
        <title>Almost there — Tests</title>
      </Head>
      <TopBar />
      <div className="slim-container">
        <div className="extruded-surface finish-signup-form">
          <h2>Welcome!</h2>

          <div style={{ width: '100%', textAlign: 'center', marginBottom: '30px' }}>Let’s get to know you much better</div>

          <Formsy onValidSubmit={saveData}>
            <div className="input-group name-group">
              <div className="input-label">Your full name</div>
              <ValidatedInput
                name="name"
                type="text"
                value={name}
                required={true}
                // onChange={val => setName(val)}
                placeholder="Full name"
                validations={{ '': (_ : any, val : string) => val && validator.matches(val, /^.+$/) }}
                validationError="Name should not be empty"
              />
            </div>

            <AvailableCredentialsInput
              className="handle-group"
              value={alias}
              onChange={val => setAlias(val)}
              field='alias'
              placeholder='handle'
              label='Your handle'
            />
            {/* <select value={skillArea} onChange={evt => setSkillArea(evt.target.value)}>
              <option value='' disabled>What role best describes you?</option>
              {Object.keys(skillAreas).map((k, i) =>
                <option key={i} value={k}>{(skillAreas as any)[k].label}</option>
              )}
            </select> */}

            <Select
              value={skillAreasList.find(p => p.value === skillArea)}
              onChange={option => setSkillArea((option as any)?.value)}
              options={skillAreasList}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  width: '100%',
                  // height: '37px',
                  // minHeight: '37px',
                  // borderLeft: '0',
                  border: '0',
                  borderBottom: '1px solid #000',
                  borderRadius: '0',
                  // borderTopLeftRadius: '0',
                  // borderTopRightRadius: '0',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  fontSize: '14px',
                  // color: '#666',
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: 'none',
                }),
                indicatorsContainer: (provided, state) => ({
                  ...provided,
                  visibility: state.isDisabled ? 'hidden' : 'visible',
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: '14px',
                  // color: '#666',
                }),
              }}
            />
            <div className="input-group join-mailing-list" style={{ marginTop: '16px' }}>
              <Checkbox
                checked={joinedMailingList}
                onChange={setJoinedMailingList}
                label="I agree to join Test’s events & newsletter mailing list (optional)"
              />
            </div>
            <input className="btn" type="submit" disabled={loggingIn} value="Complete account" />
          </Formsy>
        </div>
      </div>

      <HelpButton />
    </>
  );
}

export default withApollo(FinishSignup);
