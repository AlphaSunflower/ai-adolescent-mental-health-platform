<template>
  <div class="psychologist-list-container">
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
      <h1 class="page-title-text">预约咨询心理师</h1>
      <p class="page-subtitle">找到最适合您的心理咨询师</p>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar cosmic-toolbar">
      <!-- 筛选条件 -->
      <div class="filter-row">
        <!-- 搜索框 -->
        <div class="search-wrapper">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索心理师姓名或地址..."
            clearable
            @input="debouncedSearch"
            class="cosmic-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 咨询领域 -->
        <el-select 
          v-model="selectedFields" 
          multiple 
          collapse-tags
          collapse-tags-tooltip
          placeholder="咨询领域" 
          clearable
          class="cosmic-select"
          popper-class="cosmic-select-dropdown"
        >
          <el-option 
            v-for="field in consultationFields" 
            :key="field.id" 
            :label="field.name" 
            :value="field.id"
          />
        </el-select>

        <!-- 咨询方式 -->
        <el-select
          v-model="selectedServiceTypes" 
          multiple 
          collapse-tags
          placeholder="咨询方式" 
          clearable
          class="cosmic-select"
          popper-class="cosmic-select-dropdown"
        >
          <el-option label="图文咨询" value="text" />
          <el-option label="视频咨询" value="video" />
          <el-option label="语音咨询" value="voice" />
          <el-option label="线下面询" value="offline" />
        </el-select>

        <!-- 性别 -->
        <el-select 
          v-model="selectedSex" 
          placeholder="性别" 
          clearable
          class="cosmic-select"
          popper-class="cosmic-select-dropdown"
        >
          <el-option label="不限" :value="null" />
          <el-option label="男咨询师" :value="1" />
          <el-option label="女咨询师" :value="2" />
        </el-select>

        <!-- 价格区间 -->
        <div class="price-range">
          <el-input 
            v-model="minPrice" 
            placeholder="最低价" 
            type="number"
            class="price-input cosmic-input"
          />
          <span class="price-separator">-</span>
          <el-input 
            v-model="maxPrice" 
            placeholder="最高价" 
            type="number"
            class="price-input cosmic-input"
          />
        </div>

        <!-- 评分 -->
        <el-select 
          v-model="minRating" 
          placeholder="最低评分" 
          clearable
          class="cosmic-select"
          popper-class="cosmic-select-dropdown"
        >
          <el-option label="不限" :value="null" />
          <el-option label="4.5分以上" :value="4.5" />
          <el-option label="4.0分以上" :value="4.0" />
          <el-option label="3.5分以上" :value="3.5" />
          <el-option label="3.0分以上" :value="3.0" />
        </el-select>

        <!-- 重置按钮 -->
        <el-button class="reset-btn cosmic-btn-secondary cosmic-btn" @click="resetFilters">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>

        <!-- 视图切换 -->
        <el-radio-group v-model="viewMode" class="view-switch">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon> 网格
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon> 列表
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 排序 -->
      <div class="sort-row">
        <span class="sort-label">排序：</span>
        <el-radio-group v-model="sortBy" size="small" @change="handleSearch">
          <el-radio-button value="">综合推荐</el-radio-button>
          <el-radio-button value="rating">评分最高</el-radio-button>
          <el-radio-button value="price">价格最低</el-radio-button>
          <el-radio-button value="experience">经验最丰富</el-radio-button>
          <el-radio-button value="count">咨询量最多</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 心理师列表 -->
    <div v-loading="loading" class="psychologist-list">
      <div v-if="psychologists.length === 0 && !loading" class="empty-wrapper">
        <el-empty description="暂无符合条件的心理咨询师" class="cosmic-empty" />
      </div>

      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="psychologist-grid">
        <div 
          v-for="item in psychologists" 
          :key="item.id" 
          class="psychologist-card cosmic-card"
        >
          <!-- 收藏标记 -->
          <div class="favorite-badge" v-if="item.isFavorite">
            <el-icon><Star /></el-icon>
          </div>

          <!-- 头像区域 -->
          <div class="card-header" @click="goToDetail(item.id)">
            <div class="avatar-section">
              <el-avatar :size="80" :src="item.headPath" class="psychologist-avatar cosmic-avatar">
                <el-icon :size="40"><User /></el-icon>
              </el-avatar>
              <div class="online-badge" :class="{ online: item.onlineStatus === 1 }">
                {{ item.onlineStatus === 1 ? '在线' : '离线' }}
              </div>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="card-body" @click="goToDetail(item.id)">
            <h3 class="psychologist-name">
              {{ item.realName }}
              <span class="sex-tag" :class="{ male: item.sex === 1, female: item.sex === 2 }">
                {{ item.sex === 1 ? '男' : item.sex === 2 ? '女' : '' }}
              </span>
            </h3>
            
            <div class="rating-row">
              <el-rate v-model="item.ratingScore" disabled show-score size="small" class="cosmic-rating" />
              <span class="rating-count">({{ item.ratingCount }}人评价)</span>
            </div>

            <p class="experience-text">
              <el-icon><Clock /></el-icon>
              {{ item.yearsExperience }}年咨询经验 | {{ item.consultationCount }}次咨询
            </p>

            <!-- 擅长领域 -->
            <div class="fields-row">
              <span 
                v-for="field in item.fields?.slice(0, 3)" 
                :key="field.id" 
                class="field-tag cosmic-tag"
              >
                {{ field.name }}
              </span>
              <span v-if="item.fields?.length > 3" class="more-fields">
                +{{ item.fields.length - 3 }}
              </span>
            </div>

            <!-- 线下咨询地址 -->
            <div class="offline-address" v-if="item.offlineRegion || item.offlineAddress">
              <el-icon><Location /></el-icon>
              <span>{{ item.offlineRegion }}{{ item.offlineAddress }}</span>
            </div>

            <!-- 资质标签 -->
            <div class="qualifications-row" v-if="item.qualifications?.length > 0">
              <span 
                v-for="q in item.qualifications?.slice(0, 2)" 
                :key="q.id" 
                class="qualification-tag"
              >
                <el-icon><Medal /></el-icon>
                {{ q.name }}
              </span>
            </div>

            <!-- 个人简介 -->
            <p class="introduction" v-if="item.introduction">
              {{ item.introduction.length > 80 ? item.introduction.slice(0, 80) + '...' : item.introduction }}
            </p>
          </div>

          <!-- 价格与服务 -->
          <div class="card-footer">
            <div class="services-preview">
              <span
                v-for="service in getDisplayServices(item.services)"
                :key="service.serviceType"
                class="service-price"
              >
                <span class="service-type">{{ service.serviceName }}</span>
                <span class="service-amount">¥{{ service.price }}</span>
              </span>
            </div>
            <div class="action-buttons">
              <el-button 
                class="favorite-btn cosmic-btn-secondary cosmic-btn"
                @click.stop="toggleFavorite(item)"
              >
                <el-icon :color="item.isFavorite ? '#ffd700' : undefined">
                  <Star v-if="item.isFavorite" />
                  <Star v-else />
                </el-icon>
                {{ item.isFavorite ? '已收藏' : '收藏' }}
              </el-button>
              <el-button 
                class="book-btn cosmic-btn-primary cosmic-btn"
                @click.stop="goToDetail(item.id)"
              >
                立即预约
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="psychologist-list-view">
        <div 
          v-for="item in psychologists" 
          :key="item.id" 
          class="list-card cosmic-card"
          @click="goToDetail(item.id)"
        >
          <div class="list-left">
            <div class="list-avatar-wrapper">
              <el-avatar :size="80" :src="item.headPath" class="cosmic-avatar">
                <el-icon :size="40"><User /></el-icon>
              </el-avatar>
              <div class="online-badge" :class="{ online: item.onlineStatus === 1 }">
                {{ item.onlineStatus === 1 ? '在线' : '离线' }}
              </div>
            </div>
            <div class="favorite-btn-wrapper">
              <el-button 
                class="favorite-btn cosmic-btn-secondary cosmic-btn"
                @click.stop="toggleFavorite(item)"
              >
                <el-icon :color="item.isFavorite ? '#ffd700' : undefined">
                  <Star v-if="item.isFavorite" />
                  <Star v-else />
                </el-icon>
              </el-button>
            </div>
          </div>

          <div class="list-content">
            <div class="list-main">
              <div class="list-header">
                <h3 class="psychologist-name">
                  {{ item.realName }}
                  <span class="sex-tag" :class="{ male: item.sex === 1, female: item.sex === 2 }">
                    {{ item.sex === 1 ? '男' : item.sex === 2 ? '女' : '' }}
                  </span>
                </h3>
                <div class="list-tags">
                  <!-- 资质标签 -->
                  <span 
                    v-for="q in item.qualifications?.slice(0, 3)" 
                    :key="q.id" 
                    class="qualification-tag"
                  >
                    <el-icon><Medal /></el-icon>
                    {{ q.name }}
                  </span>
                </div>
              </div>

              <div class="list-info">
                <div class="info-item">
                  <el-rate v-model="item.ratingScore" disabled show-score size="small" class="cosmic-rating" />
                  <span class="rating-count">({{ item.ratingCount }}人评价)</span>
                </div>
                <div class="info-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ item.yearsExperience }}年咨询经验</span>
                </div>
                <div class="info-item">
                  <span>咨询{{ item.consultationCount }}次</span>
                </div>
              </div>

              <div class="list-fields">
                <span class="field-label">擅长领域：</span>
                <span 
                  v-for="field in item.fields?.slice(0, 5)" 
                  :key="field.id" 
                  class="field-tag cosmic-tag"
                >
                  {{ field.name }}
                </span>
                <span v-if="item.fields?.length > 5" class="more-fields">
                  +{{ item.fields.length - 5 }}
                </span>
              </div>

              <!-- 线下咨询地址 -->
              <div class="list-offline-address" v-if="item.offlineRegion || item.offlineAddress">
                <el-icon><Location /></el-icon>
                <span>{{ item.offlineRegion }}{{ item.offlineAddress }}</span>
              </div>

              <p class="introduction" v-if="item.introduction">
                {{ item.introduction.length > 150 ? item.introduction.slice(0, 150) + '...' : item.introduction }}
              </p>
            </div>

            <div class="list-right">
              <div class="services-list">
                <div
                  v-for="service in getDisplayServices(item.services)"
                  :key="service.serviceType"
                  class="service-item"
                >
                  <span class="service-type">{{ service.serviceName }}</span>
                  <span class="service-amount">¥{{ service.price }}</span>
                </div>
              </div>
              <el-button class="book-btn cosmic-btn-primary cosmic-btn">
                立即预约
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="viewMode === 'grid' ? [8, 12, 16, 24] : [10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
          class="cosmic-pagination"
        />
      </div>
    </div>

    <!-- 预约对话框 -->
    <el-dialog 
      v-model="bookingDialogVisible" 
      title="预约咨询" 
      width="600px" 
      class="cosmic-dialog"
      :close-on-click-modal="false"
    >
      <div class="booking-content" v-if="selectedPsychologist">
        <!-- 心理师信息 -->
        <div class="booking-psychologist-info">
          <el-avatar :size="60" :src="selectedPsychologist.headPath" class="cosmic-avatar">
            <el-icon :size="30"><User /></el-icon>
          </el-avatar>
          <div class="info-text">
            <h4>{{ selectedPsychologist.realName }}</h4>
            <p>{{ selectedPsychologist.yearsExperience }}年经验 | {{ selectedPsychologist.consultationCount }}次咨询</p>
          </div>
        </div>

        <!-- 选择服务类型 -->
        <el-form label-width="100px" class="booking-form">
          <el-form-item label="咨询方式">
            <el-radio-group v-model="bookingForm.serviceType" class="service-type-group">
              <el-radio 
                v-for="service in selectedPsychologist.services" 
                :key="service.serviceType" 
                :value="service.serviceType"
                class="service-option"
              >
                <span class="option-label">{{ getServiceTypeName(service.serviceType) }}</span>
                <span class="option-price">¥{{ service.price }}</span>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 选择时间 -->
          <el-form-item label="预约时间">
            <div class="schedule-grid">
              <div 
                v-for="schedule in availableSchedules" 
                :key="schedule.id"
                class="schedule-item"
                :class="{ 
                  selected: bookingForm.scheduleId === schedule.id,
                  disabled: schedule.bookedCount >= schedule.maxAppointments 
                }"
                @click="selectSchedule(schedule)"
              >
                <span class="schedule-date">{{ formatDate(schedule.scheduleDate) }}</span>
                <span class="schedule-slot">{{ getTimeSlotName(schedule.timeSlot) }}</span>
                <span class="schedule-status">
                  {{ schedule.bookedCount }}/{{ schedule.maxAppointments }}
                </span>
              </div>
              <el-empty v-if="availableSchedules.length === 0" description="暂无可用时间" :image-size="60" />
            </div>
          </el-form-item>

          <!-- 填写信息 -->
          <el-form-item label="个人情况" v-if="bookingForm.serviceType === 'video' || bookingForm.serviceType === 'text'">
            <el-input 
              v-model="bookingForm.personalSituation" 
              type="textarea" 
              :rows="3"
              placeholder="简单描述您的个人情况..."
              class="cosmic-textarea"
            />
          </el-form-item>

          <el-form-item label="主要问题">
            <el-input 
              v-model="bookingForm.problems" 
              type="textarea" 
              :rows="4"
              placeholder="请详细描述您想解决的问题..."
              class="cosmic-textarea"
            />
          </el-form-item>

          <!-- 费用预览 -->
          <div class="fee-preview">
            <div class="fee-row">
              <span>咨询方式：</span>
              <span>{{ getServiceTypeName(bookingForm.serviceType) }}</span>
            </div>
            <div class="fee-row total">
              <span>应付金额：</span>
              <span class="total-price">¥{{ selectedPrice }}</span>
            </div>
            <p class="fee-tip">
              <el-icon><InfoFilled /></el-icon>
              预约成功后费用将从您的虚拟账户扣除
            </p>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bookingDialogVisible = false" class="cosmic-btn-secondary cosmic-btn">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmBooking" 
            class="cosmic-btn-primary cosmic-btn"
            :loading="submitting"
            :disabled="!canSubmit"
          >
            确认预约（¥{{ selectedPrice }}）
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search, Refresh, Star, User, Clock, Medal, InfoFilled, Grid, List, Location 
} from '@element-plus/icons-vue'
import { 
  getPsychologistList, 
  getConsultationFields, 
  toggleFavorite as apiToggleFavorite,
  getPsychologistSchedule,
  createAppointment,
  type Psychologist
} from '@/api/psychologist'

const router = useRouter()

// 状态
const loading = ref(false)
const psychologists = ref<any[]>([])
const consultationFields = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 筛选条件
const searchKeyword = ref('')
const selectedFields = ref<number[]>([])
const selectedServiceTypes = ref<string[]>([])
const selectedSex = ref<number | null>(null)
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const minRating = ref<number | null>(null)
const sortBy = ref('')
const viewMode = ref('grid')

// 预约相关
const bookingDialogVisible = ref(false)
const selectedPsychologist = ref<any>(null)
const availableSchedules = ref<any[]>([])
const submitting = ref(false)
const bookingForm = reactive({
  serviceType: '',
  scheduleId: null as number | null,
  personalSituation: '',
  problems: ''
})

// 计算选中的价格
const selectedPrice = computed(() => {
  if (!selectedPsychologist.value || !bookingForm.serviceType) return 0
  const service = selectedPsychologist.value.services?.find(
    (s: any) => s.serviceType === bookingForm.serviceType
  )
  return service?.price || 0
})

// 是否可以提交
const canSubmit = computed(() => {
  return bookingForm.serviceType && bookingForm.scheduleId && bookingForm.problems.trim()
})

// 咨询类型映射
const serviceTypeMap: Record<string, string> = {
  text: '图文咨询',
  video: '视频咨询',
  voice: '语音咨询',
  offline: '线下面询',
  TEXT: '图文咨询',
  VIDEO: '视频咨询',
  VOICE: '语音咨询',
  OFFLINE: '线下面询'
}

const getServiceTypeName = (type: string) => serviceTypeMap[type] || type

// 获取显示用的服务列表（合并视频和语音为线上咨询）
const getDisplayServices = (services: any[]) => {
  if (!services || services.length === 0) return []

  const result: any[] = []
  const onlineService = services.find((s: any) =>
    s.serviceType === 'video' || s.serviceType === 'VIDEO' || s.serviceType === 'voice' || s.serviceType === 'VOICE'
  )
  const offlineService = services.find((s: any) =>
    s.serviceType === 'offline' || s.serviceType === 'OFFLINE'
  )

  if (onlineService) {
    result.push({
      serviceType: 'online',
      serviceName: '线上咨询',
      price: onlineService.price
    })
  }
  if (offlineService) {
    result.push({
      serviceType: 'offline',
      serviceName: '线下面询',
      price: offlineService.price
    })
  }
  return result
}

// 时间段映射
const timeSlotMap: Record<string, string> = {
  MORNING: '上午',
  AFTERNOON: '下午',
  EVENING: '晚上',
  morning: '上午',
  afternoon: '下午',
  evening: '晚上'
}

const getTimeSlotName = (slot: string) => timeSlotMap[slot] || slot

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${month}月${day}日 周${week}`
}

// 防抖搜索
let searchTimer: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    handleSearch()
  }, 500)
}

// 搜索
const handleSearch = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value || undefined,
      fieldIds: selectedFields.value.length > 0 ? selectedFields.value : undefined,
      serviceTypes: selectedServiceTypes.value.length > 0 ? selectedServiceTypes.value : undefined,
      sex: selectedSex.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      minRating: minRating.value,
      sortBy: sortBy.value || undefined,
      offlineRegion: searchKeyword.value || undefined,
      offlineAddress: searchKeyword.value || undefined
    }
    const res: any = await getPsychologistList(params)
    if (res.code === 200 && res.data) {
      let list = res.data.records || []
      // 如果后端没有按地址搜索，前端过滤
      if (searchKeyword.value && res.data.records?.length > 0) {
        const keyword = searchKeyword.value.toLowerCase()
        list = list.filter((p: any) => 
          p.realName?.toLowerCase().includes(keyword) ||
          p.offlineRegion?.toLowerCase().includes(keyword) ||
          p.offlineAddress?.toLowerCase().includes(keyword)
        )
      }
      psychologists.value = list.map((p: any) => ({
        ...p,
        isFavorite: p.isFavorited || false,
        fields: p.fields || [],
        qualifications: p.qualifications || [],
        services: p.services || []
      }))
      total.value = list.length
    }
  } catch (e) {
    console.error('搜索失败', e)
  } finally {
    loading.value = false
  }
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  selectedFields.value = []
  selectedServiceTypes.value = []
  selectedSex.value = null
  minPrice.value = null
  maxPrice.value = null
  minRating.value = null
  sortBy.value = ''
  currentPage.value = 1
  handleSearch()
}

// 跳转详情
const goToDetail = (id: number) => {
  console.log('跳转心理咨询师详情，id:', id)

  if (!id) {
    ElMessage.error('无效的心理咨询师ID')
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录后再查看详情')
    router.push('/login')
    return
  }

  router.push(`/consultation/psychologist/${id}`).catch(err => {
    console.error('路由跳转失败:', err)
    ElMessage.error('页面跳转失败，请稍后重试')
  })
}

// 切换收藏
const toggleFavorite = async (item: any) => {
  try {
    const res: any = await apiToggleFavorite(item.id)
    if (res.code === 200) {
      item.isFavorite = !item.isFavorite
      ElMessage.success(item.isFavorite ? '收藏成功' : '取消收藏')
    }
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 显示预约对话框
const showBookingDialog = async (item: any) => {
  selectedPsychologist.value = item
  bookingForm.serviceType = item.services?.[0]?.serviceType || ''
  bookingForm.scheduleId = null
  bookingForm.personalSituation = ''
  bookingForm.problems = ''
  
  // 获取可用排班
  try {
    const today = new Date()
    const nextMonth = new Date(today)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const res: any = await getPsychologistSchedule(
      item.id,
      today.toISOString().slice(0, 10),
      nextMonth.toISOString().slice(0, 10)
    )
    if (res.code === 200) {
      availableSchedules.value = res.data || []
    }
  } catch (e) {
    console.error('获取排班失败', e)
  }
  
  bookingDialogVisible.value = true
}

// 选择排班
const selectSchedule = (schedule: any) => {
  if (schedule.bookedCount >= schedule.maxAppointments) {
    ElMessage.warning('该时段已约满')
    return
  }
  bookingForm.scheduleId = schedule.id
}

// 确认预约
const confirmBooking = async () => {
  if (!bookingForm.serviceType || !bookingForm.scheduleId) {
    ElMessage.warning('请选择咨询方式和时间')
    return
  }
  if (!bookingForm.problems.trim()) {
    ElMessage.warning('请填写主要问题')
    return
  }
  
  submitting.value = true
  try {
    const res: any = await createAppointment({
      psychologistId: selectedPsychologist.value.id,
      scheduleId: bookingForm.scheduleId,
      serviceType: bookingForm.serviceType,
      personalSituation: bookingForm.personalSituation,
      problems: bookingForm.problems
    })
    if (res.code === 200) {
      ElMessage.success('预约成功！')
      bookingDialogVisible.value = false
      handleSearch()
    } else {
      ElMessage.error(res.message || '预约失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '预约失败')
  } finally {
    submitting.value = false
  }
}

// 获取咨询领域
const fetchConsultationFields = async () => {
  try {
    const res: any = await getConsultationFields()
    if (res.code === 200) {
      consultationFields.value = res.data || []
    }
  } catch (e) {
    console.error('获取咨询领域失败', e)
  }
}

onMounted(() => {
  handleSearch()
  fetchConsultationFields()
})
</script>

<style scoped>
.psychologist-list-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1400px;
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

.page-title-text {
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

/* 筛选工具栏 */
.filter-toolbar {
  position: relative;
  z-index: 1;
  margin-bottom: 32px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(10, 10, 42, 0.7) 0%, rgba(26, 26, 74, 0.5) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
}

.search-wrapper {
  width: 100%;
  max-width: 350px;
}

.search-wrapper :deep(.el-input__wrapper) {
  background: rgba(10, 15, 30, 0.8) !important;
  border-radius: 12px;
}

.search-hint {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
  padding-left: 4px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.filter-row .cosmic-select {
  width: 160px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 100px;
}

.price-separator {
  color: rgba(255, 255, 255, 0.5);
}

.reset-btn {
  margin-left: auto;
}

.view-switch {
  margin-left: auto;
}

.view-switch :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.view-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%) !important;
  border-color: rgba(255, 215, 0, 0.5) !important;
  color: #ffd700 !important;
}

.sort-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sort-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.sort-row :deep(.el-radio-button__inner) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.sort-row :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%) !important;
  border-color: rgba(255, 215, 0, 0.5) !important;
  color: #ffd700 !important;
}

/* 心理师网格 */
.psychologist-list {
  position: relative;
  z-index: 1;
}

.psychologist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.psychologist-card {
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.favorite-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
  z-index: 2;
}

.card-header {
  text-align: center;
  margin-bottom: 16px;
  cursor: pointer;
}

.avatar-section {
  position: relative;
  display: inline-block;
}

.psychologist-avatar {
  border: 3px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.online-badge {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  background: rgba(100, 100, 100, 0.8);
  color: #fff;
  white-space: nowrap;
}

.online-badge.online {
  background: linear-gradient(135deg, #4ade80, #22c55e);
}

.card-body {
  cursor: pointer;
  margin-bottom: 16px;
}

.psychologist-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.sex-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: normal;
}

.sex-tag.male {
  background: rgba(100, 149, 237, 0.3);
  color: #87ceeb;
}

.sex-tag.female {
  background: rgba(255, 182, 193, 0.3);
  color: #ffb6c1;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rating-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.experience-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.fields-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 8px;
}

.field-tag {
  font-size: 11px;
  padding: 3px 8px;
}

.more-fields {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.qualifications-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
}

.qualification-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #ffd700;
}

.offline-address {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(167, 139, 250, 0.9);
}

.offline-address .el-icon {
  flex-shrink: 0;
}

.offline-address span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.introduction {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin: 0;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.services-preview {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  justify-content: center;
}

.service-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.service-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.service-amount {
  font-size: 16px;
  font-weight: 600;
  color: #ffd700;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .el-button {
  flex: 1;
  padding: 10px 12px;
  font-size: 13px;
}

/* 列表视图 */
.psychologist-list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-card {
  display: flex;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.list-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.2);
}

.list-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-right: 24px;
}

.list-avatar-wrapper {
  position: relative;
}

.list-avatar-wrapper .cosmic-avatar {
  border: 3px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.favorite-btn-wrapper :deep(.el-button) {
  padding: 8px;
}

.list-content {
  flex: 1;
  display: flex;
  gap: 24px;
}

.list-main {
  flex: 1;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.list-tags {
  display: flex;
  gap: 8px;
}

.list-info {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}

.info-item .rating-count {
  margin-left: 4px;
}

.list-fields {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.list-offline-address {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(167, 139, 250, 0.9);
  width: fit-content;
}

.list-offline-address .el-icon {
  flex-shrink: 0;
}

.field-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.list-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  min-width: 200px;
}

.services-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.service-item .service-type {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.service-item .service-amount {
  font-size: 16px;
  font-weight: 600;
  color: #ffd700;
}

.list-right .book-btn {
  width: 100%;
  padding: 12px 24px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* 预约对话框 */
.booking-content {
  padding: 10px 0;
}

.booking-psychologist-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 24px;
}

.booking-psychologist-info h4 {
  color: #fff;
  margin: 0 0 4px;
  font-size: 18px;
}

.booking-psychologist-info p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 13px;
}

.booking-form :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.service-type-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-option {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-option.is-selected {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.5);
}

.option-label {
  color: #fff;
}

.option-price {
  color: #ffd700;
  font-weight: 600;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.schedule-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.schedule-item:hover:not(.disabled) {
  background: rgba(100, 149, 237, 0.2);
  border-color: rgba(100, 149, 237, 0.5);
}

.schedule-item.selected {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.5);
}

.schedule-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.schedule-date {
  display: block;
  color: #fff;
  font-weight: 500;
  margin-bottom: 4px;
}

.schedule-slot {
  display: block;
  color: #87ceeb;
  font-size: 13px;
  margin-bottom: 4px;
}

.schedule-status {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.fee-preview {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: rgba(255, 255, 255, 0.7);
}

.fee-row.total {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 12px;
  font-weight: 600;
  color: #fff;
}

.total-price {
  font-size: 24px;
  color: #ffd700;
  font-weight: 700;
}

.fee-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 12px 0 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .psychologist-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .psychologist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .schedule-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .psychologist-list-container {
    padding: 24px 16px;
  }

  .psychologist-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row .cosmic-select {
    width: 100%;
  }

  .price-range {
    flex-direction: column;
  }

  .price-input {
    width: 100%;
  }

  .schedule-grid {
    grid-template-columns: 1fr;
  }

  /* 列表视图响应式 */
  .list-card {
    flex-direction: column;
    padding: 16px;
  }

  .list-left {
    flex-direction: row;
    margin-right: 0;
    margin-bottom: 16px;
    justify-content: flex-start;
  }

  .list-content {
    flex-direction: column;
  }

  .list-right {
    width: 100%;
    align-items: stretch;
  }

  .services-list {
    grid-template-columns: repeat(4, 1fr);
  }

  .view-switch {
    margin-left: 0;
    margin-top: 12px;
    width: 100%;
  }

  .view-switch :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }

  .view-switch :deep(.el-radio-button) {
    flex: 1;
  }

}
</style>
