<template>
  <div class="platform-income-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>平台收入统计</h2>
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          style="width: 260px;"
        />
        <el-button type="primary" @click="resetDate">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <!-- 收入模块卡片 -->
    <div class="income-modules">
      <div
        v-for="mod in incomeModules"
        :key="mod.key"
        class="module-card"
        :class="{ active: activeModule === mod.key }"
        @click="switchModule(mod.key)"
      >
        <div class="module-icon" :style="{ background: mod.color }">
          <el-icon><component :is="mod.icon" /></el-icon>
        </div>
        <div class="module-info">
          <div class="module-name">{{ mod.name }}</div>
          <div class="module-amount">¥{{ formatNumber(mod.commission) }}</div>
          <div class="module-sub">{{ mod.orderCount }} 笔订单</div>
        </div>
        <div class="module-tag">
          <el-tag size="small" :type="mod.key === 'consultation' ? 'success' : 'info'">
            {{ mod.key === 'consultation' ? '已上线' : '预留' }}
          </el-tag>
        </div>
      </div>

      <!-- 总收入汇总 -->
      <div class="module-card total-card">
        <div class="total-content">
          <div class="total-label">平台总抽成</div>
          <div class="total-amount">¥{{ formatNumber(statsData.totalPlatformCommission || 0) }}</div>
          <div class="total-sub">本月 ¥{{ formatNumber(statsData.monthCommission || 0) }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-card trend-chart">
        <div class="chart-header">
          <h3>收入趋势</h3>
          <div class="chart-legend">
            <span class="legend-dot" style="background:#409eff"></span> 平台抽成
            <span class="legend-dot" style="background:#67c23a"></span> 咨询流水
          </div>
        </div>
        <div class="chart-body">
          <div ref="trendChartRef" class="chart-container"></div>
        </div>
      </div>
      <div class="chart-card pie-chart">
        <div class="chart-header">
          <h3>收入构成</h3>
        </div>
        <div class="chart-body">
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions" v-if="activeModule === 'consultation'">
      <el-button type="primary" plain @click="goToDetail">
        <el-icon><View /></el-icon>
        查看心理咨询收入明细
      </el-button>
      <el-button type="info" plain @click="showCommissionRule">
        <el-icon><InfoFilled /></el-icon>
        抽成规则说明
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Money, TrendCharts, PieChart, View, InfoFilled, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getPlatformIncomeStats, getPlatformIncomeTrend } from '@/api/admin/platformIncome.ts'

const router = useRouter()

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 统计数据
const statsData = reactive({
  totalPlatformCommission: 0,
  monthCommission: 0,
  consultation: { totalFee: 0, platformCommission: 0, orderCount: 0 },
  member: { totalFee: 0, platformCommission: 0, orderCount: 0 }
})

// 当前选中模块
const activeModule = ref('consultation')

// 收入模块配置
const incomeModules = ref([
  {
    key: 'consultation',
    name: '心理咨询',
    icon: 'User',
    color: 'linear-gradient(135deg, #11998e, #38ef7d)',
    commission: 0,
    orderCount: 0
  },
  {
    key: 'member',
    name: '会员收入',
    icon: 'UserFilled',
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    commission: 0,
    orderCount: 0
  }
])

// 图表
const trendChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  }
  return num.toFixed(2)
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const params: any = {}
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    const res: any = await getPlatformIncomeStats(params)
    if (res.code === 200) {
      const data = res.data || {}
      statsData.totalPlatformCommission = data.totalPlatformCommission || 0
      statsData.monthCommission = data.monthCommission || 0

      const consult = data.consultation || {}
      statsData.consultation = {
        totalFee: consult.totalFee || 0,
        platformCommission: consult.platformCommission || 0,
        orderCount: consult.orderCount || 0
      }

      const member = data.member || {}
      statsData.member = {
        totalFee: member.totalFee || 0,
        platformCommission: member.platformCommission || 0,
        orderCount: member.orderCount || 0
      }

      // 更新模块数据
      const [consultationModule, memberModule] = incomeModules.value
      if (consultationModule) {
        consultationModule.commission = consult.platformCommission || 0
        consultationModule.orderCount = consult.orderCount || 0
      }
      if (memberModule) {
        memberModule.commission = member.platformCommission || 0
        memberModule.orderCount = member.orderCount || 0
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取统计数据失败')
  }
}

// 获取趋势数据
const fetchTrend = async () => {
  try {
    // 默认最近30天
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)
    const startStr = dateRange.value?.[0] || start.toISOString().slice(0, 10)
    const endStr = dateRange.value?.[1] || end.toISOString().slice(0, 10)

    const res: any = await getPlatformIncomeTrend({
      startDate: startStr,
      endDate: endStr,
      module: activeModule.value === 'consultation' ? 'CONSULTATION' : undefined
    })
    if (res.code === 200) {
      updateCharts(res.data)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取趋势数据失败')
  }
}

// 更新图表
const updateCharts = (data: any) => {
  nextTick(() => {
    // 趋势图
    if (trendChart) trendChart.dispose()
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['平台抽成', '咨询流水'],
          textStyle: { color: '#666' }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.dates || []
        },
        yAxis: {
          type: 'value',
          axisLabel: { formatter: '¥{value}' }
        },
        series: [
          {
            name: '平台抽成',
            type: 'line',
            smooth: true,
            data: data.commissionData || [],
            areaStyle: { color: 'rgba(64,158,255,0.1)' },
            itemStyle: { color: '#409eff' }
          },
          {
            name: '咨询流水',
            type: 'line',
            smooth: true,
            data: data.consultationData || [],
            areaStyle: { color: 'rgba(103,194,58,0.1)' },
            itemStyle: { color: '#67c23a' }
          }
        ]
      })
    }

    // 饼图
    if (pieChart) pieChart.dispose()
    if (pieChartRef.value) {
      pieChart = echarts.init(pieChartRef.value)
      const consultCommission = statsData.consultation.platformCommission || 0
      const memberCommission = statsData.member.platformCommission || 0

      pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '¥{c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left', textStyle: { color: '#666' } },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '¥{c}' },
          data: [
            { value: consultCommission, name: '心理咨询', itemStyle: { color: '#38ef7d' } },
            { value: memberCommission, name: '会员收入', itemStyle: { color: '#764ba2' } }
          ]
        }]
      })
    }
  })
}

// 切换模块
const switchModule = (key: string) => {
  activeModule.value = key
  fetchStats()
  fetchTrend()
}

// 日期变化
const handleDateChange = () => {
  fetchStats()
  fetchTrend()
}

// 重置日期
const resetDate = () => {
  dateRange.value = null
  fetchStats()
  fetchTrend()
}

// 跳转明细
const goToDetail = () => {
  router.push({ name: 'ConsultationIncomeDetail' })
}

// 抽成规则说明
const showCommissionRule = () => {
  ElMessage.info('评分0-1.5分：平台抽成60%  |  评分1.5-3分：平台抽成45%  |  评分3-4.5分：平台抽成30%  |  评分4.5-5分：平台抽成15%')
}

// 窗口调整
const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  fetchStats()
  fetchTrend()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.platform-income-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 模块卡片 */
.income-modules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.module-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.module-card.active {
  border-color: #409eff;
}

.module-card.total-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  cursor: default;
}

.module-card.total-card:hover {
  transform: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.module-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  margin-right: 16px;
  flex-shrink: 0;
}

.module-info {
  flex: 1;
}

.module-name {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.module-amount {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.module-sub {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.module-tag {
  align-self: flex-start;
}

.total-content {
  width: 100%;
  text-align: center;
}

.total-label {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 8px;
}

.total-amount {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}

.total-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.chart-container {
  height: 280px;
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  gap: 12px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
