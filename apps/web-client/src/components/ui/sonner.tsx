"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        style: {
          background: "linear-gradient(180deg, rgba(20, 30, 80, 0.98) 0%, rgba(30, 40, 100, 0.95) 100%)",
          border: "1px solid rgba(100, 149, 237, 0.3)",
          borderRadius: "12px",
          color: "#fff",
          backdropFilter: "blur(16px)",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
