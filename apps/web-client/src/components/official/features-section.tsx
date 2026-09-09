// 文案逐字来自《官网需呈现内容》第 3 节「功能介绍」表格；空缺模块按约定标「内容完善中」。
type Feature = { name: string; desc: string };
type Module = { module: string; features: Feature[] };

const USER_MODULES: Module[] = [
  {
    module: "AI情绪陪伴模块",
    features: [
      {
        name: "小爱咨询",
        desc: "用户可与AI心理助手进行实时对话，对话方式分两种，一种是纯语言、一种是视频对话，运用多模态情感识别面部表情，捕获用户情绪，获得情绪陪伴分析、压力缓解建议及初步心理疏导。",
      },
      { name: "情绪日记", desc: "由用户自行设置情绪状态，描述内心想法。" },
      {
        name: "情绪趋势图",
        desc: "可视化展示情绪波动规律，帮助用户了解自己的情绪模式。",
      },
    ],
  },
  {
    module: "心理自助工具模块",
    features: [
      {
        name: "心理科普小课堂",
        desc: "分年龄段、趣味化的漫画、短视频、图文科普。",
      },
      {
        name: "心理量表测评",
        desc: "内置SCL-90、抑郁自评量表等多维标准化问卷，用户完成测评后自动生成评估报告，并结合AI评估当前心理情况并做预警反馈给相关医生，能够辅助了解自身情绪状态，并为咨询师提供参考。",
      },
      {
        name: "心理咨询",
        desc: "用户可预约入驻平台的专业心理咨询师，通过视频方式进行一对一咨询，降低线下求助的心理负担。",
      },
    ],
  },
  {
    module: "安全与预警模块",
    features: [
      { name: "自动风险识别", desc: "多模态数据融合分析，自动识别风险信号" },
      {
        name: "危机干预引导",
        desc: "识别到自伤或强烈绝望信号时，立即停止提问、引导联系信任的大人或拨打心理援助热线",
      },
      { name: "匿名模式", desc: "支持完全匿名使用，降低病耻感" },
    ],
  },
  {
    module: "成长档案模块",
    features: [
      { name: "身份验证", desc: "实名验证身份信息，填写个人信息及家庭信息" },
      {
        name: "情绪结晶时间线",
        desc: "所有“想明白的话”汇成可视化时间线，可回看完整对话",
      },
      {
        name: "阶段性心理报告",
        desc: "自动生成周报/月报，呈现情绪变化、成长轨迹",
      },
    ],
  },
  {
    module: "每日打卡与智能体养成模块",
    features: [
      {
        name: "智能体形象",
        desc: "拟为产品专属陪伴型智能体，以可视化形象呈现于打卡主场景，其形态表现随用户情绪状态联动变化，并随打卡积分累积提升等级，逐步呈现不同成长阶段的外观形态，形成“记录—反馈—成长”的可视化陪伴体验。",
      },
      {
        name: "每日打卡",
        desc: "系统按每日签到、情绪日记记录、AI情绪对话、心理韧性训练、科普课程学习、心理量表测评、咨询预约回访、亲子互动任务八个维度生成打卡任务清单，任务项根据用户年龄与历史行为自动适配，不强制全部完成。用户完成对应行为后系统自动核销并发放积分，单日积分设置获取上限，打卡记录以日历视图呈现。",
      },
      {
        name: "积分体系",
        desc: "本模块设置唯一虚拟积分凭证，用户通过完成打卡任务获取，用于等级晋升、功能解锁与形象装扮兑换。积分不可转让、不可交易、不可折现，仅具平台内使用价值。",
      },
      {
        name: "等级与权益解锁",
        desc: "设十个等级，以累计积分为晋升依据，晋升不扣减已获积分。等级提升逐步解锁语音包、月度情绪成长报告、专注陪伴模式、记忆相册、表达风格调节等功能权益，以及限定形象外观、场景背景等装扮权益。AI情绪陪伴、情绪日记、心理量表测评、自动风险识别等基础服务功能不设积分门槛，全等级开放。",
      },
      {
        name: "装扮系统",
        desc: "提供形象外观、场景背景、配饰挂件、动作表情、头像挂件等多类个性化装扮，可通过积分兑换、等级赠送、成就奖励与限定活动四种方式获取，装扮仅具装饰作用，不产生功能差异；未成年人账号设置兑换限额，超出部分须经家长端确认。",
      },
      {
        name: "断签保护",
        desc: "用户中断打卡时，智能体进入降温或休眠状态，已获积分与等级完整保留，恢复打卡后形态自动回升，不设清零与降级惩罚，避免打卡焦虑。",
      },
      {
        name: "家长端联动与安全保障",
        desc: "在用户明确授权前提下，家长端可查看子女打卡完成情况、智能体成长阶段与阶段性成长报告，不可查看情绪日记正文与对话内容。未成年人账号启用夜间时段管理、单次使用时长提醒与单日积分上限。当识别到风险信号时，本模块激励与推送功能全部暂停，优先转入危机干预流程。",
      },
    ],
  },
];

// 家长端 / 管理端：原文功能介绍空缺，仅列模块名，禁止编造
const PARENT_MODULES = [
  "孩子状态总览模块",
  "亲子沟通支持模块",
  "专业支持模块",
  "支付模块",
];

const ADMIN_MODULES = [
  "用户管理模块",
  "心理咨询管理模块",
  "数据与报告模块",
  "内容管理模块",
  "危机干预管理模块",
];

function ModuleCard({ data }: { data: Module }) {
  return (
    <article className="official-glass rounded-[28px] p-6 md:p-8">
      <h4 className="official-gradient-text text-lg font-black">{data.module}</h4>
      <ul className="mt-5 space-y-4">
        {data.features.map((feature) => (
          <li key={feature.name} className="border-t border-[rgba(201,168,255,0.25)] pt-4 first:border-t-0 first:pt-0">
            <p className="font-bold text-[var(--ink)]">{feature.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{feature.desc}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function PendingModules({ title, modules }: { title: string; modules: string[] }) {
  return (
    <div className="mt-12">
      <h3 className="text-xl font-black text-[var(--ink)]">{title}</h3>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <div
            key={module}
            className="official-glass flex items-center justify-between gap-3 rounded-2xl px-5 py-4"
          >
            <span className="font-bold text-[var(--ink)]">{module}</span>
            <span className="shrink-0 rounded-full bg-[rgba(255,229,138,0.45)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
              内容完善中
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[var(--ink)] md:text-4xl">功能介绍</h2>
        <div className="official-gradient-text mx-auto mt-4 h-1 w-16 rounded-full" />
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-black text-[var(--ink)]">用户端</h3>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {USER_MODULES.slice(0, 4).map((data) => (
            <ModuleCard key={data.module} data={data} />
          ))}
          <div className="md:col-span-2">
            <ModuleCard data={USER_MODULES[4]} />
          </div>
        </div>
      </div>

      <PendingModules title="家长端" modules={PARENT_MODULES} />
      <PendingModules title="管理端" modules={ADMIN_MODULES} />
    </section>
  );
}
