import { Suspense } from "react";
import { AssessmentPage } from "@/components/assessment/assessment-page";

export default function AssessmentRoute() {
  return (
    <Suspense>
      <AssessmentPage />
    </Suspense>
  );
}
