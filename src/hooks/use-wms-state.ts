'use client';

import { useContext } from 'react';
import { WMSContext } from '@/context/wms-context';

export function useWMSState() {
  const context = useContext(WMSContext);
  if (!context) {
    throw new Error('useWMSState must be used within a WMSProvider');
  }
  return context;
}
