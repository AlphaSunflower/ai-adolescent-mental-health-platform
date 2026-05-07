import { Suspense } from "react";
import { PsychologistListPage } from "@/components/consultation/psychologist-list-page";

export default function PsychologistListRoute() {
  return (
    <Suspense>
      <PsychologistListPage />
    </Suspense>
  );
}
