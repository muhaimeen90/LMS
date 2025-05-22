"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import ColorBlindnessFilters from './ColorBlindnessFilters';

// Import keyboard shortcuts handler
const KeyboardShortcutsHandler = dynamic(
  () => import('../utils/keyboardShortcuts').then(mod => {
    const { default: useKeyboardShortcuts } = mod;
    return function KeyboardShortcutsWrapper() {
      useKeyboardShortcuts();
      return null;
    };
  }),
  { ssr: false }
);

// Import screen reader announcer
const ScreenReaderAnnouncerComponent = dynamic(
  () => import('../utils/screenReaderAnnouncer').then(mod => mod.default),
  { ssr: false }
);

export default function ClientComponents() {
  return (
    <>
      <KeyboardShortcutsHandler />
      <ScreenReaderAnnouncerComponent />
      <ColorBlindnessFilters />
    </>
  );
}
