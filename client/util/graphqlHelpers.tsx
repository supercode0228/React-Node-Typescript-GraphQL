import React, { useEffect, useState, useRef, useMemo } from 'react';

export const resolveQuery = <T extends unknown>(data : any, field : string, defaultValue : T) : (() => T) => {
  return () => {
    if(!data)
      return defaultValue;
    return data[field] as T;
  };
};
