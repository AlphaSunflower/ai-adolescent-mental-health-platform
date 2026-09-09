import SpotlightCard from "./spotlight-card";

// 模块与功能名逐字来自《官网需呈现内容》第 3 节三个表格；本板块仅呈现“模块 + 功能”两级。
// 原文空缺的模块按约定标注「内容完善中」，禁止编造。
type FeatureModule = {
  module: string;
  features: string[];
  pending?: boolean;
};

const USER_MODULES: FeatureModule[] = [
  {
    module: "AI情绪陪伴模块",
    features: ["小爱咨询", "情绪日记", "情绪趋势图"],
  },
  {
    module: "心理自助工具模块",
    features: ["心理科普小课堂", "心理量表测评", "心理咨询"],
  },
  {
    module: "安全与预警模块",
    features: ["自动风险识别", "危机干预引导", "匿名模式"],
  },
  {
    module: "成长档案模块",
    features: ["身份验证", "情绪结晶时间线", "阶段性心理报告"],
  },
  {
    module: "每日打卡与智能体养成模块",
    features: [
      "智能体形象",
      "每日打卡",
      "积分体系",
      "等级与权益解锁",
      "装扮系统",
      "断签保护",
      "家长端联动与安全保障",
    ],
  },
];

const PARENT_MODULES: FeatureModule[] = [
  { module: "孩子状态总览模块", features: [], pending: true },
  { module: "亲子沟通支持模块", features: [], pending: true },
  { module: "专业支持模块", features: [], pending: true },
  { module: "支付模块", features: ["绑定小孩用户端"] },
];

const ADMIN_MODULES: FeatureModule[] = [
  { module: "用户管理模块", features: [], pending: true },
  { module: "心理咨询管理模块", features: [], pending: true },
  { module: "数据与报告模块", features: [], pending: true },
  { module: "内容管理模块", features: [], pending: true },
  { module: "危机干预管理模块", features: [], pending: true },
];

function ModuleCard({ data, index }: { data: FeatureModule; index: number }) {
  return (
    <SpotlightCard className="group rounded-[20px] border border-[rgba(58,46,92,0.08)] bg-white/85 p-6 md:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold text-[var(--purple)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-[var(--ink)]">
            {data.module}
          </h3>
        </div>
        {!data.pending && (
          <span className="shrink-0 text-sm text-[var(--muted)] transition-colors group-hover:text-[var(--purple)]">
            了解 <span aria-hidden="true">↗</span>
          </span>
        )}
      </div>

      {data.pending ? (
        <p className="mt-4 text-sm text-[var(--muted)]">内容完善中</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {data.features.map((feature) => (
            <li key={feature} className="text-sm text-[var(--muted)]">
              {feature}
            </li>
          ))}
        </ul>
      )}
    </SpotlightCard>
  );
}

function ModuleGroup({ title, modules }: { title: string; modules: FeatureModule[] }) {
  return (
    <div className="mt-12">
      <p className="text-sm font-bold text-[var(--muted)]">{title}</p>
      <div className="mt-5 space-y-4">
        {modules.map((data, index) => (
          <ModuleCard key={data.module} data={data} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-28">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)] md:text-3xl">
        功能介绍
      </h2>
      <div className="mt-4 h-px w-12 bg-[rgba(58,46,92,0.2)]" />

      <ModuleGroup title="用户端" modules={USER_MODULES} />
      <ModuleGroup title="家长端" modules={PARENT_MODULES} />
      <ModuleGroup title="管理端" modules={ADMIN_MODULES} />
    </section>
  );
}
