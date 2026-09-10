/**
 * 官网功能介绍共享内容数据（方案 B 定稿后由选稿数据文件演变而来）。
 * 用户端模块来自《官网需呈现内容》第 3 节；家长端/管理端逐字来自
 * agent-brief/02b-家长端管理端功能.md；
 * 一句话定位（tagline）为各自功能描述的提炼句，不引入新概念。
 */

export type FeatureModule = {
  module: string;
  tagline: string;
  features: string[];
};

export const USER_MODULES: FeatureModule[] = [
  {
    module: "AI情绪陪伴模块",
    tagline: "实时对话、视频对话与情绪日记，获得情绪陪伴分析与压力缓解建议",
    features: ["小爱咨询", "情绪日记", "情绪趋势图"],
  },
  {
    module: "心理自助工具模块",
    tagline: "科普小课堂、标准化量表测评与一对一视频心理咨询",
    features: ["心理科普小课堂", "心理量表测评", "心理咨询"],
  },
  {
    module: "安全与预警模块",
    tagline: "多模态识别风险信号，危机时引导求助，支持匿名使用",
    features: ["自动风险识别", "危机干预引导", "匿名模式"],
  },
  {
    module: "成长档案模块",
    tagline: "情绪结晶时间线与周报/月报，呈现情绪变化与成长轨迹",
    features: ["身份验证", "情绪结晶时间线", "阶段性心理报告"],
  },
  {
    module: "每日打卡与智能体养成模块",
    tagline: "八维度打卡与积分等级，养成专属陪伴智能体，形成记录—反馈—成长",
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

// 家长端：模块/功能名/介绍逐字来自 agent-brief/02b「3.2 家长端」；tagline 为介绍原文提炼
export const PARENT_MODULES: FeatureModule[] = [
  {
    module: "孩子状态总览模块",
    tagline: "授权范围内查看情绪变化趋势与风险等级，不读取具体聊天内容，保护孩子隐私",
    features: ["情绪概览看板", "风险预警推送", "历史报告查看"],
  },
  {
    module: "亲子沟通支持模块",
    tagline: "结合孩子情绪状态输出沟通建议与话术模板，AI 情景模拟练习共情式沟通",
    features: ["沟通话术建议", "亲子情景模拟", "分龄育儿指南"],
  },
  {
    module: "专业支持模块",
    tagline: "在线预约心理咨询师，打通线上预约与线下服务衔接，支持转诊授权",
    features: ["咨询师预约", "线下机构导航", "转诊授权"],
  },
];

// 管理端：模块/功能名/介绍逐字来自 agent-brief/02b「3.3 管理端」；tagline 为介绍原文提炼
export const ADMIN_MODULES: FeatureModule[] = [
  {
    module: "用户管理模块",
    tagline: "多角色分级权限管控，支持多机构入驻与家长账号自动关联绑定",
    features: ["多角色权限管理", "机构管理", "账号体系"],
  },
  {
    module: "心理咨询管理模块",
    tagline: "咨询师排班与预约审核，咨询记录留存，资质核验统一管理",
    features: ["咨询预约管理", "咨询记录管理", "咨询师资质审核"],
  },
  {
    module: "数据与报告模块",
    tagline: "批量下发心理测评任务，可视化展示区域与学校心理健康状况",
    features: ["心理普查管理", "可视化数据看板", "危机等级管理", "时间轴档案"],
  },
  {
    module: "内容管理模块",
    tagline: "科普内容发布与量表配置，平台兼容五十套以上青少年专用量表",
    features: ["科普内容管理", "量表管理", "AI模型管理"],
  },
  {
    module: "危机干预管理模块",
    tagline: "风险等级实时看板，高风险个案工单流转与四方协同处置",
    features: ["风险预警看板", "工单系统", "四方联动"],
  },
];

/** Hero 简介段落：逐字来自《官网需呈现内容》第 1 节（strong 对应原文强调），配色随父容器继承 */
export function HeroIntro({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      本项目是一款面向 6-24 岁青少年群体的智能化健康服务产品，核心定位为
      <strong>专业体系支撑的 AI 辅助心理咨询智能体平台</strong>
      ，打通“AI初筛测评 — 持续情绪干预 — 专业咨询师转接”全服务链路，为不同需求层级的用户提供匹配的心理健康支持。产品分
      <strong>用户端、家长端、管理端</strong>
      三端协同运行，服务对象为青少年、家长、学校、少年宫、咨询师。
    </p>
  );
}

export const NAV_LINKS = [
  { label: "首页", href: "#hero" },
  { label: "功能介绍", href: "#features" },
] as const;

export const HERO_BUTTONS = {
  primary: { label: "网页版入口", href: "/login" },
  secondary: { label: "APP 下载", href: "/index#app-download" },
} as const;
