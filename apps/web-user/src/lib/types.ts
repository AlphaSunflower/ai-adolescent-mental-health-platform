export type ApiResult<T> = {
  code: number;
  message: string;
  data: T;
};

export type PageResult<T> = {
  total: number;
  records: T[];
  current: number;
  size: number;
  pages?: number;
};

export type UserProfile = {
  id: number;
  nickname: string;
  username?: string;
  email?: string;
  phone?: string;
  sex?: number;
  signature?: string;
  headPath?: string;
};

export type PatientContact = {
  id: number;
  name: string;
  relation: string;
  age: number;
  gender: string;
  phone?: string;
};

export type Psychologist = {
  id: number;
  name: string;
  title: string;
  avatar?: string;
  fields: string[];
  rating: number;
  price: number;
  onlinePrice?: number;
  offlinePrice?: number;
  city: string;
  availableToday: boolean;
  serviceTypes: string[];
  intro: string;
  isFavorite?: boolean;
};

export type Appointment = {
  id: number;
  psychologistName: string;
  patientName: string;
  date: string;
  time: string;
  status: "待支付" | "已预约" | "进行中" | "已完成" | "已取消";
  type: "线上咨询" | "到院咨询";
  fee: number;
};

export type AssessmentTemplate = {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  duration: string;
  riskLevel: "日常筛查" | "情绪压力" | "睡眠关注" | "亲子关系";
};

export type AssessmentRecord = {
  id: number;
  title: string;
  score: number;
  result: string;
  createTime: string;
};

export type AiSession = {
  id: number;
  title: string;
  createTime: string;
};

export type AiMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createTime: string;
};

export type LibraryItem = {
  id: number;
  title: string;
  type: "文章" | "课程" | "书籍" | "社区";
  tag: string;
  summary: string;
  author: string;
  readTime: string;
  views: number;
};

export type DashboardSnapshot = {
  quote: string;
  moodScore: number;
  activePlan: string;
  nextAppointment: Appointment;
  aiSummary: string;
  assessmentProgress: number;
  recommendations: LibraryItem[];
};
