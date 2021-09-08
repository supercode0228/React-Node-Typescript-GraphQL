/**
 * @format
 */

import React from 'react';
import styles from './Form.module.scss';

type Action = {
  /** Content of the action */
  content: string;
  /** Whether or not the action is disabled */
  disabled?: boolean;
  /** Callback when the action is clicked */
  onClick: () => void;
};

export interface FormProps {
  /** Content to display inside the form */
  children?: React.ReactNode;
  /** Form action */
  action?: Action;
}

export function Form({ children, action }: FormProps) {
  const actionMarkup = action && (
    <div className={styles.Action}>
      <button
        disabled={action.disabled}
        onClick={action.onClick}
        className="btn-slim dark"
      >
        {action.content}
      </button>
    </div>
  );

  return (
    <div className={styles.Form}>
      {React.Children.map(children, (child, index) => (
        <div key={index} className={styles.Section}>
          {child}
        </div>
      ))}

      {actionMarkup}
    </div>
  );
}
