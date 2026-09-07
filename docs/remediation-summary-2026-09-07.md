# 安全修复收尾报告 — 2026-09-07

> 承接 `docs/audit-report-2026-09-07.md`。本次完成纳入范围的 CRITICAL 可落地项;需运行环境验证的 #4/#5 给出实施方案待后续执行。

## 一、本次已交付并验证

以下改动全部通过编译 / typecheck(后端 `./mvnw compile` 通过;web-client / admin-portal / web-admin 三端 typecheck 通过)。

### CRITICAL #1 — 未认证注册提权为超管
- **`service/impl/LoginServiceImpl.java`** (`register`, 约 737 行)
  注册路径改为无条件 `setRole(1)`、`setStatus(1)`、`setMemberType(null)`、`setDeleted(false)`,彻底忽略客户端传入的 `role/status/memberType`。`{"role":4}` 不再生效。
- 影响: `POST /user/register`(permitAll)不再能创建超管。

### CRITICAL #2 — 已知默认 JWT 签名密钥 → 任意 token 伪造
- **`src/main/resources/application.yml`**
  `jwt.secret` 从 `${JWT_SECRET:ai-...-dev-secret-key-2024}` 改为 `${JWT_SECRET}`(删除公开 fallback)。
- **`domain/common/JwtProperties.java`** (`init`)
  新增启动校验:密钥缺失 / 仍为公开默认值 / 短于 32 字节 → 抛 `IllegalStateException` **fail-fast**,拒绝启动。本地 `application-local.yml`(git-ignored)已用独立 32 字符密钥,不受影响。

### CRITICAL #3 — 会话 token 存进 SSE URL(代理/nginx 日志泄露)
- **后端收紧**(`SecurityConfig.java`): 4 个 `message/stream/**` 端点从 `permitAll()` 改为 `authenticated()`。
- **后端 Controller**: `ConsultationMessageController.stream`、`PsychologistMessageController.subscribeUser` / `subscribePsychologist` 改用 `@CurrentUserId` 注入已认证用户,删除从 `?token=` 解析 JWT 的逻辑及未使用的 `jwtUtil`/`parseUserId`。
- **前端 6 处 SSE** 全部由 `EventSource`(无法带 header,故塞 URL)改为 `fetch + ReadableStream` 携带 `Authorization: Bearer`:
  - React: `web-client .../chat-page.tsx`、`admin-portal .../PsychChat.tsx`
  - Vue: `web-admin .../Consultation.vue`、`Workbench.vue`、`UserChat.vue`、`Chat.vue`
  - 新增可复用工具: `web-client/src/lib/sse.ts`、`admin-portal/src/lib/sse.ts`、`web-admin/src/utils/sse.ts`(支持 Bearer 头、自动重连、`close()` 清理)
- 结果: JWT 不再进入任何 URL,不再落入代理/nginx 访问日志、浏览器历史、Referer。

### 后端控制批次(HIGH 关联修复,一并落地)
- **`SecurityConfig.java`**: CORS 不再 `AllowedOriginPatterns("*") + credentials`(CWE-346),改为从 `${app.cors.allowed-origins}` 读取白名单(未配置回退本地开发端口);401/403 响应体不再回泄 `accessDeniedException.getMessage()` / `authException.getMessage()`。
- **`GlobalExceptionHandler.java`**: 兜底 `Exception` 返回通用 `"服务器内部错误,请稍后重试"`,不再回泄 `e.getMessage()`(可能含 SQL 片段、表名、内部路径)。
- **`JwtAuthenticationTokenFilter.java`**: 删除打印整个 `principal` 的 INFO 日志(此前会经 Lombok `toString` 泄露 password 哈希/phone/birthday 等 PHI)。

## 二、待办(需能运行验证的环境)

### CRITICAL #4 — 前端授权完全依赖可改的 localStorage
**现状**: `web-admin/src/router/index.ts` 与 `admin-portal/src/components/admin/AuthGuard.tsx` 均读 `localStorage.user.role` 决定是否放行 admin/PHI 页面;两端均无 `middleware.ts`。
**已确认约束**: Next.js `middleware.ts` 跑在服务端,读不到 `localStorage` —— 要让它能验,必须先改造凭据载体。

**方案(需要运行环境验证)**
1. 后端登录类接口返回时设置 `HttpOnly + Secure + SameSite` cookie(作为 session 载体),而非/除此之外不依赖前端 localStorage 存 JWT。
2. 前端所有 API 请求切换为 `credentials: 'include'`;SSE 助手(data 已支持 header)与 WS 凭据同步适配 cookie。
3. `admin-portal` / `web-client` 增加 `middleware.ts`,在服务端校验 cookie 中的会话声明(角色),未授权重定向——这才是真正不可绕过的门禁。
4. `web-admin`(Vue,无 Next.js middleware)路由守卫从"仅读 localStorage role"改为调用 `/me` 类受保护接口取其服务端角色,凭过期/无会话即拒绝。
5. 后端作为最终边界,is-own-data / 角色校验已在各 service 落实(本次已加固消息/SSE 属主校验)。

### CRITICAL #5 — 微信音频实时通道仅凭客户端可控 userId 鉴权
**现状**: `apps/web-client .../xiaoai-listen-page.tsx:380-394`、`apps/web-admin .../XiaoaiListen.vue:981-987` 以 `ws.send({type:'session.init', userId})` 上报身份,后端 `OmniRealtimeWebSocketProxy` 信任该 userId;默认协议 `ws://`。
**已确认约束**: 浏览器 `WebSocket` 无法设 header,token 只能走 `Sec-WebSocket-Protocol` 子协议或 URL;若走 URL 又与 #3 冲突。

**方案(需要运行环境验证)**
1. 后端 `@ServerEndpoint("/ws/omni-realtime")` 增加 `ServerEndpointConfig.Configurator`,在 `beforeHandshake` 校验凭据(从 `Sec-WebSocket-Protocol` 子协议或握手头取 token),校验失败拒绝握手;移除对客户端 `session.init.userId` 的信任。
2. 前端 `new WebSocket(url, [subProtocol])` 携带 token;默认协议由 `ws://` 改为 `wss://`(生产)。
3. 会话记录绑定到服务端认证主体,而非客户端上报的 `userId`。

## 三、建议后续(低风险,可随时做)
- 空 `catch (Exception ignored) {}` 吞错处补日志(websocket 代理、SSE broadcast、assessment/psychologist NumberFormat…)。
- `PsychologistAdminController`(1091 行)、`LoginServiceImpl`(874 行)超大控制器拆分。
- Vue `XiaoaiListen.vue`(2657 行)SFC 拆 composables。
- `@Transactional(readOnly=true)` 补充到查询型方法。
