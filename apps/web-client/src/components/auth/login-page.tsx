"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { safeRedirect } from "@/lib/safe-redirect";
import { PeekCharacters, W, H } from "./peek-characters";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeRedirect(searchParams.get("redirect"), "/me");

  const [tab, setTab] = useState("account");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  // Account login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Peek character state
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const onPasswordChange = (value: string) => {
    setPassword(value);
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const onPasswordFocus = () => setIsFocused(true);
  const onPasswordBlur = () => setIsFocused(false);

  // Email code login
  const [emailCode, setEmailCode] = useState("");
  const [emailForCode, setEmailForCode] = useState("");

  // Email password login
  const [emailPwd, setEmailPwd] = useState("");
  const [passwordEmail, setPasswordEmail] = useState("");

  const activePasswordLength =
    tab === "account" ? password.length : tab === "emailPwd" ? passwordEmail.length : 0;

  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCardHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const startCountdown = useCallback(() => {
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async () => {
    if (!emailForCode) { toast.warning("请先输入邮箱"); return; }
    try {
      await api.user.sendEmailCode(emailForCode);
      toast.success("验证码已发送");
      startCountdown();
    } catch {
      toast.error("发送失败，请重试");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (tab === "account") {
        if (!username || !password) { toast.warning("请填写账号和密码"); return; }
        result = await api.user.loginByUsernamePassword(username, password, rememberMe);
      } else if (tab === "emailCode") {
        if (!emailForCode || !emailCode) { toast.warning("请填写邮箱和验证码"); return; }
        result = await api.user.loginByEmailCode(emailForCode, emailCode);
      } else {
        if (!emailPwd || !passwordEmail) { toast.warning("请填写邮箱和密码"); return; }
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

  const MAX_SCALE = 1.35;
  const scale = cardHeight > 0 ? Math.min(cardHeight / H, MAX_SCALE) : 1;

  return (
    <div className="flex items-end justify-center px-4">
      {/* Peek characters — left side, bottom-aligned, all tabs */}
      {cardHeight > 0 && (
        <div
          className="hidden xl:flex flex-col justify-end shrink-0"
          style={{ width: Math.round(W * scale), height: cardHeight }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: "bottom left" }}>
            <PeekCharacters
              isTyping={isTyping}
              showPassword={showPwd}
              passwordLength={activePasswordLength}
              isFocused={isFocused}
            />
          </div>
        </div>
      )}

      {/* Vertical divider */}
      <div
        className="hidden xl:block w-px shrink-0 bg-white/15"
        style={{ height: cardHeight > 0 ? cardHeight : "auto", margin: "0 24px" }}
      />

      <div ref={cardRef} className="shrink-0">
        <Card className="w-full max-w-md animate-fadeIn">
        <CardHeader className="text-center">
          <CardTitle className="cosmic-gradient-text text-3xl font-bold">登录</CardTitle>
          <CardDescription>青少年心理健康 AI 平台</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="account">账号登录</TabsTrigger>
              <TabsTrigger value="emailCode">邮箱验证码</TabsTrigger>
              <TabsTrigger value="emailPwd">邮箱密码</TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin}>
              {/* Account Login */}
              <TabsContent value="account" className="space-y-4">
                <Input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    placeholder="密码"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    onFocus={onPasswordFocus}
                    onBlur={onPasswordBlur}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-cosmic-dim hover:text-cosmic-gold" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-cosmic-muted cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="accent-cosmic-blue" />
                    记住我
                  </label>
                  <Link href="/forgot-password" className="text-cosmic-sky hover:underline">忘记密码？</Link>
                </div>
              </TabsContent>

              {/* Email Code Login */}
              <TabsContent value="emailCode" className="space-y-4">
                <Input type="email" placeholder="邮箱" value={emailForCode} onChange={(e) => setEmailForCode(e.target.value)} />
                <div className="flex gap-3">
                  <Input placeholder="验证码" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} className="flex-1" />
                  <Button type="button" variant="outline" size="sm" disabled={codeCountdown > 0} onClick={handleSendCode}>
                    {codeCountdown > 0 ? `${codeCountdown}s` : "发送验证码"}
                  </Button>
                </div>
              </TabsContent>

              {/* Email Password Login */}
              <TabsContent value="emailPwd" className="space-y-4">
                <Input type="email" placeholder="邮箱" value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} />
                <Input
                  type="password"
                  placeholder="密码"
                  value={passwordEmail}
                  onChange={(e) => { setPasswordEmail(e.target.value); setIsTyping(true); if (typingTimerRef.current) clearTimeout(typingTimerRef.current); typingTimerRef.current = setTimeout(() => setIsTyping(false), 1000); }}
                  onFocus={onPasswordFocus}
                  onBlur={onPasswordBlur}
                />
              </TabsContent>

              <Button type="submit" variant="primary" className="mt-6 w-full" disabled={loading}>
                {loading ? "登录中..." : "登 录"}
              </Button>
            </form>
          </Tabs>

          <p className="mt-6 text-center text-sm text-cosmic-muted">
            还没有账号？
            <Link href="/register" className="ml-1 text-cosmic-sky hover:underline">立即注册</Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
