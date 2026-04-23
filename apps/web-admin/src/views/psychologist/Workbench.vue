<template>
  <div class="psychologist-workbench-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">心理咨询师工作台</h1>
      <p class="page-subtitle">欢迎回来，{{ psychologistName }}</p>
    </div>

    <!-- 在线状态切换 -->
    <div class="online-status-section">
      <div class="status-card">
        <div class="status-info">
          <span class="status-label">当前状态</span>
          <span class="status-value" :class="getStatusClass(onlineStatus)">
            {{ getStatusText(onlineStatus) }}
          </span>
        </div>
        <div class="status-toggle">
          <el-switch
            v-model="onlineStatus"
            :active-value="1"
            :inactive-value="0"
            active-text="在线"
            inactive-text="离线"
            :loading="statusLoading"
            @change="handleStatusChange"
          />
          <span class="status-hint">（忙碌状态由系统自动设置）</span>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon size="32"><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.todayAppointments }}</span>
          <span class="stat-label">今日预约</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon gold">
          <el-icon size="32"><Coin /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ stats.todayIncome }}</span>
          <span class="stat-label">今日收入</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon size="32"><Star /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalConsultations }}</span>
          <span class="stat-label">总咨询量</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon size="32"><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.rating }}</span>
          <span class="stat-label">当前评分</span>
        </div>
      </div>
    </div>

    <!-- 待处理事项 -->
    <div class="pending-section">
      <h2 class="section-title">待处理事项</h2>
      <div class="pending-grid">
        <div 
          class="pending-card" 
          @click="goToAppointments(0)"
        >
          <div class="pending-icon" style="background: #E6A23C;">
            <el-icon size="24"><Clock /></el-icon>
          </div>
          <div class="pending-info">
            <span class="pending-count">{{ stats.pendingAppointments }}</span>
            <span class="pending-label">待接受预约</span>
          </div>
        </div>

        <div 
          class="pending-card" 
          @click="goToAppointments(1)"
        >
          <div class="pending-icon" style="background: #909399;">
            <el-icon size="24"><CircleCheck /></el-icon>
          </div>
          <div class="pending-info">
            <span class="pending-count">{{ stats.confirmedAppointments }}</span>
            <span class="pending-label">已确认</span>
          </div>
        </div>

        <div 
          class="pending-card" 
          @click="goToAppointments(7)"
        >
          <div class="pending-icon" style="background: #409EFF;">
            <el-icon size="24"><VideoPlay /></el-icon>
          </div>
          <div class="pending-info">
            <span class="pending-count">{{ stats.toStartAppointments }}</span>
            <span class="pending-label">待进行</span>
          </div>
        </div>

        <div 
          class="pending-card" 
          @click="goToAppointments(3)"
        >
          <div class="pending-icon" style="background: #67C23A;">
            <el-icon size="24"><ChatDotRound /></el-icon>
          </div>
          <div class="pending-info">
            <span class="pending-count">{{ stats.inProgressAppointments }}</span>
            <span class="pending-label">进行中</span>
          </div>
        </div>

        <div 
          class="pending-card" 
          @click="goToIncome"
        >
          <div class="pending-icon" style="background: #F56C6C;">
            <el-icon size="24"><Wallet /></el-icon>
          </div>
          <div class="pending-info">
            <span class="pending-count">{{ stats.pendingWithdrawals }}</span>
            <span class="pending-label">待处理提现</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日预约 -->
    <div class="today-section">
      <h2 class="section-title">今日预约</h2>
      <div v-loading="loading" class="appointments-list">
        <el-empty v-if="todayAppointments.length === 0 && !loading" description="今日暂无预约" />
        <div v-else class="appointment-cards">
          <div 
            class="appointment-card"
            v-for="item in todayAppointments"
            :key="item.id"
          >
            <div class="appointment-time">
              <span class="time-slot">{{ formatDate(item.appointmentTime) }}</span>
              <span class="time-range">{{ formatTime(item.appointmentTime) }}</span>
            </div>
            <div class="appointment-user">
              <el-avatar :size="48" :src="item.userHead">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ item.userName }}</span>
                <span class="user-problem">{{ item.userBasicInfo?.problems || '-' }}</span>
              </div>
            </div>
            <div class="appointment-service">
              <el-tag>{{ getServiceTypeName(item.serviceType) }}</el-tag>
              <span class="service-price">¥{{ item.fee }}</span>
            </div>
            <div class="appointment-status">
              <el-tag :type="getStatusType(item.status)">
                {{ item.statusText || getStatusName(item.status) }}
              </el-tag>
            </div>
            <div class="appointment-actions">
              <template v-if="item.status === 0">
                <el-button type="primary" size="small" @click="acceptAppointment(item)">
                  接受
                </el-button>
                <el-button type="danger" size="small" @click="showRejectDialog(item)">
                  拒绝
                </el-button>
              </template>
              <template v-else-if="item.status === 7">
                <el-button type="success" size="small" @click="showStartDialog(item)">
                  <el-icon><VideoPlay /></el-icon>
                  开始咨询
                </el-button>
                <el-button type="primary" size="small" @click="openChat(item)">
                  图文咨询
                </el-button>
              </template>
              <template v-else-if="item.status === 3">
                <el-button type="warning" size="small" @click="completeConsultation(item)">
                  <el-icon><CircleCheck /></el-icon>
                  完成咨询
                </el-button>
                <el-button type="primary" size="small" @click="openChat(item)">
                  图文咨询
                </el-button>
              </template>
              <template v-else-if="item.status === 1">
                <el-button type="primary" size="small" @click="openChat(item)">
                  图文咨询
                </el-button>
              </template>
              <el-button v-else size="small" @click="viewDetail(item)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 收入概览图表 -->
    <div class="income-section">
      <h2 class="section-title">收入概览</h2>
      <div class="income-chart">
        <div ref="incomeChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 拒绝预约对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝预约" width="400px">
      <el-form>
        <el-form-item label="拒绝原因" required>
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 开始咨询对话框 -->
    <el-dialog v-model="startDialogVisible" title="开始咨询" width="400px">
      <el-form label-width="100px">
        <el-form-item label="咨询开始时间">
          <el-date-picker
            v-model="startTime"
            type="datetime"
            placeholder="选择开始时间（可选）"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="视频链接" v-if="currentAppointment?.videoLink">
          <el-link type="primary" :href="currentAppointment?.videoLink" target="_blank">
            {{ currentAppointment?.videoLink }}
          </el-link>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="startDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmStartConsultation">开始咨询</el-button>
      </template>
    </el-dialog>

    <!-- 视频链接对话框 -->
    <el-dialog 
      v-model="videoLinkDialogVisible" 
      title="提供视频会议链接" 
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="预约用户">
          {{ currentAppointment?.userName }}
        </el-form-item>
        <el-form-item label="咨询方式">
          {{ getServiceTypeName(currentAppointment?.serviceType) }}
        </el-form-item>
        <el-form-item label="视频平台" required>
          <el-select v-model="videoForm.platform" placeholder="选择视频会议平台">
            <el-option label="腾讯会议" value="tencent" />
            <el-option label="钉钉会议" value="dingtalk" />
            <el-option label="微信视频" value="wechat" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议链接" required>
          <el-input 
            v-model="videoForm.link" 
            placeholder="请输入视频会议链接或会议号"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="videoForm.startTime"
            type="datetime"
            placeholder="选择咨询开始时间（可选）"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="videoLinkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVideoLink">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, Coin, Star, User, ChatDotRound, VideoPlay, CircleCheck, Clock, Wallet } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getMyPsychologistProfile, getMyAppointments, handleAppointment, sendVideoLink, startConsultation, completeConsultationApi, getDashboardStats } from '@/api/psychologistAdminPage'
import { updateOnlineStatus, OnlineStatus, OnlineStatusText } from '@/api/psychologist'

const router = useRouter()

// 在线状态
const onlineStatus = ref(OnlineStatus.OFFLINE)
const statusLoading = ref(false)

const getStatusText = (status: number) => {
  if (status === OnlineStatus.ONLINE || status === OnlineStatus.BUSY || status === OnlineStatus.OFFLINE) {
    return OnlineStatusText[status]
  }
  return '离线'
}

const getStatusClass = (status: number) => {
  switch (status) {
    case OnlineStatus.ONLINE: return 'status-online'
    case OnlineStatus.BUSY: return 'status-busy'
    default: return 'status-offline'
  }
}

const handleStatusChange = async (newStatus: number) => {
  const oldStatus = onlineStatus.value
  statusLoading.value = true
  try {
    await updateOnlineStatus(newStatus)
    ElMessage.success(`状态已更新为：${getStatusText(newStatus)}`)
  } catch (error) {
    ElMessage.error('状态更新失败')
    onlineStatus.value = oldStatus
  } finally {
    statusLoading.value = false
  }
}

// 获取当前心理师在线状态
const fetchOnlineStatus = async () => {
  try {
    const res = await getMyPsychologistProfile()
    if (res.data?.psychologist?.onlineStatus !== undefined) {
      onlineStatus.value = res.data.psychologist.onlineStatus
    }
  } catch (error) {
    console.error('获取在线状态失败', error)
  }
}

// 心理师信息
const psychologistName = ref('心理咨询师')

// 统计数据
const stats = ref({
  todayAppointments: 0,
  todayIncome: 0,
  totalConsultations: 0,
  rating: 0,
  pendingAppointments: 0,
  confirmedAppointments: 0,
  toStartAppointments: 0,
  inProgressAppointments: 0,
  pendingWithdrawals: 0
})

// 今日预约
const loading = ref(false)
const todayAppointments = ref<any[]>([])

// 图表
const incomeChartRef = ref<HTMLElement | null>(null)

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectItem = ref<any>(null)

// 开始咨询对话框
const startDialogVisible = ref(false)
const startTime = ref('')
const currentAppointment = ref<any>(null)

// 视频链接对话框
const videoLinkDialogVisible = ref(false)
const videoForm = reactive({
  platform: 'tencent',
  link: '',
  startTime: '',
  remark: ''
})

// 服务类型
const serviceTypeMap: Record<string, string> = {
  text: '图文咨询', video: '视频咨询', voice: '语音咨询', offline: '线下面询',
  TEXT: '图文咨询', VIDEO: '视频咨询', VOICE: '语音咨询', OFFLINE: '线下面询'
}

const getServiceTypeName = (type: string) => serviceTypeMap[type] || type

// 状态
const statusMap: Record<number, string> = {
  0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 7: '待进行', 8: '已评价'
}

const getStatusName = (status: number) => statusMap[status] || '未知'

const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning', 1: 'info', 2: 'danger', 3: 'primary', 4: 'success', 5: 'info', 6: 'danger', 7: 'warning', 8: 'success'
  }
  return types[status] || 'info'
}

// 跳转到预约列表
const goToAppointments = (status: number) => {
  router.push(`/psychologist-admin/appointments${status !== undefined ? '?status=' + status : ''}`)
}

// 跳转到收入页面
const goToIncome = () => {
  router.push('/psychologist-admin/income')
}

// 格式化日期
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

// 格式化时间
const formatTime = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 接受预约
const acceptAppointment = async (item: any) => {
  try {
    const res: any = await handleAppointment(item.id, true)
    if (res.code === 200) {
      ElMessage.success('已接受预约')
      fetchTodayAppointments()
      fetchDashboardStats()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 显示拒绝对话框
const showRejectDialog = (item: any) => {
  currentRejectItem.value = item
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  try {
    const res: any = await handleAppointment(currentRejectItem.value.id, false, '', rejectReason.value)
    if (res.code === 200) {
      ElMessage.success('已拒绝预约')
      rejectDialogVisible.value = false
      fetchTodayAppointments()
      fetchDashboardStats()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 提供视频链接
const provideVideoLink = (item: any) => {
  currentAppointment.value = item
  videoForm.link = ''
  videoForm.startTime = ''
  videoForm.remark = ''
  videoLinkDialogVisible.value = true
}

// 提交视频链接
const submitVideoLink = async () => {
  if (!videoForm.link) {
    ElMessage.warning('请输入会议链接')
    return
  }
  try {
    const res: any = await sendVideoLink({
      appointmentId: currentAppointment.value.id,
      videoLink: videoForm.link,
      startTime: videoForm.startTime || undefined
    })
    if (res.code === 200) {
      ElMessage.success('已发送视频链接')
      videoLinkDialogVisible.value = false
      fetchTodayAppointments()
      fetchDashboardStats()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 显示开始咨询对话框
const showStartDialog = (item: any) => {
  currentAppointment.value = item
  startTime.value = ''
  startDialogVisible.value = true
}

// 确认开始咨询
const confirmStartConsultation = async () => {
  try {
    const res: any = await startConsultation({
      appointmentId: currentAppointment.value.id,
      startTime: startTime.value || undefined
    })
    if (res.code === 200) {
      ElMessage.success('咨询已开始')
      startDialogVisible.value = false
      fetchTodayAppointments()
      fetchDashboardStats()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 完成咨询
const completeConsultation = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要完成此咨询吗？完成后用户可以进行评价。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await completeConsultationApi(item.id)
    if (res.code === 200) {
      ElMessage.success('咨询已完成')
      fetchTodayAppointments()
      fetchDashboardStats()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 打开聊天
const openChat = (item: any) => {
  router.push(`/psychologist-admin/chat?userId=${item.userId}&appointmentId=${item.id}`)
}

// 查看详情
const viewDetail = (item: any) => {
  router.push(`/psychologist-admin/appointments?detail=${item.id}`)
}

// 获取工作台统计数据
const fetchDashboardStats = async () => {
  try {
    const res: any = await getDashboardStats()
    if (res.code === 200 && res.data) {
      const data = res.data
      psychologistName.value = data.realName || data.nickname || '心理咨询师'
      stats.value.todayAppointments = data.todayAppointments || 0
      stats.value.todayIncome = data.todayIncome || 0
      stats.value.totalConsultations = data.totalConsultations || 0
      stats.value.rating = data.rating || 0
      stats.value.pendingAppointments = data.pendingAppointments || 0
      stats.value.confirmedAppointments = data.confirmedAppointments || 0
      stats.value.toStartAppointments = data.toStartAppointments || 0
      stats.value.inProgressAppointments = data.inProgressAppointments || 0
      stats.value.pendingWithdrawals = data.pendingWithdrawals || 0
    }
  } catch (error) {
    console.error('获取工作台统计失败:', error)
  }
}

// 获取个人信息（兼容旧接口）
const fetchProfile = async () => {
  try {
    const res: any = await getMyPsychologistProfile()
    if (res.code === 200 && res.data) {
      const data = res.data.psychologist || res.data
      psychologistName.value = data.realName || data.nickname || '心理咨询师'
    }
  } catch (error) {
    console.error('获取个人信息失败:', error)
  }
}

// 获取今日预约
const fetchTodayAppointments = async () => {
  loading.value = true
  try {
    const res: any = await getMyAppointments({ 
      page: 1, 
      size: 10,
      status: undefined
    })
    if (res.code === 200) {
      todayAppointments.value = res.data.records || []
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initChart = () => {
  if (!incomeChartRef.value) return
  
  const chart = echarts.init(incomeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '订单数']
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: [
      {
        type: 'value',
        name: '收入',
        axisLine: { lineStyle: { color: '#409EFF' } },
        axisLabel: { color: '#606266' },
        splitLine: { lineStyle: { color: '#ebeef5' } }
      },
      {
        type: 'value',
        name: '订单数',
        axisLine: { lineStyle: { color: '#67C23A' } },
        axisLabel: { color: '#606266' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '收入',
        type: 'bar',
        data: [1200, 1800, 1500, 2100, 1900, 2400, 2000],
        itemStyle: { color: '#409EFF' },
        barWidth: '40%'
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: [3, 5, 4, 6, 5, 7, 6],
        smooth: true,
        lineStyle: { color: '#67C23A', width: 2 },
        itemStyle: { color: '#67C23A' }
      }
    ]
  }
  chart.setOption(option)
}

onMounted(() => {
  fetchDashboardStats()
  fetchProfile()
  fetchTodayAppointments()
  fetchOnlineStatus()
  setTimeout(initChart, 100)
})
</script>

<style scoped>
.psychologist-workbench-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 12px;
}

.page-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

/* 在线状态切换 */
.online-status-section {
  margin-bottom: 30px;
}

.status-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-label {
  font-size: 14px;
  opacity: 0.9;
}

.status-value {
  font-size: 20px;
  font-weight: 600;
}

.status-online { color: #67C23A; }
.status-busy { color: #E6A23C; }
.status-offline { color: #909399; }

.status-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-toggle :deep(.el-switch) {
  --el-switch-on-color: #67C23A;
  --el-switch-off-color: #909399;
}

.status-hint {
  font-size: 12px;
  opacity: 0.8;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue { background: #ecf5ff; color: #409EFF; }
.stat-icon.gold { background: #fdf6ec; color: #E6A23C; }
.stat-icon.purple { background: #f4f0ff; color: #8B5CF6; }
.stat-icon.green { background: #f0f9eb; color: #67C23A; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 区块标题 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
  padding-left: 16px;
  border-left: 4px solid #409EFF;
}

/* 待处理事项 */
.pending-section {
  margin-bottom: 40px;
}

.pending-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.pending-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pending-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.pending-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.pending-info {
  display: flex;
  flex-direction: column;
}

.pending-count {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.pending-label {
  font-size: 13px;
  color: #909399;
}

/* 今日预约 */
.today-section {
  margin-bottom: 40px;
}

.appointment-cards {
  display: grid;
  gap: 16px;
}

.appointment-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.appointment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  min-width: 100px;
}

.time-slot {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
}

.time-range {
  font-size: 12px;
  color: #909399;
}

.appointment-user {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.user-problem {
  font-size: 13px;
  color: #909399;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appointment-service {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-price {
  font-size: 18px;
  font-weight: 600;
  color: #E6A23C;
}

.appointment-actions {
  display: flex;
  gap: 8px;
}

/* 收入概览 */
.income-section {
  margin-bottom: 40px;
}

.income-chart {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-container {
  height: 300px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .pending-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .pending-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .appointment-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .appointment-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
