'use client';

import { useEffect } from 'react';

export default function ThemeInit() {
  useEffect(() => {
    try {
      if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light');
      }
    } catch {}
  }, []);

  return null;
}
