// 文案逐字来自《官网需呈现内容》第 4 节「团队文化」。
export default function CultureSection() {
  return (
    <section id="culture" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-28">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)] md:text-3xl">
        团队文化
      </h2>
      <div className="mt-4 h-px w-12 bg-[rgba(58,46,92,0.2)]" />

      <div className="mt-16 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="心愈智联 Logo"
          className="h-20 w-auto object-contain"
        />
        <p className="official-brand-font mt-8 text-4xl font-black tracking-wide text-[var(--ink)]">
          心愈智联
        </p>
        <p className="mx-auto mt-10 max-w-2xl text-[15px] leading-[2] text-[var(--muted)] md:text-base">
          “心愈智联”凝聚着团队以智能与情感交融的力量，助力青少年心灵的健康疗愈与成长。“心愈”象征着内心疗愈与情感关怀，代表团队以温暖、专业与同理心，为青少年提供可信赖的心理支持与疏导；“智联”代表着智慧联结与系统赋能，寓意团队依托科学方法、创新工具与互助网络，赋能青少年建立积极心态、掌握应对策略，携手构建可持续的心理健康生态，助力他们在成长中勇敢前行，收获内心的光亮与成长的力量。
        </p>
      </div>
    </section>
  );
}
