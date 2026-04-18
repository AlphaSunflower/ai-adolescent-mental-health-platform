<template>
  <div class="consultation-income-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="router.back()" text>
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>心理咨询收入明细</h2>
      </div>
    </div>

    <!-- 统计摘要 -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-label">总订单数</div>
        <div class="summary-value">{{ summary.totalCount }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">总收入流水</div>
        <div class="summary-value">¥{{ formatMoney(summary.totalFee) }}</div>
      </div>
      <div class="summary-card highlight">
        <div class="summary-label">平台总抽成</div>
        <div class="summary-value">¥{{ formatMoney(summary.totalCommission) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">平均评分</div>
        <div class="summary-value">{{ summary.avgRating }}</div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>咨询师</label>
          <el-select
            v-model="filters.psychologistId"
            placeholder="全部咨询师"
            clearable
            filterable
            @change="handleFilterChange"
            style="width: 200px"
          >
            <el-option
              v-for="p in psychologistOptions"
              :key="p.id"
              :label="p.realName"
              :value="p.id"
            />
          </el-select>
        </div>

        <div class="filter-item">
          <label>评分范围</label>
          <el-select
            v-model="filters.ratingRange"
            placeholder="全部评分"
            clearable
            @change="handleFilterChange"
            style="width: 180px"
          >
            <el-option label="0 - 1.5 分（高抽成60%）" :value="1" />
            <el-option label="1.5 - 3 分（抽成45%）" :value="2" />
            <el-option label="3 - 4.5 分（抽成30%）" :value="3" />
            <el-option label="4.5 - 5 分（低抽成15%）" :value="4" />
          </el-select>
        </div>

        <div class="filter-item">
          <label>日期范围</label>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
            @change="handleFilterChange"
            style="width: 240px"
          />
        </div>

        <div class="filter-item">
          <el-button type="primary" @click="handleFilterChange">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="咨询师" min-width="140">
          <template #default="scope">
            <div class="psychologist-cell">
              <el-avatar :size="32" :src="scope.row.psychologistAvatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="name">{{ scope.row.psychologistName || '未知' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderId" label="订单ID" width="120">
          <template #default="scope">
            <span class="order-id">#{{ scope.row.orderId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" width="120">
          <template #default="scope">
            <span class="amount">¥{{ scope.row.orderFee || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="100">
          <template #default="scope">
            <el-rate
              v-model="scope.row.ratingScore"
              disabled
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              :max="5"
              style="display:inline-flex"
            />
            <span style="margin-left:4px;vertical-align:middle">
              {{ scope.row.ratingScore ? scope.row.ratingScore.toFixed(1) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="抽成比例" width="110">
          <template #default="scope">
            <el-tag :type="getCommissionTagType(scope.row.commissionRate)" size="small">
              {{ formatRate(scope.row.commissionRate) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="抽成金额" width="120">
          <template #default="scope">
            <span class="commission">¥{{ scope.row.commissionAmount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="生成时间" min-width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search, Refresh, User } from '@element-plus/icons-vue'
import { getConsultationIncomeList } from '@/api/admin/platformIncome'
import { getAdminPsychologistList } from '@/api/psychologistAdmin'

const router = useRouter()

// 咨询师选项
const psychologistOptions = ref<any[]>([])

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 摘要统计
const summary = reactive({
  totalCount: 0,
  totalFee: 0,
  totalCommission: 0,
  avgRating: '-'
})

// 筛选条件
const filters = reactive({
  psychologistId: null as number | null,
  ratingRange: null as number | null,
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 格式化金额
const formatMoney = (val: number) => {
  if (!val) return '0.00'
  if (val >= 10000) return (val / 10000).toFixed(2) + '万'
  return val.toFixed(2)
}

// 格式化评分
const formatRate = (rate: number) => {
  if (!rate) return '-'
  return (rate * 100).toFixed(0) + '%'
}

// 格式化日期时间
const formatDateTime = (dt: string) => {
  if (!dt) return '-'
  return dt.replace('T', ' ').substring(0, 19)
}

// 获取抽成标签颜色
const getCommissionTagType = (rate: number) => {
  if (!rate) return 'info'
  if (rate >= 0.45) return 'danger'
  if (rate >= 0.30) return 'warning'
  return 'success'
}

// 获取咨询师列表
const fetchPsychologists = async () => {
  try {
    const res: any = await getAdminPsychologistList({ page: 1, size: 999 })
    if (res.code === 200) {
      psychologistOptions.value = res.data?.list || []
    }
  } catch (e) {
    console.error('获取咨询师列表失败', e)
  }
}

// 获取列表数据
const fetchList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    if (filters.psychologistId) {
      params.psychologistId = filters.psychologistId
    }
    // 评分范围转换
    if (filters.ratingRange) {
      const map: Record<number, [number, number]> = {
        1: [0, 1.5],
        2: [1.5, 3],
        3: [3, 4.5],
        4: [4.5, 5]
      }
      const [min, max] = map[filters.ratingRange] || [null, null]
      if (min !== null) params.minRating = min
      if (max !== null) params.maxRating = max
    }
    if (filters.dateRange) {
      params.startDate = filters.dateRange[0]
      params.endDate = filters.dateRange[1]
    }

    const res: any = await getConsultationIncomeList(params)
    if (res.code === 200) {
      const data = res.data
      tableData.value = data?.list || []
      pagination.total = data?.total || 0

      // 计算摘要统计
      calcSummary(data?.list || [])
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

// 计算摘要
const calcSummary = (list: any[]) => {
  summary.totalCount = pagination.total
  summary.totalFee = list.reduce((sum: number, item: any) => sum + (item.orderFee || 0), 0)
  summary.totalCommission = list.reduce((sum: number, item: any) => sum + (item.commissionAmount || 0), 0)
  const rated = list.filter((item: any) => item.ratingScore)
  if (rated.length > 0) {
    const avg = rated.reduce((sum: number, item: any) => sum + item.ratingScore, 0) / rated.length
    summary.avgRating = avg.toFixed(2)
  } else {
    summary.avgRating = '-'
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  fetchList()
}

// 重置筛选
const resetFilters = () => {
  filters.psychologistId = null
  filters.ratingRange = null
  filters.dateRange = null
  handleFilterChange()
}

// 分页变化
const handleSizeChange = () => {
  pagination.page = 1
  fetchList()
}

const handlePageChange = () => {
  fetchList()
}

onMounted(() => {
  fetchPsychologists()
  fetchList()
})
</script>

<style scoped>
.consultation-income-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

/* 摘要卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.summary-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.summary-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.summary-card.highlight .summary-label {
  color: rgba(255,255,255,0.8);
}

.summary-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

/* 筛选区 */
.filter-section {
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

/* 表格区 */
.table-section {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.psychologist-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.psychologist-cell .name {
  font-size: 14px;
  color: #303133;
}

.order-id {
  font-family: 'Courier New', monospace;
  color: #909399;
  font-size: 13px;
}

.amount {
  color: #303133;
  font-weight: 600;
}

.commission {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
