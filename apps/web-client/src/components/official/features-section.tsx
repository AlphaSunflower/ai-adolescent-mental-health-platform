import {
  Building2,
  HeartHandshake,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import CultureCard from "./culture-card";
import ScrollStack, { ScrollStackItem } from "./scroll-stack";
import {
  ADMIN_MODULES,
  PARENT_MODULES,
  USER_MODULES,
  type FeatureModule,
} from "./style-data";

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

function ModuleEntry({
  data,
  index,
}: {
  data: FeatureModule;
  index: number;
}) {
  return (
    <article className="official-stack-module">
      <div className="official-stack-module__header">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <h4>{data.module}</h4>
      </div>
      <p>{data.tagline}</p>
      <ul>
        {data.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </article>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="official-features-stack scroll-mt-24">
      <div className="official-features-stack__inner">
        <h2 className="official-stack-title">功能介绍</h2>

        <ScrollStack
          className="official-scroll-stack"
          useWindowScroll
          itemDistance={72}
          itemScale={0.015}
          itemStackDistance={24}
          stackPosition="12%"
          scaleEndPosition="5%"
          baseScale={0.94}
        >
          {FEATURE_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <ScrollStackItem
                key={group.id}
                id={`audience-${group.id}`}
                itemClassName={`official-stack-card official-stack-card--${group.id}`}
              >
                <div className="official-stack-card__header">
                  <span className="official-stack-card__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{group.label}</h3>
                </div>

                <div className="official-stack-modules">
                  {group.modules.map((data, index) => (
                    <ModuleEntry key={data.module} data={data} index={index} />
                  ))}
                </div>
              </ScrollStackItem>
            );
          })}

          <ScrollStackItem
            id="culture"
            itemClassName="official-stack-card official-stack-card--culture"
          >
            <CultureCard />
          </ScrollStackItem>
        </ScrollStack>
      </div>
    </section>
  );
}
