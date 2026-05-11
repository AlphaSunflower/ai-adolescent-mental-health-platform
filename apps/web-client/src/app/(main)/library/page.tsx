import { Suspense } from "react";
import { LibraryPage } from "@/components/library/library-page";

export default function LibraryRoute() {
  return (
    <Suspense>
      <LibraryPage />
    </Suspense>
  );
}
