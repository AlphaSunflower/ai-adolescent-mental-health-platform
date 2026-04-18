<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="header-time">{{ currentTime }}</div>
      </div>
      <div class="header-title">
        <h1>{{ stats.hospitalName || '医院' }}数据概览</h1>
        <span class="subtitle">医院管理后台</span>
      </div>
      <div class="header-right">
        <div class="date-info">{{ currentDate }}</div>
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
          <div class="stat-label">服务患者</div>
          <div class="stat-trend">
            <span class="trend-tag">本月+{{ stats.monthlyNewPatients || 0 }}</span>
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
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalDoctors || 0) }}</div>
          <div class="stat-label">本院医生</div>
          <div class="stat-trend">
            <span class="trend-tag success">已完成 {{ stats.completedAppointments || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ formatNumber(stats.totalRevenue || 0) }}</div>
          <div class="stat-label">收入总额</div>
          <div class="stat-trend">
            <span class="trend-tag">已取消 {{ stats.cancelledAppointments || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon cyan">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ (stats.averageRating || 0).toFixed(1) }}</div>
          <div class="stat-label">平均评分</div>
          <div class="stat-trend">
            <span class="trend-tag success">满意度</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pink">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.monthlyAppointments || 0) }}</div>
          <div class="stat-label">本月预约</div>
          <div class="stat-trend">
            <span class="trend-tag">环比增长</span>
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
      <!-- 科室预约量 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>各科室预约量</h3>
        </div>
        <div class="chart-body">
          <div ref="departmentChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 满意度分布 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>咨询满意度分布</h3>
        </div>
        <div class="chart-body">
          <div ref="satisfactionChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 医生接诊排行 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>医生接诊排行 TOP10</h3>
        </div>
        <div class="chart-body">
          <div class="ranking-list">
            <div
              v-for="(item, index) in (stats.doctorRanking || []).slice(0, 10) as any[]"
              :key="index"
              class="ranking-item"
            >
              <span class="ranking-num" :class="{ top3: Number(index) < 3 }">{{ Number(index) + 1 }}</span>
              <span class="ranking-name">{{ item.realName || item.doctorName || '未知医生' }}</span>
              <span class="ranking-value">{{ item.count || 0 }} 次</span>
            </div>
            <div v-if="!stats.doctorRanking || stats.doctorRanking.length === 0" class="empty-data">
              暂无数据
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
import { getHospitalOverview } from '@/api/stats'
import { User, UserFilled, Calendar, Money, Star, TrendCharts } from '@element-plus/icons-vue'

const stats = reactive<any>({})
const currentTime = ref('')
const currentDate = ref('')

const appointmentTrendChart = ref<HTMLElement>()
const appointmentStatusChart = ref<HTMLElement>()
const departmentChart = ref<HTMLElement>()
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
      lineStyle: { color: '#10B981', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
        ])
      },
      itemStyle: { color: '#10B981' }
    }]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initAppointmentStatusChart = () => {
  if (!appointmentStatusChart.value) return
  const chart = echarts.init(appointmentStatusChart.value)
  const data = stats.appointmentByStatus || []
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    color: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#F5F7FA', borderWidth: 2 },
      label: { show: true, color: '#D1D5DB', formatter: '{b}\n{c}次' },
      data: data.map((d: any) => ({ name: getStatusName(d.status), value: d.count }))
    }]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initDepartmentChart = () => {
  if (!departmentChart.value) return
  const chart = echarts.init(departmentChart.value)
  const data = (stats.departmentAppointments || []).sort((a: any, b: any) => b.count - a.count)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: '#E8E8E8' } }
    },
    yAxis: {
      type: 'category',
      data: data.map((d: any) => d.departmentName || '未知').reverse(),
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '预约量',
      type: 'bar',
      data: data.map((d: any) => d.count).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#06B6D4' },
          { offset: 1, color: '#3B82F6' }
        ]),
        borderRadius: [0, 4, 4, 0]
      }
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
  initDepartmentChart()
  initSatisfactionChart()
}

const fetchData = async () => {
  try {
    const res = await getHospitalOverview()
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
  background: linear-gradient(90deg, rgba(103, 194, 58, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  margin-bottom: 24px;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #34D399, #06B6D4);
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
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.15);
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
  background: rgba(103, 194, 58, 0.2);
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

.ranking-list {
  height: 200px;
  overflow-y: auto;
}

.ranking-list::-webkit-scrollbar {
  width: 4px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.3);
  border-radius: 2px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F5F7FA;
}

.ranking-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: rgba(103, 194, 58, 0.2);
  color: #34D399;
  margin-right: 12px;
  flex-shrink: 0;
}

.ranking-num.top3 {
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  color: #fff;
}

.ranking-name {
  flex: 1;
  font-size: 13px;
  color: #D1D5DB;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-value {
  font-size: 12px;
  color: #909399;
  margin-left: 12px;
  flex-shrink: 0;
}

.empty-data {
  text-align: center;
  padding: 40px 0;
  color: #6B7280;
  font-size: 14px;
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
