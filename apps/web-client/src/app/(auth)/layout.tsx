import { Starfield } from "@/components/cosmic/starfield";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Starfield />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        {children}
      </div>
    </>
  );
}
