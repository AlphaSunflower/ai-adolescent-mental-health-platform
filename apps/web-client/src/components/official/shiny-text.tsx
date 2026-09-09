/**
 * 改编自 React Bits「ShinyText」（reactbits.dev）：纯 CSS 微光扫过文字，无 JS 依赖。
 * 动画关停逻辑见 official.css 的 prefers-reduced-motion 分支。
 */
export default function ShinyText({
  text,
  speed = 5,
  className = "",
}: {
  text: string;
  /** 微光扫过一轮的秒数 */
  speed?: number;
  className?: string;
}) {
  return (
    <span
      className={`official-shiny-text ${className}`}
      style={{ animationDuration: `${speed}s` }}
    >
      {text}
    </span>
  );
}
