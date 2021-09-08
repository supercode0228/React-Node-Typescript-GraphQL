// Ref: https://github.com/airbnb/react-dates/issues/262#issuecomment-409855452
import React from "react";
import MediaQuery from "react-responsive";
import { maybeClipStr } from "../../shared/util/str";

export const MobileOnly = (props : any) => <MediaQuery {...props} maxDeviceWidth={767} />;
export const DesktopOnly = (props : any) => <MediaQuery {...props} minDeviceWidth={768} />;

export const responsiveMaybeClipStr = (s : string, desktopMaxLen : number, mobileMaxLen : number) => {
  return (
    <>
      <MobileOnly>{maybeClipStr(s, mobileMaxLen)}</MobileOnly>
      <DesktopOnly>{maybeClipStr(s, desktopMaxLen)}</DesktopOnly>
    </>
  );
};

export const responsiveShrinkOrClipStr = (s : string, desktopMaxLen : number, mobileMaxLen : number) => {
  return (
    <>
      <MobileOnly>{maybeClipStr(s, mobileMaxLen)}</MobileOnly>
      <DesktopOnly>
        <div style={{ fontSize: `${s.length < desktopMaxLen ? 1.0 : (desktopMaxLen / (desktopMaxLen + Math.pow(s.length - desktopMaxLen, 0.67)))}em` }}>
          {s}
        </div>
      </DesktopOnly>
    </>
  );
};
