import { tokens } from "@/lib/design-tokens";

type FilingFooterProps = {
  variant?: "light" | "dark";
};

export function FilingFooter({ variant = "light" }: FilingFooterProps) {
  const isDark = variant === "dark";

  return (
    <footer
      style={{
        flexShrink: 0,
        padding: isDark ? "0 20px 18px" : "10px 20px",
        textAlign: "center",
        fontSize: tokens.fontSizeXs,
        lineHeight: 1.5,
        color: isDark ? "rgba(255, 255, 255, 0.45)" : tokens.textDisabled,
        backgroundColor: "transparent",
        borderTop: isDark ? "none" : `1px solid ${tokens.borderLight}`,
      }}
    >
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "inherit",
          textDecoration: "none",
        }}
      >
        粤ICP备2025440449号
      </a>
    </footer>
  );
}
