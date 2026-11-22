'use client';

import { useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, subscribe } from './store';

export const useUserData = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
