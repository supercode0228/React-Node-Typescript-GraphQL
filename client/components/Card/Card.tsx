/**
 * @format
 */

import React from 'react';
import { Header, Section } from './components';
import styles from './Card.module.scss';

export interface CardProps {
  /** Content to display inside the card */
  children?: React.ReactNode;
  /** Auto wrap content in section */
  sectioned?: boolean;
}

export function Card({ children, sectioned }: CardProps) {
  const contentMarkup = sectioned ? <Section>{children}</Section> : children;

  return <div className={styles.Card}>{contentMarkup}</div>;
}

Card.Header = Header;
Card.Section = Section;
