<template>
  <div class="my-psychology-container">
    <!-- 星空背景 -->
    <div class="stars-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="planet planet-1"></div>
      <div class="planet planet-2"></div>
      <div class="comet"></div>
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的心理咨询</h1>
      <p class="page-subtitle">管理您的心理咨询预约和咨询历史</p>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="content-tabs cosmic-tabs">
      <!-- 全部预约 -->
      <el-tab-pane label="全部预约" name="all">
        <div class="tab-content">
          <div class="filter-bar">
            <el-select 
              v-model="allStatusFilter" 
              placeholder="筛选状态" 
              clearable 
              size="default" 
              class="cosmic-select"
              @change="fetchAllAppointments"
            >
              <template #dropdown>
                <div class="cosmic-select-dropdown">
                  <el-option label="全部状态" :value="undefined" />
                  <el-option label="待审核" :value="0" />
                  <el-option label="已确认" :value="1" />
                  <el-option label="已拒绝" :value="2" />
                  <el-option label="进行中" :value="3" />
                  <el-option label="已完成" :value="4" />
                  <el-option label="已取消" :value="5" />
                  <el-option label="待进行" :value="7" />
                  <el-option label="已评价" :value="8" />
                </div>
              </template>
            </el-select>
          </div>
          <div v-loading="loadingAll" class="appointment-list">
            <div v-if="allAppointments.length === 0 && !loadingAll" class="empty-wrapper">
              <el-empty description="暂无预约记录">
                <el-button type="primary" class="cosmic-btn-primary cosmic-btn" @click="goToFindPsychologist">
                  去预约心理师
                </el-button>
              </el-empty>
            </div>

            <div v-else class="appointment-grid">
              <div
                class="appointment-card cosmic-card"
                v-for="item in allAppointments"
                :key="item.id"
              >
                <div class="psychologist-section">
                  <el-avatar :size="64" :src="item.psychologistHeadPath" class="psychologist-avatar cosmic-avatar">
                    <el-icon :size="32"><User /></el-icon>
                  </el-avatar>
                  <div class="psychologist-info">
                    <h3 class="psychologist-name">{{ item.psychologistName }}</h3>
                    <div class="appointment-meta">
                      <span class="meta-item">
                        <el-icon><Calendar /></el-icon>
                        {{ formatDate(item.appointmentTime) }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ getTimeSlotName(item.timeSlot) }}
                      </span>
                    </div>
                  </div>
                  <el-tag class="status-tag" :type="getStatusType(item.status)">
                    {{ getStatusName(item.status) }}
                  </el-tag>
                </div>

                <div class="appointment-details">
                  <div class="detail-row">
                    <span class="detail-label">咨询方式：</span>
                    <span class="detail-value">{{ getServiceTypeName(item.serviceType) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">咨询费用：</span>
                    <span class="detail-value price">¥{{ item.price }}</span>
                  </div>
                </div>

                <div class="action-buttons">
                  <template v-if="item.status === 1 || item.status === 7">
                    <el-button type="primary" class="cosmic-btn-primary cosmic-btn" @click="showConsultationInfo(item)">
                      <el-icon><VideoPlay /></el-icon>
                      进入咨询
                    </el-button>
                    <el-button class="cosmic-btn-secondary cosmic-btn" @click="openChat(item)">
                      <el-icon><ChatDotRound /></el-icon>
                      图文咨询
                    </el-button>
                    <el-button type="danger" class="cosmic-btn-secondary cosmic-btn" @click="cancelAppointment(item)">
                      取消预约
                    </el-button>
                  </template>
                  <template v-else-if="item.status === 0">
                    <el-tag type="warning">等待心理师确认</el-tag>
                    <el-button type="danger" class="cosmic-btn-secondary cosmic-btn" @click="cancelAppointment(item)">
                      取消预约
                    </el-button>
                  </template>
                  <template v-else-if="item.status === 4 && !item.rating">
                    <el-button type="warning" class="cosmic-btn-secondary cosmic-btn" @click="showRatingDialog(item)">
                      <el-icon><Star /></el-icon>
                      立即评价
                    </el-button>
                  </template>
                  <template v-else-if="item.status === 4 && item.rating">
                    <el-tag type="success">已评价</el-tag>
                  </template>
                  <template v-else-if="item.status === 8">
                    <el-tag type="success">已完成</el-tag>
                  </template>
                </div>
              </div>
            </div>

            <div class="pagination-wrapper" v-if="allTotal > 0">
              <el-pagination
                v-model:current-page="allPage"
                :page-size="allSize"
                :total="allTotal"
                layout="prev, pager, next"
                @current-change="fetchAllAppointments"
                class="cosmic-pagination"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 当前预约 -->
      <el-tab-pane label="当前预约" name="current">
        <div class="tab-content">
          <div v-loading="loadingCurrent" class="appointment-list">
            <div v-if="currentAppointments.length === 0 && !loadingCurrent" class="empty-wrapper">
              <el-empty description="暂无进行中的预约">
                <el-button type="primary" class="cosmic-btn-primary cosmic-btn" @click="goToFindPsychologist">
                  去预约心理师
                </el-button>
              </el-empty>
            </div>

            <div v-else class="appointment-grid">
              <div 
                class="appointment-card cosmic-card" 
                v-for="item in currentAppointments" 
                :key="item.id"
              >
                <!-- 心理师信息 -->
                <div class="psychologist-section">
                  <el-avatar :size="64" :src="item.psychologistHeadPath" class="psychologist-avatar cosmic-avatar">
                    <el-icon :size="32"><User /></el-icon>
                  </el-avatar>
                  <div class="psychologist-info">
                    <h3 class="psychologist-name">{{ item.psychologistName }}</h3>
                    <div class="appointment-meta">
                      <span class="meta-item">
                        <el-icon><Calendar /></el-icon>
                        {{ formatDate(item.appointmentTime) }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ getTimeSlotName(item.timeSlot) }}
                      </span>
                    </div>
                  </div>
                  <el-tag class="status-tag" :type="getStatusType(item.status)">
                    {{ getStatusName(item.status) }}
                  </el-tag>
                </div>

                <!-- 预约信息 -->
                <div class="appointment-details">
                  <div class="detail-row">
                    <span class="detail-label">咨询方式：</span>
                    <span class="detail-value">{{ getServiceTypeName(item.serviceType) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">咨询费用：</span>
                    <span class="detail-value price">¥{{ item.price }}</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <template v-if="item.status === 1 || item.status === 7">
                    <!-- 已确认/待进行，显示视频链接 -->
                    <el-button type="primary" class="cosmic-btn-primary cosmic-btn" @click="showConsultationInfo(item)">
                      <el-icon><VideoPlay /></el-icon>
                      进入咨询
                    </el-button>
                    <el-button class="cosmic-btn-secondary cosmic-btn" @click="openChat(item)">
                      <el-icon><ChatDotRound /></el-icon>
                      图文咨询
                    </el-button>
                    <el-button type="danger" class="cosmic-btn-secondary cosmic-btn" @click="cancelAppointment(item)">
                      取消预约
                    </el-button>
                  </template>
                  <template v-else-if="item.status === 0">
                    <el-tag type="warning">等待心理师确认</el-tag>
                    <el-button type="danger" class="cosmic-btn-secondary cosmic-btn" @click="cancelAppointment(item)">
                      取消预约
                    </el-button>
                  </template>
                  <template v-else-if="item.status === 4">
                    <!-- 已完成，待评价 -->
                    <el-button type="warning" class="cosmic-btn-secondary cosmic-btn" @click="showRatingDialog(item)">
                      <el-icon><Star /></el-icon>
                      立即评价
                    </el-button>
                  </template>
                </div>

                <!-- 视频链接 -->
                <div class="video-link" v-if="item.status === 1 && item.videoLink">
                  <el-icon><VideoCamera /></el-icon>
                  <span>会议链接：</span>
                  <el-link :href="item.videoLink" target="_blank" type="primary">
                    {{ item.videoLink }}
                  </el-link>
                </div>

                <!-- 线下地址 -->
                <div class="offline-info" v-if="item.status === 1 && item.serviceType === 'offline'">
                  <el-icon><Location /></el-icon>
                  <span>面询地址：</span>
                  <span>{{ item.offlineAddress || '待定' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 咨询历史 -->
      <el-tab-pane label="咨询历史" name="history">
        <div class="tab-content">
          <div v-loading="loadingHistory" class="history-list">
            <el-empty v-if="consultationHistory.length === 0 && !loadingHistory" description="暂无咨询历史">
              <el-button type="primary" class="cosmic-btn-primary cosmic-btn" @click="goToFindPsychologist">
                去预约心理师
              </el-button>
            </el-empty>

            <el-timeline v-else>
              <el-timeline-item 
                v-for="item in consultationHistory" 
                :key="item.id"
                :timestamp="formatDate(item.appointmentTime)"
                placement="top"
                type="primary"
              >
                <div class="history-card cosmic-card">
                  <div class="history-header">
                    <div class="psychologist-mini">
                      <el-avatar :size="48" :src="item.psychologistHeadPath">
                        <el-icon><User /></el-icon>
                      </el-avatar>
                      <span class="name">{{ item.psychologistName }}</span>
                    </div>
                    <div class="history-meta">
                      <el-tag size="small" :type="getStatusType(item.status)">
                        {{ getStatusName(item.status) }}
                      </el-tag>
                      <span class="service-type">{{ getServiceTypeName(item.serviceType) }}</span>
                    </div>
                  </div>
                  <div class="history-content">
                    <p class="history-problem">{{ item.problems }}</p>
                    <div class="history-rating" v-if="item.rating">
                      <el-rate v-model="item.rating" disabled show-score />
                      <span class="rating-comment">{{ item.ratingComment }}</span>
                    </div>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>

            <div class="pagination-wrapper" v-if="historyTotal > 0">
              <el-pagination
                v-model:current-page="historyPage"
                :page-size="historySize"
                :total="historyTotal"
                layout="prev, pager, next"
                @current-change="fetchHistory"
                class="cosmic-pagination"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 收藏的心理咨询师 -->
      <el-tab-pane label="收藏的心理咨询师" name="favorites">
        <div class="tab-content">
          <div v-loading="loadingFavorites" class="favorites-list">
            <el-empty v-if="favoritePsychologists.length === 0 && !loadingFavorites" description="暂无收藏的心理咨询师">
              <el-button type="primary" class="cosmic-btn-primary cosmic-btn" @click="goToFindPsychologist">
                去发现心理师
              </el-button>
            </el-empty>

            <div v-else class="psychologist-grid">
              <div 
                class="psychologist-card cosmic-card"
                v-for="item in favoritePsychologists"
                :key="item.id"
                @click="goToPsychologistDetail(item.psychologistId)"
              >
                <div class="card-header">
                  <el-avatar :size="72" :src="item.psychologistHead" class="psychologist-avatar cosmic-avatar">
                    <el-icon :size="36"><User /></el-icon>
                  </el-avatar>
                  <div class="online-indicator" :class="{ online: item.onlineStatus === 1 }">
                    {{ item.onlineStatus === 1 ? '在线' : '离线' }}
                  </div>
                </div>
                <h3 class="psychologist-name">{{ item.psychologistName }}</h3>
                <div class="psychologist-rating">
                  <el-rate v-model="item.ratingScore" disabled show-score size="small" />
                </div>
                <p class="psychologist-experience">{{ item.yearsExperience || 0 }}年经验 | {{ item.consultationCount || 0 }}次咨询</p>
                <div class="psychologist-tags">
                  <span v-for="field in item.fields?.slice(0, 2)" :key="field.id" class="mini-tag cosmic-tag">
                    {{ field.name }}
                  </span>
                </div>
                <div class="card-actions">
                  <el-button class="book-again-btn cosmic-btn-primary cosmic-btn" @click.stop="bookAgain(item)">
                    再次预约
                  </el-button>
                  <el-button class="unfavorite-btn cosmic-btn-secondary cosmic-btn" @click.stop="unfavorite(item)">
                    <el-icon><Star /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 图文咨询 -->
      <el-tab-pane label="图文咨询" name="chat">
        <div class="tab-content">
          <div class="chat-list-wrapper">
            <div v-if="chatAppointments.length === 0" class="empty-chat">
              <el-empty description="暂无图文咨询">
                <el-button type="primary" class="cosmic-btn-primary cosmic-btn" @click="goToFindPsychologist">
                  去预约心理师
                </el-button>
              </el-empty>
            </div>
            <div v-else class="chat-list-grid">
              <div 
                class="chat-card cosmic-card"
                v-for="item in chatAppointments"
                :key="item.id"
              >
                <div class="chat-card-header">
                  <el-avatar :size="56" :src="item.psychologistHeadPath" class="psy-avatar">
                    <el-icon :size="28"><User /></el-icon>
                  </el-avatar>
                  <div class="psy-info">
                    <h4 class="psy-name">{{ item.psychologistName }}</h4>
                    <span class="service-badge">{{ getServiceTypeName(item.serviceType) }}</span>
                  </div>
                </div>
                <div class="chat-card-body">
                  <p class="problem-preview" v-if="item.problems || item.userProblems">
                    {{ (item.problems || item.userProblems || '').substring(0, 50) }}...
                  </p>
                  <p class="problem-preview" v-else>
                    点击下方按钮开始与心理咨询师对话
                  </p>
                </div>
                <div class="chat-card-footer">
                  <el-button 
                    type="primary" 
                    class="cosmic-btn-primary cosmic-btn start-chat-btn"
                    @click="openChat(item)"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    开始聊天
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 评价对话框 -->
    <el-dialog 
      v-model="ratingDialogVisible" 
      title="评价咨询" 
      width="500px" 
      class="cosmic-dialog"
    >
      <div class="rating-form" v-if="ratingAppointment">
        <div class="rating-psychologist">
          <el-avatar :size="60" :src="ratingAppointment.psychologistHeadPath">
            <el-icon :size="30"><User /></el-icon>
          </el-avatar>
          <div class="psychologist-info">
            <h4>{{ ratingAppointment.psychologistName }}</h4>
            <p>{{ formatDate(ratingAppointment.appointmentTime) }}</p>
          </div>
        </div>

        <el-form label-position="top">
          <el-form-item label="评分">
            <el-rate v-model="ratingForm.rating" show-text>
              <template #text-choices>
                <span>非常不满意</span>
                <span>不满意</span>
                <span>一般</span>
                <span>满意</span>
                <span>非常满意</span>
              </template>
            </el-rate>
          </el-form-item>
          <el-form-item label="评价内容">
            <el-input 
              v-model="ratingForm.comment" 
              type="textarea" 
              :rows="4"
              placeholder="分享您的咨询体验..."
              class="cosmic-textarea"
            />
          </el-form-item>
          <el-form-item label="匿名评价">
            <el-switch v-model="ratingForm.isAnonymous" :active-value="1" :inactive-value="0" />
            <span class="anonymous-hint">（匿名后咨询师将看不到您的昵称）</span>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="ratingDialogVisible = false" class="cosmic-btn-secondary cosmic-btn">取消</el-button>
        <el-button type="primary" @click="submitRating" class="cosmic-btn-primary cosmic-btn" :loading="submittingRating">
          提交评价
        </el-button>
      </template>
    </el-dialog>

    <!-- 进入咨询对话框 -->
    <el-dialog
      v-model="consultationDialogVisible"
      title="进入咨询"
      width="500px"
      class="cosmic-dialog"
    >
      <div class="consultation-info" v-if="currentConsultation">
        <div class="consultation-psychologist">
          <el-avatar :size="60" :src="currentConsultation.psychologistHeadPath">
            <el-icon :size="30"><User /></el-icon>
          </el-avatar>
          <div class="psychologist-info">
            <h4>{{ currentConsultation.psychologistName }}</h4>
            <p>{{ getServiceTypeName(currentConsultation.serviceType) }}</p>
          </div>
        </div>

        <div class="consultation-details">
          <div class="detail-row">
            <span class="detail-label">预约时间</span>
            <span class="detail-value">{{ formatDate(currentConsultation.appointmentTime) }} {{ getTimeSlotName(currentConsultation.timeSlot) }}</span>
          </div>
          <div class="detail-row" v-if="currentConsultation.startTime">
            <span class="detail-label">开始时间</span>
            <span class="detail-value">{{ currentConsultation.startTime }}</span>
          </div>
          <div class="detail-row" v-if="currentConsultation.endTime">
            <span class="detail-label">结束时间</span>
            <span class="detail-value">{{ currentConsultation.endTime }}</span>
          </div>
          <div class="detail-row" v-if="currentConsultation.videoLink">
            <span class="detail-label">视频会议链接</span>
            <span class="detail-value video-link-text">{{ currentConsultation.videoLink }}</span>
          </div>
          <div class="detail-row" v-if="currentConsultation.serviceType === 'offline' && currentConsultation.offlineAddress">
            <span class="detail-label">面询地址</span>
            <span class="detail-value">{{ currentConsultation.offlineAddress }}</span>
          </div>
        </div>

        <div class="consultation-tip" v-if="currentConsultation.videoLink">
          <el-icon><InfoFilled /></el-icon>
          <span>点击下方按钮打开视频会议</span>
        </div>
        <div class="consultation-tip warning" v-else>
          <el-icon><Warning /></el-icon>
          <span>心理师暂未提供视频链接，请耐心等待或使用图文咨询</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="consultationDialogVisible = false" class="cosmic-btn-secondary cosmic-btn">关闭</el-button>
        <el-button
          v-if="currentConsultation?.videoLink"
          type="primary"
          @click="openVideoLink"
          class="cosmic-btn-primary cosmic-btn"
        >
          <el-icon><VideoPlay /></el-icon>
          打开视频会议
        </el-button>
      </template>
    </el-dialog>

    <!-- 取消预约对话框 -->
    <el-dialog
      v-model="cancelDialogVisible"
      title="取消预约"
      width="450px"
      class="cosmic-dialog"
    >
      <div class="cancel-dialog-content" v-if="cancelTarget">
        <div class="cancel-header">
          <div class="cancel-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <h3>确定要取消预约吗？</h3>
          <p class="cancel-subtitle">请填写取消原因</p>
        </div>

        <div class="cancel-info">
          <div class="info-row">
            <span class="info-label">心理咨询师</span>
            <span class="info-value">{{ cancelTarget.psychologistName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">预约时间</span>
            <span class="info-value">{{ formatDate(cancelTarget.appointmentTime) }} {{ getTimeSlotName(cancelTarget.timeSlot) }}</span>
          </div>
        </div>

        <el-form label-position="top">
          <el-form-item label="取消原因" required>
            <el-input
              v-model="cancelReason"
              type="textarea"
              :rows="3"
              placeholder="请输入取消原因，以便心理师了解情况..."
              class="cosmic-textarea"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="cancelDialogVisible = false" class="cosmic-btn-secondary cosmic-btn">返回</el-button>
        <el-button type="danger" @click="confirmCancelAppointment" class="cosmic-btn-danger cosmic-btn" :loading="cancelLoading">
          确认取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, Calendar, Clock, VideoPlay, VideoCamera, ChatDotRound,
  Star, Location, InfoFilled, Warning
} from '@element-plus/icons-vue'
import {
  getCurrentAppointments,
  getConsultationHistory,
  getFavoritePsychologists,
  getAllMyAppointments,
  cancelAppointment as apiCancelAppointment,
  rateAppointment,
  toggleFavorite,
} from '@/api/psychologist'

const router = useRouter()

// 状态
const activeTab = ref('all')
const loadingAll = ref(false)
const loadingCurrent = ref(false)
const loadingHistory = ref(false)
const loadingFavorites = ref(false)

// 数据
const allAppointments = ref<any[]>([])
const currentAppointments = ref<any[]>([])
const consultationHistory = ref<any[]>([])
const favoritePsychologists = ref<any[]>([])
const chatAppointments = ref<any[]>([])
const activeChat = ref<any>(null)
const chatMessages = ref<any[]>([])
const messageInput = ref('')
const messagesContainer = ref<any>(null)

// 全部预约分页和筛选
const allPage = ref(1)
const allSize = ref(10)
const allTotal = ref(0)
const allStatusFilter = ref<number | undefined>(undefined)
const historyTotal = ref(0)

// 评价
const ratingDialogVisible = ref(false)
const ratingAppointment = ref<any>(null)
const submittingRating = ref(false)
const ratingForm = reactive({
  rating: 5,
  comment: '',
  isAnonymous: 0
})

// 进入咨询弹窗
const consultationDialogVisible = ref(false)
const currentConsultation = ref<any>(null)

// 取消预约对话框
const cancelDialogVisible = ref(false)
const cancelTarget = ref<any>(null)
const cancelReason = ref('')
const cancelLoading = ref(false)

// 服务类型映射
const serviceTypeMap: Record<string, string> = {
  text: '图文咨询',
  video: '视频咨询',
  voice: '语音咨询',
  offline: '线下面询'
}

const getServiceTypeName = (type: string) => serviceTypeMap[type] || type

// 时间段
const timeSlotMap: Record<string, string> = {
  MORNING: '上午',
  AFTERNOON: '下午',
  EVENING: '晚上',
  morning: '上午',
  afternoon: '下午',
  evening: '晚上'
}

const getTimeSlotName = (slot: string) => timeSlotMap[slot] || slot

// 状态
const statusMap: Record<number, string> = {
  0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 7: '待进行', 8: '已评价'
}

const getStatusName = (status: number) => statusMap[status] || '未知'

const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning', 1: 'success', 2: 'danger', 3: 'primary', 4: 'info', 5: 'info', 6: 'danger', 7: 'warning', 8: 'success'
  }
  return types[status] || 'info'
}

// 格式化
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getFullYear()}年`
}

// 获取全部预约
const fetchAllAppointments = async () => {
  loadingAll.value = true
  try {
    const res: any = await getAllMyAppointments({
      page: allPage.value,
      size: allSize.value,
      status: allStatusFilter.value
    })
    if (res.code === 200) {
      allAppointments.value = res.data?.records || []
      allTotal.value = res.data?.total || 0
    }
  } catch (e) {
    console.error('获取全部预约失败', e)
  } finally {
    loadingAll.value = false
  }
}

// 获取当前预约
const fetchCurrentAppointments = async () => {
  loadingCurrent.value = true
  try {
    const res: any = await getCurrentAppointments()
    if (res.code === 200) {
      currentAppointments.value = res.data || []
      // 所有进行中的预约都可以用于图文咨询
      chatAppointments.value = currentAppointments.value
    }
  } catch (e) {
    console.error('获取当前预约失败', e)
  } finally {
    loadingCurrent.value = false
  }
}

// 获取咨询历史（已完成、已评价的预约）
const fetchHistory = async () => {
  loadingHistory.value = true
  try {
    const res: any = await getConsultationHistory()
    if (res.code === 200) {
      consultationHistory.value = res.data || []
      historyTotal.value = res.data?.length || 0
    }
  } catch (e) {
    console.error('获取咨询历史失败', e)
  } finally {
    loadingHistory.value = false
  }
}

// 获取收藏的心理咨询师
const fetchFavorites = async () => {
  loadingFavorites.value = true
  try {
    const res: any = await getFavoritePsychologists()
    if (res.code === 200) {
      favoritePsychologists.value = res.data || []
    }
  } catch (e) {
    console.error('获取收藏失败', e)
  } finally {
    loadingFavorites.value = false
  }
}

// 取消预约 - 打开取消对话框
const cancelAppointment = (item: any) => {
  cancelTarget.value = item
  cancelReason.value = ''
  cancelDialogVisible.value = true
}

// 确认取消预约
const confirmCancelAppointment = async () => {
  if (!cancelReason.value.trim()) {
    ElMessage.warning('请输入取消原因')
    return
  }
  cancelLoading.value = true
  try {
    const res: any = await apiCancelAppointment({ appointmentId: cancelTarget.value.id, cancelReason: cancelReason.value })
    if (res.code === 200) {
      ElMessage.success('取消成功')
      cancelDialogVisible.value = false
      fetchCurrentAppointments()
      fetchAllAppointments()
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '取消失败')
  } finally {
    cancelLoading.value = false
  }
}

// 进入咨询 - 显示信息弹窗
const showConsultationInfo = (item: any) => {
  currentConsultation.value = item
  consultationDialogVisible.value = true
}

// 打开视频链接
const openVideoLink = () => {
  if (currentConsultation.value?.videoLink) {
    window.open(currentConsultation.value.videoLink, '_blank')
    consultationDialogVisible.value = false
  }
}

// 打开聊天
const openChat = (item: any) => {
  router.push(`/user-chat/${item.id}`)
}

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || !activeChat.value) return

  const content = messageInput.value
  messageInput.value = ''

  try {
    // TODO: 实现发送消息功能
    chatMessages.value.push({
      id: Date.now(),
      content: content,
      isSelf: true,
      createTime: new Date().toISOString()
    })
    nextTick(() => scrollToBottom())
  } catch (e) {
    console.error('发送消息失败', e)
    messageInput.value = content
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 评价
const showRatingDialog = (item: any) => {
  ratingAppointment.value = item
  ratingForm.rating = 5
  ratingForm.comment = ''
  ratingForm.isAnonymous = 0
  ratingDialogVisible.value = true
}

const submitRating = async () => {
  if (ratingForm.rating < 1) {
    ElMessage.warning('请选择评分')
    return
  }
  submittingRating.value = true
  try {
    const res: any = await rateAppointment({
      appointmentId: ratingAppointment.value.id,
      rating: ratingForm.rating,
      comment: ratingForm.comment,
      isAnonymous: ratingForm.isAnonymous
    })
    if (res.code === 200) {
      ElMessage.success('评价成功')
      ratingDialogVisible.value = false
      fetchCurrentAppointments()
    } else {
      ElMessage.error(res.message || '评价失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '评价失败')
  } finally {
    submittingRating.value = false
  }
}

// 取消收藏
const unfavorite = async (item: any) => {
  try {
    const res: any = await toggleFavorite(item.psychologistId)
    if (res.code === 200) {
      ElMessage.success('取消收藏')
      fetchFavorites()
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 再次预约
const bookAgain = (item: any) => {
  router.push(`/consultation/psychologist/${item.psychologistId}`)
}

// 跳转
const goToFindPsychologist = () => {
  router.push('/consultation/psychologist')
}

const goToPsychologistDetail = (id: number) => {
  router.push(`/consultation/psychologist/${id}`)
}

onMounted(() => {
  fetchAllAppointments()
  fetchCurrentAppointments()
  fetchHistory()
  fetchFavorites()
})
</script>

<style scoped>
.my-psychology-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
}

/* 星空背景 */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(to bottom, #0a0a2a, #1a1a4a, #2a2a6a);
  overflow: hidden;
}

.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars:before, .stars:after,
.stars2:before, .stars2:after,
.stars3:before, .stars3:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars:before {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 100px 100px;
  animation: starsMove 200s linear infinite;
}

.stars:after {
  background-image: radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 150px 150px;
  animation: starsMove 150s linear infinite;
}

.stars2:before {
  background-image: radial-gradient(1px 1px at 90px 120px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: starsMove 100s linear infinite;
}

.stars3:before {
  background-image: radial-gradient(3px 3px at 150px 200px, #ddd, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 300px 300px;
  animation: starsMove 250s linear infinite;
}

@keyframes starsMove {
  from { transform: translateY(0px) }
  to { transform: translateY(-2000px) }
}

.planet {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  opacity: 0.7;
  z-index: 0;
}

.planet-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 5%;
  background: radial-gradient(circle at 30% 30%, #ff9a9e, #fad0c4);
  box-shadow: 0 0 40px rgba(255, 154, 158, 0.5);
  animation: float 25s infinite ease-in-out;
}

.planet-2 {
  width: 80px;
  height: 80px;
  bottom: 15%;
  left: 3%;
  background: radial-gradient(circle at 30% 30%, #a1c4fd, #c2e9fb);
  box-shadow: 0 0 50px rgba(161, 196, 253, 0.5);
  animation: float 30s infinite ease-in-out reverse;
}

.comet {
  position: absolute;
  top: 15%;
  left: -50px;
  width: 150px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  animation: cometMove 20s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes cometMove {
  0% { transform: translateX(-100px) translateY(-100px) rotate(45deg); }
  100% { transform: translateX(calc(100vw + 100px)) translateY(calc(100vh + 100px)) rotate(45deg); }
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #fff 0%, #87ceeb 50%, #dda0dd 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* 标签页 */
.content-tabs {
  position: relative;
  z-index: 1;
}

/* 当前预约卡片 */
.appointment-grid {
  display: grid;
  gap: 20px;
}

.appointment-card {
  padding: 24px;
}

.psychologist-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.psychologist-info {
  flex: 1;
}

.psychologist-name {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.appointment-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.status-tag {
  font-weight: 600;
}

.appointment-details {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.detail-label {
  color: rgba(255, 255, 255, 0.6);
}

.detail-value {
  color: #fff;
}

.detail-value.price {
  color: #ffd700;
  font-weight: 600;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.video-link, .offline-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 16px;
  background: rgba(135, 206, 235, 0.1);
  border: 1px solid rgba(135, 206, 235, 0.3);
  border-radius: 10px;
  font-size: 14px;
  color: #87ceeb;
}

/* 咨询历史 */
.history-card {
  padding: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.psychologist-mini {
  display: flex;
  align-items: center;
  gap: 12px;
}

.psychologist-mini .name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.history-problem {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px;
  line-height: 1.5;
}

.history-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-comment {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* 收藏的心理咨询师 */
.psychologist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.psychologist-card {
  padding: 24px;
  text-align: center;
  cursor: pointer;
}

.psychologist-card .card-header {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  background: rgba(100, 100, 100, 0.8);
  color: #fff;
}

.online-indicator.online {
  background: linear-gradient(135deg, #4ade80, #22c55e);
}

.psychologist-card .psychologist-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.psychologist-experience {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px;
}

.psychologist-tags {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
}

.mini-tag {
  font-size: 11px;
  padding: 3px 8px;
}

.card-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.book-again-btn {
  flex: 1;
}

.unfavorite-btn {
  padding: 8px 12px;
}

/* 图文咨询 */
.chat-container {
  min-height: 500px;
}

.chat-list {
  min-height: 400px;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.chat-list-items {
  display: grid;
  gap: 12px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
}

.chat-info {
  flex: 1;
}

.chat-info h4 {
  color: #fff;
  margin: 0 0 4px;
  font-size: 16px;
}

.last-message {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.chat-window {
  height: 600px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-psychologist {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-weight: 600;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border-top-left-radius: 4px;
}

.message-item.self .message-bubble {
  background: rgba(135, 206, 235, 0.3);
  border-top-left-radius: 16px;
  border-top-right-radius: 4px;
}

.message-content {
  color: #fff;
  margin: 0;
  line-height: 1.5;
}

.message-time {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.message-input {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 评价表单 */
.rating-form {
  padding: 10px 0;
}

/* 进入咨询弹窗样式 */
.cosmic-dialog .consultation-info {
  padding: 10px 0;
}

.cosmic-dialog .consultation-psychologist {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 20px;
}

.cosmic-dialog .consultation-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.cosmic-dialog .consultation-details .detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cosmic-dialog .consultation-details .detail-row:last-child {
  border-bottom: none;
}

.cosmic-dialog .consultation-details .detail-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.cosmic-dialog .consultation-details .detail-value {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  max-width: 60%;
  word-break: break-all;
}

.cosmic-dialog .consultation-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 10px;
  font-size: 13px;
  color: rgba(135, 206, 235, 0.9);
}

.cosmic-dialog .consultation-tip.warning {
  background: rgba(230, 162, 60, 0.1);
  color: rgba(230, 162, 60, 0.9);
}

.rating-psychologist {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 24px;
}

.psychologist-info h4 {
  color: #fff;
  margin: 0 0 4px;
}

.psychologist-info p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 13px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 图文咨询卡片样式 */
.chat-list-wrapper {
  min-height: 400px;
}

.chat-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.chat-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.psy-info {
  flex: 1;
}

.psy-name {
  color: #fff;
  margin: 0 0 4px;
  font-size: 16px;
}

.service-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(135, 206, 235, 0.2);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(135, 206, 235, 0.9);
}

.chat-card-body {
  flex: 1;
}

.problem-preview {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin: 0;
  line-height: 1.5;
}

.chat-card-footer {
  display: flex;
  justify-content: center;
}

.start-chat-btn {
  width: 100%;
}

/* 响应式 */
@media (max-width: 992px) {
  .psychologist-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chat-list-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .my-psychology-container {
    padding: 24px 16px;
  }

  .psychologist-grid {
    grid-template-columns: 1fr;
  }

  .chat-list-grid {
    grid-template-columns: 1fr;
  }

  .chat-window {
    height: 500px;
  }
}

/* 取消预约对话框样式 */
.cancel-dialog-content {
  padding: 10px 0;
}

.cancel-header {
  text-align: center;
  margin-bottom: 20px;
}

.cancel-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.2), rgba(245, 108, 108, 0.1));
  border: 2px solid #f56c6c;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #f56c6c;
  font-size: 28px;
}

.cancel-header h3 {
  color: #fff;
  margin: 0 0 8px;
  font-size: 18px;
}

.cancel-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 14px;
}

.cancel-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.cancel-info .info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-info .info-row:last-child {
  border-bottom: none;
}

.cancel-info .info-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.cancel-info .info-value {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

/* 危险按钮样式 */
.cosmic-btn-danger {
  background: linear-gradient(135deg, #f56c6c 0%, #e64242 100%) !important;
  border: none !important;
  color: #fff !important;
}

.cosmic-btn-danger:hover {
  background: linear-gradient(135deg, #e64242 0%, #d63232 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

/* 星空特效下拉框 */
.cosmic-select {
  min-width: 160px;
}

.cosmic-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  transition: all 0.3s ease;
}

.cosmic-select :deep(.el-input__wrapper:hover) {
  border-color: rgba(167, 139, 250, 0.6) !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

.cosmic-select :deep(.el-input__wrapper.is-focus) {
  border-color: #a78bfa !important;
  background: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2) !important;
}

.cosmic-select :deep(.el-input__inner) {
  color: #ffffff !important;
  font-size: 14px;
}

.cosmic-select :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

.cosmic-select :deep(.el-select__caret) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.cosmic-select-dropdown {
  background: rgba(15, 15, 50, 0.98) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 8px;
  overflow: hidden;
}

.cosmic-select-dropdown :deep(.el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  margin: 2px 0;
  padding: 10px 16px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.cosmic-select-dropdown :deep(.el-select-dropdown__item:hover),
.cosmic-select-dropdown :deep(.el-select-dropdown__item.hover) {
  background: rgba(167, 139, 250, 0.2) !important;
  color: #ffffff;
}

.cosmic-select-dropdown :deep(.el-select-dropdown__item.selected) {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(129, 140, 248, 0.3)) !important;
  color: #ffffff;
  font-weight: 600;
}

.cosmic-select-dropdown :deep(.el-select-dropdown__item.is-disabled) {
  color: rgba(255, 255, 255, 0.3);
}

/* 下拉箭头图标 */
.cosmic-select :deep(.el-icon-arrow-up::before) {
  content: '▼' !important;
  font-size: 10px;
}
</style>
