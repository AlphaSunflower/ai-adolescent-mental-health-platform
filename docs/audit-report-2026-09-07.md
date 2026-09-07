# 全量代码审计报告 — ai-adolescent-mental-health-platform

**审计日期**: 2026-09-07
**审计范围**: `apps/backend`(全部 Java)· `apps/web-client` + `apps/admin-portal`(React)· `apps/web-admin`(Vue)。跳过 android / wechat-miniapp。
**维度**: 安全/合规 + 代码质量。
**说明**: 针对当前全源树静态审计(非 diff);后端未运行 `mvn verify`(需外部 MySQL/Redis)。仅 android `settings.gradle.kts` 有未提交改动。

> 各条目由评审代理逐条读取源文件核实;前后端对同一根因的发现已合并去重。全库未发现 SQL 注入(MyBatis `#{}` 参数化正确),核心对象属主校验基本正确。

---

## CRITICAL — 合并前必须修复(安全)

### 1. 未认证注册即提权为超管
`service/impl/LoginServiceImpl.java:737-741`
`POST /user/register` 为 `permitAll`(`SecurityConfig.java:82`),直接绑定 `User` JSON,`register()` 仅当 `role==null` 才默认 `1`。请求体 `{"role":4}` 即注册成超级管理员,获得全部 `/admin/**` 与用户数据读写权。
**修复**: 自注册路径强制 `user.setRole(1)`,用 `RegisterDTO` 白名单字段,禁止客户端传 `role/status/memberType`。

### 2. 已知默认 JWT 签名密钥 → 任意 token 伪造
`src/main/resources/application.yml:48` → `jwt.secret: ${JWT_SECRET:ai-...-dev-secret-key-2024}`
`JWT_SECRET` 未设时用公开 fallback 作 HS256 key(`JwtUtil.java:41/54/77/136`),启动无校验。知道该值即可铸造任意 `userId` 的合法 token,完全绕过鉴权。与 #1 叠加:匿名者无密码即得超管 token 读写未成年人 PHI。
**修复**: 删除 fallback,启动 `@PostConstruct` 缺失/弱密钥(＜32 字节或等于 dev 值)即 fail-fast;每部署随机 256-bit 密钥。

### 3. 会话 token 全存 localStorage + SSE 查询串泄露
- `web-client/src/lib/session.ts`、`admin-portal/src/lib/session.ts` — token 存 `localStorage["aiamh.*.token"]`,任何 XSS/扩展/共享设备可读。
- `web-client chat-page.tsx:77`、`admin-portal PsychChat.tsx:91` — SSE 用 `EventSource` 把原始 JWT 拼进 URL `?token=`,落入 nginx/代理日志、历史、Referer。
**修复**: token 移入 `httpOnly + Secure + SameSite` cookie;SSE 改用短效一次性 ticket 或带 header 的 WS/fetch stream。

### 4. 前端授权完全依赖可改的 localStorage(客户端伪造)
- `web-admin/src/router/index.ts:556-579` — `beforeEach` 读 `JSON.parse(localStorage.user).role`,据此放行 `/admin`、`/hospital`、`/doctor` 及所有 `requiresRole` 页。改 `{"role":4}` 全通。
- `admin-portal AuthGuard.tsx:19-43` + 各 layout — 只信 `getToken()` + localStorage `role/isPsychologist`;两个 app 均无 `middleware.ts` 服务端门禁。
- 叠加后,`Workbench.vue` / `PatientArchives.vue` 的未成年 PHI 可被伪造角色直取。

**修复**: (a) 后端 is-own-data 强制校验(前台 gate 不是控制点);(b) 两端加 `middleware.ts` 服务端验 session;(c) 角色只信服务端 claims。

### 5. 微信音频实时通道仅凭客户端可控 `userId` 鉴权
`web-client xiaoai-listen-page.tsx:380-394`、`web-admin XiaoaiListen.vue:981-987`
WebSocket `/ws/omni-realtime` 无凭据连接,随后发 `session.init` 带 `getStoredUser().id`(localStorage 可改),默认 `ws://127.0.0.1:8080`。任意客户端可冒充任意用户接入未成年人 AI 聆听通道。
**修复**: WS 握手要求访问 token(或服务端验证的首帧),默认 `wss://`。

---

## HIGH — 合并前应修复

### 后端
- **`JwtAuthenticationTokenFilter.java:103-107`** — 每个请求 INFO 日志打印 `principal`(Lombok `@Data` toString 序列化出 password 哈希/phone/birthday)。改记 `userId+uri`,敏感字段置空。
- **`SecurityConfig.java:52-63`** — CORS `AllowedOriginPatterns("*")` + `allowCredentials(true)`(CWE-346)。改严格 origin 白名单。
- **`GlobalExceptionHandler.java:42-46` + `SecurityConfig.java:118/125`** — 兜底/401/403 回泄 `e.getMessage()`(SQL 片段、表名、内部路径)。改通用消息 + 仅服务端记栈。
- **auth 端点无速率限制** — `/user/login`、`/admin/login`、`/user/forgot/reset`、`/user/register` 全 `permitAll` 且无节流(`RateLimiter`/bucket4j 全库无),可无限暴力破解。加 IP/账户级限流 + 锁。
- **`PsychologistAdminController.java:217-224` 等约 20 处** — 每个变更接口 `catch(Exception) return error(e.getMessage())`,绕过 `@RestControllerAdvice` 且泄露内部。删 try/catch,交给 advice(域异常映射 HTTP 码)。

### React
- **无 `middleware.ts` 服务端验** — 见 CRITICAL #4。
- **`admin-portal` 类型安全坍塌** — 17 文件用 `PageResult<Record<string,unknown>>`,162 处 `row.X as type`;字段改名字符串 `undefined` 不是编译错。补 typed row 接口 / Zod 边界校验。
- **`admin-portal` 65/72 catch 为空** — `BookManager.tsx:26/36/41/73/86` 等加载/切换/删除失败静默 no-op。补 toast + `logger.error`。
- **两个 app 均无 error boundary** — 零 `error.tsx`/`global-error.tsx`/`ErrorBoundary`,一次 render throw 即白屏。

### Vue
- **`BookDetail.vue:298/352`** — 硬编码 `fetch('http://localhost:8080/...')` 绕过统一 API 层 + Bearer。走 `book.ts` 模块。
- **`Workbench.vue:501-509` + `PsychologistDetail.vue:157`** — `dangerouslyUseHTMLString` / `v-html` 未经净化(后端字段,可注入 stored XSS,见安全审计)。

---

## MEDIUM — 建议修复

**后端**: OTP 明文写日志(`EmailVerifyServiceImpl.java:112`);医院 admin(role 3)跨院 IDOR(`MedicalRecordServiceImpl.java:35-44`);`/common/upload` 未认证 + 无类型校验匿名传 OSS;微信默认密码为 openid 确定函数(`LoginServiceImpl.java:300/318`);PHI 明文落库 + 无同意无脱敏发三方 AI(合规 PIPL/GDPR);SSE 查询串传 token;`/user/register` 返回 password 哈希等实体(`UserServiceImpl.java:103-114`);`application.yml:36` DEBUG;`@Transactional` 94 处仅 1 处 `readOnly=true`;for 循环 `selectById` N+1(`PsychologistServiceImpl.java:530/570`);静态可变更注入(`OmniRealtimeWebSocketProxy.java:42-65`)。

**React**: status 转译 6+ 文件 DRY 重复;`getDisplayServices` 复制;web-client 近零 ARIA + 自定义 `Dialog` 无 Esc/焦点陷阱;`info-page.tsx` 死代码 `httpClient`;`key={i}` 用于可变列表(BookManager / patients-page)。

**Vue**: `as any` 124 处 + `strict` 摧毁类型安全;模块级无保护 `JSON.parse(localStorage)` 约 15 处;`user.ts` 另建 axios 实例只发 `token` 头(与主 util 不一致 → 静默鉴权失败);SSE 回调深层嵌套+空 catch;`XiaoaiListen.vue` 约 45 条 console.log 落盘点;硬编码 URL(`ws://127.0.0.1`、`http://122.51.12.200` 等);动态列表 `:key="index"` 错复用。

---

## LOW(节选)

弃用 `createScriptProcessor` → AudioWorklet;`URL.createObjectURL` 未 revoke;缺 `autocomplete`(password/PII 字段);`safeRedirect` 不拒 `\`/`%5C`;`@SuppressWarnings` + raw cast;null vs Optional;`v-html` 用于硬编码 SVG(非安全 bug,但该换 `<svg>`/`:is`)。

---

## 汇总

| 维度 | CRITICAL | HIGH | MEDIUM | LOW |
|---|---|---|---|---|
| 后端安全/合规 | 2 | 5 | 7 | ~3 |
| 后端质量/架构 | — | 9 | 7 | ~6 |
| React 安全 | 2 | 2 | ~4 | ~3 |
| React 质量 | — | 4 | 6 | 7 |
| Vue 安全 | 1 | 2 | ~4 | ~3 |
| Vue 质量 | — | 6 | 6 | 3 |

**总体判断: 高风险。** 后端两个 CRITICAL(自注册提权 + 默认 JWT 密钥)叠加,配合前端 localStorage 授权模型与 SSE token 泄露,等于 —— 匿名攻击者无需凭据,即可伪造超管 token 读写未成年人心理/医疗数据。合并前阻断。

**优先行动顺序**:
1. 立即修 #1(注册强制 role=1)、#2(密钥 fail-fast + 轮换)、#3(token 入 httpOnly)、#5(WS 凭据);并轮换已暴露的 `application-local.yml` 弱密钥。
2. 删前端 localStorage 角色门 + 加 middleware #4,后端强制 is-own-data。
3. 后端: 删 controller `catch&echo`,补限流,`getUsers` 置空 password,修跨院 IDOR。
4. 质量杠杆: 抽 2657 行 `XiaoaiListen.vue` / 1091 行 `PsychologistAdminController` / 874 行 `LoginServiceImpl` → 拆分。
