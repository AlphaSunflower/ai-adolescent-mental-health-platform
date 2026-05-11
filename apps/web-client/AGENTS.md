# AGENTS.md — `apps/web-client`

> 面向 AI 编码助手的 web-client（Next.js 前端）工作区速查。动手前请同时参阅根 [AGENTS.md](../../AGENTS.md)。
>
> **文档自更新**：当本工作区的脚本 / 依赖 / 页面结构 / 约定发生变化，或你从用户对话中沉淀到新约束时，**可直接更新本文件或根 README / AGENTS**。就近修改、先事实后文档、保持锚点准确。详见根 [AGENTS.md](../../AGENTS.md) 第「五、文档自更新」节。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/web-client`
- 技术栈：Next.js `^16.2.4`、React `^19.2.4`、TypeScript `^5`、Tailwind CSS `^4`
- 模块类型：`"type": "module"`
- 开发端口：`3100`（Turbopack 开发服务器）
- 样式方案：Tailwind v4 + 自定义 "cosmic" 设计系统（暗色主基调、渐变、玻璃态、星空动画）
- 动画库：GSAP（`^3.15.0`），不要引入 Framer Motion 等平行动画库
- UI 组件：自建 shadcn 风格组件（cva + clsx + tailwind-merge），部分使用 `@base-ui/react`
- 无外部状态管理库（全部 `useState` / `useEffect`），反馈弹窗使用 React Context
- 会话管理：`localStorage` + `lib/session.ts`，不使用 NextAuth 或 cookie-based session
- Markdown 渲染：`react-markdown` + `remark-gfm`；编辑：`@uiw/react-md-editor`
- 通知：`sonner`
- 主题切换：`next-themes`

## 二、目录结构

```
src/
├── app/                          # Next.js App Router（路由定义 + 薄包装）
│   ├── layout.tsx                # 根布局（Geist 字体、sonner Toaster）
│   ├── globals.css               # Tailwind v4 + Cosmic 设计系统
│   ├── page.tsx                  # 根路由 → 重定向到 /home
│   ├── (auth)/                   # 认证路由组（Starfield 背景，无 NavBar）
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── (main)/                   # 主界面路由组（AppShell 包裹）
│       ├── layout.tsx
│       ├── home/page.tsx
│       ├── library/...
│       ├── assessment/page.tsx
│       ├── ai/page.tsx
│       ├── search/page.tsx
│       ├── consultation/...
│       ├── xiaoai/page.tsx
│       ├── me/...
│       ├── user/[userId]/...
│       └── apply/...
├── lib/
│   ├── api.ts                    # 统一 API 客户端（基于 api-client workspace 包）
│   ├── session.ts                # localStorage 认证会话管理
│   ├── types.ts                  # 类型重导出（来自 domain workspace 包）
│   ├── utils.ts                  # cn() 工具（clsx + tailwind-merge）
│   └── safe-redirect.ts          # 开放重定向防护
└── components/
    ├── cosmic/                   # 布局壳组件（AppShell、NavBar、Footer、Starfield、FloatingButtons）
    ├── ui/                       # 底层 UI 基础组件（button、card、dialog、tabs、skeleton 等）
    ├── auth/                     # 认证页面组件
    ├── home/                     # 首页
    ├── library/                  # 内容库（文章、书籍）
    ├── assessment/               # 心理评估
    ├── ai/                       # AI 对话
    ├── search/                   # 全局搜索
    ├── consultation/             # 心理咨询（咨询师列表、详情、即时沟通）
    ├── xiaoai/                   # 小艾 AI 伙伴（文字 + 语音/视频）
    ├── me/                       # 个人中心
    ├── user/                     # 他人主页
    ├── apply/                    # 咨询师入驻申请
    ├── feedback/                 # 反馈弹窗（Context + Provider 模式）
    └── legal/                    # 法律文档页
```

## 三、命令

通过 monorepo 根目录执行：

```bash
pnpm dev:web-client                              # 等价：pnpm --filter @ai-adolescent-mental-health/web-client dev
pnpm --filter @ai-adolescent-mental-health/web-client dev        # next dev --port 3100（Turbopack）
pnpm --filter @ai-adolescent-mental-health/web-client build      # next build
pnpm --filter @ai-adolescent-mental-health/web-client start      # next start
pnpm --filter @ai-adolescent-mental-health/web-client lint       # eslint .
pnpm --filter @ai-adolescent-mental-health/web-client typecheck  # tsc --noEmit
pnpm --filter @ai-adolescent-mental-health/web-client clean      # rimraf .next
```

提交前请至少运行 `pnpm typecheck`（根级快捷脚本覆盖所有工作区）。

## 四、AI 约束

### 4.1 组件与路由

1. **Page-as-wrapper 模式**：所有 `app/**/page.tsx` 仅做薄包装，导入 `components/` 中的对应组件并渲染。业务逻辑、状态、副作用全部放在 components 中。
2. **组件默认 `"use client"`**：几乎全部功能组件都是客户端组件。仅根 `layout.tsx` 和路由组 `layout.tsx` 使用服务端组件。
3. **组件命名**：文件名 PascalCase（如 `LoginPage.tsx`），导出函数名与文件名一致。
4. **按功能域组织**：`components/` 下按业务域拆分目录（`home/`、`library/`、`ai/` 等），不要按类型（`pages/`、`widgets/`）组织。

### 4.2 API 与数据

5. **统一 API 客户端**：所有后端通信必须走 `lib/api.ts` 导出的 `api` 对象（基于 `@ai-adolescent-mental-health/api-client` 工作区包）。**禁止**在组件中直接 `fetch` 或 `axios.create`。
6. **类型复用**：API 返回类型从 `@ai-adolescent-mental-health/domain` 工作区包导入，通过 `lib/types.ts` 重导出。
7. **会话管理**：认证 token 和用户信息通过 `lib/session.ts` 读写 localStorage。API 客户端在 401 时自动清除会话并跳转 `/login`。

### 4.3 实时通信

8. **三种实时模式，不得混用**：
   - **流式 AI 对话**：使用 `streamAiChat`（来自 api-client 工作区）
   - **咨询师即时沟通**：SSE（Server-Sent Events），路径 `/psychologist/message/stream/{id}`
   - **小艾语音/视频**：WebSocket，连接 `NEXT_PUBLIC_WS_BASE_URL + /ws/omni-realtime`（OpenAI Realtime API 兼容协议）

### 4.4 样式

9. **Tailwind v4 "cosmic" 设计系统**：所有样式使用 Tailwind 类，自定义设计令牌（颜色、阴影、动画）统一在 `globals.css` 中定义。**不使用 CSS Modules**。
10. **UI 基础组件采用 shadcn 模式**：`components/ui/` 下的组件使用 `class-variance-authority` 定义 variant，`cn()` 合并类名。
11. **动画使用 GSAP**：页面过渡和角色动画使用 GSAP。不要引入 Framer Motion 或 React Spring。

### 4.5 安全

12. **重定向验证**：所有涉及 URL 参数重定向的地方必须使用 `lib/safe-redirect.ts` 校验，防止开放重定向攻击。
13. **前端不做权限判断闭包**：敏感数据的可见性应在后端控制；前端仅做 UI 层面的展示/隐藏，不依赖前端权限作为安全边界。

### 4.6 依赖

14. **禁止擅自新增平行库**：当前已引入 GSAP（动画）、react-markdown（Markdown 渲染）、@uiw/react-md-editor（Markdown 编辑）、sonner（通知）、next-themes（主题）。如需新增同类库，先说明理由。
15. **monorepo 工作区依赖**：依赖 `@ai-adolescent-mental-health/api-client`、`config`、`domain`、`ui` 四个工作区包。这些包通过 `transpilePackages` 在 Next.js 中编译。不要新增对后端 Java 代码的直接引用。

## 五、常见坑

- **`pnpm dev` 启动后页面空白或 API 报错**：检查后端是否在 `127.0.0.1:8080` 运行。Next.js rewrites 将所有 `/api/*` 代理到 `BACKEND_URL`（默认 `http://127.0.0.1:8080`）。如后端在其他地址，设置环境变量 `BACKEND_URL`。
- **工作区包找不到**：确认已先运行 `pnpm install`（根级）建立了工作区链接。Next.js 通过 `transpilePackages` 在 `next.config.ts` 中转译工作区 TS 包。
- **WebSocket 连接失败（小艾语音）**：检查 `NEXT_PUBLIC_WS_BASE_URL`，默认 `ws://127.0.0.1:8080`。
- **Tailwind 样式不生效**：检查 `postcss.config.mjs` 和 Tailwind v4 的 CSS-first 配置是否完整。Tailwind v4 不再使用 `tailwind.config.ts`。
- **登录后跳转异常**：重定向参数不应包含外部 URL。`safe-redirect.ts` 会阻止 `://` 和 `:` 开头的重定向目标。

## 六、路由概览

| 路由组 | 布局 | 主要页面 |
|--------|------|----------|
| `(auth)` | Starfield 背景 + 居中卡片 | `/login`、`/register`、`/forgot-password` |
| `(main)` | AppShell（NavBar + Footer + FloatingButtons） | `/home`、`/library`、`/ai`、`/assessment`、`/search`、`/xiaoai`、`/xiaoai-listen`、`/consultation/*`、`/me/*`、`/user/[userId]`、`/apply/*`、`/legal` |

`(auth)` 路由组无 NavBar/Footer，适用于未登录用户。`(main)` 路由组包裹完整的应用壳。
