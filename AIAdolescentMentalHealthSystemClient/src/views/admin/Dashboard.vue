<template>
  <div class="dashboard">
    <!-- 核心指标卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalUsers || 0) }}</div>
          <div class="stat-label">用户总数</div>
          <div class="stat-trend">
            <span class="trend-tag">本月+{{ stats.monthlyNewUsers || 0 }}</span>
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
          <div class="stat-label">医生总数</div>
          <div class="stat-trend">
            <span class="trend-tag">{{ stats.totalHospitals || 0 }} 家医院</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Reading /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalArticles || 0) }}</div>
          <div class="stat-label">心理文章</div>
          <div class="stat-trend">
            <span class="trend-tag">{{ stats.totalCourses || 0 }} 课程</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon cyan">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(stats.totalAssessments || 0) }}</div>
          <div class="stat-label">心理测评</div>
          <div class="stat-trend">
            <span class="trend-tag success">AI问诊 {{ stats.totalAiConsultations || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pink">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ formatNumber(stats.totalRevenue || 0) }}</div>
          <div class="stat-label">总收入</div>
          <div class="stat-trend">
            <span class="trend-tag success">已完成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 中部图表区域 -->
    <div class="charts-row">
      <!-- 用户增长趋势 -->
      <div class="chart-card flex-2">
        <div class="chart-header">
          <h3>用户增长趋势</h3>
        </div>
        <div class="chart-body">
          <div ref="userTrendChart" class="chart-container"></div>
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
      <!-- 各医院预约量 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>各医院预约量</h3>
        </div>
        <div class="chart-body">
          <div ref="hospitalAppointmentChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 咨询满意度 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>咨询满意度分布</h3>
        </div>
        <div class="chart-body">
          <div ref="satisfactionChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 科室预约量排名 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>科室预约量排名</h3>
        </div>
        <div class="chart-body">
          <div ref="departmentChart" class="chart-container"></div>
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

    <!-- 内容统计区域 -->
    <div class="charts-row">
      <!-- 文章浏览排行 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>热门文章 TOP5</h3>
        </div>
        <div class="chart-body">
          <div class="article-list">
            <div
              v-for="(item, index) in (stats.articleRanking || []).slice(0, 5) as any[]"
              :key="index"
              class="article-item"
            >
              <span class="article-num" :class="{ top3: Number(index) < 3 }">{{ Number(index) + 1 }}</span>
              <span class="article-title">{{ item.title || '未知文章' }}</span>
              <span class="article-views">{{ item.viewCount || 0 }} 阅读</span>
            </div>
            <div v-if="!stats.articleRanking || stats.articleRanking.length === 0" class="empty-data">
              暂无数据
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势统计 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>内容发布趋势</h3>
        </div>
        <div class="chart-body">
          <div ref="contentTrendChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 用户角色分布 -->
      <div class="chart-card flex-1">
        <div class="chart-header">
          <h3>用户角色分布</h3>
        </div>
        <div class="chart-body">
          <div ref="userRoleChart" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getAdminOverview } from '@/api/stats'
import { User, UserFilled, Calendar, Reading, ChatDotRound, Money } from '@element-plus/icons-vue'

const stats = reactive<any>({})
const currentTime = ref('')
const currentDate = ref('')

const userTrendChart = ref<HTMLElement>()
const appointmentStatusChart = ref<HTMLElement>()
const hospitalAppointmentChart = ref<HTMLElement>()
const satisfactionChart = ref<HTMLElement>()
const departmentChart = ref<HTMLElement>()
const contentTrendChart = ref<HTMLElement>()
const userRoleChart = ref<HTMLElement>()

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

const getRoleName = (role: number) => {
  const roleMap: any = { 0: '游客', 1: '普通用户', 2: '医生', 3: '医院管理员', 4: '超级管理员' }
  return roleMap[role] || '未知'
}

const getStatusName = (status: number) => {
  const statusMap: any = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约' }
  return statusMap[status] || '未知'
}

const initUserTrendChart = () => {
  if (!userTrendChart.value) return
  const chart = echarts.init(userTrendChart.value)
  const data = (stats.userTrend || []).reverse()
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d: any) => d.month),
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
      name: '用户数',
      type: 'line',
      smooth: true,
      data: data.map((d: any) => d.count),
      lineStyle: { color: '#3B82F6', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
        ])
      },
      itemStyle: { color: '#3B82F6' }
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
      itemStyle: { borderRadius: 8, borderColor: '#0F172A', borderWidth: 2 },
      label: { show: true, color: '#606266', formatter: '{b}\n{c}次' },
      data: data.map((d: any) => ({ name: getStatusName(d.status), value: d.count }))
    }]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initHospitalAppointmentChart = () => {
  if (!hospitalAppointmentChart.value) return
  const chart = echarts.init(hospitalAppointmentChart.value)
  const data = stats.appointmentByHospital || []
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d: any) => d.hospitalName || '未知'),
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399', rotate: 15 }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: '#E8E8E8' } }
    },
    series: [{
      name: '预约量',
      type: 'bar',
      data: data.map((d: any) => d.count),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#6366F1' },
          { offset: 1, color: '#8B5CF6' }
        ]),
        borderRadius: [4, 4, 0, 0]
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

const initContentTrendChart = () => {
  if (!contentTrendChart.value) return
  const chart = echarts.init(contentTrendChart.value)
  const articleData = (stats.articleTrend || []).reverse()
  const assessmentData = (stats.assessmentTrend || []).reverse()
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['文章', '测评'], textStyle: { color: '#606266' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: articleData.map((d: any) => d.month),
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#CCCCCC' } },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: '#E8E8E8' } }
    },
    series: [
      {
        name: '文章',
        type: 'line',
        smooth: true,
        data: articleData.map((d: any) => d.count),
        lineStyle: { color: '#10B981', width: 2 },
        itemStyle: { color: '#10B981' }
      },
      {
        name: '测评',
        type: 'line',
        smooth: true,
        data: assessmentData.map((d: any) => d.count),
        lineStyle: { color: '#F59E0B', width: 2 },
        itemStyle: { color: '#F59E0B' }
      }
    ]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initUserRoleChart = () => {
  if (!userRoleChart.value) return
  const chart = echarts.init(userRoleChart.value)
  const data = stats.userRoleDistribution || []
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    color: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
    series: [{
      type: 'pie',
      radius: ['35%', '65%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#0F172A', borderWidth: 2 },
      label: { show: true, color: '#606266', formatter: '{b}\n{c}人' },
      data: data.map((d: any) => ({ name: getRoleName(d.role), value: d.count }))
    }]
  }
  chart.setOption(option)
  chartInstances.push(chart)
}

const initAllCharts = async () => {
  await nextTick()
  chartInstances.forEach(chart => chart.dispose())
  chartInstances = []
  initUserTrendChart()
  initAppointmentStatusChart()
  initHospitalAppointmentChart()
  initSatisfactionChart()
  initDepartmentChart()
  initContentTrendChart()
  initUserRoleChart()
}

const fetchData = async () => {
  try {
    const res = await getAdminOverview()
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
  background: #F5F7FA;
  min-height: calc(100vh - 60px);
  padding: 20px;
  color: #303133;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  margin-bottom: 24px;
}

.header-title h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #303133;
}

.header-title .subtitle {
  font-size: 14px;
  color: #909399;
}

.header-time, .date-info {
  font-size: 16px;
  color: #606266;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.12);
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
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.trend-tag.warning {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.trend-tag.success {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
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

.ranking-list, .article-list {
  height: 200px;
  overflow-y: auto;
}

.ranking-list::-webkit-scrollbar, .article-list::-webkit-scrollbar {
  width: 4px;
}

.ranking-list::-webkit-scrollbar-thumb, .article-list::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.2);
  border-radius: 2px;
}

.ranking-item, .article-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F5F7FA;
}

.ranking-num, .article-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  margin-right: 12px;
  flex-shrink: 0;
}

.ranking-num.top3, .article-num.top3 {
  background: linear-gradient(135deg, #E6A23C, #F56C6C);
  color: #fff;
}

.ranking-name, .article-title {
  flex: 1;
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-value, .article-views {
  font-size: 12px;
  color: #909399;
  margin-left: 12px;
  flex-shrink: 0;
}

.empty-data {
  text-align: center;
  padding: 40px 0;
  color: #C0C4CC;
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
