# web-client

心愈智联（XinYuZhiLian）青少年心理健康 AI 平台的 Next.js 前端应用。

## 技术栈

| 技术 | 版本 / 说明 |
|------|-------------|
| Next.js | `^16.2.4`（App Router, Turbopack） |
| React | `^19.2.4` |
| TypeScript | `^5` |
| Tailwind CSS | `^4`（cosmic 设计系统） |
| 动画 | GSAP `^3.15.0` |
| Markdown | react-markdown + @uiw/react-md-editor |
| 通知 | sonner |
| 主题 | next-themes |
| 构建工具 | Next.js Turbopack（dev）+ Webpack/SWC（build） |

## 快速开始

```bash
# 在仓库根目录安装依赖
pnpm install

# 配置环境变量（创建 .env.local）
cp .env.example .env.local  # 如有模板文件
# 编辑 .env.local 设置后端地址等变量

# 启动开发服务器（端口 3100）
pnpm --filter @ai-adolescent-mental-health/web-client dev
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `BACKEND_URL` | `http://127.0.0.1:8080` | 后端地址，Next.js rewrites 代理目标 |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | API 基础路径（前端使用的 API 前缀） |
| `NEXT_PUBLIC_WS_BASE_URL` | `ws://127.0.0.1:8080` | WebSocket 基础地址（小艾语音/视频） |

`NEXT_PUBLIC_*` 变量会在构建时内联到客户端代码中，修改后需重新构建。

## 目录结构

```
src/
├── app/                    # App Router 路由
│   ├── (auth)/             # 认证路由组（登录、注册、忘记密码）
│   └── (main)/             # 主界面路由组（需认证的页面）
├── lib/                    # 工具、API 客户端、会话管理、类型
└── components/             # 功能组件（按业务域组织）
    ├── cosmic/             # 布局壳（NavBar、Footer、AppShell、Starfield）
    ├── ui/                 # UI 基础组件（button、card、dialog 等）
    ├── auth/               # 认证
    ├── home/               # 首页
    ├── library/            # 内容库
    ├── assessment/         # 心理评估
    ├── ai/                 # AI 对话
    ├── search/             # 搜索
    ├── consultation/       # 心理咨询
    ├── xiaoai/             # 小艾 AI 伙伴
    ├── me/                 # 个人中心
    ├── user/               # 他人主页
    ├── apply/              # 咨询师入驻申请
    ├── feedback/           # 反馈弹窗
    └── legal/              # 法律文档
```

## 主要功能

- 用户认证（账号密码 / 邮箱验证码 / 邮箱密码登录，注册，忘记密码）
- 首页仪表盘（问候、每日一言、快捷入口、数据概览）
- 心理内容库（文章、课程、书籍，支持评论互动和在线阅读）
- AI 对话（会话管理，流式 SSE 响应）
- 小艾 AI 伙伴（文字对话 + WebSocket 实时语音/视频）
- 心理评估（量表作答、历史记录查看）
- 心理咨询（咨询师列表、筛选排序、详情预约、SSE 即时沟通）
- 全局搜索（热门关键词、历史记录、结果展示）
- 个人中心（资料编辑、订单管理、关注/粉丝、收藏/点赞、文章发布、隐私设置）
- 咨询师入驻申请（多步表单、状态追踪）
- 反馈系统（基于 Context/Provider 的平台反馈弹窗）
- 法律文档（隐私政策、用户协议、免责声明、未成年人保护）

## 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（端口 3100） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | ESLint 检查 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm clean` | 清理 .next 构建产物 |

## 依赖的工作区包

本应用依赖以下 monorepo 工作区包（通过 `workspace:*` 协议）：

- `@ai-adolescent-mental-health/api-client` — HTTP 客户端封装和 API 调用生成
- `@ai-adolescent-mental-health/config` — 共享配置
- `@ai-adolescent-mental-health/domain` — 共享类型定义和领域模型
- `@ai-adolescent-mental-health/ui` — 共享 UI 组件

这些包通过 `next.config.ts` 的 `transpilePackages` 在 Next.js 中编译。
