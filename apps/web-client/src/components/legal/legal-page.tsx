"use client";

import { useState } from "react";
import { Shield, FileText, AlertTriangle, Heart } from "lucide-react";

export type LegalTab = "privacy" | "terms" | "disclaimer" | "minor";

const TABS: { key: LegalTab; label: string; icon: typeof Shield }[] = [
  { key: "privacy", label: "隐私保护协议", icon: Shield },
  { key: "terms", label: "用户服务协议", icon: FileText },
  { key: "disclaimer", label: "免责声明", icon: AlertTriangle },
  { key: "minor", label: "未成年人保护指引", icon: Heart },
];

const CONTENT: Record<LegalTab, { title: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "隐私保护协议",
    sections: [
      {
        heading: "一、信息收集",
        body: "我们仅收集为您提供心理健康服务所必需的个人信息，包括但不限于：您主动填写的个人资料、心理健康评估数据、咨询记录等。我们承诺在收集信息前获得您的明确同意，并告知收集的目的、方式和范围。",
      },
      {
        heading: "二、信息使用",
        body: "您的个人信息将仅用于以下目的：（1）提供个性化的心理健康服务；（2）改善和优化我们的服务质量；（3）履行法律法规规定的义务。我们不会将您的信息用于与上述目的无关的用途。",
      },
      {
        heading: "三、信息保护",
        body: "我们采用行业标准的安全技术和组织措施保护您的个人信息，包括数据加密传输、访问控制、定期安全审计等。我们建立了完善的数据安全管理制度，确保您的信息不被未经授权的访问、使用或泄露。",
      },
      {
        heading: "四、信息共享",
        body: "未经您的明确同意，我们不会将您的个人信息分享给任何第三方，但法律法规要求或为保护您或他人生命健康所必需的情况除外。与心理咨询师的信息共享将严格限制在为您提供服务的必要范围内。",
      },
      {
        heading: "五、信息存储",
        body: "您的个人信息将存储在中华人民共和国境内的服务器上。我们将在为您提供服务所必需的期限内保留您的信息，除非法律法规另有规定。在您注销账户后，我们将依法对您的信息进行删除或匿名化处理。",
      },
      {
        heading: "六、您的权利",
        body: "您有权查阅、更正、删除您的个人信息，有权撤回同意、注销账户，以及行使法律规定的其他权利。如需行使上述权利，请通过应用内「意见反馈」功能或联系客服与我们取得联系。",
      },
      {
        heading: "七、未成年人保护",
        body: "我们特别重视对未成年人个人信息的保护。如您是未满18周岁的未成年人，请在监护人指导下使用本平台。我们将按照《未成年人保护指引》对未成年人的信息进行更加严格的保护。",
      },
      {
        heading: "八、协议更新",
        body: "我们可能会根据法律法规变化或业务发展需要更新本隐私保护协议。如有重大变更，我们将通过应用内通知、弹窗提示等显著方式告知您。继续使用本平台即表示您同意更新后的协议。",
      },
    ],
  },
  terms: {
    title: "用户服务协议",
    sections: [
      {
        heading: "一、服务说明",
        body: "本平台（以下简称「平台」）是面向青少年及家长的心理健康服务平台，提供AI心理倾诉、心理咨询预约、心理健康评估、心理知识内容等服务。平台所有服务均应在遵守国家法律法规及本协议的前提下使用。",
      },
      {
        heading: "二、用户注册与账户",
        body: "您在使用平台服务前需要注册账户。您应当提供真实、准确、完整的个人信息，并在信息变更时及时更新。您对账户下的所有活动负责，请妥善保管账户密码，不得将账户转让、出借或授权他人使用。",
      },
      {
        heading: "三、服务使用规范",
        body: "您在使用平台服务时，应遵守国家法律法规，不得利用平台从事违法违规活动，不得发布虚假、侵权、淫秽、暴力等不良信息，不得干扰平台正常运营。如发现违规行为，平台有权采取警告、限制功能、暂停或终止服务等措施。",
      },
      {
        heading: "四、咨询服务说明",
        body: "平台提供的AI心理倾诉服务基于人工智能技术，旨在提供情绪支持和心理健康建议，不能替代专业的医疗诊断和治疗。真人心理咨询服务由具备资质的心理咨询师提供，咨询师对其提供的服务质量承担责任。",
      },
      {
        heading: "五、付费服务",
        body: "平台部分服务需要付费使用。您在使用付费服务前应仔细阅读服务说明和价格信息。支付完成后，如符合退款条件，可按照平台退款政策申请退款。平台保留根据市场情况调整服务价格的权利。",
      },
      {
        heading: "六、知识产权",
        body: "平台及其内容（包括但不限于文字、图片、音频、视频、软件、界面设计等）的知识产权归平台所有或已获得合法授权。未经许可，您不得复制、修改、传播、商业利用平台的任何内容。您发布的内容，视为授权平台在合理范围内使用。",
      },
      {
        heading: "七、服务变更与终止",
        body: "平台可能因系统维护、升级等原因暂停部分服务，将尽可能提前通知。如您违反本协议约定，平台有权暂停或终止向您提供服务。您可随时停止使用平台服务，已支付的费用按平台退款政策处理。",
      },
      {
        heading: "八、争议解决",
        body: "本协议的订立、执行和解释均适用中华人民共和国法律。因本协议引起的争议，双方应首先协商解决；协商不成的，任何一方可向平台运营方所在地有管辖权的人民法院提起诉讼。",
      },
    ],
  },
  disclaimer: {
    title: "免责声明",
    sections: [
      {
        heading: "一、一般免责",
        body: "您理解并同意，使用本平台服务需要自行承担风险。平台以「现有」状态提供服务，在法律允许的最大范围内，不提供任何明示或默示的保证，包括但不限于适销性、特定用途适用性和非侵权的保证。",
      },
      {
        heading: "二、健康信息免责",
        body: "平台提供的心理健康内容（包括AI对话、文章、测评结果等）仅供参考和教育目的，不构成医疗诊断、治疗建议或医疗处方。如您有严重的心理健康问题或紧急情况，请立即联系专业医疗机构或拨打心理援助热线。",
      },
      {
        heading: "三、AI服务免责",
        body: "AI心理倾诉服务基于大语言模型生成内容，可能存在不准确、不完整或不适当的情况。AI服务不能替代专业心理咨询师、精神科医生或其他医疗专业人士的诊断和治疗。平台对AI对话内容不承担医疗责任。",
      },
      {
        heading: "四、第三方服务免责",
        body: "平台可能包含第三方服务的链接或内容。平台不对任何第三方服务的内容、隐私政策、安全性或可用性负责。您使用第三方服务应自行承担风险，并遵守该第三方的服务条款和隐私政策。",
      },
      {
        heading: "五、不可抗力",
        body: "因自然灾害、战争、政府行为、网络攻击、系统故障等不可抗力或不可预见的事件导致服务中断或数据丢失的，平台不承担责任，但将尽力采取措施减少由此给您带来的影响和不便。",
      },
      {
        heading: "六、用户行为免责",
        body: "因您自身操作不当、账户信息泄露、设备故障等原因导致的损失，平台不承担责任。您在平台上的互动行为（包括咨询、评论、分享等）均由您自行承担责任。",
      },
      {
        heading: "七、责任限制",
        body: "在法律允许的最大范围内，平台及其关联方对任何间接的、附带的、特殊的或惩罚性的损害赔偿不承担责任，包括但不限于利润损失、数据丢失、商誉损失等，无论该等损害赔偿是否可预见。",
      },
    ],
  },
  minor: {
    title: "未成年人保护指引",
    sections: [
      {
        heading: "一、适用范围",
        body: "本指引适用于使用本平台服务的未满18周岁的未成年人及其监护人。我们致力于为未成年人提供安全、健康的心理健康服务环境，严格保护未成年人的合法权益。",
      },
      {
        heading: "二、监护人责任",
        body: "未成年人使用平台服务应当在监护人的知情和指导下进行。监护人应当：（1）了解平台服务的性质和内容；（2）指导未成年人正确使用平台服务；（3）关注未成年人的心理健康状况；（4）监督未成年人的使用行为，防止过度依赖或不当使用。",
      },
      {
        heading: "三、信息保护",
        body: "我们对未成年人的个人信息实施更加严格的保护措施：（1）收集未成年人信息前获得监护人明确同意；（2）仅收集提供服务的必要信息；（3）严禁将未成年人信息用于营销或其他商业目的；（4）监护人有权查阅、更正、删除未成年人的个人信息。",
      },
      {
        heading: "四、内容安全",
        body: "平台建立专门的内容审核机制，确保提供给未成年人的内容健康、积极、适合其年龄段。我们严格过滤可能对未成年人造成不良影响的内容，包括但不限于暴力、色情、自伤、自杀等相关信息。",
      },
      {
        heading: "五、使用限制",
        body: "平台对未成年人使用部分功能实施必要的限制：（1）支付功能需监护人授权；（2）真人咨询服务建议监护人陪同；（3）AI倾诉服务中的高危内容将触发预警机制并通知监护人；（4）每日使用时长将进行适当限制和提醒。",
      },
      {
        heading: "六、危机干预",
        body: "当平台检测到未成年人可能存在自伤、自杀或其他严重危机情况时，将启动紧急干预机制：（1）立即向用户推送专业心理援助热线；（2）尽可能联系监护人；（3）必要时配合相关部门采取保护措施。",
      },
      {
        heading: "七、监护人知情权",
        body: "监护人有权了解未成年人在平台上的主要活动情况。平台将提供相应功能帮助监护人查看未成年人的使用情况。如监护人认为平台服务对未成年人产生不良影响，可随时要求限制或终止相关服务。",
      },
      {
        heading: "八、投诉与建议",
        body: "如您对未成年人保护工作有任何意见、建议或投诉，请通过应用内「意见反馈」功能或发送邮件至客服邮箱与我们联系。我们将在收到反馈后及时处理并回复。",
      },
    ],
  },
};

export function LegalPage({ initialTab = "privacy" }: { initialTab?: LegalTab }) {
  const [tab, setTab] = useState<LegalTab>(initialTab);

  const current = CONTENT[tab];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">法律声明</h1>
        <p className="mt-3 text-cosmic-muted">
          请仔细阅读以下法律文件，了解您的权利和义务
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
              tab === key
                ? "bg-cosmic-blue/30 text-cosmic-gold border border-cosmic-gold/30"
                : "bg-white/5 text-cosmic-muted border border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="cosmic-card rounded-xl p-6 sm:p-10">
        <h2 className="mb-8 text-center text-xl font-bold text-cosmic-gold">{current.title}</h2>
        <div className="space-y-8">
          {current.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="mb-2 text-base font-semibold text-white">{section.heading}</h3>
              <p className="text-sm leading-relaxed text-cosmic-muted">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
