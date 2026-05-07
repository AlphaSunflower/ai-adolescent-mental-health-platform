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
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!email) { toast.warning("请先输入邮箱"); return; }
    try {
      await api.user.sendEmailCode(email);
      toast.success("验证码已发送");
      setCodeCountdown(60);
      const timer = setInterval(() => {
        setCodeCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("发送失败");
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "email") {
      if (!email) { toast.warning("请输入邮箱"); return; }
      setStep("reset");
      return;
    }
    if (!code || !newPassword) { toast.warning("请填写验证码和新密码"); return; }
    setLoading(true);
    try {
      // Reuse the register endpoint or a dedicated reset endpoint
      await api.user.registerWithEmail({ username: email, password: newPassword, email, code });
      toast.success("密码重置成功，请登录");
      setStep("email");
    } catch {
      toast.error("重置失败，请检查验证码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fadeIn">
      <CardHeader className="text-center">
        <CardTitle className="cosmic-gradient-text text-3xl font-bold">忘记密码</CardTitle>
        <CardDescription>
          {step === "email" ? "输入注册邮箱，获取验证码" : "输入验证码，设置新密码"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyAndReset} className="space-y-4">
          {step === "email" ? (
            <div className="flex gap-3">
              <Input type="email" placeholder="注册邮箱" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
              <Button type="submit" variant="primary" size="sm">下一步</Button>
            </div>
          ) : (
            <>
              <Input type="email" value={email} disabled className="opacity-60" />
              <div className="flex gap-3">
                <Input placeholder="验证码" value={code} onChange={(e) => setCode(e.target.value)} className="flex-1" />
                <Button type="button" variant="outline" size="sm" disabled={codeCountdown > 0} onClick={handleSendCode} className="shrink-0">
                  {codeCountdown > 0 ? `${codeCountdown}s` : "重新发送"}
                </Button>
              </div>
              <div className="relative">
                <Input type={showPwd ? "text" : "password"} placeholder="新密码" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-dim hover:text-cosmic-gold" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "重置中..." : "重置密码"}
              </Button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-cosmic-muted">
          <Link href="/login" className="text-cosmic-sky hover:underline">返回登录</Link>
        </p>
      </CardContent>
    </Card>
  );
}
