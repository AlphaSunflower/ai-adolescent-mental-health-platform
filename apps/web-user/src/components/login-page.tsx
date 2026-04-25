"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@ai-adolescent-mental-health/ui";

import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/session";

type LoginTab = "account" | "email";
type EmailLoginMode = "code" | "password";

function resolveNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/me";
  return value;
}

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNextPath(searchParams.get("next"));
  const [loginTab, setLoginTab] = useState<LoginTab>("account");
  const [emailLoginMode, setEmailLoginMode] = useState<EmailLoginMode>("code");
  const [username, setUsername] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (getStoredUser()) router.replace(nextPath);
  }, [nextPath, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function sendCode() {
    if (!validateEmail(email)) {
      toast.warning("请输入正确的邮箱地址");
      return;
    }
    setIsSendingCode(true);
    try {
      await api.sendEmailCode(email, "login");
      setCountdown(60);
      toast.success("验证码已发送");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "验证码发送失败");
    } finally {
      setIsSendingCode(false);
    }
  }

  function submit() {
    startTransition(async () => {
      try {
        if (loginTab === "account") {
          if (!username.trim() || !accountPassword) {
            toast.warning("请输入用户名和密码");
            return;
          }
          await api.loginByUsernamePassword(username.trim(), accountPassword, rememberMe);
        } else if (emailLoginMode === "code") {
          if (!validateEmail(email) || !emailCode.trim()) {
            toast.warning("请输入邮箱和验证码");
            return;
          }
          await api.loginByEmailCode(email.trim(), emailCode.trim());
        } else {
          if (!validateEmail(email) || !emailPassword) {
            toast.warning("请输入邮箱和密码");
            return;
          }
          await api.loginByEmailPassword(email.trim(), emailPassword, rememberMe);
        }
        toast.success("登录成功");
        router.replace(nextPath);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "登录失败");
      }
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
        <section className="relative hidden overflow-hidden bg-sidebar px-12 py-10 lg:flex lg:flex-col">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="size-4" />
            返回首页
          </Link>
          <div className="flex flex-1 flex-col justify-center">
            <Badge variant="secondary" className="w-fit">
              心愈智联
            </Badge>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-tight">用一个真实账号，接续你的照护记录。</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              登录后同步咨询预约、AI 会话、测评记录和就诊人信息。账号登录与邮箱登录均连接后端真实接口。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["账号登录", "邮箱验证码", "30天免登录"].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-card/70 p-4 text-sm font-medium">
                <ShieldCheck className="mb-3 size-5 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">登录</CardTitle>
              <CardDescription>支持用户名密码、邮箱验证码和邮箱密码登录。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-2 rounded-full bg-secondary p-1">
                <Button variant={loginTab === "account" ? "default" : "ghost"} size="sm" onClick={() => setLoginTab("account")}>
                  账号登录
                </Button>
                <Button variant={loginTab === "email" ? "default" : "ghost"} size="sm" onClick={() => setLoginTab("email")}>
                  邮箱登录
                </Button>
              </div>

              {loginTab === "account" ? (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">
                    用户名
                    <div className="relative mt-2">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={username} onChange={(event) => setUsername(event.target.value)} className="pl-10" placeholder="请输入用户名" />
                    </div>
                  </label>
                  <label className="text-sm font-medium">
                    密码
                    <div className="relative mt-2">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={accountPassword}
                        onChange={(event) => setAccountPassword(event.target.value)}
                        className="pl-10"
                        type="password"
                        placeholder="请输入密码"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") submit();
                        }}
                      />
                    </div>
                  </label>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <button
                      type="button"
                      className={emailLoginMode === "code" ? "font-semibold text-primary" : "text-muted-foreground"}
                      onClick={() => setEmailLoginMode("code")}
                    >
                      验证码登录
                    </button>
                    <span className="text-muted-foreground">|</span>
                    <button
                      type="button"
                      className={emailLoginMode === "password" ? "font-semibold text-primary" : "text-muted-foreground"}
                      onClick={() => setEmailLoginMode("password")}
                    >
                      密码登录
                    </button>
                  </div>
                  <label className="text-sm font-medium">
                    邮箱
                    <div className="relative mt-2">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input value={email} onChange={(event) => setEmail(event.target.value)} className="pl-10" placeholder="请输入邮箱地址" />
                    </div>
                  </label>
                  {emailLoginMode === "code" ? (
                    <label className="text-sm font-medium">
                      验证码
                      <div className="mt-2 flex gap-2">
                        <div className="relative min-w-0 flex-1">
                          <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            value={emailCode}
                            onChange={(event) => setEmailCode(event.target.value)}
                            className="pl-10"
                            placeholder="6位验证码"
                            maxLength={6}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") submit();
                            }}
                          />
                        </div>
                        <Button variant="outline" onClick={sendCode} disabled={isSendingCode || countdown > 0}>
                          {isSendingCode ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                          {countdown > 0 ? `${countdown}秒` : "发送"}
                        </Button>
                      </div>
                    </label>
                  ) : (
                    <label className="text-sm font-medium">
                      密码
                      <div className="relative mt-2">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={emailPassword}
                          onChange={(event) => setEmailPassword(event.target.value)}
                          className="pl-10"
                          type="password"
                          placeholder="请输入密码"
                          onKeyDown={(event) => {
                            if (event.key === "Enter") submit();
                          }}
                        />
                      </div>
                    </label>
                  )}
                </div>
              )}

              <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary px-4 py-3 text-sm">
                <span className="text-muted-foreground">30天免登录</span>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="size-4"
                />
              </label>

              <Button size="lg" onClick={submit} disabled={isPending}>
                {isPending && <Loader2 data-icon="inline-start" className="animate-spin" />}
                登录
              </Button>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary lg:hidden">
                  返回首页
                </Link>
                <button type="button" className="ml-auto hover:text-primary" onClick={() => toast.message("用户端暂未提供重置密码页面")}>
                  忘记密码？
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
