"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken, getStoredUser } from "@/lib/session";
import { getRoleDashboardPath } from "@/lib/role-utils";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles: number[];
  allowPsychologist?: boolean;
}

export function AuthGuard({ children, allowedRoles, allowPsychologist = false }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    const user = getStoredUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const role = (user as Record<string, unknown>).role as number | undefined;
    const isPsychologist = (user as Record<string, unknown>).isPsychologist === 1;
    if (role === undefined || role === null) {
      router.replace("/login");
      return;
    }
    const hasRole = allowedRoles.includes(role);
    const hasPsych = allowPsychologist && isPsychologist;
    if (!hasRole && !hasPsych) {
      router.replace(getRoleDashboardPath(role, isPsychologist));
      return;
    }
    setAuthorized(true);
  }, [router, allowedRoles, allowPsychologist]);

  if (!authorized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#909399", fontSize: "14px" }}>
        加载中...
      </div>
    );
  }
  return <>{children}</>;
}
