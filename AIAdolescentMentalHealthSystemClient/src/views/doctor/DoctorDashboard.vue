<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="header-time">{{ currentTime }}</div>
      </div>
      <div class="header-title">
        <h1>{{ stats.doctorName || '医生' }}工作台</h1>
        <span class="subtitle">{{ stats.hospitalName || '' }} · {{ stats.departmentName || '' }} · {{ stats.title || '' }}</span>
      </div>
      <div class="header-right">
        <div class="date-info">{{ currentDate }}</div>
      </div>
    </div>

    <!-- 今日概览 -->
    <div class="today-overview">
      <div class="overview-item">
        <div class="overview-icon blue">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ stats.todayAppointments || 0 }}</div>
          <div class="overview-label">今日预约</div>
        </div>
      </div>
      <div class="overview-item">
        <div class="overview-icon green">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ stats.todayCompleted || 0 }}</div>
          <div class="overview-label">今日已完成</div>
        </div>
      </div>
      <div class="overview-item">
        <div class="overview-icon purple">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="overview-content">
          <div class="overview-value">{{ stats.tomorrowAppointments || 0 }}</div>
          <div class="overview-label">明日预约</div>
        </div>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalPatients || 0) }}</div>
          <div class="stat-label">累计患者</div>
          <div class="stat-trend">
            <span class="trend-tag">本月+{{ stats.monthlyPatients || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalAppointments || 0) }}</div>
          <div class="stat-label">预约总量</div>
          <div class="stat-trend">
            <span class="trend-tag warning">待就诊 {{ stats.pendingAppointments || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon><Finished /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.completedAppointments || 0) }}</div>
          <div class="stat-label">已完成</div>
          <div class="stat-trend">
            <span class="trend-tag success">好评率 {{ calcGoodRate() }}%</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.noShowAppointments || 0 }}</div>
          <div class="stat-label">爽约次数</div>
          <div class="stat-trend">
            <span class="trend-tag">取消 {{ stats.cancelledAppointments || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon cyan">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalMedicalRecords || 0) }}</div>
          <div class="stat-label">病历记录</div>
          <div class="stat-trend">
            <span class="trend-tag">本月 {{ stats.monthlyAppointments || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pink">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ formatNumber(stats.totalRevenue || 0) }}</div>
          <div class="stat-label">咨询收入</div>
          <div class="stat-trend">
            <span class="trend-tag success">排班利用率 {{ (stats.scheduleUtilization || 0).toFixed(0) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 中部图表区域 -->
    <div class="charts-row">
      <!-- 预约趋势 -->
      <div class="chart-card flex-2">
        <div class="chart-header">
          <h3>预约量趋势（近30天）</h3>
        </div>
        <div class="chart-body">
          <div ref="appointmentTrendChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 预约状态分布 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>预约状态分布</h3>
        </div>
        <div class="chart-body">
          <div ref="appointmentStatusChart" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 底部图表区域 -->
    <div class="charts-row">
      <!-- 满意度分布 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>咨询满意度分布</h3>
        </div>
        <div class="chart-body">
          <div ref="satisfactionChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 评分概览 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>评分概览</h3>
        </div>
        <div class="chart-body rating-overview">
          <div class="rating-main">
            <div class="rating-score">{{ (stats.averageRating || 0).toFixed(1) }}</div>
            <div class="rating-stars">
              <el-icon v-for="i in 5" :key="i" :class="{ active: i <= Math.round(stats.averageRating || 0) }">
                <Star />
              </el-icon>
            </div>
            <div class="rating-count">共 {{ stats.totalRatings || 0 }} 条评价</div>
          </div>
          <div class="rating-detail">
            <div class="rating-item">
              <span class="rating-label">5星</span>
              <div class="rating-bar">
                <div class="rating-bar-fill" :style="{ width: calcRatingPercent(5) + '%' }"></div>
              </div>
              <span class="rating-value">{{ getRatingCount(5) }}</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">4星</span>
              <div class="rating-bar">
                <div class="rating-bar-fill" :style="{ width: calcRatingPercent(4) + '%' }"></div>
              </div>
              <span class="rating-value">{{ getRatingCount(4) }}</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">3星</span>
              <div class="rating-bar">
                <div class="rating-bar-fill" :style="{ width: calcRatingPercent(3) + '%' }"></div>
              </div>
              <span class="rating-value">{{ getRatingCount(3) }}</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">2星</span>
              <div class="rating-bar">
                <div class="rating-bar-fill" :style="{ width: calcRatingPercent(2) + '%' }"></div>
              </div>
              <span class="rating-value">{{ getRatingCount(2) }}</span>
            </div>
            <div class="rating-item">
              <span class="rating-label">1星</span>
              <div class="rating-bar">
                <div class="rating-bar-fill" :style="{ width: calcRatingPercent(1) + '%' }"></div>
              </div>
              <span class="rating-value">{{ getRatingCount(1) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 排班情况 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>排班情况</h3>
        </div>
        <div class="chart-body schedule-overview">
          <div class="schedule-circle">
            <div class="schedule-value">{{ (stats.scheduleUtilization || 0).toFixed(0) }}%</div>
            <div class="schedule-label">排班利用率</div>
          </div>
          <div class="schedule-info">
            <div class="schedule-item">
              <span class="schedule-dot available"></span>
              <span class="schedule-text">可用排班: {{ stats.availableSchedules || 0 }}</span>
            </div>
            <div class="schedule-item">
              <span class="schedule-dot total"></span>
              <span class="schedule-text">总排班数: {{ stats.totalSchedules || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDoctorOverview } from '@/api/stats'
import {
  User, Calendar, Money, Star, Clock, CircleCheck,
  Finished, Warning, Document
} from '@element-plus/icons-vue'

const stats = reactive<any>({})
const currentTime = ref('')
const currentDate = ref('')

const appointmentTrendChart = ref<HTMLElement>()
const appointmentStatusChart = ref<HTMLElement>()
const satisfactionChart = ref<HTMLElement>()

let chartInstances: any[] = []
let timeInterval: any = null

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

const getStatusName = (status: number) => {
  const statusMap: any = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约' }
  return statusMap[status] || '未知'
}

const calcGoodRate = () => {
  if (!stats.totalRatings || stats.totalRatings === 0) return 0
  return ((stats.goodRatingCount || 0) / stats.totalRatings * 100).toFixed(0)
}

const getRatingCount = (rating: number) => {
  const data = stats.satisfactionDistribution || []
  const item = data.find((d: any) => d.rating === rating)
  return item ? item.count : 0
}

const calcRatingPercent = (rating: number) => {
  if (!stats.totalRatings || stats.totalRatings === 0) return 0
  return (getRatingCount(rating) / stats.totalRatings * 100)
}

const initAppointmentTrendChart = () => {
  if (!appointmentTrendChart.value) return
  const chart = echarts.init(appointmentTrendChart.value)
  const data = stats.appointmentTrend || []
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d: any) => d.day),
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399', rotate: 30 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: '#E8E8E8' } }
    },
    series: [{
      name: '预约量',
      type: 'line',
      smooth: true,
      data: data.map((d: any) => d.count),
      lineStyle: { color: '#8B5CF6', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
          { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
        ])
      },
      itemStyle: { color: '#8B5CF6' }
    }]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initAppointmentStatusChart = () => {
  if (!appointmentStatusChart.value) return
  const chart = echarts.init(appointmentStatusChart.value)
  const statusData = [
    { status: 0, count: stats.pendingAppointments || 0 },
    { status: 1, count: stats.completedAppointments || 0 },
    { status: 2, count: stats.cancelledAppointments || 0 },
    { status: 3, count: stats.noShowAppointments || 0 }
  ]
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    color: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#F5F7FA', borderWidth: 2 },
      label: { show: true, color: '#D1D5DB', formatter: '{b}\n{c}次' },
      data: statusData.map(d => ({ name: getStatusName(d.status), value: d.count }))
    }]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initSatisfactionChart = () => {
  if (!satisfactionChart.value) return
  const chart = echarts.init(satisfactionChart.value)
  const data = stats.satisfactionDistribution || []
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1星', '2星', '3星', '4星', '5星'],
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: '#E8E8E8' } }
    },
    series: [{
      name: '评价数',
      type: 'bar',
      data: [1, 2, 3, 4, 5].map(rating => {
        const item = data.find((d: any) => d.rating === rating)
        return item ? item.count : 0
      }),
      itemStyle: {
        color: (params: any) => {
          const colors = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981']
          return colors[params.dataIndex]
        },
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initAllCharts = async () => {
  await nextTick()
  chartInstances.forEach(chart => chart.dispose())
  chartInstances = []
  initAppointmentTrendChart()
  initAppointmentStatusChart()
  initSatisfactionChart()
}

const fetchData = async () => {
  try {
    const res = await getDoctorOverview()
    if (res.code === 200) {
      Object.assign(stats, res.data || {})
      await initAllCharts()
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const handleResize = () => {
  chartInstances.forEach(chart => chart.resize())
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  window.removeEventListener('resize', handleResize)
  chartInstances.forEach(chart => chart.dispose())
})
</script>

<style scoped>
.dashboard {
  background: linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%);
  min-height: calc(100vh - 60px);
  padding: 20px;
  color: #303133;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  margin-bottom: 24px;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #A78BFA, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-title .subtitle {
  font-size: 14px;
  color: #909399;
}

.header-time, .date-info {
  font-size: 16px;
  color: #D1D5DB;
  font-weight: 500;
}

.today-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  border-radius: 16px;
}

.overview-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.overview-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.overview-icon.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.overview-icon.green { background: linear-gradient(135deg, #10B981, #059669); }
.overview-icon.purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }

.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.overview-label {
  font-size: 13px;
  color: #909399;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-icon.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.stat-icon.green { background: linear-gradient(135deg, #10B981, #059669); }
.stat-icon.purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
.stat-icon.orange { background: linear-gradient(135deg, #F59E0B, #D97706); }
.stat-icon.cyan { background: linear-gradient(135deg, #06B6D4, #0891B2); }
.stat-icon.pink { background: linear-gradient(135deg, #EC4899, #DB2777); }

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.stat-trend {
  margin-top: 8px;
}

.trend-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: rgba(59, 130, 246, 0.2);
  color: #60A5FA;
}

.trend-tag.warning {
  background: rgba(245, 158, 11, 0.2);
  color: #FBBF24;
}

.trend-tag.success {
  background: rgba(16, 185, 129, 0.2);
  color: #34D399;
}

.charts-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: #FFFFFF;
  border: 1px solid #EBEEF5;
  border-radius: 16px;
  padding: 20px;
  flex: 1;
}

.chart-card.flex-1 { flex: 1; min-width: 0; }
.chart-card.flex-2 { flex: 2; min-width: 0; }

.chart-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EBEEF5;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.chart-body {
  min-height: 200px;
}

.chart-container {
  width: 100%;
  height: 200px;
}

.rating-overview {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 10px 0;
}

.rating-main {
  text-align: center;
}

.rating-score {
  font-size: 48px;
  font-weight: 700;
  color: #F59E0B;
  line-height: 1;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin: 8px 0;
  font-size: 20px;
  color: #CCCCCC;
}

.rating-stars .active {
  color: #F59E0B;
}

.rating-count {
  font-size: 12px;
  color: #909399;
}

.rating-detail {
  flex: 1;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.rating-label {
  width: 30px;
  font-size: 12px;
  color: #909399;
}

.rating-bar {
  flex: 1;
  height: 8px;
  background: #EBEEF5;
  border-radius: 4px;
  overflow: hidden;
}

.rating-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #F59E0B, #FBBF24);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.rating-value {
  width: 30px;
  text-align: right;
  font-size: 12px;
  color: #D1D5DB;
}

.schedule-overview {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 10px 0;
}

.schedule-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    rgba(139, 92, 246, 0.2) 0deg,
    rgba(139, 92, 246, 0.2) calc(var(--percent, 0) * 3.6deg),
    rgba(139, 92, 246, 0.1) calc(var(--percent, 0) * 3.6deg)
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.schedule-circle::before {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  background: #FFFFFF;
  border-radius: 50%;
}

.schedule-value {
  font-size: 24px;
  font-weight: 700;
  color: #A78BFA;
  position: relative;
  z-index: 1;
}

.schedule-label {
  font-size: 10px;
  color: #909399;
  position: relative;
  z-index: 1;
}

.schedule-info {
  flex: 1;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.schedule-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.schedule-dot.available { background: #10B981; }
.schedule-dot.total { background: #8B5CF6; }

.schedule-text {
  font-size: 13px;
  color: #D1D5DB;
}

@media (max-width: 1600px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    flex-wrap: wrap;
  }
  .chart-card {
    min-width: calc(50% - 10px);
  }
}
</style>
