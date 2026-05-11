# 青少年心理健康 AI 平台（ai-adolescent-mental-health-platform）

本仓库是一套面向青少年心理健康场景的 AI 辅助平台，包含 AI 问诊助手「小艾」、真人心理咨询、心理量表评估、心理内容库、医院与心理咨询师目录等业务域，多端覆盖 Web 管理后台、Android 客户端与微信小程序。

仓库采用 `pnpm + Turborepo` 组织成 monorepo，不同技术栈（Java / Vue / Kotlin / WeChat MiniProgram）共存于 `apps/*` 下，由根目录统一编排与依赖锁定。

## 架构总览

| 端 | 技术栈 | 工作区 | 对外角色 |
| --- | --- | --- | --- |
| 后端 API | Spring Boot 3.5.9 / Java 17 | `apps/backend` | 所有客户端共享的核心服务 |
| 管理后台 | Vue 3 + Vite + Element Plus | `apps/web-admin` | 运营/心理咨询师/管理员使用 |
| Android 客户端 | Kotlin / AGP 8.12 | `apps/android` | 面向青少年及家长用户 |
| 微信小程序 | 原生微信小程序 | `apps/wechat-miniapp` | 面向青少年及家长用户 |
| 微信云函数 | Node.js + wx-server-sdk | `apps/wechat-functions` | 小程序的 Serverless 后端 |

数据层共享资源放在 `infra/sql/`（SQL 初始化脚本、演进补丁）。

## 前置环境

- Node.js `>=24.0.0`
- pnpm `>=10.33.0`（仓库已通过 `packageManager` 字段固定为 `pnpm@10.33.0`）
- Java 17 JDK（后端；`JAVA_HOME` 指向 Java 17 兼容版本）
- Android SDK（若需开发 Android 端，需本地生成 `apps/android/local.properties`）
- 微信开发者工具（调试 `apps/wechat-miniapp`）
- MySQL 8+（库名 `xinyuzhilian`）
- Redis 6+
- RabbitMQ（可选；部分消息相关业务依赖）

## 仓库结构

```
.
├── apps
│   ├── backend          # Spring Boot 后端服务
│   ├── web-admin        # Vue 3 管理后台
│   ├── android          # Android 客户端
│   ├── wechat-miniapp   # 微信小程序
│   └── wechat-functions # 微信云函数
├── infra
│   └── sql              # 共享数据库脚本（跨工作区）
├── scripts              # Turbo/pnpm 调用 mvnw、gradlew 的桥接脚本
├── package.json         # 根工作区脚本
├── pnpm-workspace.yaml  # 工作区通配：apps/*
└── turbo.json           # Turbo 任务管线
```

工作区包名命名空间统一为 `@ai-adolescent-mental-health/<app>`。

## 快速开始

```bash
# 在仓库根目录
pnpm install
```

启动所有工作区的开发进程（并行）：

```bash
pnpm dev
```

只启动某个 app：

```bash
pnpm dev:backend      # 等价：pnpm --filter @ai-adolescent-mental-health/backend dev
pnpm dev:web-client   # 等价：pnpm --filter @ai-adolescent-mental-health/web-client dev
pnpm dev:web-admin    # 等价：pnpm --filter @ai-adolescent-mental-health/web-admin dev
```

对应各 app 的命令约定（由 `scripts/run-workspace-bin.cjs` 桥接）：

- 后端：`pnpm dev` → `mvnw spring-boot:run`，`pnpm build` → `mvnw clean package -DskipTests`
- 管理后台：`pnpm dev` → `vite`，`pnpm build` → `vite build`
- Android：`pnpm build` → `gradlew build`，`pnpm test` → `gradlew test`
- 小程序 / 云函数：无 CLI 构建，打印提示信息

## 常用脚本

| 脚本 | 作用 |
| --- | --- |
| `pnpm dev` | 并行启动所有工作区的 `dev` 任务 |
| `pnpm build` | 依拓扑顺序构建所有工作区（`^build`） |
| `pnpm test` | 先构建依赖再运行测试 |
| `pnpm typecheck` | 对支持的工作区执行类型检查 |
| `pnpm clean` | 清理各工作区产物及根目录 `.turbo` |
| `pnpm dev:backend` / `pnpm dev:web-client` / `pnpm dev:web-admin` | 单独启动后端 / web-client / 管理后台开发 |
| `pnpm test:backend` / `pnpm test:android` | 只跑后端 / Android 测试 |
| `pnpm typecheck:web-admin` | 只跑管理后台类型检查 |

通过 `--filter` 还可以精确到任何工作区：

```bash
pnpm --filter @ai-adolescent-mental-health/web-admin build
pnpm --filter @ai-adolescent-mental-health/backend test
```

Turbo 的 `build` 与 `test` 任务均依赖 `^build`（上游工作区先构建），`dev` 配置为 `persistent: true` 且不缓存，`clean` 亦不缓存。详见 [turbo.json](turbo.json)。

## 后端配置与环境变量

后端配置主文件：[apps/backend/src/main/resources/application.yml](apps/backend/src/main/resources/application.yml)。仓库不再提交 `application-dev.yml` / `application-test.yml` 等环境配置文件；CI/CD 通过环境变量注入，本地开发可复制 [apps/backend/.env.example](apps/backend/.env.example) 为 `apps/backend/.env`。缺少必需变量时应让应用启动失败，避免使用无效默认值。

需要在本地或部署环境设置的常见变量：

| 变量 | 用途 |
| --- | --- |
| `DB_MYSQL_HOST` / `DB_MYSQL_PORT` / `DB_MYSQL_DATABASE` | MySQL 地址、端口与数据库名 |
| `DB_MYSQL_USERNAME` / `DB_MYSQL_PASSWORD` | MySQL 账号与密码 |
| `DB_REDIS_HOST` / `DB_REDIS_PORT` | Redis 地址与端口 |
| `ALIYUN_OSS_ENDPOINT` / `ALIYUN_OSS_BUCKET_NAME` | 阿里云 OSS endpoint 与 bucket |
| `ALIYUN_OSS_ACCESS_KEY_ID` / `ALIYUN_OSS_ACCESS_KEY_SECRET` | 阿里云 OSS 凭据 |
| `JWT_SECRET` | JWT 签名密钥（HS256，至少 256 位） |
| `DASHSCOPE_API_KEY` | 阿里云百炼 DashScope API Key（小艾 AI 对话） |
| `WX_APP_ID` / `WX_APP_SECRET` | 微信小程序 AppID 与 AppSecret |
| `WX_GZH_APP_ID` / `WX_GZH_SECRET` | 微信公众号 AppID 与 AppSecret |
| `WX_GZH_CALLBACK_BASE_URL` | 微信公众号授权回调基础地址 |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP 服务配置 |

本地起服前请确保：

1. MySQL 中已有数据库 `xinyuzhilian`，并执行过 `infra/sql/` 下的脚本；
2. Redis 在 `localhost:6379` 可用；
3. 如需 RabbitMQ 相关功能，本地 `guest:guest@localhost:5672` 可达。

## 常见问题

- **`gradlew` 不可用**：Windows 下会用 `gradlew.bat`；`scripts/run-workspace-bin.cjs` 已做平台适配，直接用 `pnpm --filter ... build` 即可。
- **Android SDK 未就绪**：在 `apps/android/local.properties` 写入 `sdk.dir=<你的 Android SDK 路径>`（Android Studio 首次打开会自动生成，不要入库）。
- **小程序没有 CLI 构建**：`apps/wechat-miniapp` 的 `pnpm build` 只是打印提示。实际开发请用微信开发者工具打开该目录；云函数上传见 `apps/wechat-miniapp/uploadCloudFunction.sh`。
- **云函数如何部署**：`apps/wechat-functions` 依赖由根 `pnpm-lock.yaml` 管理，无需在子目录单独 `npm install`。代码变更后，通过微信开发者工具或上述脚本上传至云开发环境。
- **首次 `pnpm dev` 报端口占用**：后端默认 `server.port=8080`，前端 Vite 默认 `5173`，请先确认占用情况。

## 分支与协作

- 主干：`main`
- 提交前建议至少执行：

  ```bash
  pnpm typecheck
  pnpm --filter <受影响的工作区> test
  ```

- 涉及数据库 schema 变更需同步更新 `infra/sql/` 下脚本并在 PR 中说明。

## 进一步阅读

- 面向 AI 编码助手（Claude Code / Codex / Cursor 等）的上下文速查：[AGENTS.md](AGENTS.md)
- 各 app 单独的 AI 指引：
  - [apps/backend/AGENT.md](apps/backend/AGENT.md)
  - [apps/web-admin/AGENT.md](apps/web-admin/AGENT.md)
  - [apps/android/AGENT.md](apps/android/AGENT.md)
  - [apps/wechat-miniapp/AGENT.md](apps/wechat-miniapp/AGENT.md)
  - [apps/wechat-functions/AGENT.md](apps/wechat-functions/AGENT.md)
