type FilingFooterProps = {
  variant?: "light" | "dark";
};

const s = {
  colorTextDisabled: "#909399",
  colorTextDark: "rgba(255, 255, 255, 0.72)",
  colorBgBase: "#fff",
  colorBgTransparent: "transparent",
  borderColorBase: "#ebeef5",
  borderNone: "none",
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
        color: isDark ? s.colorTextDark : s.colorTextDisabled,
        backgroundColor: isDark ? s.colorBgTransparent : s.colorBgBase,
        borderTop: isDark ? s.borderNone : `1px solid ${s.borderColorBase}`,
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
