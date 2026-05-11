# 心愈智联用户端 Web

面向青少年及家长的 Next.js 用户端。当前首版覆盖首页工作台、心理咨询、AI 问诊、心理测评、内容库和个人中心。

## Getting Started

在仓库根目录启动：

```bash
pnpm --filter @ai-adolescent-mental-health/web-user dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

未配置时默认连接 `http://localhost:8080`。后端不可用、接口失败或返回空列表时，页面展示加载、错误或空状态，不再回退到本地演示数据。

## Scripts

```bash
pnpm --filter @ai-adolescent-mental-health/web-user typecheck
pnpm --filter @ai-adolescent-mental-health/web-user lint
pnpm --filter @ai-adolescent-mental-health/web-user build
```

## Structure

- `src/components/app-shell.tsx`：桌面侧栏、移动底栏、全局搜索。
- `src/app/login/page.tsx`：独立登录路由，支持账号登录、邮箱验证码登录和邮箱密码登录。
- `src/components/pages.tsx`：首版用户端页面和交互流。
- `src/lib/api.ts`：Spring Boot API client、SSE AI 聊天封装。
- `src/lib/session.ts`：客户端 token 和用户信息存储。

## Notes

当前版本支持账号登录、邮箱验证码登录和邮箱密码登录；微信登录/公众号能力保留在 API 层，实际可用性依赖后端微信配置。
