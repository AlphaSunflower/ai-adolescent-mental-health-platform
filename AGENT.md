# AGENT.md — 根目录 AI 协作速查

> 本文件是面向 AI 编码助手（Claude Code / Codex / Cursor 等）的上下文速查清单。先读这里再动手。人类开发者请优先阅读 [README.md](README.md)。

## 一、仓库定位

- 项目名：`ai-adolescent-mental-health-platform`
- 形态：`pnpm + Turborepo` monorepo
- 业务：青少年心理健康 AI 平台（AI 问诊「小艾」、真人咨询、量表评估、内容库、医院与咨询师目录）
- 主干：`main`

## 二、工作区拓扑

| 路径 | 包名 | 技术栈 | 有无 CLI 构建 |
| --- | --- | --- | --- |
| `apps/backend` | `@ai-adolescent-mental-health/backend` | Spring Boot 3.5.9 / Java 17 / Maven Wrapper | 有（`mvnw`） |
| `apps/web-admin` | `@ai-adolescent-mental-health/web-admin` | Vue 3 / Vite 8 beta / TS 5.9 | 有（`vite`） |
| `apps/android` | `@ai-adolescent-mental-health/android` | Kotlin / Gradle Wrapper / AGP 8.12 | 有（`gradlew`） |
| `apps/wechat-miniapp` | `@ai-adolescent-mental-health/wechat-miniapp` | 原生微信小程序 | 无（使用微信开发者工具） |
| `apps/wechat-functions` | `@ai-adolescent-mental-health/wechat-functions` | Node.js + `wx-server-sdk@~2.4.0` | 无（Serverless） |

工作区通配：见 [pnpm-workspace.yaml](pnpm-workspace.yaml)（`apps/*`）。
共享 SQL：`infra/sql/`。

## 三、命令速查

根目录可用脚本（来源：[package.json](package.json)）：

```bash
pnpm dev            # turbo run dev --parallel
pnpm build          # turbo run build
pnpm test           # turbo run test
pnpm typecheck      # turbo run typecheck
pnpm clean          # turbo run clean + 清理 .turbo

pnpm dev:backend           # 只起后端
pnpm dev:web-admin         # 只起前端
pnpm test:backend          # 只跑后端测试
pnpm test:android          # 只跑 Android 测试
pnpm typecheck:web-admin   # 只跑前端类型检查
```

精确过滤（替代记忆 shortcut）：

```bash
pnpm --filter @ai-adolescent-mental-health/<app> <script>
```

Turbo 任务管线（来源：[turbo.json](turbo.json)）：

- `build`：依赖 `^build`，产物目录 `dist/** | target/** | build/** | app/build/**`
- `test`：依赖 `^build`，无产物
- `dev`：`persistent: true`、`cache: false`
- `typecheck`：依赖 `^typecheck`
- `clean`：`cache: false`

## 四、变更约束（AI 请严格遵守）

1. **不要修改 `pnpm-lock.yaml`**，除非用户明确要求升级/新增依赖。
2. **不要擅自新增 `CLAUDE.md`、`.cursorrules`、`.github/copilot-instructions.md` 等其他 AI 规约文件**；本仓库统一使用 `AGENT.md`。
3. **不要跨 app 复制源文件**。各端独立演进，若需共享 SQL/常量，考虑放 `infra/`。
4. **修改根级配置前先说明理由**：`turbo.json`、`pnpm-workspace.yaml`、根 `package.json`、`apps/backend/src/main/resources/application*.yml`。
5. **不要提交真实密钥或环境配置文件**。后端敏感项和环境差异通过 `${ENV_VAR}` 读取，本地可用 `apps/backend/.env`；不要提交真实 `.env` 或 `application-dev.yml`、`application-test.yml`、`application-local.yml` 等 profile 配置。
6. **工作区内新增依赖**走对应子目录的 `package.json` / `pom.xml` / `build.gradle.kts`；不要把 app 级依赖塞到根 `package.json`。
7. **文档默认不写 emoji**，与仓库既有风格一致。

## 五、文档自更新（AGENT.md / README.md 维护）

- **允许并鼓励** AI 编码助手在以下情况**主动更新** `README.md` 与任意 `AGENT.md`：
  - 发现文档描述与代码现状不符（脚本名、路径、版本号、依赖、端口、业务域划分等漂移）
  - 新增或删除了工作区、脚本、环境变量、外部服务依赖
  - 引入了新的约定 / 陷阱 / 常见坑，值得沉淀给后续 AI 或人类
  - 用户在对话中给出了应长期遵循的规则（例如「以后新增接口都要 xxx」），应沉淀到对应 AGENT.md
- 更新时遵循：
  1. **先改代码 / 配置，再同步文档**，避免文档先于事实。
  2. **就近原则**：全局约束写根 `AGENT.md`；仅某个 app 的约束写 `apps/<name>/AGENT.md`。
  3. **保持锚点准确**：引用的版本号、包名、脚本名须能在当前仓库中核对到。
  4. **在 PR / 提交信息中说明文档变更**，方便 reviewer 对齐认知。
- **不要**在未征得用户同意时：新增 `CLAUDE.md` / `.cursorrules` 等平行规约文件；大规模重写文档风格；删除他人添加但你不理解的条目（先询问）。

## 六、外部服务清单（后端）

后端直接依赖的三方能力（对应变量见 `apps/backend/src/main/resources/application.yml`）：

- 阿里云百炼 **DashScope**（`DASHSCOPE_API_KEY`）——小艾 AI 对话
- **微信小程序 / 公众号**（`WX_APP_ID` / `WX_APP_SECRET` / `WX_GZH_APP_ID` / `WX_GZH_SECRET` / `WX_GZH_CALLBACK_BASE_URL`）——登录与回调
- **阿里云 OSS**（`ALIYUN_OSS_ENDPOINT` / `ALIYUN_OSS_ACCESS_KEY_ID` / `ALIYUN_OSS_ACCESS_KEY_SECRET` / `ALIYUN_OSS_BUCKET_NAME`）——文件存储
- **QQ 邮箱 SMTP**（`MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD`）——验证码/通知邮件
- **MySQL / Redis / RabbitMQ**（`DB_MYSQL_*` / `DB_REDIS_*`）——数据层

本地启动后端的最低运行期条件：MySQL (`xinyuzhilian`) + Redis。RabbitMQ 视所触发的业务而定。

## 七、提交前自检清单

| 改动范围 | 建议执行 |
| --- | --- |
| 任意 TS/Vue 文件 | `pnpm typecheck:web-admin` |
| 后端代码或 SQL | `pnpm test:backend` |
| Android 代码 | `pnpm test:android` |
| 跨多个工作区 | `pnpm typecheck && pnpm test` |
| 数据库 schema | 同步更新 `infra/sql/` 脚本并在 PR 说明 |

## 八、子工作区深入阅读

进入任何一个 `apps/<name>` 修改前，请先读该目录下的 `AGENT.md`：

- [apps/backend/AGENT.md](apps/backend/AGENT.md)
- [apps/web-admin/AGENT.md](apps/web-admin/AGENT.md)
- [apps/android/AGENT.md](apps/android/AGENT.md)
- [apps/wechat-miniapp/AGENT.md](apps/wechat-miniapp/AGENT.md)
- [apps/wechat-functions/AGENT.md](apps/wechat-functions/AGENT.md)
