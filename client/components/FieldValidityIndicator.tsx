import React, { useEffect, useState, useRef, useMemo } from 'react';

interface Props {
  visible : boolean;
  loading : boolean;
  valid : boolean;
};

const FieldValidityIndicator = ({ visible, loading, valid } : Props) => {
  const showLoading = visible && loading;
  const showValidity = visible && !loading;
  return (
    <>
      <img 
        className="icon" 
        src="/icons/field-loading.svg" 
        style={{
          visibility: showLoading ? 'visible' : 'hidden',
          opacity: showLoading ? '1.0' : '0',
        }}
      />
      <img 
        className="icon" 
        src="/icons/field-check.svg" 
        style={{
          visibility: showValidity && valid ? 'visible' : 'hidden',
          opacity: showValidity && valid ? '1.0' : '0',
        }}
      />
      <img 
        className="icon" 
        src="/icons/field-cross.svg" 
        style={{
          visibility: showValidity && !valid ? 'visible' : 'hidden',
          opacity: showValidity && !valid ? '1.0' : '0',
        }}
      />
    </>
  );
};

export default FieldValidityIndicator;
