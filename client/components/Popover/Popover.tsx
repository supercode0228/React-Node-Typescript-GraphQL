/**
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import { PopperChildrenProps, usePopper } from 'react-popper';
import { classNames } from '../../utilities/css';
import styles from './Popover.module.scss';

export interface PopoverProps {
  /** Content to display inside the popover */
  children?: React.ReactNode;
  /** Whether or not the popover is active */
  active?: boolean;
  /** Element to activate the popover */
  activator: React.ReactElement;
  /**
   * Placement
   * @default 'bottom-end'
   */
  placement?: PopperChildrenProps['placement'];
  /** Remove border */
  noBorder?: boolean;
  /** Callback when the popover is closed */
  onClose: () => void;
}

export function Popover({
  children,
  active,
  activator,
  placement = 'bottom-end',
  noBorder,
  onClose
}: PopoverProps) {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown, false);

    return () =>
      document.removeEventListener('mousedown', handleMouseDown, false);
  }, [active]);

  function handleMouseDown(event: MouseEvent) {
    if (
      event.target instanceof Element &&
      wrapper.current &&
      wrapper.current.contains(event.target)
    ) {
      return;
    }

    if (active) {
      onClose();
    }
  }

  const className = classNames(
    styles.Popover,
    active && styles.active,
    noBorder && styles.noBorder
  );

  const [
    referenceElement,
    setReferenceElement
  ] = useState<HTMLButtonElement | null>();

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>();

  const { styles: popperStyles, attributes, forceUpdate } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 10]
          }
        },
        {
          name: 'preventOverflow',
          options: {
            altAxis: true,
            padding: 10
          }
        }
      ]
    }
  );

  useEffect(() => {
    if (forceUpdate) {
      forceUpdate();
    }
  }, [active]);

  return (
    <div ref={wrapper} className={className}>
      {React.cloneElement(activator, { ref: setReferenceElement })}

      <div
        ref={setPopperElement}
        className={styles.Content}
        style={popperStyles.popper}
        {...attributes.popper}
      >
        {children}
      </div>
    </div>
  );
}
