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
        fontSize: "12px",
        lineHeight: 1.5,
        color: isDark ? "rgba(255, 255, 255, 0.72)" : "#909399",
        backgroundColor: isDark ? "transparent" : "#fff",
        borderTop: isDark ? "none" : "1px solid #ebeef5",
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
