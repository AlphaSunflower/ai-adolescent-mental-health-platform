"use client";

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
  Menu,
  NotebookTabs,
  Search,
  Sprout,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/ai", label: "AI 咨询室", icon: Bot },
  { href: "/consultation", label: "心理咨询预约", icon: CalendarCheck },
  { href: "/assessment", label: "心理评估", icon: ClipboardCheck },
  { href: "/library", label: "内容馆", icon: BookOpen },
  { href: "/me", label: "我的照护计划", icon: NotebookTabs },
];

const secondaryNavItems = [
  { href: "/me", label: "我的记录", icon: NotebookTabs },
  { href: "/library", label: "我的收藏", icon: BookOpen },
  { href: "/me", label: "消息中心", icon: Bell },
  { href: "/assessment", label: "成长空间", icon: UserRound },
];

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="relative grid size-11 place-items-center rounded-lg text-primary">
        <Heart className="fill-primary/20" />
        <span className="absolute bottom-1 right-1 size-3 rounded-full bg-primary/80" />
      </span>
      <span className="flex flex-col">
        <span className="text-xl font-semibold leading-tight">心语伴行</span>
        <span className="text-sm text-muted-foreground">青少年心理健康 AI 平台</span>
      </span>
    </Link>
  );
}

function NavLinks({
  items = navItems,
  onNavigate,
  muted = false,
}: {
  items?: typeof navItems;
  onNavigate?: () => void;
  muted?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex h-12 items-center gap-4 rounded-lg px-4 text-base font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-primary",
              muted && "h-11 text-muted-foreground",
            )}
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r bg-sidebar px-5 py-6 lg:flex">
        <BrandMark />
        <div className="mt-8">
          <NavLinks />
        </div>
        <div className="mt-5 border-t pt-5">
          <NavLinks items={secondaryNavItems} muted />
        </div>
        <div className="relative mt-auto overflow-hidden rounded-lg bg-muted p-5">
          <p className="text-sm font-semibold">今天也要照顾好自己</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">记得给自己一点鼓励哦</p>
          <Button className="mt-4 bg-card text-primary hover:bg-card/80" variant="secondary">
            记录心情
          </Button>
          <Sprout className="absolute bottom-3 right-5 text-primary/55" />
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur lg:ml-72">
        <div className="flex h-20 items-center gap-3 px-4 lg:px-14">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" />}>
              <Menu />
              <span className="sr-only">打开导航</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>心愈智联</SheetTitle>
                <SheetDescription>选择用户端功能模块</SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex w-full max-w-sm items-center gap-2 rounded-lg border bg-card px-3">
            <Search className="text-muted-foreground" />
            <Input
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              placeholder="搜索文章、课程、练习等"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative hidden lg:inline-flex">
            <Bell />
            <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-white">
              3
            </span>
          </Button>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="grid size-11 place-items-center rounded-full bg-secondary font-semibold text-primary">林</span>
            <ChevronDown className="text-muted-foreground" />
          </div>
        </div>
      </header>

      <main className="pb-24 lg:ml-72 lg:pb-0">
        <div className="w-full px-4 py-6 lg:px-14 lg:py-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t bg-background/95 px-2 py-2 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-2 text-xs text-muted-foreground",
                active && "bg-accent text-accent-foreground",
              )}
            >
              <Icon />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
