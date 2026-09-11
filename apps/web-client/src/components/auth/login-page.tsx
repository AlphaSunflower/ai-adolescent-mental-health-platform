"use client";

import { useState, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Leaf, Mail, Send, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/pouf/Button";
import { AuthShell, Field, Input, Segmented } from "./pouf-auth";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { safeRedirect } from "@/lib/safe-redirect";

type LoginTab = "account" | "emailCode" | "emailPwd";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeRedirect(searchParams.get("redirect"), "/home");

  const [tab, setTab] = useState<LoginTab>("account");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [emailForCode, setEmailForCode] = useState("");
  const [emailCode, setEmailCode] = useState("");

  const [passwordEmail, setPasswordEmail] = useState("");
  const [emailPwd, setEmailPwd] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const startCountdown = useCallback(() => {
    setCodeCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async () => {
    if (!emailForCode) {
      toast.warning("请先输入邮箱");
      return;
    }
    try {
      await api.user.sendEmailCode(emailForCode, "login");
      toast.success("验证码已发送");
      startCountdown();
    } catch {
      toast.error("发送失败，请重试");
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (tab === "account") {
        if (!username || !password) {
          toast.warning("请填写账号和密码");
          return;
        }
        result = await api.user.loginByUsernamePassword(username, password, rememberMe);
      } else if (tab === "emailCode") {
        if (!emailForCode || !emailCode) {
          toast.warning("请填写邮箱和验证码");
          return;
        }
        result = await api.user.loginByEmailCode(emailForCode, emailCode);
      } else {
        if (!emailPwd || !passwordEmail) {
          toast.warning("请填写邮箱和密码");
          return;
        }
        result = await api.user.loginByEmailPassword(emailPwd, passwordEmail, rememberMe);
      }
      saveSession(result.token, result.user);
      toast.success("登录成功");
      router.push(nextPath);
    } catch {
      toast.error("登录失败，请检查账号信息");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-lg rounded-card bg-surface/75 p-7 sm:p-8 backdrop-blur-md cushion-card [animation:pouf-fade_360ms_ease]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-grid size-14 place-items-center rounded-full bg-mint tone-mint cushion-control">
            <Leaf className="size-6 text-ink" />
          </div>
          <h1 className="text-2xl font-black text-ink">登录心愈智联</h1>
          <p className="mt-2 text-sm font-bold text-muted">青少年心理健康 AI 平台</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "account", label: "账号登录" },
              { value: "emailCode", label: "邮箱验证码" },
              { value: "emailPwd", label: "邮箱密码" },
            ]}
          />

          {tab === "account" ? (
            <div className="flex flex-col gap-4">
              <Field label="用户名">
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} className="pl-11" placeholder="请输入用户名" autoComplete="username" />
                </div>
              </Field>
              <Field label="密码">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 pr-11" placeholder="请输入密码" autoComplete="current-password" />
                  <button type="button" aria-label={showPwd ? "隐藏密码" : "显示密码"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink" onClick={() => setShowPwd((v) => !v)}>
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
            </div>
          ) : tab === "emailCode" ? (
            <div className="flex flex-col gap-4">
              <Field label="邮箱">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input type="email" value={emailForCode} onChange={(e) => setEmailForCode(e.target.value)} className="pl-11" placeholder="请输入邮箱地址" autoComplete="email" />
                </div>
              </Field>
              <Field label="验证码" hint={codeCountdown > 0 ? `${codeCountdown}秒后重发` : undefined}>
                <div className="flex gap-2">
                  <Input value={emailCode} onChange={(e) => setEmailCode(e.target.value)} className="min-w-0 flex-1" placeholder="6位验证码" maxLength={6} inputMode="numeric" />
                  <Button type="button" variant="quiet" tone="info" onClick={handleSendCode} disabled={codeCountdown > 0}>
                    {codeCountdown > 0 ? `${codeCountdown}秒` : <Send className="size-4" />}
                  </Button>
                </div>
              </Field>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Field label="邮箱">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input type="email" value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} className="pl-11" placeholder="请输入邮箱地址" autoComplete="email" />
                </div>
              </Field>
              <Field label="密码">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input type={showPwd ? "text" : "password"} value={passwordEmail} onChange={(e) => setPasswordEmail(e.target.value)} className="pl-11 pr-11" placeholder="请输入密码" autoComplete="current-password" />
                  <button type="button" aria-label={showPwd ? "隐藏密码" : "显示密码"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink" onClick={() => setShowPwd((v) => !v)}>
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
            </div>
          )}

          {tab === "account" || tab === "emailPwd" ? (
            <label className="flex items-center justify-between gap-3 rounded-control bg-bg px-4 py-3 text-sm">
              <span className="font-bold text-ink">记住我</span>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="size-5 accent-mint" />
            </label>
          ) : null}

          <Button tone="mint" variant="solid" size="lg" block type="submit" loading={loading}>
            登录
          </Button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm font-bold text-muted">
          <p>
            还没有账号？
            <Link href="/register" className="ml-1 transition-colors hover:text-ink">
              立即注册
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="transition-colors hover:text-ink">
              忘记密码？
            </Link>
          </p>
          <p className="text-xs font-bold text-muted">
            登录即代表您已阅读并同意
            <Link href="/legal?tab=terms" className="ml-1 transition-colors hover:text-ink">
              《心愈智联用户服务协议》
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
