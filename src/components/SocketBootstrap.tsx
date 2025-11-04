'use client';

import { useEffect } from 'react';

export default function SocketBootstrap() {
  useEffect(() => {
    // Trigger server-side Socket.io initialization once
    fetch('/api/socket').catch(() => {
      // swallow errors to avoid disrupting UI
    });
  }, []);

  return null;
}