'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Paths where navbar should not appear
  const hiddenPaths = [
    '/sign-in',
    '/sign-up',
    '/admin/dashboard',
    '/officer/dashboard',
    '/institutional/dashboard',
    
  ];

  // Check if pathname starts with any of the hidden paths
  if (hiddenPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return <Navbar />;
}
