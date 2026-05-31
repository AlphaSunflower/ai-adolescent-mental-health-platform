"use client";

import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[4]} allowPsychologist={false}>
      <AdminLayout role={4} isPsychologist={false}>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
