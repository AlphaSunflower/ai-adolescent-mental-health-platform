import AnimatedContent from "./animated-content";
import SpotlightCard from "./spotlight-card";
import {
  Building2,
  HeartHandshake,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  ADMIN_MODULES,
  PARENT_MODULES,
  USER_MODULES,
  type FeatureModule,
} from "./style-data";

// 模块与功能名逐字来自各自的内容源，tagline 为同源功能描述的提炼句。

type FeatureGroup = {
  id: "user" | "parent" | "admin";
  label: string;
  modules: FeatureModule[];
  icon: LucideIcon;
};

const FEATURE_GROUPS: FeatureGroup[] = [
  { id: "user", label: "用户端", modules: USER_MODULES, icon: Sparkles },
  {
    id: "parent",
    label: "家长端",
    modules: PARENT_MODULES,
    icon: HeartHandshake,
  },
  { id: "admin", label: "管理端", modules: ADMIN_MODULES, icon: Building2 },
];

const CARD_SPANS = [
  "md:col-span-3",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-3",
  "md:col-span-5",
];

function ModuleCard({
  data,
  index,
  group,
}: {
  data: FeatureModule;
  index: number;
  group: FeatureGroup["id"];
}) {
  return (
    <SpotlightCard
      className={`official-feature-card official-feature-card--${group} h-full p-7`}
    >
      <div className="flex items-center gap-4">
        <span className="official-feature-card__index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[#4A4266]">
          {data.module}
        </h3>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#8A84A3]">{data.tagline}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {data.features.map((feature) => (
          <li key={feature} className="official-feature-card__tag">
            {feature}
          </li>
        ))}
      </ul>
    </SpotlightCard>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="official-features relative scroll-mt-24">
      <div className="official-features__inner relative mx-auto max-w-5xl px-6 py-28">
        <AnimatedContent>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#4A4266]">
            功能介绍
          </h2>
        </AnimatedContent>

        <div className="official-feature-groups mt-14 space-y-20">
          {FEATURE_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.id}
                className={`official-feature-group official-feature-group--${group.id} grid gap-7 lg:grid-cols-[140px_1fr]`}
              >
                <AnimatedContent>
                  <div className="lg:sticky lg:top-28">
                    <h3 className="official-feature-group__title">
                      <span className="official-feature-group__icon">
                        <Icon aria-hidden="true" />
                      </span>
                      {group.label}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="official-feature-group__line"
                    />
                  </div>
                </AnimatedContent>

                <div className="official-module-grid grid grid-cols-1 gap-5 md:grid-cols-5">
                  {group.modules.map((data, index) => (
                    <AnimatedContent
                      key={data.module}
                      delay={index * 0.08}
                      className={`${CARD_SPANS[index]} ${
                        group.id === "parent" && index === 2
                          ? "md:col-span-2"
                          : ""
                      }`}
                    >
                      <ModuleCard data={data} index={index} group={group.id} />
                    </AnimatedContent>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
