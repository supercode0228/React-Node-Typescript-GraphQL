/**
 * @format
 */

import React from 'react';
import { Heading } from '../Heading';
import { Stack } from '../Stack';
import styles from './Hint.module.scss';

export interface HintProps {
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Illustration */
  illustration: string;
  /** Label displayed at the top left corner */
  label?: string;
  /** Whether or not the skill definition is visible */
  visible?: boolean;
  /** Callback when the skill definition is closed */
  onClose: () => void;
}

export function Hint({
  title,
  description,
  illustration,
  label,
  visible,
  onClose
}: HintProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className={styles.Hint}>
      {label && <span className={styles.Label}>{label}</span>}

      <a onClick={onClose} className={styles.Close}>
        <img src="/icons/cross-big.svg" />
      </a>

      <Stack wrap={false} spacing="tight" alignment="center">
        <Stack.Item>
          <img src={illustration} className={styles.Illustration} />
        </Stack.Item>

        <Stack.Item fill={true}>
          <Stack vertical={true} spacing="none">
            <Heading element="p">{title}</Heading>

            <p
              dangerouslySetInnerHTML={{
                __html: description
              }}
            />
          </Stack>
        </Stack.Item>
      </Stack>
    </div>
  );
}
