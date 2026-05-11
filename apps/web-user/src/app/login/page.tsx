import { Suspense } from "react";
import { Skeleton } from "@ai-adolescent-mental-health/ui";

import { LoginPage } from "@/components/login-page";

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="min-h-screen w-full" />}>
      <LoginPage />
    </Suspense>
  );
}
