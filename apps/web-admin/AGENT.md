# AGENT.md — `apps/web-admin`

> 面向 AI 编码助手的管理后台（Web Admin）工作区速查。动手前请同时参阅根 [AGENT.md](../../AGENT.md)。
>
> **文档自更新**：当本工作区的脚本 / 依赖 / 视图结构 / 约定发生变化，或你从用户对话中沉淀到新约束时，**可直接更新本文件或根 README / AGENT**。就近修改、先事实后文档、保持锚点准确。详见根 [AGENT.md](../../AGENT.md) 第「五、文档自更新」节。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/web-admin`
- 技术栈：Vue 3.5、Vite `8.0.0-beta.13`、TypeScript `~5.9.3`、`vue-tsc ^3.1.5`
- 状态管理：Pinia 3
- 路由：vue-router 5
- UI 组件：Element Plus `^2.13.2` + `@element-plus/icons-vue`
- 其他：ECharts 6（图表）、`@kangc/v-md-editor`（Markdown 编辑）、`highlight.js`、`dayjs`、`axios`、`sass`
- 模块类型：`"type": "module"`
- 构建器：Vite（通过 `overrides` 强制锁定 `^8.0.0-beta.13`）

## 二、目录结构

```
src/
├── main.ts           # 入口
├── App.vue           # 根组件
└── views/            # 页面级组件（已有文件见下）
```

目前存在的视图文件（摘录）：`AdminLayout.vue`、`Layout.vue`、`Home.vue`、`Login.vue`、`Register.vue`、`ForgotPassword.vue`、`Books.vue`、`SearchResults.vue`、`AIConsultation.vue`、`ApplyPsychologist.vue`、`XiaoaiListen.vue`。新增页面按业务域对齐后端包（`book`、`consultation`、`content`、`hospital`、`psychologist`、`user`、`stats`、`search`、`xiaoai`）。

## 三、命令

```bash
pnpm dev:web-admin                                         # vite
pnpm --filter @ai-adolescent-mental-health/web-admin build   # vite build
pnpm --filter @ai-adolescent-mental-health/web-admin build:check  # typecheck + build
pnpm --filter @ai-adolescent-mental-health/web-admin preview      # vite preview
pnpm --filter @ai-adolescent-mental-health/web-admin typecheck    # vue-tsc -b
pnpm --filter @ai-adolescent-mental-health/web-admin clean        # 删除 dist/
```

提交前请至少运行 `pnpm typecheck:web-admin`（根级快捷脚本）。

## 四、AI 约束

1. **组件命名**：单文件组件文件名采用 PascalCase（如 `UserProfile.vue`）；模板内使用 kebab-case 标签也可，保持单文件内部一致。
2. **样式先用 Element Plus 令牌**：颜色/间距/字体尽量走 Element Plus 主题变量，避免散落的硬编码 HEX。
3. **axios 统一封装**：基址与拦截器应在同一处集中配置，禁止在组件中直接 `axios.create` 或硬编码 `http://localhost:8080`；如发现尚未封装，请先提醒用户。
4. **Pinia store**：按业务域拆分（`useUserStore`、`useBookStore`…），不要把所有状态塞进单一全局 store。
5. **Markdown 渲染**：统一使用已引入的 `@kangc/v-md-editor` + `highlight.js`；不要再引入额外 markdown 库。
6. **图表**：使用 `echarts`；避免再引入 Chart.js 等平行库。
7. **路由懒加载**：新增页面采用 `() => import('...')` 形式，保持首屏体积。
8. **Vite 8 beta**：当前锁定 beta 版本，引入插件时检查兼容性；不要擅自降级或升级 Vite major 版本。
9. **TypeScript 严格性**：`vue-tsc -b` 会按 tsconfig 组合检查，修改 `tsconfig*.json` 前先说明理由。

## 五、常见坑

- **`pnpm dev` 启动失败**：多半是后端接口地址未配置；检查 `.env*` / 封装文件。
- **Element Plus 图标不展示**：确认 `@element-plus/icons-vue` 已全局注册或按需引入。
- **构建产物过大**：优先排查 ECharts 与 `v-md-editor` 是否被全量引入，考虑按需引入。
