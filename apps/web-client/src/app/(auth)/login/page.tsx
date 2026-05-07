export default function LoginPage() {
  return (
    <div className="cosmic-card w-full max-w-md p-8">
      <h2 className="cosmic-gradient-text text-center text-3xl font-bold">
        登录
      </h2>
      <p className="mt-2 text-center text-sm text-cosmic-muted">
        青少年心理健康 AI 平台
      </p>
      <div className="mt-8 space-y-4">
        <input
          className="cosmic-input w-full px-4 py-3"
          placeholder="用户名 / 邮箱"
        />
        <input
          className="cosmic-input w-full px-4 py-3"
          type="password"
          placeholder="密码"
        />
        <button className="cosmic-btn-primary w-full py-3 text-base">
          登 录
        </button>
      </div>
    </div>
  );
}
