"use client";

import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={[2]} allowPsychologist={false}>
      <AdminLayout role={2} isPsychologist={false}>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
