/**
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import { classNames } from '../../utilities/css';
import { Item, TabItemProps } from './components';
import styles from './Tabs.module.scss';

type ScrollBehavior = 'auto' | 'smooth';

export interface TabsProps {
  /** List of tab items */
  items: TabItemProps[];
  /**
   * Scroll behavior
   * @default 'smooth'
   */
  scrollBehavior?: ScrollBehavior;
}

export function Tabs({ items, scrollBehavior = 'smooth' }: TabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabRefs = useRef(
    Array.from({ length: items.length }, () =>
      React.createRef<HTMLDivElement>()
    )
  );

  const [overflow, setOverflow] = useState(false);
  const [shadowLeft, setShadowLeft] = useState(false);
  const [shadowRight, setShadowRight] = useState(false);

  useEffect(() => {
    updateAppearance();
  }, [items]);

  useEffect(() => {
    window.addEventListener('resize', updateAppearance);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', resolveShadows);
    }

    return () => {
      window.removeEventListener('resize', updateAppearance);

      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener(
          'scroll',
          resolveShadows
        );
      }
    };
  }, []);

  function updateAppearance() {
    resolveOverflow();
    resolveScrollPosition();
    resolveShadows();
  }

  function resolveOverflow() {
    const containerWidth = measureContainerWidth();
    const tabsWidth = measureTabsWidth();
    setOverflow(tabsWidth > containerWidth);
  }

  function resolveShadows() {
    if (!scrollContainerRef.current) {
      return;
    }

    const ref = scrollContainerRef.current;
    setShadowLeft(ref.scrollLeft > 0);
    setShadowRight(ref.scrollLeft !== ref.scrollWidth - ref.offsetWidth);
  }

  function resolveScrollPosition() {
    const index = items.findIndex((item) => item.active);
    if (index < 0) {
      return;
    }

    const ref = tabRefs.current[index];
    if (ref.current) {
      scrollIntoView(ref.current, {
        behavior: scrollBehavior,
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  function measureContainerWidth() {
    let width = 0;

    if (scrollContainerRef.current) {
      width = scrollContainerRef.current.offsetWidth;
    }

    return width;
  }

  function measureTabsWidth() {
    let width = 0;

    tabRefs.current.map((ref) => {
      if (ref.current) {
        width += ref.current.offsetWidth;
      }
    });

    return width;
  }

  const className = classNames(
    styles.Tabs,
    overflow && styles.overflow,
    shadowLeft && styles.shadowLeft,
    shadowRight && styles.shadowRight
  );

  return (
    <div className={className}>
      <div ref={scrollContainerRef} className={styles.ScrollContainer}>
        {items.map((item, index) => (
          <div
            key={index}
            ref={tabRefs.current[index]}
            className={styles.TabWrapper}
          >
            <Item
              content={item.content}
              badge={item.badge}
              url={item.url}
              active={item.active}
              onClick={item.onClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
