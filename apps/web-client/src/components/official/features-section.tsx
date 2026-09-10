import AnimatedContent from "./animated-content";
import SpotlightCard from "./spotlight-card";
import {
  ADMIN_MODULES,
  PARENT_MODULES,
  USER_MODULES,
  type FeatureModule,
} from "./style-data";

// 模块与功能名逐字来自各自的内容源：用户端见《官网需呈现内容》第 3 节，
// 家长端/管理端见 agent-brief/02b-家长端管理端功能.md；tagline 为同源功能描述的提炼句。
// 文案一律以原文为准，禁止编造。

function ModuleCard({ data, index }: { data: FeatureModule; index: number }) {
  return (
    <SpotlightCard className="h-full rounded-[28px] bg-white p-7 shadow-[0_10px_36px_rgba(139,124,200,0.12)]">
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFEBFA] text-sm font-bold text-[#7A6BBA]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[#4A4266]">
          {data.module}
        </h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#8A84A3]">{data.tagline}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {data.features.map((feature) => (
          <li
            key={feature}
            className="rounded-full bg-[#F1EEFA] px-3.5 py-1.5 text-xs font-medium text-[#6F64A8]"
          >
            {feature}
          </li>
        ))}
      </ul>
    </SpotlightCard>
  );
}

export default function FeaturesSection() {
  // 错落网格：奇偶行宽度互异（3+2 / 2+3），第 5 卡通栏 —— 拒绝等距机械平铺
  const spans = [
    "md:col-span-3",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-3",
    "md:col-span-5",
  ];

  return (
    <section id="features" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-28">
      <AnimatedContent>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#4A4266]">
          功能介绍
        </h2>
      </AnimatedContent>

      <p className="mt-14 text-sm font-bold text-[#8A84A3]">用户端</p>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-5">
        {USER_MODULES.map((data, index) => (
          <AnimatedContent
            key={data.module}
            delay={index * 0.1}
            className={spans[index]}
          >
            <ModuleCard data={data} index={index} />
          </AnimatedContent>
        ))}
      </div>

      <p className="mt-14 text-sm font-bold text-[#8A84A3]">家长端</p>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {PARENT_MODULES.map((data, index) => (
          <AnimatedContent
            key={data.module}
            delay={index * 0.1}
            className={index === 2 ? "md:col-span-2" : ""}
          >
            <ModuleCard data={data} index={index} />
          </AnimatedContent>
        ))}
      </div>

      <p className="mt-14 text-sm font-bold text-[#8A84A3]">管理端</p>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-5">
        {ADMIN_MODULES.map((data, index) => (
          <AnimatedContent
            key={data.module}
            delay={index * 0.1}
            className={spans[index]}
          >
            <ModuleCard data={data} index={index} />
          </AnimatedContent>
        ))}
      </div>
    </section>
  );
}
