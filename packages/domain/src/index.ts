export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export type ApiResult<T> = ApiEnvelope<T>;

export type PageResult<T> = {
  total: number;
  records: T[];
  current: number;
  size: number;
  pages?: number;
};

export type UserRole = "teen" | "parent" | "psychologist" | "admin";

export type UserProfile = {
  id: number;
  nickname: string;
  username?: string;
  email?: string;
  phone?: string;
  sex?: number;
  signature?: string;
  headPath?: string;
  role?: UserRole | number;
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

export type AppointmentStatus = "待支付" | "待确认" | "已预约" | "进行中" | "已完成" | "已取消";

export type ConsultationType = "线上咨询" | "到院咨询";

export type Appointment = {
  id: number;
  psychologistName: string;
  patientName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: ConsultationType;
  fee: number;
};

export type AssessmentRiskLevel = "日常筛查" | "情绪压力" | "睡眠关注" | "亲子关系";

export type AssessmentTemplate = {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  duration: string;
  riskLevel: AssessmentRiskLevel;
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

export type AiMessageRole = "user" | "assistant";

export type AiMessage = {
  id: number;
  role: AiMessageRole;
  content: string;
  createTime: string;
};

export type LibraryItemType = "文章" | "课程" | "书籍" | "社区";

export type LibraryItem = {
  id: number;
  title: string;
  type: LibraryItemType;
  tag: string;
  summary: string;
  author: string;
  readTime: string;
  views: number;
};

export type CarePlanStatus = "进行中" | "待开始" | "已完成";

export type CarePlanItem = {
  id: string;
  title: string;
  status: CarePlanStatus;
  accent: "green" | "purple" | "yellow" | "coral" | "teal";
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
