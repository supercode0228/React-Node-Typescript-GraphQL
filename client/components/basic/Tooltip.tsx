import React from 'react';
import TooltipTrigger from 'react-popper-tooltip';
import { TooltipTriggerProps } from 'react-popper-tooltip/dist/types';

interface Props {
  tooltip : string;
  children : JSX.Element;
  hideArrow? : boolean;
  trigger : "none" | "click" | "right-click" | "hover" | "focus" | undefined;
};
 
const Tooltip = ({children, tooltip, hideArrow, ...props} : Props) => (
  <TooltipTrigger
    {...props}
    tooltip={({
      arrowRef,
      tooltipRef,
      getArrowProps,
      getTooltipProps,
      placement
    }) => (
      <div
        {...getTooltipProps({
          ref: tooltipRef,
          className: 'tooltip-container'
        })}
      >
        {!hideArrow && (
          <div
            {...getArrowProps({
              ref: arrowRef,
              className: 'tooltip-arrow',
              'data-placement': placement
            })}
          />
        )}
        {tooltip}
      </div>
    )}
  >
    {({getTriggerProps, triggerRef}) => (
      <span
        {...getTriggerProps({
          ref: triggerRef,
          className: 'trigger'
        })}
      >
        {children}
      </span>
    )}
  </TooltipTrigger>
);
 
export default Tooltip;
