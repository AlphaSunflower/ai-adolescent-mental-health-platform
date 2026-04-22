# AGENT.md — `apps/wechat-functions`

> 面向 AI 编码助手的微信云函数工作区速查。动手前请同时参阅根 [AGENT.md](../../AGENT.md)。
>
> **文档自更新**：当云函数入口 / 依赖 / 部署方式 / 约定发生变化，或你从用户对话中沉淀到新约束时，**可直接更新本文件或根 README / AGENT**。就近修改、先事实后文档、保持锚点准确。详见根 [AGENT.md](../../AGENT.md) 第「五、文档自更新」节。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/wechat-functions`
- 形态：微信云开发云函数（Serverless）
- 运行时：Node.js（由微信云开发环境决定版本）
- 核心依赖：`wx-server-sdk@~2.4.0`
- 入口：`index.js`（根目录直接暴露 `main` 函数）
- **无构建步骤**：`pnpm build` / `pnpm test` 均只打印提示

## 二、关键文件

- `index.js`：云函数入口，导出 `exports.main = async (event, context) => { ... }`
- `config.json`：云函数权限 / 触发配置（格式见微信官方）
- `package.json`：依赖声明；`wx-server-sdk` 必须存在

## 三、命令

```bash
pnpm --filter @ai-adolescent-mental-health/wechat-functions build   # 仅打印提示
pnpm --filter @ai-adolescent-mental-health/wechat-functions test    # 仅打印提示
```

依赖安装在仓库根目录统一进行：

```bash
pnpm install   # 根目录
```

云函数的**部署 / 上传**不走 pnpm，而是通过 `apps/wechat-miniapp/uploadCloudFunction.sh` 或在微信开发者工具中手动上传。

## 四、AI 约束

1. **不要在本目录单独 `npm install`**：依赖由根 `pnpm-lock.yaml` 管理；单独装会破坏 workspace 硬链接。
2. **不要引入需编译的依赖**：云开发 Node 运行时资源受限，避免 `sharp`、`puppeteer` 等带 native binding 或大体积依赖。
3. **体积敏感**：云函数上传包有大小限制，新依赖先评估 `node_modules` 占用。
4. **`wx-server-sdk` 初始化**：

   ```js
   const cloud = require('wx-server-sdk')
   cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
   ```

   不要硬编码环境 ID；`DYNAMIC_CURRENT_ENV` 会自动跟随小程序端的环境切换。
5. **密钥处理**：云函数中访问第三方 API 所需的 key 通过云开发「环境变量」配置，不要写入源码。
6. **修改后需提示用户上传**：AI 修改完云函数代码，应提醒用户在 miniapp 侧执行 `./uploadCloudFunction.sh` 或在开发者工具中重新上传，否则线上无效。
7. **新增云函数**：若将来拆出多个云函数目录（如 `functions/login/`、`functions/search/`），需同步更新 `apps/wechat-miniapp/project.config.json` 的 `cloudfunctionRoot` 与上传脚本。

## 五、与其他工作区的协作

- 本云函数面向 `apps/wechat-miniapp` 的轻量服务端需求；重业务（数据库写入、权限校验）仍走 `apps/backend` 的 REST API。
- 若云函数需要回调后端，请通过 HTTPS 调用后端对外接口，并在后端侧做身份校验。
