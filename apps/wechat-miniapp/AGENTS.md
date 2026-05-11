# AGENTS.md — `apps/wechat-miniapp`

> 面向 AI 编码助手的微信小程序工作区速查。动手前请同时参阅根 [AGENTS.md](../../AGENTS.md) 以及本目录下已有的 [README.md](README.md)。
>
> **文档自更新**：当本工作区的页面结构 / 云函数位置 / 上传脚本 / 约定发生变化，或你从用户对话中沉淀到新约束时，**可直接更新本文件或根 README / AGENTS**。就近修改、先事实后文档、保持锚点准确。详见根 [AGENTS.md](../../AGENTS.md) 第「五、文档自更新」节。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/wechat-miniapp`
- 形态：原生微信小程序（非 uni-app / Taro）
- **无 CLI 构建**：`pnpm build` / `pnpm test` 等脚本只会打印提示信息，真正的构建、预览、上传均通过「微信开发者工具」完成。
- 云函数根目录位于同级目录 `../wechat-functions`
- 当前云函数目录为 `../wechat-functions/quickstartFunctions`
- 云函数上传脚本：`./uploadCloudFunction.sh`

## 二、常见目录（微信约定）

- `app.js` / `app.json` / `app.wxss`：小程序入口与全局配置
- `project.config.json` / `project.private.config.json`：开发者工具项目配置（后者包含个人 AppID 信息，一般不入库）
- `pages/<page>/`：页面目录，每页 4 件套 `.wxml` / `.wxss` / `.js` / `.json`
- `components/`：自定义组件
- `utils/`：工具方法

## 三、开发流程

1. 克隆仓库后，用「微信开发者工具」**打开 `apps/wechat-miniapp` 这个子目录**（不是仓库根目录）。
2. 在开发者工具中完成 AppID 配置（或使用测试号）。
3. 代码修改、预览、真机调试、提审均在开发者工具内操作。
4. 云函数修改后，在小程序目录执行上传脚本：

   ```bash
   ./uploadCloudFunction.sh
   ```

## 四、AI 约束

1. **不要为此工作区编造构建 / 测试命令**：目前不存在 `pnpm build:miniapp`、`vite` 之类的构建链。如被用户要求「加构建」，应先与用户确认是否切换到 uni-app / Taro，而不是擅自搭建。
2. **`app.json` 修改需谨慎**：`pages` 数组顺序决定首页；`tabBar`、`window`、`usingComponents` 字段有严格格式要求，改动前核对微信官方 schema。
3. **`project.config.json`**：`miniprogramRoot`、`cloudfunctionRoot` 指向 monorepo 内路径，**不要改成绝对路径**。
4. **云函数目录联动**：本目录 `project.config.json` 的 `cloudfunctionRoot` 指向 `../wechat-functions`，其下再按函数名拆分子目录；改位置前确认未破坏上传脚本与函数名 `quickstartFunctions`。
5. **AppID / 云开发环境 ID**：不要写死真实 ID 在代码里，使用 `project.private.config.json`（不入库）或环境切换逻辑。
6. **不要引入 npm 包构建链**：微信小程序虽支持 `npm`，但本工作区当前未启用。如确需，先向用户说明影响（构建步骤、开发者工具开关）。
7. **样式单位**：使用 `rpx` 而非 `px`，与既有页面保持一致。

## 五、与后端的交互

- 小程序通过微信 OAuth 获取 `code`，后端 `user` 域用 `WX_APP_SECRET` 换取 `openid` / `unionid`。
- 业务数据优先走后端 REST API；仅轻量工具类逻辑（如鉴权辅助、简单查询）走云函数。
