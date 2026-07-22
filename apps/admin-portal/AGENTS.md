# AGENTS.md — `apps/admin-portal`

> 面向 AI 编码助手的 admin-portal 工作区速查。动手前请同时参阅根 [AGENTS.md](../../AGENTS.md)。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/admin-portal`
- 技术栈：Next.js 16 + React 19 + TypeScript + ECharts + @uiw/react-md-editor
- 样式：基于 `@/lib/design-tokens` 的「山林与琥珀」设计系统（潭绿主色 #3B7D7D + 暖琥珀强调 #C4956A），通过内联 `tokens` 对象引用
- 端口：`3101`（`next dev --port 3101`）
- 路由：App Router，无 middleware（角色守卫在 layout.tsx 中通过 AuthGuard 实现）
- 构建：`output: "standalone"`，通过 Next.js rewrites 代理 `/api/*` → `BACKEND_URL`

## 二、目录结构

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/login/           # 管理端登录
│   ├── admin/                  # 超级管理员 (role=4)
│   │   ├── layout.tsx          # AuthGuard[4] + AdminLayout
│   │   ├── dashboard/          # 工作概览 (AdminDashboard)
│   │   ├── content/            # articles, courses, assessments, books, audit
│   │   ├── system/             # quotes, tags, feedbacks, complaints, meme, platform-income
│   │   ├── hospitals/          # 医院管理
│   │   ├── users/              # 用户管理
│   │   ├── psychologist/       # 咨询师管理 + 资料审核
│   │   ├── psychologist-fields/     # 擅长领域字典
│   │   └── psychologist-qualifications/ # 资质字典
│   ├── hospital/               # 医院管理员 (role=3)
│   │   └── dashboard, doctors, departments, feedbacks, complaints
│   ├── doctor/                 # 医生 (role=2)
│   │   └── dashboard, workbench, schedule, patients
│   └── psychologist-admin/     # 咨询师自助 (isPsychologist=1)
│       └── workbench, schedule, appointments, income, chat, profile
├── components/admin/
│   ├── AuthGuard.tsx           # Token + role 校验
│   ├── AdminLayout.tsx         # 侧边栏 + 顶栏 + 内容区
│   ├── AdminSidebar.tsx        # 深色侧边栏 (#304156)
│   ├── AdminHeader.tsx         # 顶栏（用户信息 + 退出）
│   ├── LoginPage.tsx           # 登录页（sonner toast 提示）
│   ├── dashboard/              # AdminDashboard, HospitalDashboard, DoctorDashboard
│   ├── content/                # Article*, Course*, Assessment*, Book*, Audit*, Field*, Qualification*
│   ├── system/                 # Tag*, Quote*, Feedback*, Complaint*, Meme*, PlatformIncome*
│   ├── users/                  # UserList
│   ├── hospitals/              # HospitalList
│   ├── doctor/                 # DoctorList, DepartmentList, 医院投诉/反馈
│   ├── doctor-workbench/       # Workbench, PatientArchives, ScheduleManager
│   ├── psychologist/           # PsychSchedule, PsychAppointments, PsychChat, PsychIncome, PsychProfile
│   └── psychologist-admin/     # PsychologistAdmin, ProfileAudit
└── lib/
    ├── session.ts              # localStorage (key: aiamh.adminPortal.token/user)
    ├── api-admin.ts            # httpClient (get/post/put/delete), adminApi.login
    ├── role-utils.ts           # ROLE_*, getRoleDashboardPath(), getMenuByRole()
    └── safe-redirect.ts        # 防开放重定向
```

## 三、API 代理

Next.js rewrites 将 `/api/*` 转发到 `BACKEND_URL`（默认 `http://127.0.0.1:8080`），移除 `/api` 前缀：

```
前端调用: httpClient.get("/admin/users")
实际请求: GET {BACKEND_URL}/admin/users
```

`httpClient` 自动处理：
- 请求头注入 `Authorization: Bearer {token}`
- 401 时清除 session 并重定向到 `/login`
- 解开后端 `{ code, message, data }` 信封，组件直接获取 `data`

## 四、CRUD 组件模式

所有管理端页面为 `"use client"`，遵循以下统一模式：

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/lib/api-admin";
import { getStoredUser } from "@/lib/session";  // 需要 role 参数时
import { tokens } from "@/lib/design-tokens";   // 新设计令牌（替代旧 `s` 对象）

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

// 如需兼容旧代码，可使用 `import { s } from "@/lib/design-tokens";`
// `s` 是 `tokens` 的扁平化别名，保持与旧代码的字段名一致。

export function ResourceManager() {
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/...", { query: { page, size: 20, keyword: search } });
      setData(res);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "加载失败"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  // 搜索框 → 表格 (loading/error/empty/data 四种状态) → 分页器
}
```

### 必须包含的四种表格状态
- `loading` — 显示"加载中..."
- `error` — 显示错误信息 + "重试"按钮
- `data.records.length === 0` — 显示"暂无数据"
- `data.records.map(...)` — 正常数据渲染

### Editor 组件模式
```typescript
const params = useParams();
const id = params?.id as string | undefined;
const isEdit = !!id;
// 编辑时: GET /resource/{id} 回填表单
// 保存: isEdit ? httpClient.put(...) : httpClient.post(...)
// 取消: router.push("/admin/parent-route")  // 不要用 router.back()
```

## 四点五、设计系统

设计令牌统一从 `@/lib/design-tokens` 导入：

```typescript
import { tokens } from "@/lib/design-tokens";
```

核心色板：

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `tokens.primary` | #3B7D7D 潭绿 | 主按钮、链接、激活态 |
| `tokens.accent` | #C4956A 暖琥珀 | 强调按钮（如"新增"）、关键交互 |
| `tokens.success` | #5B9A8B | 成功状态 |
| `tokens.warning` | #D4A24E | 警告状态 |
| `tokens.danger` | #C56C62 | 危险操作 |
| `tokens.bgPage` | #F5F3F0 | 页面背景（暖石灰） |
| `tokens.bgCard` | #FFFFFF | 卡片/表格容器 |
| `tokens.textPrimary` | #2D2B28 | 主文字 |
| `tokens.textSecondary` | #9C9690 | 辅助文字 |
| `tokens.border` | #E0DCD7 | 边框 |
| `tokens.sidebarBg` | #162E2E | 侧边栏背景 |

兼容旧代码：`import { s } from "@/lib/design-tokens"` — `s` 是 `tokens` 的扁平别名 (`s.primary`, `s.text`, `s.bg` 等)，字段名与旧 `s` 对象一致，可直接替换。

## 五、关键约定

1. **API 客户端**：`httpClient.get()`, `.post()`, `.put()`, `.delete()`
2. **后端方法映射**：严格对照 `@GetMapping`→GET, `@PostMapping`→POST, `@PutMapping`→PUT, `@DeleteMapping`→DELETE
3. **认证隔离**：localStorage key 为 `aiamh.adminPortal.*`，与 web-client 独立
4. **路由守卫**：每个角色组的 `layout.tsx` 中通过 `AuthGuard(role)` 实现
5. **状态切换**：toggle 后应本地更新 state 而不要重新 fetch（后端可能过滤已禁用项）
6. **Date 格式**：传给后端的时间参数使用 ISO 格式 `yyyy-MM-ddTHH:mm:ss`（保留 `T`）
7. **咨询师消息**：后端使用 `psychologistId` 作为 senderId，需从 `/psychologist/admin/me` 获取
8. **上传**：使用 `fetch("/api/common/upload", { method:"POST", body: formData })` + `Authorization` header
9. **富文本**：`@uiw/react-md-editor` 提供分屏 Markdown 编辑/预览
10. **图表**：ECharts 通过 `echarts.init(ref.current)` 初始化，resize 监听器需 cleanup

## 六、构建与部署

```bash
# 开发
pnpm dev:admin-portal          # next dev --port 3101

# 构建
pnpm --filter @ai-adolescent-mental-health/admin-portal build

# 类型检查
pnpm typecheck:admin-portal    # tsc --noEmit

# Docker 构建
docker build -t admin-portal \
  --build-arg BACKEND_URL=http://backend:8080 \
  -f apps/admin-portal/Dockerfile .
```

环境变量：
- `BACKEND_URL` — 后端 API 地址（Next.js rewrites 代理目标）
