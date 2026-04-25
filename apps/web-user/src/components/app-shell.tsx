"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Bot,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  Heart,
  Home,
  Leaf,
  Menu,
  NotebookTabs,
  Search,
  UserRound,
} from "lucide-react";
import { USER_BOTTOM_TABS, USER_NAV_ITEMS, type IconKey } from "@ai-adolescent-mental-health/config";
import {
  BrandMark,
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  TopBar,
  cn,
} from "@ai-adolescent-mental-health/ui";

const iconMap: Record<IconKey, React.ComponentType<{ className?: string }>> = {
  home: Home,
  bot: Bot,
  calendar: CalendarCheck,
  clipboard: ClipboardCheck,
  book: BookOpen,
  heart: NotebookTabs,
  bell: Bell,
  user: UserRound,
  leaf: Leaf,
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLinks({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {USER_NAV_ITEMS.map((item) => {
        const Icon = iconMap[item.icon];
        const active = isActive(pathname, item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onNavigate}
            title={item.label}
            className={cn(
              "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-primary",
              active && "bg-sidebar-accent font-semibold text-primary",
              compact && "justify-center px-0",
            )}
          >
            {active && !compact && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />}
            <Icon className="size-5" />
            {!compact && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

const secondaryNavItems = [
  { href: "/me", label: "我的记录", icon: NotebookTabs },
  { href: "/library", label: "我的收藏", icon: BookOpen },
  { href: "/me", label: "消息中心", icon: Bell, dot: true },
  { href: "/assessment", label: "成长空间", icon: UserRound },
];

function SecondaryNavLinks() {
  return (
    <nav className="flex flex-col gap-1 border-t border-border pt-4">
      {secondaryNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className="relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-primary"
          >
            <Icon className="size-5" />
            <span>{item.label}</span>
            {item.dot && <span className="ml-auto size-2 rounded-full bg-destructive" />}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon-sm" aria-label="打开导航" />}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>心愈智联</SheetTitle>
          <SheetDescription>选择今天想进入的空间</SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <NavLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SearchBox() {
  return (
    <div className="relative hidden w-80 md:block">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="h-11 rounded-md pl-10 text-sm" placeholder="搜索文章、课程、练习等" />
    </div>
  );
}

function MotivationCard() {
  return (
    <div className="xyl-sidebar-motivation relative min-h-40 overflow-hidden rounded-lg p-5">
      <p className="text-sm font-semibold text-foreground">今天也要照顾好自己</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">记得给自己一点鼓励哦</p>
      <Button className="mt-4 h-9 min-h-9 bg-card px-4 text-xs text-primary hover:bg-card/80" variant="secondary">
        记录心情
      </Button>
      <Leaf className="absolute bottom-4 right-5 size-14 text-primary/45" />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="xyl-sidebar-shadow fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col border-r border-border bg-sidebar px-2 py-5 lg:flex xl:hidden">
        <Link href="/" className="mb-6 grid h-9 place-items-center text-primary" aria-label="心愈智联首页">
          <Heart className="size-6 fill-primary/20" />
        </Link>
        <NavLinks compact />
      </aside>

      <aside className="xyl-sidebar-shadow fixed inset-y-0 left-0 z-40 hidden w-[272px] flex-col border-r border-border bg-sidebar px-5 py-7 xl:flex">
        <Link href="/" className="mb-9 block">
          <BrandMark />
        </Link>
        <NavLinks />
        <div className="mt-5">
          <SecondaryNavLinks />
        </div>
        <div className="mt-auto">
          <MotivationCard />
        </div>
      </aside>

      <div className="lg:pl-[72px] xl:pl-[272px]">
        <TopBar
          mobileMenu={<MobileMenu />}
          search={<SearchBox />}
          notification={
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="消息中心">
              <Bell />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
            </Button>
          }
          user={
            <div className="hidden items-center gap-2 lg:flex">
              <span className="xyl-avatar-photo relative grid size-11 place-items-center rounded-full">
                <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-primary" />
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
          }
        />

        <nav className="sticky top-20 z-20 hidden border-b border-border bg-card px-4 py-2 md:flex lg:hidden">
          <div className="flex w-full gap-2 overflow-x-auto">
            {USER_NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon];
              const active = isActive(pathname, item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground",
                    active && "bg-secondary font-semibold text-primary",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="pb-24 md:pb-0">
          <div className="mx-auto w-full max-w-[1340px] px-4 py-6 lg:px-14 lg:py-8">{children}</div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid w-screen border-t border-border bg-card/95 px-2 py-2 backdrop-blur md:hidden"
        style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
      >
        {USER_BOTTOM_TABS.map((item) => {
          const Icon = iconMap[item.icon];
          const active = isActive(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn("flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[11px] text-muted-foreground", active && "bg-secondary text-primary")}
            >
              <Icon className="size-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
