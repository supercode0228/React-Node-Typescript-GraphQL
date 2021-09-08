/**
 * @format
 */

import { useMutation } from '@apollo/react-hooks';
import React, { useState } from 'react';
import { DescriptionMaxLength } from '../../../shared/sharedConfig';
import { ADD_PERSONAL_NOTE } from '../../graphql/user';
import { Form } from '../Form';
import { Input } from '../Input';

export interface PersonalNoteFormProps {
  /** Label of the multiline text field */
  label?: string;
  /** Callback when the note is saved */
  onSave?: () => void;
}

export function PersonalNoteForm({ label, onSave }: PersonalNoteFormProps) {
  const [personalNote, setPersonalNote] = useState('');

  const [addPersonalNote] = useMutation(ADD_PERSONAL_NOTE);

  async function save() {
    await addPersonalNote({ variables: { msg: personalNote } });

    setPersonalNote('');
    onSave?.();
  }

  return (
    <Form
      action={{
        content: 'Save',
        disabled: personalNote.length < 1,
        onClick: save
      }}
    >
      <Input
        label={label}
        placeholder="Create notes or goals that you would like to keep a track of here"
        value={personalNote}
        multiline={true}
        maxLength={DescriptionMaxLength}
        onChange={(value) => setPersonalNote(value)}
      />
    </Form>
  );
}
