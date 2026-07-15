import React from 'react';
import Link from 'next/link';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AdminHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
