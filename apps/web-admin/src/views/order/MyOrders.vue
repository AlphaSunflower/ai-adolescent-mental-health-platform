<template>
  <div class="my-orders-container">
    <!-- 星空背景 -->
    <div class="stars-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="planet planet-1"></div>
      <div class="planet planet-2"></div>
      <div class="comet"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title-text">我的订单</h1>
        <p class="page-subtitle">查看和管理您的所有订单</p>
      </div>

      <!-- 订单统计 -->
      <div class="stats-cards">
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">全部订单</span>
          </div>
        </div>
        <div class="stat-item pending">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.pending }}</span>
            <span class="stat-label">待处理</span>
          </div>
        </div>
        <div class="stat-item ongoing">
          <div class="stat-icon">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.ongoing }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </div>
        <div class="stat-item completed">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.completed }}</span>
            <span class="stat-label">已完成</span>
          </div>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="tabs-container">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all">
            <OrderTable :orders="allOrders" :loading="loading" type="all" @view-detail="showDetail" />
          </el-tab-pane>
          <el-tab-pane label="心理咨询" name="psychologist">
            <OrderTable :orders="psychologistOrders" :loading="loadingPsychologist" type="psychologist" @view-detail="showDetail" />
          </el-tab-pane>
          <el-tab-pane label="书籍" name="book">
            <OrderTable :orders="bookOrders" :loading="loadingBook" type="book" @view-detail="showDetail" />
          </el-tab-pane>
          <el-tab-pane label="测评" name="assessment">
            <OrderTable :orders="assessmentOrders" :loading="loadingAssessment" type="assessment" @view-detail="showDetail" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="600px"
      class="detail-dialog"
      :close-on-click-modal="true"
    >
      <div v-if="detailLoading" class="detail-loading">
        <span>加载中...</span>
      </div>
      <div v-else-if="detailData" class="detail-content">
        <!-- 预约信息 -->
        <div class="detail-section">
          <h3 class="section-title">预约信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">订单编号</span>
              <span class="info-value order-no">{{ detailData.orderNo }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">咨询师</span>
              <span class="info-value">{{ detailData.psychologistName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">咨询方式</span>
              <span class="info-value">{{ getServiceTypeText(detailData.serviceType) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">预约时间</span>
              <span class="info-value">{{ formatDate(detailData.appointmentTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">订单金额</span>
              <span class="info-value price">¥{{ detailData.fee }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">支付状态</span>
              <el-tag size="small">{{ detailData.payStatusText }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">订单状态</span>
              <el-tag :type="statusTypeMap[detailData.status] || 'info'" size="small">{{ detailData.statusText }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 咨询内容 -->
        <div class="detail-section">
          <h3 class="section-title">咨询内容</h3>
          <div class="info-grid">
            <div class="info-item full-width">
              <span class="info-label">问题描述</span>
              <span class="info-value">{{ detailData.problems || '-' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">个人情况</span>
              <span class="info-value">{{ formatUserBasicInfo(detailData.userBasicInfo) }}</span>
            </div>
          </div>
        </div>

        <!-- 拒绝原因 -->
        <div v-if="detailData.rejectReason && detailData.status === 2" class="detail-section">
          <h3 class="section-title reject-title">拒绝原因</h3>
          <div class="reject-reason">{{ detailData.rejectReason }}</div>
        </div>

        <!-- 评价信息 -->
        <div v-if="detailData.isRated === 1" class="detail-section">
          <h3 class="section-title">
            <el-icon class="title-icon"><StarFilled /></el-icon>
            评价信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">评分</span>
              <span class="info-value rating-value">
                <el-icon><StarFilled /></el-icon>
                {{ detailData.ratingScore }}分
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">评价时间</span>
              <span class="info-value">{{ formatDate(detailData.ratingTime) }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">评价内容</span>
              <span class="info-value">{{ detailData.ratingContent || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 时间记录 -->
        <div class="detail-section">
          <h3 class="section-title">时间记录</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">下单时间</span>
              <span class="info-value">{{ formatDate(detailData.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">完成时间</span>
              <span class="info-value">{{ formatDate(detailData.completeTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Document, Clock, VideoPlay, CircleCheck, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPsychologistOrders, getAppointmentDetail } from '@/api/order'
import OrderTable from './OrderTable.vue'

const activeTab = ref('all')
const loading = ref(false)
const loadingPsychologist = ref(false)
const loadingBook = ref(false)
const loadingAssessment = ref(false)

const allOrders = ref<any[]>([])
const psychologistOrders = ref<any[]>([])
const bookOrders = ref<any[]>([])
const assessmentOrders = ref<any[]>([])

const stats = reactive({
  total: 0,
  pending: 0,
  ongoing: 0,
  completed: 0
})

const statusMap: Record<number, string> = {
  0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 8: '已评价'
}

const statusTypeMap: Record<number, string> = {
  0: 'warning', 1: 'success', 2: 'danger', 3: 'primary', 4: 'info', 5: 'info', 6: 'danger', 8: 'success'
}

const serviceTypeMap: Record<string, string> = {
  video: '线上咨询', offline: '线下面询'
}

const getServiceTypeText = (type: string): string => {
  return serviceTypeMap[type] || (type === 'text' ? '图文咨询' : type === 'voice' ? '语音咨询' : type || '-')
}

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<any>(null)

const showDetail = async (row: any) => {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  
  try {
    const res = await getAppointmentDetail(row.id)
    if (res.code === 200) {
      detailData.value = res.data
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (e) {
    console.error('获取详情失败', e)
    ElMessage.error('获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatUserBasicInfo = (value: any): string => {
  if (!value) return '-'
  if (typeof value === 'object') {
    return value.personalSituation || '-'
  }
  try {
    const parsed = JSON.parse(value)
    return parsed.personalSituation || '-'
  } catch {
    return value || '-'
  }
}

const fetchAllOrders = async () => {
  loading.value = true
  try {
    const res: any = await getPsychologistOrders()
    if (res.code === 200) {
      const orders = (res.data.records || res.data || []).map((item: any) => ({
        ...item,
        type: 'psychologist',
        orderNo: item.orderNo,
        title: item.psychologistName,
        subtitle: getServiceTypeText(item.serviceType) || '心理咨询',
        statusText: statusMap[item.status]
      }))
      allOrders.value = orders
      updateStats(orders)
    }
  } catch (e) {
    console.error('获取订单失败', e)
  } finally {
    loading.value = false
  }
}

const fetchPsychologistOrders = async () => {
  loadingPsychologist.value = true
  try {
    const res: any = await getPsychologistOrders()
    if (res.code === 200) {
      const orders = (res.data.records || res.data || []).map((item: any) => ({
        ...item,
        type: 'psychologist',
        orderNo: item.orderNo,
        title: item.psychologistName,
        subtitle: getServiceTypeText(item.serviceType) || '心理咨询',
        statusText: statusMap[item.status]
      }))
      psychologistOrders.value = orders
    }
  } catch (e) {
    console.error('获取心理咨询订单失败', e)
  } finally {
    loadingPsychologist.value = false
  }
}

const fetchBookOrders = async () => {
  loadingBook.value = true
  try {
    bookOrders.value = []
  } finally {
    loadingBook.value = false
  }
}

const fetchAssessmentOrders = async () => {
  loadingAssessment.value = true
  try {
    assessmentOrders.value = []
  } finally {
    loadingAssessment.value = false
  }
}

const updateStats = (orders: any[]) => {
  stats.total = orders.length
  stats.pending = orders.filter(o => [0].includes(o.status)).length
  stats.ongoing = orders.filter(o => [1, 3].includes(o.status)).length
  stats.completed = orders.filter(o => [4, 8].includes(o.status)).length
}

const handleTabChange = (tab: string) => {
  switch (tab) {
    case 'all': if (allOrders.value.length === 0) fetchAllOrders(); break
    case 'psychologist': if (psychologistOrders.value.length === 0) fetchPsychologistOrders(); break
    case 'book': if (bookOrders.value.length === 0) fetchBookOrders(); break
    case 'assessment': if (assessmentOrders.value.length === 0) fetchAssessmentOrders(); break
  }
}

onMounted(() => {
  fetchAllOrders()
  fetchPsychologistOrders()
})
</script>

<style scoped>
.my-orders-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
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

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title-text {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.stat-item.pending .stat-icon {
  background: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.stat-item.ongoing .stat-icon {
  background: rgba(64, 158, 255, 0.3);
  color: #409eff;
}

.stat-item.completed .stat-icon {
  background: rgba(103, 194, 58, 0.3);
  color: #67c23a;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.tabs-container {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
}

.tabs-container :deep(.el-tabs__content) {
  max-height: 500px;
  overflow-y: auto;
}

.tabs-container :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.tabs-container :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.1);
}

.tabs-container :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
}

.tabs-container :deep(.el-tabs__item:hover) {
  color: #ffffff;
}

.tabs-container :deep(.el-tabs__item.is-active) {
  color: #ffffff;
  font-weight: 600;
}

.tabs-container :deep(.el-tabs__active-bar) {
  background-color: #a78bfa;
}

.tabs-container :deep(.el-table) {
  background: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.05);
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.08);
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-text-color: rgba(255, 255, 255, 0.9);
  --el-table-header-text-color: rgba(255, 255, 255, 0.7);
}

.tabs-container :deep(.el-table__header-wrapper th) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
}

.tabs-container :deep(.el-table__body-wrapper tr) {
  cursor: pointer;
}

.tabs-container :deep(.el-table__body-wrapper td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.tabs-container :deep(.el-table__body-wrapper tr:hover > td) {
  background: rgba(255, 255, 255, 0.1) !important;
}

.tabs-container :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 255, 255, 0.03);
}

.tabs-container :deep(.el-table .el-tag) {
  border: none;
}

.tabs-container :deep(.el-button.is-link) {
  color: rgba(255, 255, 255, 0.8);
}

.tabs-container :deep(.el-button.is-link:hover) {
  color: #ffffff;
}

/* 详情弹窗样式 */
.detail-loading {
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.7);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #a78bfa, #818cf8);
  border-radius: 2px;
}

.title-icon {
  color: #fbbf24;
}

.reject-title::before {
  background: linear-gradient(180deg, #f87171, #ef4444);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  word-break: break-word;
}

.info-value.order-no {
  font-family: 'Consolas', 'Monaco', monospace;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.info-value.price {
  color: #fbbf24;
  font-weight: 600;
}

.rating-value {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fbbf24;
  font-weight: 600;
}

.reject-reason {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fca5a5;
  font-size: 14px;
}

/* Element Plus 弹窗样式覆盖 */
:deep(.el-dialog) {
  background: rgba(15, 15, 45, 0.98) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 18px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px 16px 0 0;
}

:deep(.el-dialog__title) {
  color: #ffffff;
  font-weight: 600;
  font-size: 18px;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
  color: rgba(255, 255, 255, 0.9);
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__body::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-dialog__body::-webkit-scrollbar-track) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

:deep(.el-dialog__body::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #ffffff;
}

:deep(.el-tag) {
  border: none;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 24px 16px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .tabs-container :deep(.el-table__body) {
    overflow-x: auto;
  }

  .tabs-container :deep(.el-table) {
    min-width: 800px;
  }
}
</style>
