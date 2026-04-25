import type {
  AiMessage,
  AiSession,
  Appointment,
  AssessmentRecord,
  AssessmentTemplate,
  DashboardSnapshot,
  LibraryItem,
  PatientContact,
  Psychologist,
  UserProfile,
} from "@ai-adolescent-mental-health/domain";

export const mockUser: UserProfile = {
  id: 1,
  nickname: "林同学",
  username: "lin_user",
  email: "lin***@example.com",
  phone: "138****5200",
  signature: "希望每天都比昨天更平稳一点。",
};

export const mockPatients: PatientContact[] = [
  { id: 1, name: "林同学", relation: "本人", age: 16, gender: "女", phone: "138****5200" },
  { id: 2, name: "林小舟", relation: "子女", age: 13, gender: "男", phone: "139****7701" },
];

export const mockPsychologists: Psychologist[] = [
  {
    id: 101,
    name: "周予安",
    title: "国家二级心理咨询师",
    fields: ["青少年情绪", "亲子沟通", "学业压力"],
    rating: 4.9,
    price: 260,
    onlinePrice: 260,
    offlinePrice: 360,
    city: "上海",
    availableToday: true,
    serviceTypes: ["视频咨询", "文字陪伴"],
    intro: "擅长把复杂情绪拆解成可执行的小步骤，适合首次咨询的青少年与家长。",
    isFavorite: true,
  },
  {
    id: 102,
    name: "陈嘉禾",
    title: "注册心理师",
    fields: ["睡眠问题", "焦虑调节", "人际关系"],
    rating: 4.8,
    price: 220,
    onlinePrice: 220,
    offlinePrice: 320,
    city: "杭州",
    availableToday: false,
    serviceTypes: ["视频咨询", "到院咨询"],
    intro: "关注青春期自我认同与家庭协作，咨询节奏温和、边界清晰。",
  },
  {
    id: 103,
    name: "许知微",
    title: "儿童青少年心理治疗师",
    fields: ["抑郁筛查", "创伤支持", "家庭会谈"],
    rating: 4.95,
    price: 320,
    onlinePrice: 320,
    offlinePrice: 420,
    city: "北京",
    availableToday: true,
    serviceTypes: ["视频咨询", "家庭会谈"],
    intro: "适合需要连续跟踪的个案，重视风险评估与家校沟通。",
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 5001,
    psychologistName: "周予安",
    patientName: "林同学",
    date: "2026-04-25",
    time: "19:30",
    status: "已预约",
    type: "线上咨询",
    fee: 260,
  },
  {
    id: 5002,
    psychologistName: "陈嘉禾",
    patientName: "林小舟",
    date: "2026-04-18",
    time: "20:00",
    status: "已完成",
    type: "线上咨询",
    fee: 220,
  },
];

export const mockAssessments: AssessmentTemplate[] = [
  {
    id: 1,
    title: "青少年情绪压力自评",
    description: "快速了解最近两周的情绪波动、压力来源和支持需求。",
    questionCount: 18,
    duration: "约 5 分钟",
    riskLevel: "情绪压力",
  },
  {
    id: 2,
    title: "睡眠与精力状态筛查",
    description: "识别睡眠节律、白天疲惫和注意力状态的变化。",
    questionCount: 12,
    duration: "约 3 分钟",
    riskLevel: "睡眠关注",
  },
  {
    id: 3,
    title: "亲子沟通温度计",
    description: "帮助家长和孩子一起看见沟通中的压力点与积极资源。",
    questionCount: 15,
    duration: "约 4 分钟",
    riskLevel: "亲子关系",
  },
];

export const mockAssessmentRecords: AssessmentRecord[] = [
  { id: 301, title: "青少年情绪压力自评", score: 68, result: "中等压力，建议持续观察", createTime: "2026-04-20 21:18" },
  { id: 302, title: "睡眠与精力状态筛查", score: 42, result: "轻度睡眠波动", createTime: "2026-04-16 22:02" },
];

export const mockAiSessions: AiSession[] = [
  { id: 8001, title: "考试前焦虑梳理", createTime: "2026-04-24 18:20" },
  { id: 8002, title: "和家人沟通练习", createTime: "2026-04-21 20:12" },
];

export const mockAiMessages: AiMessage[] = [
  { id: 1, role: "assistant", content: "晚上好，我是小艾。可以先告诉我，现在最困扰你的一件事是什么？", createTime: "18:20" },
  { id: 2, role: "user", content: "一想到下周考试就很紧张，晚上也睡不太好。", createTime: "18:21" },
  { id: 3, role: "assistant", content: "我听到两个线索：考试压力和睡眠受影响。我们先把担心写成三类：能准备的、需要求助的、暂时无法控制的。", createTime: "18:21" },
];

export const mockLibrary: LibraryItem[] = [
  {
    id: 201,
    title: "当孩子说“我不想上学”时，家长可以先做的三件事",
    type: "文章",
    tag: "亲子沟通",
    summary: "从情绪接住、信息澄清和共同计划三个步骤降低冲突。",
    author: "心愈智联内容组",
    readTime: "6 分钟",
    views: 4280,
  },
  {
    id: 202,
    title: "5 分钟睡前放松音频",
    type: "课程",
    tag: "睡眠",
    summary: "适合考试周和高压日程后的短时放松练习。",
    author: "周予安",
    readTime: "音频 5 分钟",
    views: 2190,
  },
  {
    id: 203,
    title: "青春期情绪地图",
    type: "书籍",
    tag: "自我理解",
    summary: "用可视化方式理解情绪、身体反应和需求之间的关系。",
    author: "推荐书单",
    readTime: "章节导读",
    views: 3160,
  },
  {
    id: 204,
    title: "我如何把晚上的担心放进第二天计划里",
    type: "社区",
    tag: "同伴经验",
    summary: "用户投稿：一个高二学生的压力管理记录。",
    author: "匿名用户",
    readTime: "4 分钟",
    views: 980,
  },
];

export const mockDashboard: DashboardSnapshot = {
  quote: "先让今天变得可承受，再慢慢靠近想要的生活。",
  moodScore: 76,
  activePlan: "考试周稳定计划",
  nextAppointment: mockAppointments[0],
  aiSummary: "小艾建议今晚先做 12 分钟复习收尾，再完成一轮睡前呼吸练习。",
  assessmentProgress: 62,
  recommendations: mockLibrary.slice(0, 3),
};
