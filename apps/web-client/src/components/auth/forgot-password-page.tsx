"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Leaf, Mail, Send, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/pouf/Button";
import { AuthShell, Field, Input } from "./pouf-auth";
import { api } from "@/lib/api";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const startCountdown = () => {
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!username || !email) {
      toast.warning("请先填写用户名和邮箱");
      return;
    }
    try {
      await api.user.sendForgotPasswordCode(username, email);
      toast.success("验证码已发送");
      startCountdown();
    } catch {
      toast.error("发送失败，请检查用户名和邮箱是否匹配");
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      toast.warning("请填写用户名和邮箱");
      return;
    }
    if (!code) {
      toast.warning("请输入验证码");
      return;
    }
    setLoading(true);
    try {
      await api.user.verifyForgotPasswordCode(username, email, code);
      toast.success("验证通过，请设置新密码");
      setStep("reset");
    } catch {
      toast.error("验证失败，请检查验证码");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.warning("请填写新密码和确认密码");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("两次密码不一致");
      return;
    }
    setLoading(true);
    try {
      await api.user.resetPassword(username, email, code, newPassword, confirmPassword);
      toast.success("密码重置成功，请使用新密码登录");
      window.location.href = "/login";
    } catch {
      toast.error("重置失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-card bg-surface/75 p-7 sm:p-8 backdrop-blur-md cushion-card [animation:pouf-fade_360ms_ease]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-grid size-14 place-items-center rounded-full bg-mint tone-mint cushion-control">
            <Leaf className="size-6 text-ink" />
          </div>
          <h1 className="text-2xl font-black text-ink">忘记密码</h1>
          <p className="mt-2 text-sm font-bold text-muted">
            {step === "verify" ? "输入用户名和注册邮箱进行验证" : "设置新的登录密码"}
          </p>
        </div>

        {step === "verify" ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <Field label="用户名">
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="pl-11" placeholder="请输入用户名" autoComplete="username" />
              </div>
            </Field>
            <Field label="注册邮箱">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11" placeholder="请输入注册邮箱" autoComplete="email" />
              </div>
            </Field>
            <Field label="验证码" hint={codeCountdown > 0 ? `${codeCountdown}秒后重发` : undefined}>
              <div className="flex gap-2">
                <Input value={code} onChange={(e) => setCode(e.target.value)} className="min-w-0 flex-1" placeholder="请输入验证码" maxLength={6} inputMode="numeric" />
                <Button type="button" variant="quiet" tone="info" onClick={handleSendCode} disabled={codeCountdown > 0}>
                  {codeCountdown > 0 ? `${codeCountdown}秒` : <Send className="size-4" />}
                </Button>
              </div>
            </Field>
            <Button tone="mint" variant="solid" size="lg" block type="submit" loading={loading}>
              验证并下一步
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <Field label="新密码">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input type={showPwd ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-11 pr-11" placeholder="请输入新密码" autoComplete="new-password" />
                <button type="button" aria-label={showPwd ? "隐藏密码" : "显示密码"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink" onClick={() => setShowPwd((v) => !v)}>
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Field label="确认密码">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-11" placeholder="请再次输入新密码" autoComplete="new-password" />
              </div>
            </Field>
            <Button tone="mint" variant="solid" size="lg" block type="submit" loading={loading}>
              确认重置
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm font-bold text-muted">
          <Link href="/login" className="transition-colors hover:text-ink">
            返回登录
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
