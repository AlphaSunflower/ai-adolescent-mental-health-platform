# AGENTS.md — `apps/admin-portal`

> 面向 AI 编码助手的 admin-portal 工作区速查。动手前请同时参阅根 [AGENTS.md](../../AGENTS.md)。

## 一、工作区基本事实

- 包名：`@ai-adolescent-mental-health/admin-portal`
- 技术栈：Next.js 16 + React 19 + TypeScript + Element Plus 2.13 + ECharts
- 设计风格：Element Plus 设计令牌（`s = { primary: "#409eff", ... }`）通过内联样式应用，不使用 Element Plus 组件库
- 默认端口：`3001`（next.config.ts）
- 路由：App Router

## 二、目录结构

```
src/
├── app/                      # Next.js App Router 路由
│   ├── (auth)/login/         # 管理端登录页
│   ├── admin/                # 超级管理员 (role=4)
│   │   ├── layout.tsx        # AuthGuard + AdminLayout
│   │   ├── dashboard/        # 超级管理员仪表盘
│   │   ├── content/          # 内容管理 (articles, assessments, books, courses, audit)
│   │   ├── system/           # 系统管理 (quotes, tags, feedbacks)
│   │   ├── hospitals/        # 医院管理
│   │   ├── users/            # 用户管理
│   │   ├── psychologist/     # 咨询师审核
│   │   └── ...
│   ├── hospital/             # 医院管理员 (role=3)
│   ├── doctor/               # 医生 (role=2)
│   └── psychologist-admin/   # 心理咨询师 (isPsychologist=1)
├── components/admin/
│   ├── AuthGuard.tsx         # Token + 角色校验
│   ├── AdminLayout.tsx       # 主布局 (sidebar + header + content)
│   ├── AdminSidebar.tsx      # 深色侧边栏 (#304156 bg)
│   ├── AdminHeader.tsx       # 顶栏（用户头像 + 下拉菜单）
│   ├── LoginPage.tsx         # Element Plus 风格登录页
│   ├── dashboard/            # 各角色仪表盘组件
│   ├── content/              # 内容 CRUD 组件 (Article, Assessment, Book, Course)
│   ├── system/               # 系统 CRUD 组件 (Quote, Tag, Feedback, Complaint, Meme)
│   ├── hospitals/            # HospitalList
│   ├── users/                # UserList
│   ├── doctor/               # DoctorList, DepartmentList, 医生诊室 CRUD
│   ├── doctor-workbench/     # 医生工作台
│   └── psychologist/         # 咨询师管理组件
└── lib/
    ├── session.ts            # localStorage 认证 (key: aiamh.adminPortal.token/user)
    ├── api-admin.ts          # HTTP 客户端 (httpClient.get/.post/.put/.delete)
    ├── role-utils.ts         # 角色常量、菜单配置、getMenuByRole()
    └── safe-redirect.ts      # 防开放重定向
```

## 三、CRUD 组件模式

所有管理端页面均为 `"use client"`，使用以下统一模式：

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { httpClient } from "@/lib/api-admin";

const s = {
  primary: "#409eff", text: "#303133", text2: "#606266", text3: "#909399",
  border: "#dcdfe6", bg: "#f0f2f5", white: "#fff", danger: "#f56c6c",
  success: "#67c23a", radius: "4px", shadow: "0 2px 12px rgba(0,0,0,0.06)",
};

type PageResult<T> = { total: number; records: T[]; current: number; size: number; pages: number };

export function ResourceManager() {
  const router = useRouter();
  const [data, setData] = useState<PageResult<Record<string,unknown>>>({ total:0, records:[], current:1, size:20, pages:0 });
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async (page = 1) => {
    try {
      const res = await httpClient.get<PageResult<Record<string,unknown>>>("/admin/resource", { query: { page, size: 20, keyword: search } });
      setData(res);
    } catch { /* ignore */ }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 搜索条 + 新增按钮 + 表格 + 分页器
  // 表格每行的"编辑"→ router.push(`/admin/resource/${row.id}/edit`)
  // 表格每行的"删除"→ confirm → httpClient.delete → refresh
}
```

Editor 组件模式（`useParams().id` 判断新建/编辑）：

```typescript
const params = useParams();
const id = params?.id as string | undefined;
const isEdit = !!id;
// 保存: isEdit ? httpClient.put(...) : httpClient.post(...)
// 取消: router.back()
```

## 四、关键约定

1. **API 客户端**：`httpClient.get()`, `.post()`, `.put()`, `.delete()`（没有 `.del()`）
2. **类型模式**：`PageResult<T>` 用于分页列表，表单状态 `Record<string,unknown>` 或具体接口
3. **认证隔离**：localStorage key 为 `aiamh.adminPortal.*`，与 web-client 的 `aiamh.*` 独立
4. **路由分组**：每个角色的 `layout.tsx` = AuthGuard + AdminLayout，无需 Next.js middleware
5. **Element Plus 设计令牌**：所有颜色通过 `s` 对象引用，不直接使用 Element Plus 组件
6. **新增/编辑路由**：统一使用 `/new` 和 `/[id]/edit` 模式（非 `/create`）
