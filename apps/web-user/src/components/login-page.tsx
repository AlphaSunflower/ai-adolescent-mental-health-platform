"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  BrandMark,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-2">
          <Link href="/" aria-label="返回首页" className="min-w-0 overflow-hidden">
            <BrandMark />
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} aria-label="返回首页">
            <ArrowLeft data-icon="inline-start" />
            <span className="hidden sm:inline">返回首页</span>
          </Button>
        </header>

        <section className="flex flex-1 items-center justify-center py-8">
          <Card className="w-full max-w-md border border-border">
            <CardHeader>
              <Badge variant="secondary" className="mb-3">
                用户登录
              </Badge>
              <CardTitle className="text-2xl">登录心语伴行</CardTitle>
              <CardDescription>登录后同步咨询预约、AI 会话、测评记录和就诊人信息。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Tabs value={loginTab} onValueChange={(value) => setLoginTab(value as LoginTab)} className="gap-5">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger type="button" value="account">
                    账号登录
                  </TabsTrigger>
                  <TabsTrigger type="button" value="email">
                    邮箱登录
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium">
                      用户名
                      <Input
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="mt-2"
                        placeholder="请输入用户名"
                      />
                    </label>
                    <label className="text-sm font-medium">
                      密码
                      <Input
                        value={accountPassword}
                        onChange={(event) => setAccountPassword(event.target.value)}
                        className="mt-2"
                        type="password"
                        placeholder="请输入密码"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") submit();
                        }}
                      />
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="email">
                  <Tabs
                    value={emailLoginMode}
                    onValueChange={(value) => setEmailLoginMode(value as EmailLoginMode)}
                    className="gap-4"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger type="button" value="code">
                        验证码登录
                      </TabsTrigger>
                      <TabsTrigger type="button" value="password">
                        密码登录
                      </TabsTrigger>
                    </TabsList>
                    <label className="text-sm font-medium">
                      邮箱
                      <Input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-2"
                        placeholder="请输入邮箱地址"
                      />
                    </label>
                    <TabsContent value="code">
                      <label className="text-sm font-medium">
                        验证码
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={emailCode}
                            onChange={(event) => setEmailCode(event.target.value)}
                            className="min-w-0 flex-1"
                            placeholder="6位验证码"
                            maxLength={6}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") submit();
                            }}
                          />
                          <Button variant="outline" onClick={sendCode} disabled={isSendingCode || countdown > 0}>
                            {isSendingCode ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
                            {countdown > 0 ? `${countdown}秒` : "发送"}
                          </Button>
                        </div>
                      </label>
                    </TabsContent>
                    <TabsContent value="password">
                      <label className="text-sm font-medium">
                        密码
                        <Input
                          value={emailPassword}
                          onChange={(event) => setEmailPassword(event.target.value)}
                          className="mt-2"
                          type="password"
                          placeholder="请输入密码"
                          onKeyDown={(event) => {
                            if (event.key === "Enter") submit();
                          }}
                        />
                      </label>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>

              <label className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm">
                <span className="text-muted-foreground">30 天免登录</span>
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
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                返回首页
              </Link>
              <button type="button" className="hover:text-primary" onClick={() => toast.message("用户端暂未提供重置密码页面")}>
                忘记密码？
              </button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
