"use client";

import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function PsychologistAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[]} allowPsychologist={true}>
      <AdminLayout role={1} isPsychologist={true}>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
