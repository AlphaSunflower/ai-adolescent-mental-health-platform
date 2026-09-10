---
name: taste-skill
description: 心愈智联官网审美宪章（方案 B「浅色柔和」定稿）。This skill should be used whenever any UI task touches the official site (/index) or src/components/official/** — read it before writing any markup, style, or motion code. It defines the color tokens, spacing rhythm, typography hierarchy, motion charter, and layout taboos for the entire official site.
agent_created: true
---

# 心愈智联官网审美宪章（方案 B「浅色柔和」）

基线：commit 221f674 风格选稿方案 B。所有官网 UI 任务先读本宪章，再动手。

## 1. 色彩令牌

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| 页面底色 | `#FBFAFF` | 全站背景，近白带一丝紫 |
| 主紫 | `#8B7CC8` | 主按钮、强调、编号圆片文字 |
| 主紫加深 | `#7A6BBA` | 主按钮 hover |
| 墨色（一级文字） | `#4A4266` | 标题、正文强调、页脚底色 |
| 墨色（二级文字） | `#8A84A3` | 正文、辅助说明 |
| 墨色（三级/强调辅助） | `#6F64A8` | chips 文字、次按钮文字 |
| 卡片面 | `#FFFFFF` 纯白 | 所有卡片，禁止用米白/灰白 |
| 浅紫面 | `#EFEBFA` / `#F1EEFA` | 编号圆片底、chips 底 |
| 分隔线/次按钮边 | `#D8D2EC` | 仅用于次按钮边框与极细分隔 |
| 暖色标注（仅此一处） | `#FBF4E8` 底 / `#B08D57` 字 | 「内容完善中」标注 |
| 光斑 | `#E9E3FA` / `#DDE7FA` | Hero 背景柔光斑，blur-2xl/3xl |

阴影（分层唯一手段）：`0 10px 36px rgba(139,124,200,0.12)`，弱化版 `0.10` 透明度。禁止用边框堆出"格子感"。

## 2. 间距与密度

- 卡片内边距：24px（`p-6`）起，大卡可用 28~32px；全站统一，不得小于 20px。
- 区块垂直节奏：96~128px（`py-24` ~ `py-32`），相邻板块用留白分隔，不用分隔线。
- 内容最大宽度 `max-w-5xl`，横向 `px-6`。
- **禁止等距卡片机械平铺**：卡片行允许奇偶错落、宽度变化（如第 5 卡通栏）、高度随内容不等。grid 只是兜底，不是牢笼。
- chips 间距 `gap-2`，圆角全圆（`rounded-full`），卡片圆角 `rounded-[28px]`。

## 3. 字体层次

- 品牌四字「心愈智联」：`Noto Sans SC Brand`（四字子集，类名 `official-brand-font`），**仅用于四字词组**。
- 标题：`font-extrabold`（Hero 可用 `font-black` 仅限品牌字），tracking-tight，墨色一级。
- 正文/辅助字号字重必须拉开层次：
  - 正文 16px（`text-base`）/ 15px，regular 400，行高 2（引言段）或 relaxed；
  - 辅助 14px（`text-sm`），medium 500；
  - chips/标注 12px（`text-xs`），medium 500；
  - 标题字重 700，正文 400，不得通体 500+。

## 4. 动效宪章

- 动效只出现在三类场景：**入场**（进入视口一次）、**hover**（跟随/反馈）、**点击反馈**。禁止无限循环的自主运动（微光扫字、漂浮装饰等）。
- 同屏运动元素 ≤ 2（Hero 背景 Aurora 氛围层算 1 个名额，入场动画错开后视为静止）。
- 尊重 `prefers-reduced-motion`：所有动效组件必须降级为静态呈现（直接显示最终态），Aurora 降级为静态帧或不渲染动画循环。
- 技术红线：只用 **GSAP（含 @gsap/react、ScrollTrigger）/ ogl / 纯 CSS**。**禁止 framer-motion**（仓库红线）。
- 入场动效参数：上浮 24~32px + 渐显，stagger 0.1s，ease `power3.out`，时长 0.7~0.9s。
- React Bits 组件总数 ≤ 7，每个必须有明确用途，禁止为凑效果而引入。

## 5. 排版禁忌清单

- ❌ 满屏渐变（渐变只允许出现在模糊光斑这种"看不见边界"的形态）
- ❌ 图标堆砌（官网当前不用图标库，编号圆片即视觉锚点）
- ❌ 荧光色 / 高饱和撞色
- ❌ 居中对称滥用：允许 Hero 居中，但功能、文化等板块必须打破对称（左对齐标题、错落卡片、左右分栏）
- ❌ 无意义浮动装饰（飘点、泡泡、无功能的几何碎片）
- ❌ "大标题 + 下划线装饰条"模板感版式重复出现（全站至多保留一处）
- ❌ 卡片描边堆叠出的表格感
- ❌ 空状态用 CSS 画占位图标（二维码占位除外，用点阵底纹 `official-qr-placeholder`）

## 6. 文案纪律

文案逐字来自 `agent-brief/02-官网需呈现内容.md`；原文空缺处统一标「内容完善中」，禁止编造。tagline 只允许从原文功能描述提炼，不引入新概念。
