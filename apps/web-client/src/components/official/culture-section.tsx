import AnimatedContent from "./animated-content";

// 文案逐字来自《官网需呈现内容》第 4 节「团队文化」（strong 仅作强调，不增减字符）。
export default function CultureSection() {
  return (
    <section id="culture" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-28">
      <AnimatedContent>
        <div className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm font-bold tracking-[0.3em] text-[#8B7CC8]">
              团队文化
            </p>
            <p className="official-brand-font mt-6 text-4xl font-black tracking-wide text-[#4A4266] md:text-5xl">
              心愈智联
            </p>
            <div className="mt-8 flex gap-4">
              <span
                aria-hidden="true"
                className="official-brand-font shrink-0 select-none text-6xl leading-[0.9] text-[#D8D2EC]"
              >
                “
              </span>
              <p className="text-[15px] leading-[2] text-[#8A84A3]">
                <strong className="font-bold text-[#6F64A8]">“心愈智联”</strong>
                凝聚着团队以智能与情感交融的力量，助力青少年心灵的健康疗愈与成长。
                <strong className="font-bold text-[#6F64A8]">“心愈”</strong>
                象征着内心疗愈与情感关怀，代表团队以温暖、专业与同理心，为青少年提供可信赖的心理支持与疏导；
                <strong className="font-bold text-[#6F64A8]">“智联”</strong>
                代表着智慧联结与系统赋能，寓意团队依托科学方法、创新工具与互助网络，赋能青少年建立积极心态、掌握应对策略，携手构建可持续的心理健康生态，助力他们在成长中勇敢前行，收获内心的光亮与成长的力量。
              </p>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="rounded-[28px] bg-white p-10 shadow-[0_10px_36px_rgba(139,124,200,0.12)]">
              <img
                src="/logo.png"
                alt="心愈智联 Logo"
                className="h-28 w-auto object-contain md:h-36"
              />
            </div>
          </div>
        </div>
      </AnimatedContent>
    </section>
  );
}
