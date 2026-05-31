"use client";

import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function HospitalAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[3]} allowPsychologist={false}>
      <AdminLayout role={3} isPsychologist={false}>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
