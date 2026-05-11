"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!username || !email) { toast.warning("请先填写用户名和邮箱"); return; }
    try {
      await api.user.sendForgotPasswordCode(username, email);
      toast.success("验证码已发送");
      startCountdown();
    } catch {
      toast.error("发送失败，请检查用户名和邮箱是否匹配");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) { toast.warning("请填写用户名和邮箱"); return; }
    if (!code) { toast.warning("请输入验证码"); return; }
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) { toast.warning("请填写新密码和确认密码"); return; }
    if (newPassword !== confirmPassword) { toast.warning("两次密码不一致"); return; }
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
    <Card className="w-full max-w-md animate-fadeIn">
      <CardHeader className="text-center">
        <CardTitle className="cosmic-gradient-text text-3xl font-bold">忘记密码</CardTitle>
        <CardDescription>
          {step === "verify"
            ? "输入用户名和注册邮箱进行验证"
            : "设置新的登录密码"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "verify" ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="email"
              placeholder="注册邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-3">
              <Input
                placeholder="验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={codeCountdown > 0}
                onClick={handleSendCode}
                className="shrink-0"
              >
                {codeCountdown > 0 ? `${codeCountdown}s` : "获取验证码"}
              </Button>
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "验证中..." : "验证并下一步"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-dim hover:text-cosmic-gold"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Input
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "重置中..." : "确认重置"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-cosmic-muted">
          <Link href="/login" className="text-cosmic-sky hover:underline">返回登录</Link>
        </p>
      </CardContent>
    </Card>
  );
}
