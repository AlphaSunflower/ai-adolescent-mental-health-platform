# AGENTS.md — `apps/web-client`

> 面向 AI 编码助手的 web-client（Next.js 用户端）工作区速查。动手前先读根 [AGENTS.md](../../AGENTS.md) 与本站 [design.md](design.md)（pouf 设计规范）。
>
> **文档自更新**：脚本 / 依赖 / 页面结构 / 设计约定变化时，可直接更新本文件或根 README / AGENTS；就近修改、先事实后文档、保持锚点准确。

## 一、基本事实

- 包名：`@ai-adolescent-mental-health/web-client`
- 技术栈：Next.js `^16.2.4`、React `^19.2.4`、TypeScript `^5`、Tailwind CSS `^4`（CSS-first，**无 `tailwind.config.ts`**）
- 模块类型：`"type": "module"`；开发端口：**3300**（Turbopack）
- 样式方案：Tailwind v4 + **pouf 黏土设计系统**（浅紫底、粉彩、软垫 cushion 控件）。Token 与 chrome 在 `components/pouf/pouf.css`；**cosmic 深色语言已全站废弃**（`globals.css` 残留 `--color-cosmic-*`/`.cosmic-*`/星体 keyframe 为死代码）
- 动画：GSAP（页面/角色动效）+ `ogl`/React Bits Particles（背景漂移）+ `@react-three/fiber` / `@react-three/drei`（官网 3D 模型）；**不要引入 Framer Motion / React Spring**
- UI 原语：`components/pouf/*`（cva + clsx + tailwind-merge），overlay（select/tooltip/dialog/sheet/menu 等）由 `@base-ui/react` 驱动；**`components/ui/` 已删除**
- 状态管理：无外部状态库（`useState`/`useEffect` + Context），反馈弹窗用 React Context（`components/feedback/feedback-dialog.tsx`）
- 会话：`localStorage` + `lib/session.ts`；Markdown：`react-markdown` + `remark-gfm`，编辑 `@uiw/react-md-editor`；通知 `sonner`；主题 `next-themes`

## 二、目录结构

```
src/
├── app/
│   ├── layout.tsx                # 根布局：PoufBackground（背景全局渲染一次）+ ChunkReloadGuard + sonner Toaster
│   ├── globals.css               # @import tailwindcss + pouf.css + @fontsource-variable/nunito
│   ├── page.tsx                  # / → redirect /home
│   ├── not-found.tsx             # 全局 404：pouf 砖块消除小游戏（NotFoundBrickBreaker）
│   ├── (auth)/                   # 认证（无壳，Shuffle 品牌字，force-dynamic）
│   │   ├── layout.tsx
│   │   └── login|register|forgot-password/page.tsx
│   └── (main)/                   # 主界面（PoufAppShell 包裹）
│       ├── layout.tsx            # 直接渲染 <PoufAppShell>
│       ├── home|library|assessment|search|xiaoai|xiaoai-listen|ai|legal/page.tsx
│       ├── consultation/  user/[userId]/  apply/  me/...
├── components/
│   ├── pouf/                     # pouf 原语：Button/IconButton, Card, Dialog, Input, Textarea, Tabs, Skeleton, Progress, Badge, Avatar, tone.ts, pouf.css
│   ├── pouf-shell/               # pouf-app-shell / pouf-nav-bar / pouf-footer / pouf-background
│   ├── effects/                  # Particles（背景粒子，ogl）/ Shuffle（品牌字）/ not-found-brick-breaker（404 砖块游戏）
│   ├── feedback/                 # feedback-dialog.tsx（FeedbackDialogProvider + useFeedbackDialog）
│   ├── home/ library/ ai/ assessment/ search/ consultation/ xiaoai/ me/ user/ apply/ legal/ auth/
│   └── ChunkReloadGuard.tsx
└── lib/
    ├── api.ts                    # 统一 API 客户端（基于 @ai-adolescent-mental-health/api-client）
    ├── games/brick-breaker.ts    # 404 砖块消除游戏引擎（纯 TS，无依赖，pouf 适配版复用）
    ├── session.ts                # localStorage 认证会话（token/.user）
    ├── types.ts                  # 类型重导出（@ai-adolescent-mental-health/domain）
    ├── utils.ts                  # cn()（clsx + tailwind-merge）
    ├── safe-redirect.ts          # 开放重定向防护
    └── sse.ts                    # 咨询即时沟通 SSE
```

## 三、命令

通过 monorepo 根目录执行：

```bash
pnpm dev:web-client                              # 等价：pnpm --filter @ai-adolescent-mental-health/web-client dev
pnpm --filter @ai-adolescent-mental-health/web-client dev        # next dev --port 3300（Turbopack）
pnpm --filter @ai-adolescent-mental-health/web-client build      # next build
pnpm --filter @ai-adolescent-mental-health/web-client start      # next start
pnpm --filter @ai-adolescent-mental-health/web-client lint       # eslint .
pnpm --filter @ai-adolescent-mental-health/web-client typecheck  # tsc --noEmit
pnpm --filter @ai-adolescent-mental-health/web-client clean      # rimraf .next
```

提交前至少跑 `pnpm typecheck`（根级快捷脚本）。

## 四、AI 约束

### 4.1 组件与路由

1. **Page-as-wrapper**：`app/**/page.tsx` 仅薄包装，导入 `components/` 对应组件渲染；业务逻辑/状态/副作用全放组件。例：`home/page.tsx` → `<HomePage/>`。
2. **组件默认 `"use client"`**：仅根/路由组 `layout.tsx` 用服务端组件。
3. **组件命名**：文件名与导出函数同名 PascalCase；`components/` 按业务域拆分，不按页/组件类型分。

### 4.2 API 与数据

4. **统一 API 客户端**：所有后端通信走 `lib/api.ts` 的 `api` 对象（基于 `@ai-adolescent-mental-health/api-client`），**禁止**在组件里直接 `fetch`/`axios.create`。
5. **类型复用**：API 返回类型从 `@ai-adolescent-mental-health/domain` 导入，经 `lib/types.ts` 重导出。
6. **会话管理**：token/用户经 `lib/session.ts` 读写 localStorage；客户端 401 时自动清会话并跳 `/login`。后端地址：`NEXT_PUBLIC_API_BASE_URL ?? /api`（`next.config.ts` rewrites `/api/*` → `BACKEND_URL`，默认 `http://127.0.0.1:8080`）。

### 4.3 实时通信（三种，不得混用）

7. **流式 AI 对话**：`streamAiChat`（api-client 工作区）
8. **咨询师即时沟通**：SSE，`/psychologist/message/stream/{id}`（`lib/sse.ts`）
9. **小艾语音/视频**：WebSocket，`NEXT_PUBLIC_WS_BASE_URL + /ws/omni-realtime`（OpenAI Realtime API 兼容协议）

### 4.4 样式

10. **用 pouf，不用 cosmic**：颜色只从 pouf 色板取（`bg/ink/muted/surface` + 各粉彩），深度交给 `cushion-*` 配方与 `tone-*` 类；**禁用** `cosmic-*` 残余类、`--color-cosmic-*`、星空/金色渐变、白字压粉彩。详见 [design.md](design.md)。
11. **不用 CSS Modules**；黏土阴影用 `@utility cushion-*` 原样，**不要**用 Tailwind `shadow-*` 组装（会破坏 computed 串与快照）。
12. **动画限 GSAP / ogl / React Three Fiber**，过渡限 `box-shadow/transform`；不用 Framer/React Spring。3D 展示仅使用 `@react-three/fiber` / `@react-three/drei`，且通过 `next/dynamic(..., { ssr: false })` 挂载。overlay（select/tooltip/dialog/sheet 等）用 `@base-ui/react` 驱动的 `.pouf-*` chrome。

### 4.5 安全

13. **重定向验证**：涉及 URL 参数重定向的地方用 `lib/safe-redirect.ts` 校验。
14. **前端不做权限闭合**：敏感数据可见性由后端控制；前端仅做 UI 层展示/隐藏。

### 4.6 依赖

15. **禁止擅自新增平行库**：已有 GSAP、ogl、React Three Fiber、drei、react-markdown、@uiw/react-md-editor、sonner、next-themes、@base-ui/react。新增同类库先说明理由。
16. **monorepo 依赖**：依赖 `api-client`、`config`、`domain`、`ui` 工作区包，经 `transpilePackages` 在 Next.js 编译；不直接引后端 Java 代码。

## 五、常见坑

- **页面空白或 API 报错**：后端需在 `127.0.0.1:8080` 运行；`/api/*` 经 rewrites 代理到 `BACKEND_URL`。后端不在默认地址设 `BACKEND_URL`。
- **工作区包找不到**：先 `pnpm install`（根级）建立链接；Next.js 经 `transpilePackages` 转译工作区 TS 包。
- **小艾语音 WebSocket 失败**：查 `NEXT_PUBLIC_WS_BASE_URL`（默认 `ws://127.0.0.1:8080`）。
- **Tailwind 样式不生效**：Tailwind v4 用 CSS-first，检查 `postcss.config.mjs` 与 `globals.css` 的 `@import`/`@plugin` 是否完整（无 `tailwind.config.ts`）。
- **`text-on-accent` 不存在**：`--on-accent` 在 `:root`，须 `text-[var(--on-accent)]`。
- **`bg-${tone}` 动态拼接不生成类**：须静态映射（见 `components/pouf/Progress.tsx`）。
- **字体落系统字体**：字体栈须首列为 `'Nunito Variable'`（`@fontsource-variable/nunito` 注册名），否则静默走系统字体。
- **登录后跳转异常**：`safe-redirect.ts` 阻止 `://` 与 `:` 开头重定向。
- **cosmic 死代码**：看到 `cosmic-*`/星空类直接改 pouf 对应项；不要往 `globals.css` 加新 `@theme` 色（进 `pouf.css`）。
- **官网 3D 模型体积**：`/index` 的陪伴模型位于 `public/models/_baby.glb`，当前约 22 MB；替换模型时同步检查加载态、移动端视口高度与 WebGL 控制台错误。

## 六、路由概览

| 路由组 | 布局 | 主要页面 |
|--------|------|----------|
| `(auth)` | 无壳，左上角 Shuffle 品牌字，`force-dynamic` | `/login`、`/register`、`/forgot-password` |
| `(main)` | `PoufAppShell`（NavBar + Footer，全局 `PoufBackground`） | `/home`、`/library`、`/ai`、`/assessment`、`/search`、`/xiaoai`、`/xiaoai-listen`、`/consultation/*`、`/me/*`、`/user/[userId]/*`、`/apply/*`、`/legal` |

**沉浸式路由**（隐藏 Footer、壳层钉 `100dvh` 防双滚动条）：`/ai`、`/xiaoai-listen`、`/consultation/chat`——由 `pouf-app-shell.tsx` 的 `IMMERSIVE_ROUTES` 常量控制。

`(main)` 内 `me/*` 下含：`articles`、`assessments`、`fans`、`favorites`、`feedback`、`follow`、`followings`、`info`、`likes`、`messages`、`orders`、`patients`、`privacy`、`psychology`、`publish`；`user/[userId]` 下有 `article/[articleId]`、`follow`；`apply/*` 下有 `basic/form/status`。

未匹配路由（全局 404）走根 `not-found.tsx`，渲染 `components/effects/not-found-brick-breaker`（可玩的砖块消除小游戏，pouf 风格，无新增依赖）。
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
