export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="cosmic-gradient-text text-center text-5xl font-bold">
        心愈智联
      </h1>
      <p className="mt-4 text-center text-lg text-cosmic-muted">
        青少年心理健康 AI 平台
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {["AI 咨询", "心理咨询", "心理测评", "内容馆"].map((label) => (
          <div
            key={label}
            className="cosmic-card cursor-pointer p-6 text-center text-white transition-all hover:-translate-y-1"
          >
            <span className="text-lg font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
