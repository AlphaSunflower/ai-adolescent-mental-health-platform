# web-client 全站 pouf 迁移设计

- **日期**: 2026-09-08
- **范围**: `apps/web-client`
- **目标**: 全部路由使用 1st-Pouf 黏土语言;全局背景 = `PoufBackground`。
- **用户决策**: 方案 A(并行 pouf 原语 + 逐页迁移);`/library` 一并 pouf 化。顺序 P0 → P1 → P2。

## 一、现状(已核对)

- `components/shell/shell-router.tsx`: 仅 `/home` 走 `PoufAppShell`,其余 35+ 路由走 cosmic `AppShell`。
- `pouf-app-shell.tsx`: 已含 `PoufBackground` + pouf 导航/页脚 + `FeedbackDialogProvider`,全屏浅紫背景 + 粒子。
- `pouf.css`: **1st-Pouf 系统完整实现**(迁移自 `novusgfx/retro-design-system`)。含全部 token、cushion 配方,及 dialog/sheet/popover/dropdown/tabs/accordion/progress/table/breadcrumb/recharts/toast/bell/nav/skeleton/empty 等全套 chrome。缺的是 React 薄包。
- `globals.css` 基础层 `body { background:#f4eefc; color:#3a2e5c; font-family:var(--font-cosmic) }`,全局底色已是 pouf 浅紫;cosmic 深色在 Starfield 层与 per-component 类里。
- pouf React 薄包现有: `Button.tsx`(Button/IconButton/buttonClasses)、`Card.tsx`、`Progress.tsx`、`tone.ts`。

## 二、为什么是「并行 pouf 原语」而非「全局重改 ui/*」

- 若把 `components/ui/*` 的 cosmic token 一次性换成 pouf,仍有 30+ 页挂在 cosmic 壳上,立刻拿到浅色控件配深色背景 → 中途割裂不可读。
- 走并行 pouf 原语(`components/pouf/*`),每迁完一页才把该路由加进 ShellRouter pouf 分支 → 任意 commit 可用,零回归。

## 三、迁移方案: 并行 pouf 原语 + 逐页迁移(Hybrid)

### P0 原语补齐
按内容页真实 import 补齐 `components/pouf/*` 薄包,包住既有 `.pouf-*` CSS + token。
内容页消费的 ui 原语: Button/Skeleton/Badge/Tabs/Progress/Input/Avatar/Dialog(另 feedback-dialog 用 Dialog)。
> cosmic 导航里的 DropdownMenu/Sheet 随 P2 删 cosmic 壳移除,不做 pouf 版。

### P1 逐页迁移
每页: 内容转 pouf(换 import 到 pouf/*、替换硬编码 cosmic-* 类与白字/深玻璃假设)→ 该路由加进 ShellRouter pouf 分支 → typecheck + dev 截图验证。
顺序(优先级驱动): ① `ai`/`assessment`/`consultation`(hub/psychologist 列表/详情/chat)② `me/*` ③ `search`/`xiaoai`/`xiaoai-listen`/`user/*` ④ `apply/*`/`legal` ⑤ `/library`。
某页若比预期复杂(如 AI 对话/语音页交互重),停下来重新评估,不硬扛。

### P2 壳层收尾
全部路由 pouf 化后: 删 `ShellRouter`、删 cosmic `app-shell/nav-bar/footer/starfield/floating-buttons`,让 `(main)/layout.tsx` 直接渲染 `PoufAppShell`(全局背景 = PoufBackground),`(main)/layout` 不再分流。

## 四、关键坑(承接既有记忆)

- `--on-accent` 在 `:root`(非 `@theme` 的 `--color-*`),Tailwind 不生成 `text-on-accent`,要用 `text-[var(--on-accent)]`。
- `bg-${tone}` 动态拼接 Tailwind 不生成,须静态映射(见 pouf Progress 的 `toneBg`)。
- pouf 背景要淡: 用近白偏浅紫渐变 + 低透明大模糊径向光晕;不要满饱和大光斑。
- 认证/token 走 localStorage;API 401 → `onUnauthorized` 跳 `/login`。
- 深浅模式: pouf 深色经 `<html class="dark">`/`data-theme="dark"` 显式开关;无 `prefers-color-scheme` 自动切换。保留 next-themes。

## 五、验证

- 每页: `pnpm --filter @ai-adolescent-mental-health/web-client typecheck`;`dev`(3100)浏览器截图,桌面 + 移动。
- P2 后: 全站路由走 pouf 壳 + PoufBackground;跑 `pnpm typecheck` + `pnpm build`。

## 六、范围外

- 不改后端 / 接口合约 / URL 路由(路由 slug 不变)。
- 不动 `pnpm-lock.yaml`(除非需新增依赖,届时说明)。
- admin-portal / mobile / parent-portal 不受影响。
