# 心愈智联 — 管理端 (admin-portal)

青少年心理健康 AI 平台管理端，基于 Next.js 16 App Router 构建，覆盖超级管理员、医院管理员、医生、心理咨询师四个角色的后台管理功能。

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5 |
| 图表 | ECharts 6 |
| 富文本 | @uiw/react-md-editor |
| 设计令牌 | Element Plus 色彩/圆角/阴影体系（内联样式） |
| Toast | sonner |
| HTTP | 基于 Axios 的 workspace 包 `@ai-adolescent-mental-health/api-client` |
| 构建 | `output: "standalone"`（Docker 容器化） |

## 角色权限

| 角色 | role 值 | 路由前缀 | 说明 |
|------|---------|----------|------|
| 超级管理员 | 4 | `/admin/*` | 全部管理功能，管理所有医院/医生/咨询师/用户/内容 |
| 医院管理员 | 3 | `/hospital/*` | 管理本院医生、科室、投诉、反馈 |
| 医生 | 2 | `/doctor/*` | 查看排班、患者档案、工作台 |
| 心理咨询师 | `isPsychologist=1` | `/psychologist-admin/*` | 预约管理、排班、在线聊天、收入、个人资料 |

角色守卫通过 `AuthGuard` 组件在每个 layout.tsx 中实现，无权限时自动跳转对应仪表盘，未登录跳转 `/login`。

## 主要功能模块

### 超级管理员
- **仪表盘**：平台总览统计卡片 + 月度趋势折线图
- **用户管理**：用户 CRUD、搜索、分页、角色分配
- **医院管理**：医院 CRUD、搜索、状态管理
- **心理咨询师管理**：咨询师 CRUD、状态启停、擅长领域/资质子管理
- **资质审核**：咨询师资料变更审核队列（通过/驳回）
- **领域/资质字典**：擅长领域与资质字典表 CRUD
- **内容管理**：文章（Markdown 编辑）、课程（第三方/自有）、书籍（评论管理）、测评（JSON 题库）
- **审核中心**：双 Tab 文章审核 + 投诉审核
- **平台收入**：收入统计、ECharts 趋势图 + 饼图、收入明细列表
- **系统管理**：名言、标签、反馈、投诉、梗词典

### 医院管理员
- 仪表盘、医生管理、科室管理、咨询反馈、投诉处理

### 医生
- 仪表盘、工作台、排班视图、患者档案

### 心理咨询师
- 工作台、7 日排班管理、预约处理（接受/拒绝/开始/完成）、在线聊天、收入统计、个人资料编辑 + 头像上传

## 页面路由

```
/                                    → 重定向到 /login
/login                               → 管理端登录页

/admin/dashboard                     → 超级管理员仪表盘
/admin/users                          → 用户管理
/admin/hospitals                      → 医院管理
/admin/psychologist                   → 心理咨询师管理
/admin/psychologist/audit             → 资料审核
/admin/psychologist-fields            → 擅长领域字典
/admin/psychologist-qualifications    → 资质字典
/admin/complaints                     → 投诉管理
/admin/consultation-income            → 咨询收入明细
/admin/meme                           → 梗管理
/admin/platform/income                → 平台收入统计
/admin/content/articles               → 文章列表
/admin/content/articles/new           → 新增文章
/admin/content/articles/[id]/edit     → 编辑文章
/admin/content/courses                → 课程列表
/admin/content/courses/new            → 新增课程
/admin/content/courses/[id]/edit      → 编辑课程
/admin/content/assessments            → 测评列表
/admin/content/assessments/new        → 新增测评
/admin/content/assessments/[id]/edit  → 编辑测评
/admin/content/books                  → 书籍列表
/admin/content/books/new              → 新增书籍
/admin/content/books/[id]/edit        → 编辑书籍
/admin/content/audit                  → 审核中心
/admin/system/quotes                  → 名言管理
/admin/system/tags                    → 标签管理
/admin/system/feedbacks               → 反馈管理

/hospital/dashboard                   → 医院仪表盘
/hospital/doctors                     → 医生管理
/hospital/departments                 → 科室管理
/hospital/feedbacks                   → 咨询反馈
/hospital/complaints                  → 投诉管理

/doctor/dashboard                     → 医生仪表盘
/doctor/workbench                     → 工作台
/doctor/schedule                      → 排班管理
/doctor/patients                      → 患者档案

/psychologist-admin/workbench         → 咨询师工作台
/psychologist-admin/schedule          → 排班管理
/psychologist-admin/appointments      → 预约管理
/psychologist-admin/income            → 收入统计
/psychologist-admin/chat              → 在线聊天
/psychologist-admin/profile           → 个人资料
```

## 启动命令

```bash
# 开发（端口 3101）
pnpm dev:admin-portal

# 或
cd apps/admin-portal && pnpm dev

# 类型检查
pnpm typecheck:admin-portal

# 构建
pnpm --filter @ai-adolescent-mental-health/admin-portal build

# Docker 构建
docker build -t admin-portal \
  --build-arg BACKEND_URL=http://backend:8080 \
  -f apps/admin-portal/Dockerfile .
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `BACKEND_URL` | 后端 API 地址（Next.js rewrites 代理目标） | `http://127.0.0.1:8080` |

## 目录结构

```
apps/admin-portal/
├── next.config.ts              # standalone 输出 + API rewrites
├── package.json
├── tsconfig.json
├── Dockerfile
├── AGENTS.md                   # AI 助手上手指南
└── src/
    ├── app/                    # Next.js App Router
    │   ├── layout.tsx          # 根布局（HTML shell + Toaster）
    │   ├── page.tsx            # 首页 → redirect("/login")
    │   ├── globals.css         # 全局样式 + @keyframes spin
    │   ├── (auth)/login/       # 登录页
    │   ├── admin/              # 超级管理员路由组 (role=4)
    │   │   ├── layout.tsx      # AuthGuard(4) + AdminLayout
    │   │   ├── dashboard/ users/ hospitals/
    │   │   ├── psychologist/ psychologist/audit/
    │   │   ├── psychologist-fields/ psychologist-qualifications/
    │   │   ├── complaints/ consultation-income/ meme/
    │   │   ├── platform/income/
    │   │   ├── content/  # articles, courses, assessments, books, audit
    │   │   └── system/   # quotes, tags, feedbacks
    │   ├── hospital/           # 医院管理员 (role=3)
    │   ├── doctor/             # 医生 (role=2)
    │   └── psychologist-admin/ # 咨询师 (isPsychologist=1)
    ├── components/admin/
    │   ├── AuthGuard.tsx       # Token + 角色校验
    │   ├── AdminLayout.tsx     # 侧边栏 + 顶栏 + 内容区外壳
    │   ├── AdminSidebar.tsx    # 角色菜单（深色侧边栏）
    │   ├── AdminHeader.tsx     # 用户信息 + 退出
    │   ├── LoginPage.tsx       # 登录表单
    │   ├── dashboard/          # 四个角色仪表盘
    │   ├── content/            # Article*, Course*, Assessment*, Book*, Audit*, Field*, Qualification*
    │   ├── system/             # Tag*, Quote*, Feedback*, Complaint*, Meme*, PlatformIncome*, ConsultationIncomeDetail*
    │   ├── users/              # UserList
    │   ├── hospitals/          # HospitalList
    │   ├── doctor/             # DoctorList, DepartmentList, HospitalComplaints, HospitalFeedbackManager
    │   ├── doctor-workbench/   # Workbench, PatientArchives, ScheduleManager
    │   ├── psychologist/       # PsychSchedule, PsychAppointments, PsychChat, PsychIncome, PsychProfile
    │   └── psychologist-admin/ # PsychologistAdmin, ProfileAudit
    └── lib/
        ├── session.ts          # localStorage 会话管理
        ├── api-admin.ts        # httpClient + adminApi.login
        ├── role-utils.ts       # 角色常量、菜单、仪表盘路由
        └── safe-redirect.ts    # 防开放重定向
```

## 开发规范

### API 代理

Next.js rewrites 将 `/api/*` 转发到后端，自动去除 `/api` 前缀：

```
前端调用: httpClient.get("/admin/users")
实际请求: GET {BACKEND_URL}/admin/users
```

`httpClient`（来自 `@ai-adolescent-mental-health/api-client`）自动处理：
- `Authorization: Bearer {token}` 请求头注入
- 401 时清除 session 并重定向 `/login`
- 解包后端 `{ code, message, data }` 信封，组件直接接收 `data`

### CRUD 组件模式

所有管理页面遵循统一的四态表格模式：

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/api-admin";

// Element Plus 设计令牌
const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", radius: "4px",
};

export function ResourceManager() {
  const [data, setData] = useState({ total: 0, records: [], current: 1, size: 20, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await httpClient.get("/admin/...", { query: { page, size: 20 } });
      setData(res);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "加载失败"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <table>
      <tbody>
        {loading && <tr><td>加载中...</td></tr>}
        {error && <tr><td>{error} <button onClick={() => fetchData()}>重试</button></td></tr>}
        {!loading && !error && data.records.length === 0 && <tr><td>暂无数据</td></tr>}
        {data.records.map(row => <tr key={row.id}>...</tr>)}
      </tbody>
    </table>
  );
}
```

### 关键约定

1. **HTTP 方法**：严格对照后端 `@GetMapping`→GET, `@PostMapping`→POST, `@PutMapping`→PUT, `@DeleteMapping`→DELETE
2. **认证隔离**：localStorage key 为 `aiamh.adminPortal.*`，与 web-client 独立
3. **路由守卫**：每个角色组的 `layout.tsx` 中通过 `AuthGuard` 实现
4. **表格状态**：必须覆盖 loading / error（含重试按钮） / empty / data 四种状态
5. **分页数据**：后端返回 `{ records, total, current, size, pages }`
6. **Toast 通知**：操作成功/失败使用 `toast.success()` / `toast.error()`
7. **Editor 模式**：编辑页通过 `useParams()` 取 id，区分新增/编辑模式
8. **取消导航**：使用 `router.push("/admin/...")` 而非 `router.back()`

### 角色与状态码

**角色定义**：1=普通用户, 2=医生, 3=医院管理员, 4=超级管理员

**咨询师**通过 `isPsychologist` 标志识别，无独立 role 值。

**预约状态**：0=待确认, 1=已确认, 2=已拒绝, 3=进行中, 4=已完成, 5=已取消, 6=未到诊, 7=待开始, 8=已评价

**投诉状态**：0=待处理, 1=已处理, 2=已驳回

## 注意事项

1. **不要修改 `pnpm-lock.yaml`**，除非明确需要更新依赖
2. **不要跨 app 复制源文件**，各端独立演进
3. **后端接口未实现的功能**不要在前端提前开发
4. 本项目的 `httpClient` 自动解包 `{ code, message, data }` 信封，组件直接拿 `data`；与 web-admin（Vue 版）需手动检查 `res.code === 200` 不同
5. 心理咨询师会话列表受限于后端仅返回 `status=1 (已确认)` 的预约，进行中(status=3)和待开始(status=7)的会话暂不显示
6. 心理咨询师聊天模块暂无实时推送，需切换会话后手动刷新消息
7. Docker 构建使用 `standalone` 模式，依赖 `.next/standalone` 及 `public/`、`.next/static/` 三个目录
