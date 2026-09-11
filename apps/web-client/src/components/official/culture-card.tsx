import OfficialMascot from "./official-mascot";

// 文案逐字来自《官网需呈现内容》第 4 节「团队文化」。
export default function CultureCard() {
  return (
    <div className="official-stack-culture">
      <div className="official-stack-culture__copy">
        <p className="official-stack-eyebrow">团队文化</p>
        <h2 className="official-brand-font">心愈智联</h2>
        <div className="official-stack-culture__quote">
          <span aria-hidden="true">“</span>
          <p>
            <strong>“心愈智联”</strong>
            凝聚着团队以智能与情感交融的力量，助力青少年心灵的健康疗愈与成长。
            <strong>“心愈”</strong>
            象征着内心疗愈与情感关怀，代表团队以温暖、专业与同理心，为青少年提供可信赖的心理支持与疏导；
            <strong>“智联”</strong>
            代表着智慧联结与系统赋能，寓意团队依托科学方法、创新工具与互助网络，赋能青少年建立积极心态、掌握应对策略，携手构建可持续的心理健康生态，助力他们在成长中勇敢前行，收获内心的光亮与成长的力量。
          </p>
        </div>
      </div>

      <div className="official-stack-culture__mark">
        <OfficialMascot />
      </div>
    </div>
  );
}
