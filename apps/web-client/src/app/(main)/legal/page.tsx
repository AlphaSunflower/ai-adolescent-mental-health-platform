import { LegalPage, type LegalTab } from "@/components/legal/legal-page";

export default function LegalRoute({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const tabParam = searchParams.tab;
  const initialTab: LegalTab =
    typeof tabParam === "string" && ["privacy", "terms", "disclaimer", "minor"].includes(tabParam)
      ? (tabParam as LegalTab)
      : "privacy";
  return <LegalPage initialTab={initialTab} />;
}
