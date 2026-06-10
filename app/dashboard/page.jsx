
'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const auth = useAuth();

  return (
    <div>
      <h1>DASHBOARD DEBUG</h1>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
}
