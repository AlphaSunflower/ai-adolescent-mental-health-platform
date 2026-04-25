import type { UserRole } from "@ai-adolescent-mental-health/domain";

export type Permission =
  | "dashboard:view"
  | "ai:chat"
  | "appointment:book"
  | "assessment:take"
  | "content:view"
  | "care-plan:view"
  | "profile:manage";

export type IconKey =
  | "home"
  | "bot"
  | "calendar"
  | "clipboard"
  | "book"
  | "heart"
  | "bell"
  | "user"
  | "leaf";

export type RouteMeta = {
  path: string;
  label: string;
  subtitle?: string;
  icon: IconKey;
  permissions: Permission[];
  showInSidebar?: boolean;
  showInBottomTabs?: boolean;
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  teen: ["dashboard:view", "ai:chat", "appointment:book", "assessment:take", "content:view", "care-plan:view", "profile:manage"],
  parent: ["dashboard:view", "appointment:book", "assessment:take", "content:view", "care-plan:view", "profile:manage"],
  psychologist: ["dashboard:view", "content:view", "profile:manage"],
  admin: ["dashboard:view", "ai:chat", "appointment:book", "assessment:take", "content:view", "care-plan:view", "profile:manage"],
};

export const ROUTE_META: RouteMeta[] = [
  {
    path: "/",
    label: "首页",
    subtitle: "今日陪伴",
    icon: "home",
    permissions: ["dashboard:view"],
    showInSidebar: true,
    showInBottomTabs: true,
  },
  {
    path: "/ai",
    label: "AI 咨询室",
    subtitle: "24 小时陪伴对话",
    icon: "bot",
    permissions: ["ai:chat"],
    showInSidebar: true,
    showInBottomTabs: true,
  },
  {
    path: "/consultation",
    label: "心理咨询预约",
    subtitle: "连接专业咨询师",
    icon: "calendar",
    permissions: ["appointment:book"],
    showInSidebar: true,
    showInBottomTabs: true,
  },
  {
    path: "/assessment",
    label: "心理评估",
    subtitle: "了解当下状态",
    icon: "clipboard",
    permissions: ["assessment:take"],
    showInSidebar: true,
    showInBottomTabs: true,
  },
  {
    path: "/library",
    label: "内容馆",
    subtitle: "文章、课程、练习",
    icon: "book",
    permissions: ["content:view"],
    showInSidebar: true,
    showInBottomTabs: true,
  },
  {
    path: "/me",
    label: "照护计划",
    subtitle: "我的成长计划",
    icon: "heart",
    permissions: ["care-plan:view", "profile:manage"],
    showInSidebar: true,
    showInBottomTabs: false,
  },
];

export const USER_NAV_ITEMS = ROUTE_META.filter((item) => item.showInSidebar);
export const USER_BOTTOM_TABS = ROUTE_META.filter((item) => item.showInBottomTabs);

export function canAccessRoute(role: UserRole, path: string) {
  const route = ROUTE_META.find((item) => item.path === path);
  if (!route) return false;
  const allowed = ROLE_PERMISSIONS[role] ?? [];
  return route.permissions.every((permission) => allowed.includes(permission));
}
