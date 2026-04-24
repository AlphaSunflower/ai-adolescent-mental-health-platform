# AGENT.md — 用户端 Web

## 定位

- 工作区：`apps/web-user`
- 包名：`@ai-adolescent-mental-health/web-user`
- 技术栈：Next.js 16 App Router、React 19.2、Tailwind CSS 4、shadcn/ui
- 角色：面向青少年及家长的 Web 用户端，桌面优先，同时提供移动端底部导航体验。

## 命令

```bash
pnpm --filter @ai-adolescent-mental-health/web-user dev
pnpm --filter @ai-adolescent-mental-health/web-user typecheck
pnpm --filter @ai-adolescent-mental-health/web-user lint
pnpm --filter @ai-adolescent-mental-health/web-user build
```

## 约定

- 默认 API 地址为 `NEXT_PUBLIC_API_BASE_URL`，未设置时使用 `http://localhost:8080`。
- 真实接口不可用时，用户体验组件应回退到 `src/lib/mock-data.ts` 中的演示数据，并明确显示连接状态。
- 登录态封装在 `src/lib/session.ts`，不要在组件里散落直接访问 token 的逻辑。
- shadcn 组件优先使用语义 token；Tailwind className 中不要写十六进制颜色或 `var()`。
- Client Component 只放交互状态，数据类型和 API 封装放在 `src/lib/`。
