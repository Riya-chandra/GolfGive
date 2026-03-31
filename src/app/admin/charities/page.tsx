import { redirect } from 'next/navigation';
<<<<<<< HEAD
import { getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
=======

import { getCurrentUser } from '@/lib/auth';

import Navbar from '@/components/layout/Navbar';

>>>>>>> 3fda15e (added)
import AdminCharitiesClient from '@/components/admin/AdminCharitiesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCharitiesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/auth/login');

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <a href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</a>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">Charities</span>
          </div>
          <AdminCharitiesClient />
        </div>
      </div>
    </>
  );
}
