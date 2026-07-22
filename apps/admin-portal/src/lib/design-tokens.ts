/**
 * 心愈智联管理后台 — 设计令牌
 *
 * 设计方向：「山林与琥珀」
 * - 潭绿主色传递镇定与疗愈感，避免临床冰冷
 * - 暖琥珀作为强调色，仅在关键交互处出现，注入人味
 * - 暖石灰背景取代冷灰 #f0f2f5，与主题呼应
 * - 深潭色侧边栏替代标准蓝灰 #304156，建立平台辨识度
 */

/* ========== 主色系 ========== */
const teal = {
  50:  "#E8F4F4",
  100: "#C5E5E5",
  200: "#9DD4D4",
  300: "#72C0C0",
  400: "#4CA9A9",
  500: "#3B7D7D",   // 主色 — 深潭绿
  600: "#326A6A",
  700: "#285656",
  800: "#1F4242",
  900: "#162E2E",
} as const;

const amber = {
  50:  "#FBF3EA",
  100: "#F5E2CB",
  200: "#EDCDA4",
  300: "#E3B578",
  400: "#D4A04E",
  500: "#C4956A",   // 强调色 — 暖琥珀
  600: "#A87A54",
  700: "#8B6040",
  800: "#6D4830",
  900: "#4E3222",
} as const;

const warmGray = {
  50:  "#F7F5F2",
  100: "#EDEAE6",
  200: "#E0DCD7",
  300: "#CEC9C3",
  400: "#B5B0A9",
  500: "#9C9690",
  600: "#7A7672",
  700: "#5C5855",
  800: "#3D3A37",
  900: "#2D2B28",
} as const;

/* ========== 语义令牌 ========== */
export const tokens = {
  /* 主色 */
  primary:        teal[500],
  primaryHover:   teal[400],
  primaryActive:  teal[600],
  primaryLight:   teal[50],
  primaryBg:      teal[50],

  /* 强调色（关键交互） */
  accent:         amber[500],
  accentHover:    amber[400],
  accentLight:    amber[50],

  /* 功能色 */
  success:        "#5B9A8B",
  successLight:   "#EDF5F2",
  warning:        "#D4A24E",
  warningLight:   "#FBF3EA",
  danger:         "#C56C62",
  dangerLight:    "#FBEDEB",
  info:           teal[400],
  infoLight:      teal[50],

  /* 中性色 */
  textPrimary:    warmGray[900],
  textRegular:    warmGray[600],
  textSecondary:  warmGray[500],
  textPlaceholder:warmGray[400],
  textDisabled:   warmGray[300],
  textInverse:    "#FFFFFF",

  /* 背景 */
  bgPage:         warmGray[50],
  bgCard:         "#FFFFFF",
  bgHover:        warmGray[100],

  /* 边框 */
  border:         warmGray[200],
  borderLight:    warmGray[100],
  borderFocus:    teal[500],

  /* 侧边栏 */
  sidebarBg:      teal[900],
  sidebarHover:   teal[800],
  sidebarSubBg:   "#132626",
  sidebarText:    warmGray[300],
  sidebarActive:  teal[300],
  sidebarDivider: "rgba(255,255,255,0.06)",

  /* 圆角 */
  radiusSm:       "4px",
  radiusMd:       "6px",
  radiusLg:       "8px",
  radiusXl:       "12px",

  /* 阴影 */
  shadowSm:       "0 1px 3px rgba(45,43,40,0.06)",
  shadowMd:       "0 2px 8px rgba(45,43,40,0.08)",
  shadowLg:       "0 4px 16px rgba(45,43,40,0.10)",

  /* 字号 */
  fontSizeXs:     "11px",
  fontSizeSm:     "12px",
  fontSizeBase:   "14px",
  fontSizeMd:     "15px",
  fontSizeLg:     "16px",
  fontSizeXl:     "20px",
  fontSize2xl:    "24px",
  fontSize3xl:    "28px",

  /* 间距 */
  spacingXs:      "4px",
  spacingSm:      "8px",
  spacingMd:      "12px",
  spacingBase:    "16px",
  spacingLg:      "20px",
  spacingXl:      "24px",
  spacing2xl:     "32px",
  spacing3xl:     "40px",

  /* 组件 */
  inputHeight:    "38px",
  buttonHeight:   "38px",
  headerHeight:   "56px",
  sidebarWidth:   "220px",
} as const;

/** 兼容旧 `s` 对象命名，方便逐步迁移 */
export const s = {
  primary:        tokens.primary,
  text:           tokens.textPrimary,
  text2:          tokens.textRegular,
  text3:          tokens.textSecondary,
  border:         tokens.border,
  bg:             tokens.bgPage,
  white:          tokens.bgCard,
  danger:         tokens.danger,
  success:        tokens.success,
  warning:        tokens.warning,
  radius:         tokens.radiusSm,
  shadow:         tokens.shadowMd,
  /* 旧代码中的别名 */
  green:          tokens.success,
  orange:         tokens.warning,
  red:            tokens.danger,
  statCardBg:     tokens.bgCard,
} as const;
