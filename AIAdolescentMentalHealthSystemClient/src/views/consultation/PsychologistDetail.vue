<template>
  <div class="psychologist-detail-container">
    <!-- 星空背景 -->
    <div class="stars-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="planet planet-1"></div>
      <div class="planet planet-2"></div>
      <div class="comet"></div>
    </div>

    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button link @click="goBack" class="back-btn" >
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <div v-loading="loading" class="detail-content">
      <!-- 心理师信息卡片 -->
      <div class="info-card cosmic-card" v-if="psychologist">
        <!-- 头部信息 -->
        <div class="info-header">
          <div class="avatar-section">
            <el-avatar :size="130" :src="psychologist.headPath" class="psychologist-avatar cosmic-avatar">
              <el-icon :size="60"><User /></el-icon>
            </el-avatar>
            <div class="online-indicator" :class="{ online: psychologist.onlineStatus === 1 }">
              {{ psychologist.onlineStatus === 1 ? '在线' : '离线' }}
            </div>
          </div>
          
          <div class="basic-info">
            <div class="name-row">
              <h1 class="psychologist-name">{{ psychologist.realName }}</h1>
              <div class="status-badges">
                <span v-if="psychologist.auditStatus === 3" class="verified-badge">
                  <el-icon><CircleCheck /></el-icon>
                  已认证
                </span>
                <span v-if="psychologist.status === 1" class="active-badge">
                  正常接单
                </span>
              </div>
            </div>
            
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-value">{{ psychologist.yearsExperience }}</span>
                <span class="stat-label">年经验</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ psychologist.consultationCount }}</span>
                <span class="stat-label">咨询次数</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ psychologist.ratingScore }}</span>
                <span class="stat-label">评分</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ psychologist.ratingCount }}</span>
                <span class="stat-label">评价数</span>
              </div>
            </div>

            <div class="tags-row">
              <el-tag class="field-tag" v-for="field in psychologist.fields" :key="field.id">
                {{ field.name }}
              </el-tag>
              <el-tag class="qualification-tag" v-for="q in psychologist.qualifications" :key="q.id" type="warning">
                <el-icon><Medal /></el-icon>
                {{ q.name }}
              </el-tag>
            </div>

            <div class="language-row" v-if="psychologist.languages">
              <span class="language-label">语言能力：</span>
              <el-tag size="large" class="language-tag" v-for="lang in parseJsonArray(psychologist.languages)" :key="lang">
                {{ lang }}
              </el-tag>
            </div>

            <!-- 线下咨询地址 -->
            <div class="offline-info" v-if="psychologist.offlineRegion || psychologist.offlineAddress">
              <div class="offline-location">
                <el-icon><Location /></el-icon>
                <span class="offline-label">线下面询地址</span>
              </div>
              <div class="offline-address-detail">
                <span class="region">{{ psychologist.offlineRegion }}</span>
                <span class="address">{{ psychologist.offlineAddress }}</span>
              </div>
            </div>
          </div>

          <div class="action-section">
            <el-button 
              :icon="isFavorite ? Star : 'Star'" 
              :type="isFavorite ? 'warning' : 'default'"
              class="favorite-btn"
              @click="toggleFavorite"
            >
              {{ isFavorite ? '已收藏' : '收藏' }}
            </el-button>
            <el-button 
              type="primary" 
              class="book-now-btn cosmic-btn-primary cosmic-btn"
              @click="scrollToSchedule"
            >
              立即预约
            </el-button>
          </div>
        </div>

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="detail-tabs cosmic-tabs">
          <!-- 个人简介 -->
          <el-tab-pane label="个人简介" name="intro">
            <div class="intro-content">
              <div class="intro-section" v-if="psychologist.introduction">
                <h3 class="section-title">个人介绍</h3>
                <p class="intro-text">{{ psychologist.introduction }}</p>
              </div>

              <div class="intro-section" v-if="psychologist.educationBackground">
                <h3 class="section-title">教育背景</h3>
                <p class="intro-text">{{ psychologist.educationBackground }}</p>
              </div>

              <div class="intro-section" v-if="psychologist.trainingExperience">
                <h3 class="section-title">受训经历</h3>
                <p class="intro-text">{{ psychologist.trainingExperience }}</p>
              </div>

              <div class="intro-section" v-if="psychologist.certifications">
                <h3 class="section-title">专业认证</h3>
                <div class="certifications-list">
                  <div class="cert-item" v-for="cert in parseJsonArray(psychologist.certifications)" :key="cert">
                    <el-icon><CircleCheck /></el-icon>
                    {{ cert }}
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 擅长领域 -->
          <el-tab-pane label="擅长领域" name="fields">
            <div class="fields-content">
              <div class="field-grid">
                <div class="field-card cosmic-card" v-for="field in psychologist.fields" :key="field.id">
                  <div class="field-icon" v-html="getFieldIcon(field.icon)"></div>
                  <h4 class="field-name">{{ field.name || field.fieldName || '未知领域' }}</h4>
                </div>
              </div>
              <p v-if="!psychologist.fields?.length" class="empty-text">暂无擅长领域信息</p>
            </div>
          </el-tab-pane>

          <!-- 服务与价格 -->
          <el-tab-pane label="服务与价格" name="services">
            <div class="services-content">
              <div class="service-cards">
                <div
                  class="service-card cosmic-card"
                  :class="{ selected: selectedService?.id === service.id, 'service-disabled': service.disabled }"
                  v-for="service in displayedServices"
                  :key="service.id"
                  @click="selectService(service)"
                >
                  <div class="service-info">
                    <h4 class="service-name">{{ service.displayName }}</h4>
                    <p class="service-desc" v-if="service.description">{{ service.description }}</p>
                    <el-tag v-if="service.disabled" type="info" size="small">暂不支持</el-tag>
                  </div>
                  <div class="service-price">
                    <span class="price-currency">¥</span>
                    <span class="price-amount">{{ formatPrice(service) }}</span>
                    <span class="price-unit">/次</span>
                  </div>
                  <div class="select-indicator" v-if="selectedService?.id === service.id && !service.disabled">
                    <el-icon><Check /></el-icon>
                  </div>
                </div>
              </div>
              <div v-if="!displayedServices || displayedServices.length === 0" class="no-services">
                <p>暂无可预约服务</p>
              </div>
            </div>
          </el-tab-pane>

          <!-- 排班预约 -->
          <el-tab-pane label="预约咨询" name="schedule">
            <div class="schedule-content" v-loading="schedulesLoading">
              <div class="schedule-header">
                <h3 class="section-title">选择预约时间</h3>
                <span class="current-month">{{ currentMonthLabel }}</span>
              </div>

              <!-- 近7天视图 -->
              <div class="week-view">
                <div class="week-header">
                  <div class="week-day" v-for="day in scheduleDays" :key="day.toISOString()">
                    <span class="day-week">{{ getWeekDayName(day) }}</span>
                    <span class="day-date">{{ day.getDate() }}</span>
                  </div>
                </div>
                <div class="week-grid">
                  <div
                    v-for="day in scheduleDays"
                    :key="day.toISOString()"
                    class="day-cell"
                    :class="{
                      disabled: isPastDay(day),
                      today: isToday(day),
                      'has-available': hasAvailableSlot(day)
                    }"
                    @click="!isPastDay(day) && handleDayClick(day)"
                  >
                    <div class="day-slots" v-if="getDaySlots(day).length > 0">
                      <div
                        v-for="slot in getDaySlots(day).filter(s => s.status === 0).slice(0, 3)"
                        :key="slot.timeSlot"
                        class="slot-indicator"
                      >
                        <span class="slot-dot" :class="getSlotStatusClass(slot)"></span>
                        <span class="slot-label">{{ getTimeSlotLabel(slot.timeSlot) }}</span>
                      </div>
                    </div>
                    <div class="no-slots" v-else>
                      <span>暂无</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 提示信息 -->
              <div class="schedule-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>点击日期选择可预约时段</span>
              </div>

              <!-- 预约确认 -->
              <div class="booking-confirm" v-if="selectedSlot">
                <div class="confirm-info">
                  <h4>已选择</h4>
                  <p>{{ formatSelectedDate }} {{ getTimeSlotLabel(selectedSlot.timeSlot) }}</p>
                  <p class="confirm-price">
                    {{ selectedService?.displayName }}：¥{{ formatPrice(selectedService) }}
                  </p>
                </div>
                <el-button type="primary" size="large" class="confirm-btn cosmic-btn-primary cosmic-btn" @click="showBookingForm">
                  立即预约
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <!-- 用户评价 -->
          <el-tab-pane label="用户评价" name="reviews">
            <div class="reviews-content">
              <div class="reviews-summary">
                <div class="summary-score">
                  <span class="big-score">{{ psychologist.ratingScore }}</span>
                  <el-rate v-model="psychologist.ratingScore" disabled show-score size="large" />
                  <span class="review-count">{{ psychologist.ratingCount }}条评价</span>
                </div>
              </div>

              <div class="reviews-list" v-if="reviews.length > 0">
                <div class="review-item cosmic-card" v-for="review in reviews" :key="review.id">
                  <div class="review-header">
                    <el-avatar :size="40" :src="review.userAvatar">{{ review.userName?.charAt(0) }}</el-avatar>
                    <div class="review-user">
                      <span class="user-name">{{ review.userName }}</span>
                      <el-rate v-model="review.rating" disabled size="small" />
                    </div>
                    <span class="review-date">{{ formatDate(review.createTime) }}</span>
                  </div>
                  <p class="review-content">{{ review.comment }}</p>
                </div>
              </div>
              <el-empty v-else description="暂无评价" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 预约表单对话框 -->
    <el-dialog 
      v-model="bookingFormVisible"
      title="填写预约信息"
      width="600px"
      class="cosmic-dialog booking-dialog"
    >
      <div class="booking-modal-content">
        <!-- 顶部：服务信息 -->
        <div class="booking-service-info">
          <div class="service-badge">
            <span class="service-icon">
              <el-icon v-if="selectedService?.serviceType === 'offline'"><OfficeBuilding /></el-icon>
              <el-icon v-else><VideoCamera /></el-icon>
            </span>
            <span class="service-name">{{ selectedService?.displayName }}</span>
          </div>
          <div class="service-price-display">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ formatPrice(selectedService) }}</span>
          </div>
        </div>

        <!-- 中间：预约时间 -->
        <div class="booking-time-info">
          <div class="time-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="time-details">
            <span class="date-text">{{ formatSelectedDate }}</span>
            <span class="slot-text">{{ getTimeSlotLabel(selectedSlot?.timeSlot || '') }}</span>
          </div>
        </div>

        <!-- 线下咨询显示地址 -->
        <div class="offline-address-card" v-if="selectedService?.serviceType === 'offline'">
          <div class="address-icon">
            <el-icon><Location /></el-icon>
          </div>
          <div class="address-text">
            <span class="address-label">面询地址</span>
            <span class="address-value">{{ psychologist?.offlineRegion }} {{ psychologist?.offlineAddress }}</span>
          </div>
        </div>

        <!-- 表单内容 -->
        <el-form label-position="top" class="booking-form cosmic-form">
          <el-form-item label="主要问题" required>
            <el-input
              v-model="bookingForm.problems"
              type="textarea"
              :rows="3"
              placeholder="请详细描述您想解决的问题，以便心理师更好地帮助您..."
              class="cosmic-textarea"
            />
          </el-form-item>

          <el-form-item label="个人情况" v-if="selectedService?.serviceType !== 'offline'">
            <el-input
              v-model="bookingForm.personalSituation"
              type="textarea"
              :rows="2"
              placeholder="简单描述您的个人情况（可选）..."
              class="cosmic-textarea"
            />
          </el-form-item>
        </el-form>

        <!-- 提示信息 -->
        <div class="booking-notice">
          <el-icon><InfoFilled /></el-icon>
          <p>预约成功后，费用将从您的虚拟账户扣除。心理师接受预约后，会收到通知并可填写视频会议链接。</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="bookingFormVisible = false" class="cosmic-btn-secondary cosmic-btn">取消</el-button>
        <el-button type="primary" @click="submitBooking" class="cosmic-btn-primary cosmic-btn" :loading="submitting">
          确认预约（¥{{ formatPrice(selectedService) }}）
        </el-button>
      </template>
    </el-dialog>

    <!-- 时段选择弹窗 -->
    <el-dialog
      v-model="timeSlotDialogVisible"
      title="选择预约时段"
      width="500px"
      class="cosmic-dialog time-slot-dialog"
      :show-close="false"
    >
      <div class="time-slot-modal">
        <!-- 日期显示 -->
        <div class="selected-date-display">
          <span class="date-icon"><el-icon><Calendar /></el-icon></span>
          <span class="date-text">{{ formatSelectedDate }}</span>
        </div>

        <!-- 时段选择 -->
        <div class="time-slots-container">
          <div
            v-for="period in timeSlotPeriods"
            :key="period.key"
            class="time-period-section"
          >
            <div class="period-header">
              <span class="period-icon">
                <el-icon v-if="period.key === 'morning'"><Sunrise /></el-icon>
                <el-icon v-else-if="period.key === 'afternoon'"><Sunny /></el-icon>
                <el-icon v-else><Moon /></el-icon>
              </span>
              <span class="period-name">{{ period.name }}</span>
            </div>
            <div class="period-slots">
              <div
                v-for="slot in period.slots"
                :key="slot.timeSlot"
                class="time-slot-item"
                :class="{
                  available: slot.status === 0,
                  booked: slot.status === 1,
                  disabled: slot.status === 2,
                  selected: selectedTimeSlot?.timeSlot === slot.timeSlot
                }"
                @click="slot.status === 0 && selectTimeSlot(slot)"
              >
                <span class="slot-time">{{ getTimeSlotLabel(slot.timeSlot) }}</span>
                <span class="slot-status">
                  <template v-if="slot.status === 0">可预约</template>
                  <template v-else-if="slot.status === 1">已约满</template>
                  <template v-else>休息</template>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 无可用时段提示 -->
        <div class="no-slots-tip" v-if="allSlotsEmpty">
          <el-icon><Warning /></el-icon>
          <span>当日暂无可预约时段</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="timeSlotDialogVisible = false" class="cosmic-btn-secondary cosmic-btn">取消</el-button>
          <el-button
            type="primary"
            @click="confirmTimeSlot"
            class="cosmic-btn-primary cosmic-btn"
            :disabled="!selectedTimeSlot"
          >
            确认时段
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 支付确认对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="确认支付"
      width="450px"
      class="cosmic-dialog payment-dialog"
      :show-close="false"
    >
      <div class="payment-modal-content" v-if="pendingAppointment">
        <div class="payment-header">
          <div class="payment-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <h3>预约成功</h3>
          <p class="payment-subtitle">请确认以下订单信息并完成支付</p>
        </div>

        <div class="payment-order-info">
          <div class="order-row">
            <span class="order-label">心理咨询师</span>
            <span class="order-value">{{ psychologist?.realName }}</span>
          </div>
          <div class="order-row">
            <span class="order-label">服务类型</span>
            <span class="order-value">{{ pendingAppointment.serviceName }}</span>
          </div>
          <div class="order-row">
            <span class="order-label">预约时间</span>
            <span class="order-value">{{ pendingAppointment.appointmentTime }}</span>
          </div>
          <div class="order-row">
            <span class="order-label">预约费用</span>
            <span class="order-value price">¥{{ pendingAppointment.price }}</span>
          </div>
        </div>

        <div class="payment-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>支付成功后，费用将从您的虚拟账户扣除</span>
        </div>
      </div>

      <template #footer>
        <el-button @click="handlePaymentCancel" class="cosmic-btn-secondary cosmic-btn">取消支付</el-button>
        <el-button type="primary" @click="handlePaymentConfirm" class="cosmic-btn-primary cosmic-btn" :loading="paymentLoading">
          确认支付（¥{{ pendingAppointment?.price }}）
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, ArrowRight, User, CircleCheck, Medal, Star,
  Check, Calendar, Location, InfoFilled, VideoCamera, ChatDotRound, Microphone, OfficeBuilding,
  Sunrise, Sunny, Moon, Warning
} from '@element-plus/icons-vue'
import {
  getPsychologistDetail,
  toggleFavorite as apiToggleFavorite,
  createAppointment,
  getPsychologistSchedule,
  payAppointment
} from '@/api/psychologist'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const psychologist = ref<any>(null)
const activeTab = ref('intro')
const isFavorite = ref(false)
const selectedService = ref<any>(null)
const reviews = ref<any[]>([])

// 排班相关
const selectedSlot = ref<any>(null)

// 预约表单
const bookingFormVisible = ref(false)
const submitting = ref(false)
const bookingForm = reactive({
  personalSituation: '',
  problems: ''
})

// 时段选择弹窗
const timeSlotDialogVisible = ref(false)
const selectedTimeSlot = ref<any>(null)
const currentSlotDate = ref<Date | null>(null)

// 支付确认对话框
const paymentDialogVisible = ref(false)
const paymentLoading = ref(false)
const pendingAppointment = ref<any>(null)

// 时段分组（上午、下午、晚上）
interface TimeSlotPeriod {
  key: string
  name: string
  slots: any[]
}

const timeSlotPeriods = computed((): TimeSlotPeriod[] => {
  const slots = getDaySlots(currentSlotDate.value)
  const periods: TimeSlotPeriod[] = [
    { key: 'morning', name: '上午', slots: [] },
    { key: 'afternoon', name: '下午', slots: [] },
    { key: 'evening', name: '晚上', slots: [] }
  ]

  slots.forEach(slot => {
    if (slot.timeSlot?.toLowerCase().includes('morning')) {
      periods[0].slots.push(slot)
    } else if (slot.timeSlot?.toLowerCase().includes('afternoon')) {
      periods[1].slots.push(slot)
    } else {
      periods[2].slots.push(slot)
    }
  })

  return periods
})

// 检查所有时段是否为空
const allSlotsEmpty = computed(() => {
  return timeSlotPeriods.value.every(p => p.slots.length === 0)
})

// 选择时段
const selectTimeSlot = (slot: any) => {
  selectedTimeSlot.value = slot
}

// 确认时段选择
const confirmTimeSlot = () => {
  if (selectedTimeSlot.value && currentSlotDate.value) {
    selectSlot(currentSlotDate.value, selectedTimeSlot.value)
    timeSlotDialogVisible.value = false
    selectedTimeSlot.value = null
  }
}

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 服务类型映射
const serviceTypeMap: Record<string, string> = {
  text: '图文咨询',
  video: '线上咨询',
  voice: '语音咨询',
  offline: '线下面询',
  TEXT: '图文咨询',
  VIDEO: '线上咨询',
  VOICE: '语音咨询',
  OFFLINE: '线下面询'
}

const getServiceTypeName = (type: string) => serviceTypeMap[type] || type

// 获取领域图标HTML
const getFieldIcon = (icon: string) => {
  if (!icon) return '<span>🎯</span>'
  // 如果是SVG直接返回
  if (icon.startsWith('<')) return icon
  // 如果是URL或图标类名，包装成span
  return `<span>${icon}</span>`
}

const getServiceIcon = (type: string) => {
  const icons: Record<string, any> = {
    text: ChatDotRound,
    video: VideoCamera,
    voice: Microphone,
    offline: OfficeBuilding
  }
  return icons[type] || ChatDotRound
}

// 只显示线上和线下服务，语音咨询合并到线上
const displayedServices = computed(() => {
  if (!psychologist.value?.services) return []

  const onlineService = psychologist.value.services.find((s: any) =>
    (s.serviceType === 'video' || s.serviceType === 'VIDEO' || s.serviceType === 'voice' || s.serviceType === 'VOICE')
  )
  const offlineService = psychologist.value.services.find((s: any) =>
    s.serviceType === 'offline' || s.serviceType === 'OFFLINE'
  )

  const result: any[] = []
  // 判断线上服务是否可用（video和voice都禁用则线上不可用）
  const onlineEnabled = onlineService && onlineService.status !== 0
  if (onlineEnabled) {
    result.push({
      id: 'online',
      serviceType: 'online',
      displayName: '线上咨询',
      price: onlineService.price,
      disabled: false
    })
  } else {
    result.push({
      id: 'online',
      serviceType: 'online',
      displayName: '线上咨询',
      price: onlineService?.price || 0,
      disabled: true
    })
  }

  // 判断线下面询是否可用
  const offlineEnabled = offlineService && offlineService.status !== 0
  if (offlineEnabled) {
    result.push({
      id: 'offline',
      serviceType: 'offline',
      displayName: '线下面询',
      price: offlineService.price,
      disabled: false
    })
  } else {
    result.push({
      id: 'offline',
      serviceType: 'offline',
      displayName: '线下面询',
      price: offlineService?.price || 0,
      disabled: true
    })
  }

  return result
})

// 格式化价格显示
const formatPrice = (service: any) => {
  if (!service) return '0'
  const price = service.price
  if (price === null || price === undefined) return '0'
  // 如果已经是数字或能转成数字
  const numPrice = typeof price === 'number' ? price : parseFloat(price)
  if (isNaN(numPrice)) return '0'
  return numPrice.toFixed(2)
}

// 时间段标签
const timeSlotLabels: Record<string, string> = {
  MORNING: '上午',
  AFTERNOON: '下午',
  EVENING: '晚上',
  morning: '上午',
  afternoon: '下午',
  evening: '晚上'
}

const getTimeSlotLabel = (slot: string) => timeSlotLabels[slot] || slot

// 计算近7天日程
const scheduleDays = computed(() => {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 生成近7天的日期
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push(date)
  }

  return days
})

// 计算月份标签（显示近7天的范围）
const currentMonthLabel = computed(() => {
  if (scheduleDays.value.length === 0) return ''
  const start = scheduleDays.value[0]
  const end = scheduleDays.value[scheduleDays.value.length - 1]
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
})

// 获取星期几名称
const getWeekDayName = (day: Date) => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[day.getDay()]
}

// 获取时段状态样式类
const getSlotStatusClass = (slot: any) => {
  if (slot.status === 0) return 'available'
  if (slot.status === 1) return 'booked'
  return 'rest'
}

// 选择服务后自动滚动到预约咨询
const selectService = (service: any) => {
  if (service.disabled) {
    ElMessage.warning('心理咨询师暂不支持该服务类型')
    return
  }
  selectedService.value = service
  // 如果当前在服务与价格标签，自动滚动到预约咨询
  if (activeTab.value === 'services') {
    setTimeout(() => {
      activeTab.value = 'schedule'
      nextTick(() => {
        const tabsEl = document.querySelector('.detail-tabs')
        if (tabsEl) {
          tabsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }, 200)
  }
}

// 获取某天的排班
const getDaySlots = (day: Date) => {
  if (!psychologist.value?.schedules || psychologist.value.schedules.length === 0) {
    return []
  }
  
  // 标准化日期格式进行匹配
  const year = day.getFullYear()
  const month = String(day.getMonth() + 1).padStart(2, '0')
  const date = String(day.getDate()).padStart(2, '0')
  const targetDateStr = `${year}-${month}-${date}`
  
  // 查找该日期的排班 - 支持多种格式
  const daySchedule = psychologist.value.schedules.find((s: any) => {
    const scheduleDate = s.date || s.scheduleDate
    if (!scheduleDate) return false
    
    // 如果是 Date 对象
    if (scheduleDate instanceof Date) {
      const sd = scheduleDate
      const sdStr = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`
      return sdStr === targetDateStr
    }
    
    // 如果是字符串（后端 LocalDate 返回格式，如 "2026-04-15"）
    if (typeof scheduleDate === 'string') {
      const sdStr = scheduleDate.split('T')[0]
      return sdStr === targetDateStr
    }
    
    // 如果是对象（可能是 Jackson 序列化后的 LocalDate）
    if (typeof scheduleDate === 'object' && scheduleDate.year !== undefined) {
      const sdStr = `${scheduleDate.year}-${String(scheduleDate.month).padStart(2, '0')}-${String(scheduleDate.dayOfMonth).padStart(2, '0')}`
      return sdStr === targetDateStr
    }
    
    return false
  })
  
  if (!daySchedule) return []
  
  // 处理 slots 可能是数组或需要转换的情况
  let slots = daySchedule.slots
  if (!slots) {
    // 如果没有 slots，可能整个 daySchedule 就是一条排班记录
    if (daySchedule.timeSlot) {
      return [{
        timeSlot: daySchedule.timeSlot || daySchedule.timeSlot,
        status: getSlotStatus(daySchedule),
        id: daySchedule.id,
        bookedCount: daySchedule.bookedCount || daySchedule.booked_count || 0,
        maxAppointments: daySchedule.maxAppointments || daySchedule.max_appointments || 1
      }]
    }
    return []
  }
  
  if (!Array.isArray(slots)) return []
  
  return slots.map((slot: any) => ({
    timeSlot: slot.timeSlot || slot.time_slot || 'MORNING',
    status: getSlotStatus(slot),
    id: slot.id,
    bookedCount: slot.bookedCount || slot.booked_count || 0,
    maxAppointments: slot.maxAppointments || slot.max_appointments || 1
  }))
}

const getSlotStatus = (slot: any) => {
  if (!slot) return 2 // 无数据=休息
  const status = slot.status
  if (status === 0) return 2 // 休息
  if (status === 1) {
    // 可预约，但需要检查是否约满
    const bookedCount = slot.bookedCount || slot.booked_count || 0
    const maxAppointments = slot.maxAppointments || slot.max_appointments || 1
    if (bookedCount >= maxAppointments) return 1 // 已约满
    return 0 // 可预约
  }
  return 2 // 默认休息
}

const isPastDay = (day: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return day < today
}

const isToday = (day: Date) => {
  const today = new Date()
  return day.getDate() === today.getDate() && 
         day.getMonth() === today.getMonth() && 
         day.getFullYear() === today.getFullYear()
}

const formatSelectedDate = computed(() => {
  if (!selectedSlot.value?.date) return ''
  const d = new Date(selectedSlot.value.date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const selectSlot = (day: Date, slot: any) => {
  selectedSlot.value = {
    date: day.toISOString().split('T')[0],
    timeSlot: slot.timeSlot,
    scheduleId: slot.id || getScheduleId(day, slot.timeSlot)
  }
  ElMessage.success(`已选择：${day.getMonth() + 1}月${day.getDate()}日 ${getTimeSlotLabel(slot.timeSlot)}`)
}

const handleDayClick = (day: Date) => {
  const slots = getDaySlots(day)
  if (slots.length === 0) {
    ElMessage.info('该日期暂无排班')
    return
  }
  const availableSlots = slots.filter(s => s.status === 0)
  if (availableSlots.length === 0) {
    ElMessage.info('该日期无可预约时段')
    return
  }
  // 打开时段选择弹窗
  currentSlotDate.value = day
  selectedTimeSlot.value = null
  timeSlotDialogVisible.value = true
}

const hasAvailableSlot = (day: Date) => {
  const slots = getDaySlots(day)
  return slots.some(s => s.status === 0)
}

const getScheduleId = (day: Date, timeSlot: string) => {
  const dateStr = day.toISOString().split('T')[0]
  const daySchedule = psychologist.value?.schedules?.find((s: any) => {
    const scheduleDate = s.date || s.scheduleDate
    if (scheduleDate instanceof Date) {
      return scheduleDate.toISOString().split('T')[0] === dateStr
    }
    return scheduleDate === dateStr
  })
  if (!daySchedule || !daySchedule.slots) return null
  const slot = daySchedule.slots.find((s: any) => s.timeSlot === timeSlot)
  return slot?.id
}

const parseJsonArray = (jsonStr: string) => {
  if (!jsonStr) return []
  try {
    const parsed = JSON.parse(jsonStr)
    // 如果是数组直接返回
    if (Array.isArray(parsed)) return parsed
    // 如果是字符串，尝试按逗号分隔
    if (typeof parsed === 'string') return parsed.split(',').map(s => s.trim()).filter(Boolean)
    return []
  } catch {
    // 如果JSON.parse失败，可能是逗号分隔的字符串
    if (typeof jsonStr === 'string' && jsonStr.includes(',')) {
      return jsonStr.split(',').map(s => s.trim()).filter(Boolean)
    }
    return []
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const goBack = () => {
  router.back()
}

const scrollToSchedule = () => {
  activeTab.value = 'services'
  selectedService.value = null // 清空选择，让用户自己选择
}

const toggleFavorite = async () => {
  if (!psychologist.value) return
  try {
    const res: any = await apiToggleFavorite(psychologist.value.id)
    if (res.code === 200) {
      isFavorite.value = !isFavorite.value
      ElMessage.success(isFavorite.value ? '收藏成功' : '取消收藏')
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const showBookingForm = () => {
  if (!selectedService.value || !selectedSlot.value) {
    ElMessage.warning('请选择服务类型和时间')
    return
  }
  if (selectedService.value.disabled) {
    ElMessage.warning('心理咨询师暂不支持该服务类型')
    return
  }
  bookingForm.personalSituation = ''
  bookingForm.problems = ''
  bookingFormVisible.value = true
}

// 提交预约表单（仅保存信息，弹出支付对话框）
const submitBooking = async () => {
  if (!bookingForm.problems.trim()) {
    ElMessage.warning('请填写主要问题')
    return
  }

  submitting.value = true
  try {
    // 将显示的 'online' 类型映射回后端可识别的 'video'
    let serviceType = selectedService.value.serviceType
    if (serviceType === 'online') {
      serviceType = 'video'
    }

    // 保存预约信息到待支付对象（此时不发请求）
    pendingAppointment.value = {
      psychologistId: psychologist.value.id,
      scheduleId: selectedSlot.value.scheduleId,
      serviceType: serviceType,
      personalSituation: bookingForm.personalSituation,
      problems: bookingForm.problems,
      serviceName: selectedService.value.displayName,
      appointmentTime: formatSelectedDate.value + ' ' + getTimeSlotLabel(selectedSlot.value.timeSlot),
      price: formatPrice(selectedService.value)
    }

    bookingFormVisible.value = false
    paymentDialogVisible.value = true
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 取消支付
const handlePaymentCancel = () => {
  paymentDialogVisible.value = false
  pendingAppointment.value = null
  ElMessage.info('已取消预约')
}

// 确认支付 - 支付成功后才发送预约请求
const handlePaymentConfirm = async () => {
  if (!pendingAppointment.value?.psychologistId) {
    ElMessage.error('预约信息不存在')
    return
  }
  paymentLoading.value = true
  try {
    // 支付成功后发送预约请求
    const appointmentRes: any = await createAppointment({
      psychologistId: pendingAppointment.value.psychologistId,
      scheduleId: pendingAppointment.value.scheduleId,
      serviceType: pendingAppointment.value.serviceType,
      personalSituation: pendingAppointment.value.personalSituation,
      problems: pendingAppointment.value.problems
    })

    if (appointmentRes.code === 200) {
      // 预约创建成功后，调用支付接口
      const appointmentId = appointmentRes.data?.appointmentId || appointmentRes.data
      if (appointmentId) {
        await payAppointment(appointmentId)
      }
      ElMessage.success('预约成功！')
      paymentDialogVisible.value = false
      pendingAppointment.value = null
      // 跳转到我的预约页面
      router.push('/my-psychology')
    } else {
      ElMessage.error(appointmentRes.message || '预约失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '预约失败')
  } finally {
    paymentLoading.value = false
  }
}

const fetchDetail = async () => {
  loading.value = true
  const id = route.params.id
  try {
    const res: any = await getPsychologistDetail(id as string)
    if (res.code === 200) {
      psychologist.value = res.data
      isFavorite.value = res.data.isFavorited || false
      // 从 displayedServices 中设置默认选中的服务（确保有正确的 id）
      // 使用 nextTick 确保 computed 属性已更新
      await nextTick()
      if (displayedServices.value.length > 0) {
        selectedService.value = displayedServices.value[0]
      }
      // 获取排班数据
      await fetchSchedules()
    }
  } catch (e) {
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

// 获取排班数据
const schedulesLoading = ref(false)

const fetchSchedules = async () => {
  if (!psychologist.value) return
  
  schedulesLoading.value = true
  try {
    const today = new Date()
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const startDate = today.toISOString().split('T')[0]
    const endDate = nextMonth.toISOString().split('T')[0]
    
    console.log('获取排班数据:', {
      psychologistId: psychologist.value.id,
      startDate,
      endDate
    })
    
    const res: any = await getPsychologistSchedule(psychologist.value.id, startDate, endDate)
    if (res.code === 200) {
      console.log('排班数据:', res.data)
      psychologist.value.schedules = res.data || []
    } else {
      console.error('获取排班失败:', res.message)
      ElMessage.warning('获取排班数据失败，请刷新重试')
    }
  } catch (e: any) {
    console.error('获取排班失败', e)
    ElMessage.error('获取排班数据失败')
  } finally {
    schedulesLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.psychologist-detail-container {
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

/* 返回导航 */
.back-nav {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.back-btn {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 20px;
}

.back-btn:hover {
  color: #fff !important;

}

/* 内容区 */
.detail-content {
  position: relative;
  z-index: 1;
  padding: 20px 0;
}

.info-card {
  padding: 32px;
}

/* 头部信息 */
.info-header {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.psychologist-avatar {
  border: 4px solid rgba(255, 215, 0, 0.5);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.online-indicator {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(100, 100, 100, 0.9);
  color: #fff;
}

.online-indicator.online {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  box-shadow: 0 0 15px rgba(74, 222, 128, 0.5);


}

.basic-info {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.psychologist-name {
  font-size: 40px;
  font-weight: 700;
  color: #fff;
  margin: 10px;
}

.status-badges {
  display: flex;
  gap: 8px;
}

.verified-badge, .active-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.verified-badge {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.active-badge {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.4);
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 12px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ffd700;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.field-tag {
  background: rgba(135, 206, 235, 0.2) !important;
  border: 1px solid rgba(135, 206, 235, 0.4) !important;
  color: #87ceeb !important;
  font-size: 15px;
}

.qualification-tag {
  background: rgba(255, 215, 0, 0.2) !important;
  border: 1px solid rgba(255, 215, 0, 0.4) !important;
  color: #ffd700 !important;
  font-size: 15px;
}

.language-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-label {
  font-size: 20px;
  padding: 5px;
  color: rgba(255, 255, 255, 0.6);
}

.language-tag {
  margin: 3px;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.offline-info {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(129, 140, 248, 0.1) 100%);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 12px;
}

.offline-location {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.offline-location .el-icon {
  font-size: 18px;
  color: #a78bfa;
}

.offline-label {
  font-size: 14px;
  font-weight: 600;
  color: #a78bfa;
}

.offline-address-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 26px;
}

.offline-address-detail .region {
  font-size: 15px;
  color: #ffffff;
  font-weight: 500;
}

.offline-address-detail .address {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.action-section {
  flex-shrink: 0;
}

.favorite-btn {
  padding: 12px 24px;
}

.book-now-btn {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.book-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* 详情标签页 */
.detail-tabs {
  margin-top: 40px;
  padding: 30px 0;

}
.cosmic-tabs :deep(.el-tabs__item) {
  font-size: 20px;
}
/* 个人简介 */
.intro-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 30px;
  font-weight: 600;
  color: #ffd700;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);

}

.intro-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.8;
  margin: 0;
}

.certifications-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.cert-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  color: #ffd700;
}

/* 擅长领域 */
.field-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.field-card {
  padding: 24px;
  text-align: center;
}

.field-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.field-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.field-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* 服务与价格 */
.service-cards {
  display: grid;
  gap: 16px;
}

.service-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  cursor: pointer;
  position: relative;
}

.service-card.selected {
  border-color: rgba(255, 215, 0, 0.5) !important;
  background: rgba(255, 215, 0, 0.1) !important;
}

.service-card.service-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.service-card.service-disabled:hover {
  transform: none;
}

.service-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(135, 206, 235, 0.2), rgba(135, 206, 235, 0.1));
  border: 1px solid rgba(135, 206, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #87ceeb;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
}

.service-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.service-price {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 16px;
  color: #ffd700;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #ffd700;
}

.price-unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.select-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffd700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 排班预约 */
.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-month {
  font-size: 30px;
  font-weight: 600;
  color: #fff;
  min-width: 100px;
  text-align: center;
}



.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.week-day {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  padding: 8px;
}



.day-cell {
  min-height: 80px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);

}

.day-cell.empty {
  background: transparent;
  border: none;
}

.day-cell.disabled {
  opacity: 0.4;
}

.day-cell.today {
  border-color: rgba(255, 215, 0, 0.5);
}

.day-number {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.day-slots {
  display: flex;
  flex-direction: column;
  gap: 4px;

}

.no-slots {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 4px 0;
}

.slot-item {
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.slot-item.available {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.slot-item.available:hover {
  background: rgba(74, 222, 128, 0.4);
}

/* 7天视图 */
.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.week-view {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 50px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
}

.day-week {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
}

.day-date {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin: 50px 0;
}

.day-cell {
  min-height: 100px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.day-cell:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
}

.day-cell.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.day-cell.today {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(255, 215, 0, 0.1);
}

.day-cell.has-available {
  border-color: rgba(74, 222, 128, 0.5);
}

.day-slots {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.slot-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(74, 222, 128, 0.2);
  border-radius: 6px;
  font-size: 12px;
  color: #4ade80;
}

.slot-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.slot-dot.available {
  background: #4ade80;
}

.slot-dot.booked {
  background: #f87171;
}

.slot-dot.rest {
  background: rgba(255, 255, 255, 0.3);
}

.slot-label {
  flex: 1;
  text-align: center;
  font-size: 18px;
}

.no-slots {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
}

.schedule-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 10px;
  color: rgba(135, 206, 235, 0.8);
  font-size: 20px;
  padding: 20px;
}

/* 时段选择弹窗 */
.time-slot-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, rgba(10, 10, 42, 0.95), rgba(26, 26, 74, 0.95)) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  margin-top: 10vh;
}

.time-slot-modal {
  padding: 10px 0;
}

.selected-date-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 12px;
  margin-bottom: 24px;
}

.selected-date-display .date-icon {
  font-size: 24px;
  color: #ffd700;
}

.selected-date-display .date-text {
  font-size: 20px;
  font-weight: 600;
  color: #ffd700;
}

.time-slots-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.time-period-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.period-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.period-icon {
  font-size: 20px;
  color: #87ceeb;
}

.period-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.period-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.time-slot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.time-slot-item.available:hover {
  background: rgba(74, 222, 128, 0.2);
  border-color: rgba(74, 222, 128, 0.5);
  transform: translateY(-2px);
}

.time-slot-item.booked {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-slot-item.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.time-slot-item.selected {
  background: rgba(255, 215, 0, 0.2);
  border-color: rgba(255, 215, 0, 0.5);
}

.slot-time {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.slot-status {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.time-slot-item.available .slot-status {
  color: #4ade80;
}

.no-slots-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 预约表单弹窗 */
.booking-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, rgba(10, 10, 42, 0.95), rgba(26, 26, 74, 0.95)) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
}

.booking-modal-content {
  padding: 10px 0;
}

.booking-service-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1));
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.service-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  font-size: 24px;
  color: #ffd700;
}

.service-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.service-price-display {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 16px;
  color: #ffd700;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffd700;
}

.booking-time-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(135, 206, 235, 0.3);
}

.time-icon {
  font-size: 24px;
  color: #87ceeb;
}

.time-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-text {
  font-size: 16px;
  font-weight: 600;
  color: #87ceeb;
}

.slot-text {
  font-size: 14px;
  color: rgba(135, 206, 235, 0.8);
}

.offline-address-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(74, 222, 128, 0.1);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.address-icon {
  font-size: 24px;
  color: #4ade80;
}

.address-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.address-value {
  font-size: 14px;
  color: #fff;
}

.booking-notice {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-top: 16px;
}

.booking-notice p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.booking-notice .el-icon {
  color: #87ceeb;
  font-size: 18px;
  flex-shrink: 0;
}

.slot-item.booked {
  background: rgba(245, 108, 108, 0.2);
  color: #f87171;
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.slot-item.rest {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
}

.schedule-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.legend-dot.available {
  background: rgba(74, 222, 128, 0.5);
  border: 1px solid #4ade80;
}

.legend-dot.booked {
  background: rgba(245, 108, 108, 0.5);
  border: 1px solid #f87171;
}

.legend-dot.rest {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.booking-confirm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding: 20px 24px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
}

.confirm-info h4 {
  color: #ffd700;
  margin: 0 0 8px;
  font-size: 14px;
}

.confirm-info p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 4px;
}

.confirm-price {
  font-size: 18px;
  color: #ffd700 !important;
  font-weight: 600;
}

.confirm-btn {
  padding: 14px 32px;
  font-size: 16px;
}

/* 用户评价 */
.reviews-summary {
  text-align: center;
  padding: 32px;
  background: rgba(255, 215, 0, 0.05);
  border-radius: 16px;
  margin-bottom: 24px;
}

.summary-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.big-score {
  font-size: 64px;
  font-weight: 700;
  color: #ffd700;
  line-height: 1;
}

.review-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 20px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.review-user {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.review-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.review-content {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

/* 预约表单 */
.selected-time {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  color: #ffd700;
  font-weight: 500;
}

.form-price {
  font-size: 28px;
  font-weight: 700;
  color: #ffd700;
}

.offline-address {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(135, 206, 235, 0.1);
  border: 1px solid rgba(135, 206, 235, 0.3);
  border-radius: 10px;
  color: #87ceeb;
}

.booking-notice {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 10px;
  margin-top: 16px;
}

.booking-notice p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 992px) {
  .info-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .stats-row {
    justify-content: center;

  }
  
  .tags-row, .language-row {
    justify-content: center;
  }
  
  .field-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .psychologist-detail-container {
    padding: 20px 16px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .certifications-list {
    grid-template-columns: 1fr;
  }
}

.no-services {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.no-services p {
  margin: 0;
  font-size: 14px;
}

/* 支付对话框样式 */
.payment-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, rgba(10, 10, 42, 0.95), rgba(26, 26, 74, 0.95)) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
}

.payment-modal-content {
  padding: 10px 0;
}

.payment-header {
  text-align: center;
  margin-bottom: 24px;
}

.payment-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, 0.1));
  border: 2px solid #4ade80;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #4ade80;
  font-size: 32px;
}

.payment-header h3 {
  color: #fff;
  margin: 0 0 8px;
  font-size: 20px;
}

.payment-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 14px;
}

.payment-order-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.order-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-row:last-child {
  border-bottom: none;
}

.order-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.order-value {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.order-value.price {
  color: #ffd700;
  font-size: 18px;
  font-weight: 700;
}

.payment-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(135, 206, 235, 0.1);
  border-radius: 10px;
  font-size: 13px;
  color: rgba(135, 206, 235, 0.9);
}



</style>
