/**
 * @format
 */

import React from 'react';
import { Icon } from '../Icon';
import { Link } from '../Link';
import { Stack } from '../Stack';
import { TextStyle } from '../TextStyle';
import styles from './UnlockFeature.module.scss';

export interface UnlockFeatureProps {
  /** Description of what to unlock */
  description: string;
}

export function UnlockFeature({ description }: UnlockFeatureProps) {
  return (
    <div className={styles.UnlockFeature}>
      <Stack wrap={false} spacing="extraTight" alignment="center">
        <Icon source="locked" />

        <Stack.Item fill={true}>
          <TextStyle color="blue">{description}</TextStyle>
        </Stack.Item>

        <Link url="mailto:sales@tests.com">Upgrade to Pro</Link>
      </Stack>
    </div>
  );
}
