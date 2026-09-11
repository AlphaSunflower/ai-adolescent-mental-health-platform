# 用户端设计规范 — pouf 黏土语言

> 适用范围：`apps/web-client`（青少年/家长用户端）。
> 这是 1st-Pouf 黏土（claymorphism）语言在 web-client 的落地事实与约定，从实际 Token 与组件反向整理。新增/重构页面时以此为准，避免与既有视觉漂移。
> 设计原语与 chrome 本体在 [`src/components/pouf/pouf.css`](src/components/pouf/pouf.css)；React 薄包在 `src/components/pouf/*`。

## 1. 设计语言总览

- **语言**：**pouf 黏土**（claymorphism）——低饱和粉彩（pastel）底色、圆润软垫（cushion）控件、柔和环境光晕、慢速粒子。视觉气质：**明亮、柔软、童趣、安全**，贴合青少年心理健康场景，而非科技感暗色。
- **来源**：视觉系统移植自 `novusgfx/retro-design-system`（MIT）的 `claymorphism` 风格，落地为 `pouf.css` 的 `@theme` token + `@utility` cushion 配方 + `@layer components` overlay chrome。
- **一处刻意偏离**：参照实现里白色字浮在粉彩上，对比度不达 WCAG AA（实测 1.25:1–1.99:1）。**本站一律用深墨色 `--on-accent` 压在粉彩上**，其自带 `-pink/-mint/-yellow` 变体即墨色，实测 6.10:1–9.75:1。这是全局铁律：**粉彩填充上永远不放白字**。
- **废弃**：旧的「cosmic 深色」语言（深蓝夜空、星空动画、玻璃态、金色渐变）已全站移除。`globals.css` 中残留的 `--color-cosmic-*`、`.cosmic-card/.cosmic-btn/…`、星体 keyframe 均为**死代码**，新页面禁用，待逐步清理。

## 2. 全局表面（Global Surface）

- **唯一背景**：`PoufBackground`，只在根布局 [`src/app/layout.tsx`](src/app/layout.tsx) 渲染一次，被所有路由（含 auth/main）共享，全站读同一张表面。
- **组成**（`src/components/pouf-shell/pouf-background.tsx`）：
  1. **浅紫渐变底**：`linear-gradient(160deg, #f4eefc 0%, #eee1fb 48%, #f6edf7 100%)`（近白偏浅紫，勿用满饱和大光斑）。
  2. **柔和模糊光晕**：3 个大尺寸（40–52vw）径向渐变圆，低 alpha（0.3–0.4），`blur(80–90px)`，叠出磨砂/柔光。色相偏绿、紫、粉三向。
  3. **慢速粒子漂移**：`components/effects/Particles.tsx`（ogl/React Bits），`particleCount=520`、`speed=0.7`、低饱和 4 色（`#bb9fe6`/`#93cfae`/`#8bb6e8`/`#efaec7`），`alphaParticles`。
- **坑**：背景必须是 `-z-10` + `fixed inset-0` + `pointer-events-none`；壳层用 `relative z-10` 浮在其上。`/ai` 用无粒子背景（沉浸式）而非抛给 `PoufBackground`。

## 3. 设计令牌（Design Tokens）

模板：`globals.css` 顶部仅有 `@import "tailwindcss"` 等；实际 pouf 令牌全在 `pouf.css` 的 `@theme` 与 `:root`，**不要往 globals.css 里塞新宇宙 token**。

### 色板（`@theme`，Tailwind 会生成 `bg-purple`、`text-ink` 等类）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--color-bg` | `#f0e9ff` | 页面底色（浅薰衣草） |
| `--color-ink` | `#3a2e5c` | 主文字（深紫墨） |
| `--color-muted` | `#71609b` | 次级文字 |
| `--color-surface` | `#ffffff` | 卡片/控件表面 |
| `--color-pink` | `#ffb3d1` | 粉 |
| `--color-purple` | `#c9a8ff` | 紫（品牌主色/激活色） |
| `--color-blue` | `#9ec8ff` | 蓝 |
| `--color-mint` | `#a8f0d0` | 薄荷 |
| `--color-yellow` | `#ffe58a` | 黄 |
| `--color-orange` | `#ffb38a` | 橙 |

### 圆角、字体、间距

| 令牌 | 值 |
| --- | --- |
| `--radius-card` | `32px`（卡片） |
| `--radius-control` | `20px`（控件/按钮） |
| `--radius-blob` | `24px` |
| `--radius-pill` | `999px` |
| `--font-pouf` | `'Nunito Variable','Nunito','SF Pro Rounded','Helvetica Neue',system-ui,sans-serif` |
| `--lip` / `--lip-row` | `10px` / `6px`（黏土「地面厚度」） |

- 字体：body 默认 `font-weight: 700`、`font-size: 15px`、`line-height: 1.5`（pouf.cs base 层）。根布局用 Geist 变量，正文切换 `font-pouf` 类即 Nunito Variable。**注意**：`Nunito Variable` 二字名是 `@fontsource-variable/nunito` 的注册名，`Nunito` 只兜底；写字体栈必须保留 `'Nunito Variable'` 首位，否则静默落到系统字体。
- 间距刻度（`:root`）：`--s1..--s8` = 6/8/12/16/20/24/32/40px。
- `:root` 里另有一组**老别名**（`--bg/--ink/--surface/…/--font/--r-card/…`），供配方与部分旧组件引用；`@theme` 才是 Tailwind 面向的词表，两者值一致。

## 4. 黏土配方（Cushion Recipe）

黏土的核心是**一道物理主张**：光从上方落下（内侧顶部高光），物体自身有厚度（内侧地面阴影），并在地面投影（外侧投影）。三级盒阴影编码这三点：

```
--pouf-card:    inset 0 -lip 0 rgba(201,168,255,.35), inset 0 6px 0 rgba(255,255,255,.9), 0 20px 40px rgba(58,46,92,.15);
--pouf-control: inset 0 -6px 0 rgba(0,0,0,.15),       inset 0 4px 0 rgba(255,255,255,.35), 0 8px 16px rgba(58,46,92,.2);
--pouf-field:   inset 0 -4px 0 rgba(0,0,0,.06),       inset 0 4px 0 rgba(255,255,255,.7),  0 0 0 2px rgba(201,168,255,.2);
```

直接消费的 `@utility`（Tailwind 会生成同名类）：

- `cushion-control` / `cushion-control-active`（按钮、激活态）
- `cushion-card`（弹窗、卡片）
- `cushion-blob`（圆形图标/徽章）
- `cushion-field` / `cushion-field-focus`（输入框、聚焦态）
- `cushion-row` / `cushion-row-hover`（列表行「每行一软垫」，较紧的 32px 不行就换它）

**两条关键约定**（易踩坑）：

1. **白色表面垂直 padding 需按 `lip` 偏置**：底部内嵌地面阴影画在框内，对称 padding 会显得内容偏下；白色容器要把底部 padding 加 `lip/2`、顶部减 `lip/2`，整体高度不变、视觉居中。blob 里的字形同理，用 `translateY(-2px)` 补偿。`pouf.css` 里几乎每个 `padding` 都这样写，别改回对称。
2. **盒阴影用 `@utility` 原样，不要走 Tailwind `shadow-*`**：`shadow-*` 经 `--tw-shadow/ring` 变量栈合成，会改变最终 computed 字符串，进而破坏快照基准；变换/过渡/动画同理，一律用任意属性或 `pouf-*` 工具，别绕 Tailwind 复合系统。

## 5. 语义色与 tone

- 视觉色讲意向不讲色名：`--up`(mint 涨/正向) `--down`(pink 跌/危险) `--warn`(yellow 警示) `--info`(blue 信息) `--idle`(purple 中性)。
- **tone 类**（一个色彩活在唯一一处）：`tone-pink/purple/blue/mint/yellow/orange` + 语义 `tone-up/down/warn/info/idle`，均只设 `--tone`。所有色调组件（按钮、badge、progress、toast、mode 徽条）都靠 `var(--tone)` 取色。
- **`--on-accent`**：压在任何粉彩填充上的深墨色。它单独成 token 只因深色模式——粉彩两主题都保持低饱和（是品牌），文字必须始终深色；而页面 `--ink` 在深色下会翻成近白。两者合并会把 `#efe9ff` 压到 `#c9a8ff` 上，不可读。浅色下 `--on-accent` 恒等于 `--ink`。
  - **坑**：`--on-accent` 定义在 `:root`（非 `@theme` 的 `--color-*`），Tailwind **不会**生成 `text-on-accent` 类，要用 `text-[var(--on-accent)]`。
  - `--on-accent-muted`（`#493b64`）是粉彩上的次级墨，比 `--muted` 稳（`--muted` 跟主题走，深色会变薰衣草）。

## 6. 深色模式（Dark Mode）

- **仅显式开关**：`<html data-theme="dark">` 或 `<html class="dark">` 才生效；**没有 `prefers-color-scheme` 自动切换**。理由：让主题成为文档属性而非访客机器属性，避免截图测试随系统抖动；是否读系统偏好由宿主 app 自行决定（保留 `next-themes`）。
- 深色下：`bg→#12111a`、`surface→#211f2b`、`ink→#f7f3ff`、`muted→#b8afcb`；**粉彩 accent 不变**（是品牌、承载 `--on-accent`）。
- **软垫不能只换色**：包裹 `--surface`（由白转近黑）的 card/row/field，其顶部高光 alpha 得从 0.9 降到 ~0.06（否则那块白被读成烧爆的铬边），改让地面阴影承担；而控件/blob 悬浮在不变的粉彩上，内高光/地面几乎不动、仅外投影加深。这两类分开处理，深色才不塌陷。

## 7. 壳层（Shell）

- `(main)/layout.tsx` 直接渲染 `<PoufAppShell>`（无中间分流器）。`pouf-app-shell.tsx`：
  - 渲染 `<PoufNavBar>` + `<main>` + `<PoufFooter>`，外层 `relative z-10 flex flex-col font-pouf text-ink`，`min-h-[100dvh]`。
  - 包裹 `FeedbackDialogProvider`（反馈弹窗上下文）。
- **沉浸式路由**（隐藏 Footer、壳层钉到 `100dvh` + `overflow-hidden`，滚动只发生在页面内，避免出现第二条滚动条）：`/ai`、`/xiaoai-listen`、`/consultation/chat`。`IMMERSIVE_ROUTES` 常量在 `pouf-app-shell.tsx` 顶部。
- `PoufNavBar`：`sticky top-0`，logo（薄荷圆 + Leaf 图标）+ 主导航（首页/内容馆/心理测评/小爱心理倾诉[悬浮下拉：文字倾诉/视听倾诉]/心理咨询）+ 桌面搜索框 + 用户区（消息、我要反馈、用户下拉）+ 移动端 `xl` 断点的抽屉。
  - 激活态用 `bg-surface/90 text-ink`，别用 cosmic 的金色高亮。
  - 图标一律 `lucide-react`，按钮用 `components/pouf/Button.{Button,IconButton}`。
- `PoufFooter`：页脚（备案信息等），`xiaoai-listen` 等沉浸页不渲染。

## 8. 组件原语（Primitives）

React 薄包在 `src/components/pouf/`（本体 chrome 在 `pouf.css`）：

| 文件 | 导出 |
| --- | --- |
| `Button.tsx` | `Button` / `IconButton` / `buttonClasses(tone,size,variant,block,shape)` |
| `Card.tsx` | 卡片容器 |
| `Dialog.tsx` | 居中/移动端全屏弹窗（`pouf-dialog`） |
| `Input.tsx` / `Textarea.tsx` | 输入（`pouf-field`） |
| `Tabs.tsx` | 标签（激活态 `pouf-control-active`） |
| `Skeleton.tsx` | 加载骨架（`pouf-skeleton`） |
| `Progress.tsx` | 进度条（`pouf-progress`） |
| `Badge.tsx` / `Avatar.tsx` | 徽章 / 头像 |
| `tone.ts` | `toneClass(tone)` 与 `Tone` 类型 |

- `Button`：`cva` 定义 `variant: solid|quiet`、`size: sm|md|lg`、`shape: icon|label`，`tone` 经 `toneClass` 传入；`buttonClasses()` 复用于 Segmented/Tabs/ToggleGroup/BottomNav 的美化按钮，保证不漂移。
- overlay chrome（select/tooltip/alertdialog/popover/sheet/menu 等）在 `pouf.css` 的 `@layer components`，用 `@base-ui/react` 驱动（Radix 兼容的 `data-state` 动画）。**不要用 Framer**。
- 反馈弹窗：`components/feedback/feedback-dialog.tsx` 的 `FeedbackDialogProvider` + `useFeedbackDialog()`，全局 `sonner` toast 走 `pouf-toast` 系。

## 9. 排版与可访问性

- 标题用 `font-black`(900)，正文 `font-bold`(700)，`font-size` 基准 15px。
- `:focus-visible` 统一 `outline: 3px solid var(--ink); outline-offset: 3px`（键盘环可见、鼠标点击不触发）。
- **最小触摸目标 24px**（WCAG 2.2 AA 2.5.8）：表头排序、面包屑链接、折叠触发等文本控件，用 padding+负 margin 撑到 ≥24px 高。
- 图标按钮必须给 `label`/`aria-label`（`IconButton` 已强制），如「消息」「菜单」「关闭菜单」。
- `prefers-reduced-motion` 全局把动画/过渡压到 `0.01ms`；`Particles` 偶发 hover 移动在 `pouf-background` 关掉（`moveParticlesOnHover={false}`）。

## 10. 页面约定

- **Page-as-wrapper**：`app/**/page.tsx` 只薄包装，导入 `components/` 同名组件渲染；逻辑/状态/副作用全放组件。例：`home/page.tsx` → `<HomePage/>`（`components/home/home-page.tsx`）。
- **路由组**：`(auth)`（登录/注册/忘记密码，无壳、动态渲染、左上角 Shuffle 品牌字）与 `(main)`（`PoufAppShell` 包裹）。根路由 `/` 重定向 `/home`。
- 空态/加载态：用 `Pouf` 的 `pouf-skeleton`/`pouf-empty`，别落回 cosmic 玻璃卡。
- 数据/类型走 `lib/api.ts`（`@ai-adolescent-mental-health/api-client`）与 `lib/types.ts` 重导出；认证走 `lib/session.ts`（localStorage）；开放重定向校验走 `lib/safe-redirect.ts`；咨询即时沟通走 `lib/sse.ts`。

## 11. 新增 UI 的 Do / Don't

**Do**
- 颜色只从 pouf 色板取：`bg-*`/`text-*`/`border-*`（`bg`、`ink`、`muted`、`surface` + 各 accent）。
- 深度交给黏土配方：`cushion-control/card/field/row`、`tone-*`；需要「按压」反馈就 `enabled:active:cushion-control-active + translateY(2px)`。
- 按钮用 `@/components/pouf/Button`，图标 `lucide-react`。
- 背景复用 `PoufBackground`；沉浸页显式处理，别叠第二层背景。
- 动画：GSAP（页面/角色动效）+ ogl Particles（背景）+ React Three Fiber（官网 3D 陪伴模型）；过渡限 `box-shadow/transform`。

**Don't**
- 不要用 cosmic 残留：`cosmic-*`、`.cosmic-card/.cosmic-btn/…`、`--color-cosmic-*`、星空/星星 keyframe；深蓝夜空、白字、金色渐变。
- 不要把白字放粉彩填充上；用 `text-[var(--on-accent)]` 或 `--on-accent-muted`。
- 不要 `bg-${tone}` 动态拼接类名——Tailwind 不生成，须静态映射（见 `pouf Progress` 的 `toneBg`）。
- 不要用 Tailwind `shadow-*` 组装黏土阴影（破坏快照）；用 `cushion-*` 或原样 ``box-shadow: var(--pouf-*)``。
- 不要引 Framer/React Spring；3D 仅用 React Three Fiber / drei 并通过客户端动态挂载；`pouf.css` 覆盖到的 overlay 用 `@base-ui/react`。
- 不要往 `globals.css` 加新 `@theme` 色；进 `pouf.css`。

## 12. 关键坑（速查）

- `--on-accent` 在 `:root`，Tailwind 不生成 `text-on-accent` → 用 `text-[var(--on-accent)]`。
- 字体栈必须 `'Nunito Variable'` 首位，否则静默落系统字体（曾实测 nav 画成 Helvetica Neue）。
- 白色容器垂直 padding 按 `--lip` 上半减下半加，内容才光学居中。
- 深色只在 `data-theme="dark"`/`.dark` 下；无自动切换。
- 沉浸路由（`/ai`、`/xiaoai-listen`、`/consultation/chat`）不可渲染 Footer，壳层钉 `100dvh` 防双滚动条。
- cosmic 是死代码，看到旧类直接改用 pouf 对应项。
