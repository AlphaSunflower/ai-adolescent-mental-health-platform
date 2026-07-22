"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z\d]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;

  if (score <= 1) return { score: 25, label: "弱", color: "bg-red-500" };
  if (score <= 3) return { score: 60, label: "中", color: "bg-orange-500" };
  return { score: 100, label: "强", color: "bg-green-500" };
}

export function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const pwdStrength = getPasswordStrength(password);

  const handleSendCode = async () => {
    if (!email) { toast.warning("请先输入邮箱"); return; }
    try {
      await api.user.sendEmailCode(email, "register");
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !email || !code) { toast.warning("请填写必填项"); return; }
    if (!agreed) { toast.warning("请阅读并同意隐私政策"); return; }
    setLoading(true);
    try {
      await api.user.registerWithEmail({ username, password, email, code, ...(phone ? { phone } : {}) });
      toast.success("注册成功，请登录");
      router.push("/login");
    } catch {
      toast.error("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fadeIn">
      <CardHeader className="text-center">
        <CardTitle className="cosmic-gradient-text text-3xl font-bold">注册</CardTitle>
        <CardDescription>加入心愈智联，开启心理健康之旅</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Input placeholder="用户名 *" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} />
            <span className="mt-1 text-right text-xs text-cosmic-dim block">{username.length}/20</span>
          </div>

          <div>
            <div className="relative">
              <Input type={showPwd ? "text" : "password"} placeholder="密码 *" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-dim hover:text-cosmic-gold" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                <Progress value={pwdStrength.score} className="h-1.5" />
                <span className="text-xs text-cosmic-muted">密码强度：{pwdStrength.label}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Input type="email" placeholder="邮箱 *" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
            <Button type="button" variant="outline" size="sm" disabled={codeCountdown > 0} onClick={handleSendCode} className="shrink-0">
              {codeCountdown > 0 ? `${codeCountdown}s` : "发送验证码"}
            </Button>
          </div>

          <Input placeholder="验证码 *" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input placeholder="手机号（选填）" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label className="flex items-center gap-2 text-sm text-cosmic-muted cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-cosmic-blue" />
            我已阅读并同意
            <span className="text-cosmic-sky cursor-pointer hover:underline">《隐私政策》</span>
          </label>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "注册中..." : "注 册"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-cosmic-muted">
          已有账号？
          <Link href="/login" className="ml-1 text-cosmic-sky hover:underline">立即登录</Link>
        </p>
      </CardContent>
    </Card>
  );
}
