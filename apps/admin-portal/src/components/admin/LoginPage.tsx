"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminApi } from "@/lib/api-admin";
import { saveSession } from "@/lib/session";
import { getRoleDashboardPath } from "@/lib/role-utils";
import { FilingFooter } from "./FilingFooter";
import { tokens } from "@/lib/design-tokens";

/* ---------- Inline SVG icons ---------- */
function EyeOpenIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.warning("请填写账号和密码");
      return;
    }
    setLoading(true);
    try {
      const result = await adminApi.login(username, password, rememberMe);
      saveSession(result.token, result.user);
      const user = result.user as Record<string, unknown>;
      const role = (user.role as number) ?? 1;
      const isPsychologist = (user.isPsychologist as number) === 1;
      toast.success("登录成功");
      router.push(getRoleDashboardPath(role, isPsychologist));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "登录失败，请检查账号信息";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: `linear-gradient(160deg, #1E3A3A 0%, #162E2E 40%, #1F2E2E 100%)`,
    }}>
      <main style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 16px 24px",
        boxSizing: "border-box",
      }}>
        {/* Card */}
        <div style={{
          width: "400px",
          padding: "36px 28px 28px",
          background: tokens.bgCard,
          borderRadius: tokens.radiusXl,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          boxSizing: "border-box",
        }}>
          {/* Brand header */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            {/* Logo mark */}
            <div style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "22px",
              fontWeight: 700,
            }}>
              心
            </div>
            <h1 style={{
              fontSize: tokens.fontSize3xl,
              fontWeight: 700,
              color: tokens.textPrimary,
              margin: "0 0 6px",
              lineHeight: 1.3,
            }}>
              管理后台
            </h1>
            <p style={{
              color: tokens.textSecondary,
              margin: 0,
              fontSize: tokens.fontSizeBase,
              lineHeight: 1.5,
            }}>
              青少年心理健康 AI 平台 —{" "}
              <span style={{ color: tokens.primary, fontWeight: 600 }}>心愈智联</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ margin: 0 }}>
            {/* Username */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <span style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: tokens.textPlaceholder,
                display: "flex",
                alignItems: "center",
                zIndex: 1,
              }} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 12px 0 36px",
                  fontSize: tokens.fontSizeBase,
                  color: tokens.textPrimary,
                  backgroundColor: tokens.bgCard,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: tokens.radiusMd,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = tokens.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.primaryLight}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = tokens.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 40px 0 12px",
                  fontSize: tokens.fontSizeBase,
                  color: tokens.textPrimary,
                  backgroundColor: tokens.bgCard,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: tokens.radiusMd,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = tokens.borderFocus;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.primaryLight}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = tokens.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
                style={{
                  position: "absolute",
                  right: "1px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0 12px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: tokens.textPlaceholder,
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {showPassword ? <EyeOpenIcon size={16} /> : <EyeClosedIcon size={16} />}
              </button>
            </div>

            {/* Remember me */}
            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center" }}>
              <label style={{
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: tokens.fontSizeBase,
                color: tokens.textRegular,
                userSelect: "none",
              }}>
                <span style={{
                  position: "relative",
                  display: "inline-flex",
                  width: "14px",
                  height: "14px",
                  marginRight: "8px",
                  flexShrink: 0,
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    style={{ position: "absolute", inset: 0, margin: 0, opacity: 0, cursor: "pointer" }}
                  />
                  <span style={{
                    display: "inline-flex",
                    width: "14px",
                    height: "14px",
                    border: `1px solid ${rememberMe ? tokens.primary : tokens.border}`,
                    borderRadius: "2px",
                    backgroundColor: rememberMe ? tokens.primary : tokens.bgCard,
                    transition: "background-color 0.15s, border-color 0.15s",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                  }}>
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </span>
                记住我
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "42px",
                fontSize: tokens.fontSizeBase,
                color: "#fff",
                backgroundColor: loading ? tokens.primaryLight : tokens.primary,
                border: "none",
                borderRadius: tokens.radiusMd,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
                letterSpacing: "0.5px",
                transition: "background-color 0.15s, transform 0.1s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = tokens.primaryHover;
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = tokens.primary;
              }}
              onMouseDown={(e) => {
                if (!loading) e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {loading ? "登录中..." : "登 录"}
            </button>
          </form>
        </div>
      </main>
      <FilingFooter variant="dark" />
    </div>
  );
}
