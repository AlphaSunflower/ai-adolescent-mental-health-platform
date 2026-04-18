<template>
  <div class="psychologist-income-container">
    <div class="page-header">
      <h1 class="page-title">我的收入</h1>
    </div>

    <!-- 收入统计卡片 -->
    <div class="income-stats">
      <div class="stat-card highlight">
        <div class="stat-icon gold">
          <el-icon size="32"><Wallet /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ statsData.availableBalance }}</span>
          <span class="stat-label">可提现余额</span>
        </div>
        <el-button type="primary" class="withdraw-btn" @click="showWithdrawDialog" :disabled="statsData.availableBalance <= 0">
          提现
        </el-button>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon size="32"><Coin /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ statsData.totalIncome || 0 }}</span>
          <span class="stat-label">累计收入</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon size="32"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ statsData.pendingBalance || 0 }}</span>
          <span class="stat-label">待结算金额</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon size="32"><Star /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statsData.averageRating || 0 }}</span>
          <span class="stat-label">我的评分</span>
        </div>
      </div>
    </div>

    <!-- 本月数据概览 -->
    <div class="month-overview">
      <div class="month-stat">
        <span class="month-label">本月收入</span>
        <span class="month-value">¥{{ statsData.monthIncome || 0 }}</span>
      </div>
      <div class="month-stat">
        <span class="month-label">本月订单</span>
        <span class="month-value">{{ statsData.totalOrders || 0 }} 单</span>
      </div>
      <div class="month-stat">
        <span class="month-label">累计提现</span>
        <span class="month-value">¥{{ statsData.totalWithdraw || 0 }}</span>
      </div>
    </div>

    <!-- 收入趋势图表 -->
    <div class="income-chart-section">
      <div class="section-header">
        <h2 class="section-title">收入趋势</h2>
        <div class="trend-tabs">
          <span 
            v-for="item in trendTabs" 
            :key="item.value"
            :class="['trend-tab', { active: trendDays === item.value }]"
            @click="changeTrendDays(item.value)"
          >
            {{ item.label }}
          </span>
        </div>
      </div>
      <div class="chart-container">
        <div ref="chartRef" class="chart"></div>
        <el-empty v-if="trendData.length === 0 && !chartLoading" description="暂无收入数据" :image-size="60" />
      </div>
    </div>

    <!-- 收入记录 -->
    <div class="income-records">
      <div class="section-header">
        <h2 class="section-title">收入记录</h2>
      </div>
      <el-table :data="incomeRecords" v-loading="loading" stripe>
        <el-table-column prop="createTime" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderFee" label="订单金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.orderFee }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="commissionAmount" label="平台抽成" width="120">
          <template #default="{ row }">
            <span class="fee">-¥{{ row.commissionAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="incomeAmount" label="我的收入" width="120">
          <template #default="{ row }">
            <span class="income">+¥{{ row.incomeAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="commissionRate" label="抽成比例" width="100">
          <template #default="{ row }">
            {{ ((row.commissionRate || 0) * 100).toFixed(0) }}%
          </template>
        </el-table-column>
        <el-table-column prop="ratingScore" label="用户评分" width="100">
          <template #default="{ row }">
            <span v-if="row.ratingScore">{{ row.ratingScore }}分</span>
            <span v-else class="gray">-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper"
          @current-change="fetchIncomeRecords"
        />
      </div>
    </div>

    <!-- 提现对话框 -->
    <el-dialog v-model="withdrawDialogVisible" title="申请提现" width="500px" class="withdraw-dialog">
      <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef" label-width="100px">
        <el-form-item label="可提现金额">
          <span class="available-amount">¥{{ statsData.availableBalance }}</span>
        </el-form-item>
        <el-form-item label="提现金额" prop="amount">
          <el-input-number 
            v-model="withdrawForm.amount" 
            :min="10" 
            :max="statsData.availableBalance" 
            :step="10"
            :precision="0"
            style="width: 200px;"
          />
          <span class="withdraw-tip">最低提现10元</span>
        </el-form-item>
        <el-form-item label="收款方式" prop="withdrawType">
          <el-radio-group v-model="withdrawForm.withdrawType">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信</el-radio>
            <el-radio label="bank">银行卡</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="withdrawDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitWithdraw" :loading="submitting">确认提现</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Wallet, Coin, Clock, Star } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { 
  getMyIncomeStats, 
  getMyIncomeList, 
  getMyBalance, 
  applyWithdraw,
  getIncomeTrend
} from '@/api/psychologistAdminPage'

const chartRef = ref<HTMLElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)
const loading = ref(false)
const chartLoading = ref(false)
const submitting = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const incomeRecords = ref<any[]>([])
const trendDays = ref(7)
const trendData = ref<any[]>([])

const trendTabs = [
  { label: '近7天', value: 7 },
  { label: '近15天', value: 15 },
  { label: '近30天', value: 30 }
]

const statsData = reactive({
  totalIncome: 0,
  totalWithdraw: 0,
  availableBalance: 0,
  frozenAmount: 0,
  monthIncome: 0,
  pendingBalance: 0,
  totalOrders: 0,
  averageRating: 0
})

const withdrawDialogVisible = ref(false)
const withdrawFormRef = ref<FormInstance>()
const withdrawForm = reactive({
  amount: 100,
  withdrawType: 'alipay'
})

const withdrawRules: FormRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (value < 10) {
          callback(new Error('最低提现10元'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  withdrawType: [
    { required: true, message: '请选择收款方式', trigger: 'change' }
  ]
}

// 获取收入统计数据
const fetchStats = async () => {
  try {
    const res: any = await getMyIncomeStats()
    if (res.code === 200 && res.data) {
      const data = res.data
      statsData.totalIncome = data.totalIncome || 0
      statsData.totalWithdraw = data.totalWithdraw || 0
      statsData.availableBalance = data.availableBalance || 0
      statsData.monthIncome = data.monthIncome || 0
      statsData.pendingBalance = data.pendingBalance || 0
      statsData.totalOrders = data.totalOrders || 0
      statsData.averageRating = data.averageRating || 0
    }
  } catch (e) {
    console.error('获取收入统计失败', e)
  }
}

// 获取余额信息
const fetchBalance = async () => {
  try {
    const res: any = await getMyBalance()
    if (res.code === 200 && res.data) {
      const data = res.data
      statsData.availableBalance = data.balance || 0
      statsData.frozenAmount = data.frozenAmount || 0
    }
  } catch (e) {
    console.error('获取余额失败', e)
  }
}

// 获取收入记录
const fetchIncomeRecords = () => {
  loading.value = true
  getMyIncomeList({ page: currentPage.value, size: pageSize.value }).then((res: any) => {
    if (res.code === 200) {
      incomeRecords.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.message || '获取收入记录失败')
    }
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

// 获取收入趋势
const fetchTrend = () => {
  chartLoading.value = true
  getIncomeTrend({ days: trendDays.value }).then((res: any) => {
    if (res.code === 200) {
      trendData.value = res.data || []
      nextTick(() => {
        initChart()
      })
    }
    chartLoading.value = false
  }).catch(() => {
    chartLoading.value = false
  })
}

// 切换趋势时间范围
const changeTrendDays = (days: number) => {
  trendDays.value = days
  fetchTrend()
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  
  chartInstance.value = echarts.init(chartRef.value)
  
  const dates = trendData.value.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  const incomes = trendData.value.map(item => item.income || 0)
  const counts = trendData.value.map(item => item.count || 0)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: { color: '#303133' },
      formatter: (params: any) => {
        let result = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach((item: any) => {
          result += `<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color};"></span>
            <span>${item.seriesName}: <strong>${item.value}${item.seriesIndex === 0 ? '元' : '单'}</strong></span>
          </div>`
        })
        return result
      }
    },
    legend: {
      data: ['日收入', '日订单数'],
      bottom: 0,
      textStyle: { color: '#606266' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: [
      { 
        type: 'value', 
        name: '收入(元)',
        axisLine: { show: true, lineStyle: { color: '#409EFF' } }, 
        axisLabel: { color: '#606266', formatter: '{value}' }, 
        splitLine: { lineStyle: { color: '#ebeef5' } } 
      },
      { 
        type: 'value', 
        name: '订单数',
        axisLine: { show: true, lineStyle: { color: '#67C23A' } }, 
        axisLabel: { color: '#606266', formatter: '{value}' }, 
        splitLine: { show: false } 
      }
    ],
    series: [
      { 
        name: '日收入', 
        type: 'bar', 
        data: incomes, 
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#79BBFF' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        barWidth: '40%'
      },
      { 
        name: '日订单数', 
        type: 'line', 
        yAxisIndex: 1, 
        data: counts, 
        smooth: true, 
        lineStyle: { color: '#67C23A', width: 2 },
        itemStyle: { color: '#67C23A' },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  }
  
  chartInstance.value.setOption(option)
}

// 窗口调整时重绘图表
const handleResize = () => {
  chartInstance.value?.resize()
}

// 显示提现对话框
const showWithdrawDialog = () => {
  withdrawForm.amount = Math.min(100, statsData.availableBalance)
  withdrawDialogVisible.value = true
}

// 提交提现
const submitWithdraw = async () => {
  if (!withdrawFormRef.value) return
  
  await withdrawFormRef.value.validate(async (valid) => {
    if (valid) {
      if (withdrawForm.amount < 10) {
        ElMessage.warning('提现金额不能少于10元')
        return
      }
      submitting.value = true
      try {
        const res: any = await applyWithdraw(withdrawForm.amount)
        if (res.code === 200) {
          ElMessage.success('提现申请已提交')
          withdrawDialogVisible.value = false
          fetchStats()
          fetchBalance()
        } else {
          ElMessage.error(res.message || '提现申请失败')
        }
      } catch (e: any) {
        ElMessage.error(e.message || '提现申请失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchStats()
  fetchBalance()
  fetchIncomeRecords()
  fetchTrend()
  nextTick(() => {
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance.value?.dispose()
})
</script>

<style scoped>
.psychologist-income-container {
  min-height: calc(100vh - 200px);
  padding: 32px 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
}

.page-header {
  margin-bottom: 28px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

/* 统计卡片 */
.income-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.stat-card.highlight .stat-info,
.stat-card.highlight .stat-value,
.stat-card.highlight .stat-label {
  color: #fff !important;
}

.stat-card.highlight .withdraw-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.stat-card.highlight .withdraw-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.gold { background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%); color: #e6a23c; }
.stat-icon.blue { background: linear-gradient(135deg, #ecf5ff 0%, #c6e2ff 100%); color: #409eff; }
.stat-icon.orange { background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%); color: #f56c6c; }
.stat-icon.purple { background: linear-gradient(135deg, #f4ecff 0%, #e9d5ff 100%); color: #904afa; }

.stat-info { flex: 1; }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: #303133; line-height: 1.2; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; display: block; }

.withdraw-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}

/* 本月概览 */
.month-overview {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
}

.month-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 10px;
}

.month-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.month-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

/* 收入图表 */
.income-chart-section {
  margin-bottom: 24px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.trend-tabs {
  display: flex;
  gap: 8px;
}

.trend-tab {
  padding: 6px 16px;
  font-size: 13px;
  color: #606266;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.trend-tab:hover {
  color: #409eff;
}

.trend-tab.active {
  background: #409eff;
  color: #fff;
}

.chart-container {
  position: relative;
  min-height: 280px;
}

.chart {
  height: 280px;
}

/* 收入记录 */
.income-records {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 24px;
}

.amount { color: #303133; font-weight: 500; }
.fee { color: #f56c6c; }
.income { color: #10b981; font-weight: 600; }
.gray { color: #c0c4cc; }

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 提现对话框 */
.withdraw-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 16px;
}

.withdraw-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
}

.available-amount { 
  font-size: 28px; 
  font-weight: 700; 
  color: #409eff; 
}

.withdraw-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1200px) {
  .income-stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .income-stats { grid-template-columns: 1fr; }
  .month-overview { flex-direction: column; }
  .section-header { flex-direction: column; gap: 12px; }
  .psychologist-income-container { padding: 20px 16px; }
}
</style>
