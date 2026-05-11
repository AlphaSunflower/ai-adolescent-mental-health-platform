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
- 真实接口不可用、失败或返回空列表时，用户体验组件应展示加载、错误或空状态，不要回退到本地演示数据。
- 登录入口为独立 `/login` 路由，支持账号登录、邮箱验证码登录和邮箱密码登录；`/me` 未登录时只做登录引导。
- 登录态封装在 `src/lib/session.ts`，不要在组件里散落直接访问 token 的逻辑。
- shadcn 组件优先使用语义 token；Tailwind className 中不要写十六进制颜色或 `var()`。
- Client Component 只放交互状态，数据类型和 API 封装放在 `src/lib/`。
