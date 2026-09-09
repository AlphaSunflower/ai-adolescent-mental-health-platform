// 文案逐字来自《官网需呈现内容》第 4 节「团队文化」。
export default function CultureSection() {
  return (
    <section id="culture" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      {/* 复用 globals 的极光光斑做板块背景氛围 */}
      <div
        className="aurora-blob"
        style={{ width: "30vw", height: "30vw", background: "var(--mint)", bottom: "-15%", left: "-8%" }}
        aria-hidden="true"
      />

      <div className="relative text-center">
        <h2 className="text-3xl font-black text-[var(--ink)] md:text-4xl">团队文化</h2>
        <div className="official-gradient-text mx-auto mt-4 h-1 w-16 rounded-full" />
      </div>

      <div className="official-glass official-float-slow relative mx-auto mt-12 max-w-3xl rounded-[32px] p-8 text-center md:p-12">
        {/* Logo 图片：public/xinyuzhilian.svg */}
        <img
          src="/xinyuzhilian.svg"
          alt="心愈智联 Logo"
          className="official-float mx-auto h-24 w-24"
        />
        <p className="official-brand-font official-gradient-text mt-6 text-5xl font-black tracking-wide">
          心愈智联
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-left text-base leading-loose text-[var(--ink)]/85 md:text-justify">
          “心愈智联”凝聚着团队以智能与情感交融的力量，助力青少年心灵的健康疗愈与成长。“心愈”象征着内心疗愈与情感关怀，代表团队以温暖、专业与同理心，为青少年提供可信赖的心理支持与疏导；“智联”代表着智慧联结与系统赋能，寓意团队依托科学方法、创新工具与互助网络，赋能青少年建立积极心态、掌握应对策略，携手构建可持续的心理健康生态，助力他们在成长中勇敢前行，收获内心的光亮与成长的力量。
        </p>
      </div>
    </section>
  );
}
