"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Bot, ChevronRight, Heart, Leaf, Send, X } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import type { Appointment, CarePlanStatus, LibraryItem } from "@ai-adolescent-mental-health/domain";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "xyl-card-shadow bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent text-muted-foreground hover:bg-secondary hover:text-primary",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "min-h-0 rounded-none px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        xs: "h-7 min-h-7 px-2 text-xs",
        sm: "h-9 min-h-9 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-11 p-0",
        "icon-sm": "size-9 min-h-9 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

const badgeVariants = cva("inline-flex h-6 w-fit items-center rounded-full px-2.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-primary",
      destructive: "bg-destructive/10 text-destructive",
      outline: "border border-border bg-card text-muted-foreground",
      ghost: "text-muted-foreground",
      warning: "xyl-badge-warning",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-full border border-input bg-background px-4 text-sm text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border border-input bg-background px-4 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full bg-secondary", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex size-full items-center justify-center font-semibold text-primary", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("xyl-card-shadow rounded-lg bg-card text-card-foreground transition-shadow", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-base font-semibold leading-snug text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-1 text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-5 pt-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-border px-6 py-4", className)} {...props} />;
}

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn("h-px w-full bg-border", className)} {...props} />;
}

export function Progress({ value = 0, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={normalized}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-border", className)}
      {...props}
    >
      <div
        className="xyl-progress-fill h-full rounded-full transition-[width] duration-[600ms] ease-out"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-border", className)} {...props}>
      <div className="absolute inset-y-0 left-0 w-1/2 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent [animation:xyl-shimmer_1.4s_infinite]" />
    </div>
  );
}

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{ classNames: { toast: "border-border bg-card text-foreground" } }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-lg)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

type OverlayContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<OverlayContextValue | null>(null);

export function Dialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children, render }: { children?: React.ReactNode; render?: React.ReactElement }) {
  const context = React.useContext(DialogContext);
  const onClick = () => context?.setOpen(true);
  if (render && React.isValidElement(render)) {
    const renderProps = render.props as { children?: React.ReactNode };
    return React.cloneElement(render as React.ReactElement<{ onClick?: React.MouseEventHandler; children?: React.ReactNode }>, {
      onClick,
      children: renderProps.children ?? children,
    });
  }
  return <button onClick={onClick}>{children}</button>;
}

export function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/10 p-4 backdrop-blur-sm">
      <div className={cn("xyl-dropdown-shadow relative w-full max-w-md rounded-lg bg-card p-5", className)}>
        <Button className="absolute right-3 top-3" variant="ghost" size="icon-sm" onClick={() => context.setOpen(false)} aria-label="关闭">
          <X />
        </Button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2 pr-10", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

export function DialogClose({ children }: { children?: React.ReactNode }) {
  const context = React.useContext(DialogContext);
  return <button onClick={() => context?.setOpen(false)}>{children}</button>;
}

export const DialogFooter = CardFooter;
export const DialogOverlay = () => null;
export const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SheetContext = React.createContext<OverlayContextValue | null>(null);

export function Sheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children, render }: { children?: React.ReactNode; render?: React.ReactElement }) {
  const context = React.useContext(SheetContext);
  const onClick = () => context?.setOpen(true);
  if (render && React.isValidElement(render)) {
    const renderProps = render.props as { children?: React.ReactNode };
    return React.cloneElement(render as React.ReactElement<{ onClick?: React.MouseEventHandler; children?: React.ReactNode }>, {
      onClick,
      children: renderProps.children ?? children,
    });
  }
  return <button onClick={onClick}>{children}</button>;
}

export function SheetContent({
  className,
  children,
  side = "left",
}: React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" | "top" | "bottom" }) {
  const context = React.useContext(SheetContext);
  if (!context?.open) return null;
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm" onClick={() => context.setOpen(false)}>
      <div
        data-side={side}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "xyl-dropdown-shadow fixed inset-y-0 flex h-dvh w-80 max-w-[85vw] flex-col gap-4 bg-card data-[side=left]:left-0 data-[side=right]:right-0",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <Button className="absolute right-3 top-3" variant="ghost" size="icon-sm" onClick={() => context.setOpen(false)} aria-label="关闭">
          <X />
        </Button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pr-12", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />;
}

export const SheetFooter = CardFooter;
export const SheetClose = DialogClose;

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({ defaultValue, value, onValueChange, children, className }: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const current = value ?? internal;
  const setValue = (next: string) => {
    setInternal(next);
    onValueChange?.(next);
  };
  return <TabsContext.Provider value={{ value: current, setValue }}><div className={cn("flex flex-col gap-4", className)}>{children}</div></TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={cn("inline-flex w-fit rounded-full bg-secondary p-1", className)} {...props} />;
}

export function TabsTrigger({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  const active = context?.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => context?.setValue(value)}
      className={cn("h-9 rounded-full px-4 text-sm text-muted-foreground transition-colors", active && "bg-card text-primary shadow-sm", className)}
      {...props}
    />
  );
}

export function TabsContent({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return <div role="tabpanel" className={cn("outline-none", className)} {...props} />;
}

export type ShellNavItem = {
  href: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  active?: boolean;
};

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative block size-11 text-primary" aria-hidden="true">
        <Heart className="absolute left-0 top-1 size-8 fill-primary/80 stroke-primary" />
        <Heart className="absolute right-0 top-1 size-8 fill-primary/55 stroke-primary" />
        <span className="absolute bottom-1 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full bg-primary" />
      </span>
      <span className="flex flex-col">
        <span className="text-xl font-semibold leading-tight text-foreground">心语伴行</span>
        <span className="text-sm leading-tight text-muted-foreground">青少年心理健康 AI 平台</span>
      </span>
    </div>
  );
}

export function TopBar({
  search,
  notification,
  user,
  mobileMenu,
}: {
  search?: React.ReactNode;
  notification?: React.ReactNode;
  user?: React.ReactNode;
  mobileMenu?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 h-20 border-b border-border bg-card">
      <div className="flex h-full items-center gap-4 px-4 lg:px-14">
        <div className="flex items-center gap-3 lg:hidden">{mobileMenu}</div>
        <div className="ml-auto flex items-center gap-3">
          {search}
          {notification}
          {user}
        </div>
      </div>
    </header>
  );
}

export function Sidebar({
  items,
  footer,
  compact = false,
}: {
  items: ShellNavItem[];
  footer?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <aside
      className={cn(
        "xyl-sidebar-shadow fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-sidebar lg:flex",
        compact ? "w-16 px-2 py-4" : "w-[220px] px-3 py-4",
      )}
    >
      <div className={cn("mb-6", compact && "grid place-items-center overflow-hidden")}>{compact ? <Leaf className="text-primary" /> : <BrandMark />}</div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-primary",
              item.active && "bg-sidebar-accent font-semibold text-primary",
              compact && "justify-center px-0",
            )}
          >
            {item.active && !compact && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />}
            <span className="grid size-5 place-items-center">{item.icon}</span>
            {!compact && <span className="truncate">{item.label}</span>}
          </a>
        ))}
      </nav>
      {!compact && <div className="mt-auto">{footer}</div>}
    </aside>
  );
}

export function ShortcutCard({
  title,
  description,
  icon,
  iconClassName,
  className,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconClassName?: string;
  className?: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "xyl-card-shadow group flex min-h-[104px] min-w-0 items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/70",
        className,
      )}
    >
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-md bg-secondary text-primary", iconClassName)}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block whitespace-nowrap text-[15px] font-semibold text-foreground">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </a>
  );
}

export function ContentCard({
  title,
  action,
  children,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-4 px-6 pt-5">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="h-5 w-[3px] rounded-full bg-primary" />
          {title}
        </div>
        {action}
      </div>
      <div className="px-6 pb-5 pt-4">{children}</div>
    </Card>
  );
}

export function ChatBubble({ children, role = "assistant" }: { children: React.ReactNode; role?: "assistant" | "user" }) {
  return (
    <div className={cn("flex items-start gap-3", role === "user" && "justify-end")}>
      {role === "assistant" && (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
          <Bot className="size-5" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[78%] px-4 py-3 text-sm leading-6",
          role === "assistant" ? "xyl-chat-assistant rounded-r-lg rounded-bl-lg text-foreground" : "rounded-l-lg rounded-br-lg bg-primary text-white",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AiChatInput({ placeholder = "有什么想和我聊的吗？", onSend }: { placeholder?: string; onSend?: (value: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <form
      className="relative w-full"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        onSend?.(value.trim());
        setValue("");
      }}
    >
      <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="h-11 w-full pr-14" />
      <Button className="absolute right-1.5 top-1.5 size-8 min-h-8" size="icon-sm" aria-label="发送" type="submit">
        <Send className="size-4" />
      </Button>
    </form>
  );
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="xyl-avatar-photo size-14 ring-0" aria-label={`${appointment.psychologistName} 咨询师`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{appointment.psychologistName} 咨询师</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{appointment.date} {appointment.time}</p>
        <p className="mt-1 text-xs text-muted-foreground">{appointment.type} · 50 分钟</p>
      </div>
      <Badge variant={appointment.status === "待确认" || appointment.status === "已预约" ? "warning" : "secondary"}>{appointment.status}</Badge>
    </div>
  );
}

export function RecommendationItem({
  item,
  colorClassName = "bg-secondary",
  saved = false,
}: {
  item: LibraryItem;
  colorClassName?: string;
  saved?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-14 w-20 shrink-0 rounded-md border border-border bg-secondary", colorClassName)} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-5">{item.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{item.type} · {item.readTime}</p>
      </div>
      <Heart className={cn("size-5 shrink-0 text-muted-foreground", saved && "fill-primary text-primary")} />
    </div>
  );
}

export function CarePlanItem({
  title,
  status,
  icon,
  tone = "green",
}: {
  title: string;
  status: CarePlanStatus;
  icon: React.ReactNode;
  tone?: "green" | "purple" | "yellow" | "coral";
}) {
  const tones = {
    green: "xyl-tone-green",
    purple: "xyl-tone-purple",
    yellow: "xyl-tone-yellow",
    coral: "xyl-tone-coral",
  };
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className={cn("grid size-12 place-items-center rounded-full", tones[tone])}>{icon}</div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        <span className={cn("inline-flex items-center gap-1 text-xs", status === "进行中" ? "text-primary" : "text-muted-foreground")}>
          <span className={cn("size-1.5 rounded-full", status === "进行中" ? "bg-primary" : "bg-muted-foreground")} />
          {status}
        </span>
      </div>
    </div>
  );
}

export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-border bg-card p-6 text-center">
      <div>
        <Leaf className="mx-auto size-10 text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{title}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
