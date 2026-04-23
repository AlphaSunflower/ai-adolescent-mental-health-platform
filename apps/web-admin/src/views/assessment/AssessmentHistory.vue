<template>
  <div class="assessment-history">
    <div class="page-header">
      <h2>我的心理测评中心</h2>
      <p class="subtitle">查看您的历史测评记录</p>
    </div>

    <div class="content-container">
      <!-- 左侧就诊人列表 -->
      <el-card class="patient-list-card">
        <div class="card-title">就诊人</div>
        <el-menu :default-active="activePatientId" class="patient-menu" @select="handlePatientSelect">
          <el-menu-item index="">
            <el-icon><User /></el-icon>
            <span>全部记录</span>
          </el-menu-item>
          <el-menu-item v-for="p in patients" :key="p.id" :index="String(p.id)">
            <el-icon><UserFilled /></el-icon>
            <span>{{ p.name }} ({{ p.relationship }})</span>
          </el-menu-item>
        </el-menu>
      </el-card>

      <!-- 右侧测评记录 -->
      <el-card class="history-card">
        <div class="card-title">{{ currentPatientName }}的测评记录</div>
        <el-table :data="records" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="templateTitle" label="测评量表" min-width="200"></el-table-column>
          <el-table-column prop="record.createTime" label="测评时间" width="180"></el-table-column>
          <el-table-column prop="record.resultScore" label="得分" width="100"></el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="viewDetail(scope.row.record.id)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="total > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="测评报告" width="600px" class="report-dialog">
      <div v-if="currentDetail" class="report-content">
        <h3 class="report-title">{{ currentDetail.templateTitle }}</h3>
        <div class="report-meta">
          <span>测评时间：{{ currentDetail.record.createTime }}</span>
          <span>总得分：<strong class="score">{{ currentDetail.record.resultScore }}</strong></span>
        </div>
        <el-divider border-style="dashed" />
        <div class="analysis-section">
          <h4><el-icon><Reading /></el-icon> 结果分析</h4>
          <p class="analysis-text">{{ currentDetail.record.resultAnalysis }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getUserRecords, getRecordDetail } from '@/api/assessment'
import { getPatientContacts } from '@/api/user'
import { ElMessage } from 'element-plus'
import { Reading, User, UserFilled } from '@element-plus/icons-vue'

const records = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const patients = ref<any[]>([])
const activePatientId = ref('')

const detailVisible = ref(false)
const currentDetail = ref<any>(null)

const currentPatientName = computed(() => {
  if (!activePatientId.value) return '全部'
  const p = patients.value.find(item => String(item.id) === activePatientId.value)
  return p ? p.name : '未知'
})

const fetchPatients = async () => {
  try {
    const res = await getPatientContacts()
    if (res.code === 200) {
      patients.value = res.data
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, size: pageSize.value }
    if (activePatientId.value) {
      params.patientContactId = activePatientId.value
    }
    const res = await getUserRecords(params)
    if (res.code === 200) {
      records.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载记录失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
  } finally {
    loading.value = false
  }
}

const handlePatientSelect = (index: string) => {
  activePatientId.value = index
  currentPage.value = 1
  fetchRecords()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchRecords()
}

const viewDetail = async (id: number) => {
  try {
    const res = await getRecordDetail(id)
    if (res.code === 200) {
      currentDetail.value = res.data
      detailVisible.value = true
    } else {
      ElMessage.error(res.message || '加载详情失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
  }
}

onMounted(() => {
  fetchPatients()
  fetchRecords()
})
</script>

<style scoped>
/* ==================== 背景：行星+彗星 ==================== */
.assessment-history {
  position: relative;
  padding: 24px 40px;
  min-height: calc(100vh - 60px);
  color: #fff;
  overflow-x: hidden;
}
.assessment-history::before {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: linear-gradient(to bottom, #0a0a2a, #1a1a4a, #2a2a6a);
  z-index: 0;
  pointer-events: none;
}
.assessment-history::after {
  content: '';
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-image:
    radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.9), transparent),
    radial-gradient(2px 2px at 80px 120px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 160px 60px, rgba(255,255,255,0.5), transparent),
    radial-gradient(2px 2px at 320px 200px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 480px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(2px 2px at 640px 300px, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 800px 150px, rgba(255,255,255,0.5), transparent),
    radial-gradient(2px 2px at 960px 400px, rgba(255,255,255,0.8), transparent);
  background-repeat: repeat;
  background-size: 1000px 500px;
  animation: starsMove 200s linear infinite;
  z-index: 0;
  pointer-events: none;
}
@keyframes starsMove {
  from { transform: translateY(0px); }
  to { transform: translateY(-2000px); }
}

.page-header {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 32px;
  padding: 28px 32px;
  background: linear-gradient(135deg, rgba(10, 10, 42, 0.6) 0%, rgba(26, 26, 74, 0.4) 100%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
}
.page-header h2 {
  font-size: 28px;
  color: #fff;
  margin-bottom: 10px;
  background: linear-gradient(90deg, #7EC8FF, #FFE9A7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.subtitle {
  color: rgba(255,255,255,0.65);
  font-size: 15px;
}

.content-container {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ==================== 玻璃态卡片 ==================== */
:deep(.patient-list-card.el-card),
:deep(.history-card.el-card) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.07);
  color: #fff !important;
}
:deep(.patient-list-card .el-card__body),
:deep(.history-card .el-card__body) {
  background: transparent !important;
  color: #fff !important;
}

.patient-list-card {
  width: 240px;
  flex-shrink: 0;
}
.history-card {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #FFE9A7 !important;
}

/* ==================== 就诊人菜单 ==================== */
:deep(.patient-menu.el-menu) {
  background: transparent !important;
  border-right: none !important;
}
:deep(.patient-menu .el-menu-item) {
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 10px;
  margin-bottom: 4px;
  transition: all 0.2s;
}
:deep(.patient-menu .el-menu-item:hover) {
  background: rgba(64, 158, 255, 0.2) !important;
  color: #fff !important;
}
:deep(.patient-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.5), rgba(54, 207, 201, 0.35)) !important;
  border: 1px solid rgba(255, 233, 167, 0.3) !important;
  color: #fff !important;
}
:deep(.patient-menu .el-menu-item .el-icon) {
  color: rgba(255, 233, 167, 0.85) !important;
}
:deep(.patient-menu .el-menu-item.is-active .el-icon) {
  color: #FFE9A7 !important;
}

/* ==================== 表格 ==================== */
:deep(.history-card .el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: rgba(10, 10, 42, 0.25);
  --el-table-header-bg-color: rgba(10, 10, 42, 0.7);
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.12);
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  background: transparent !important;
  color: #E6E8EB !important;
}
:deep(.history-card .el-table__inner-wrapper::before) {
  display: none;
}
:deep(.history-card .el-table th.el-table__cell) {
  background: rgba(10, 10, 42, 0.75) !important;
  color: #FFE9A7 !important;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
}
:deep(.history-card .el-table td.el-table__cell) {
  background: transparent !important;
  color: #E6E8EB !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07) !important;
}
:deep(.history-card .el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(10, 10, 42, 0.18) !important;
}

/* 表格内按钮：渐变玻璃态 */
:deep(.history-card .el-button) {
  border-radius: 8px !important;
  font-weight: 500;
  transition: all 0.2s;
}
:deep(.history-card .el-button--primary.is-link) {
  background: transparent !important;
  border: none !important;
  color: #7EC8FF !important;
  font-weight: 600;
  padding: 0;
}
:deep(.history-card .el-button--primary.is-link:hover) {
  color: #FFE9A7 !important;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ==================== 分页 ==================== */
:deep(.history-card .el-pagination) {
  color: rgba(255,255,255,0.85) !important;
  justify-content: center;
}
:deep(.history-card .el-pagination button) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
:deep(.history-card .el-pagination .el-pager li) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  border-radius: 6px;
}
:deep(.history-card .el-pager li.is-active) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.7), rgba(103, 194, 58, 0.45)) !important;
  color: #fff !important;
  border-color: rgba(255, 233, 167, 0.45) !important;
}

/* ==================== 弹窗 ==================== */
:deep(.report-dialog.el-dialog) {
  background: linear-gradient(160deg, rgba(12, 12, 46, 0.98) 0%, rgba(26, 26, 74, 0.96) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 18px !important;
  box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 48px rgba(64,158,255,0.14) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
:deep(.report-dialog .el-dialog__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 20px 24px 16px;
}
:deep(.report-dialog .el-dialog__title) {
  color: #FFE9A7 !important;
  font-weight: 700;
  font-size: 17px;
}
:deep(.report-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255,255,255,0.7) !important;
}
:deep(.report-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #FFE9A7 !important;
}
:deep(.report-dialog .el-dialog__body) {
  background: transparent !important;
  color: #E6E8EB !important;
  padding: 24px;
}
:deep(.report-dialog .el-dialog__footer) {
  background: transparent !important;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 16px 24px 20px;
}
:deep(.report-dialog .el-divider--dashed) {
  border-color: rgba(255,255,255,0.12) !important;
}

/* 弹窗内按钮 */
:deep(.report-dialog .el-button--primary) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.75), rgba(103, 194, 58, 0.5)) !important;
  border-color: rgba(64, 158, 255, 0.55) !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 10px !important;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.35) !important;
}
:deep(.report-dialog .el-button--primary:hover) {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.92), rgba(103, 194, 58, 0.65)) !important;
  border-color: rgba(126, 200, 255, 0.75) !important;
  color: #fff !important;
}

/* 报告内容 */
.report-content {
  padding: 0;
  color: #E6E8EB !important;
}
.report-title {
  text-align: center;
  font-size: 22px;
  color: #fff !important;
  margin-bottom: 20px;
}
.report-meta {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.75) !important;
  font-size: 14px;
  background: rgba(10, 10, 42, 0.55) !important;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}
.score {
  color: #FFE9A7 !important;
  font-size: 20px;
  font-weight: 700;
}
.analysis-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #FFE9A7 !important;
  margin-bottom: 15px;
  font-size: 17px;
  font-weight: 600;
}
.analysis-section h4 .el-icon {
  color: #7EC8FF !important;
}
.analysis-text {
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.88) !important;
  background: rgba(255, 255, 255, 0.07) !important;
  padding: 16px 20px;
  border-radius: 10px;
  border-left: 3px solid rgba(255, 233, 167, 0.55) !important;
}

/* ==================== 通用深色适配（无 scoped） ==================== */
</style>

<style>
/* 弹窗背景层（teleport body） */
.el-dialog.report-dialog {
  background: linear-gradient(160deg, rgba(12, 12, 46, 0.98) 0%, rgba(26, 26, 74, 0.96) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 18px !important;
  box-shadow: 0 24px 64px rgba(0,0,0,0.65), 0 0 48px rgba(64,158,255,0.14) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.el-dialog.report-dialog .el-dialog__header {
  background: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 20px 24px 16px;
}
.el-dialog.report-dialog .el-dialog__title {
  color: #FFE9A7 !important;
  font-weight: 700;
  font-size: 17px;
}
.el-dialog.report-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(255,255,255,0.7) !important;
}
.el-dialog.report-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #FFE9A7 !important;
}
.el-dialog.report-dialog .el-dialog__body {
  background: transparent !important;
  color: #E6E8EB !important;
  padding: 24px;
}
.el-dialog.report-dialog .el-dialog__footer {
  background: transparent !important;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 16px 24px 20px;
}
.el-dialog.report-dialog .el-divider--dashed {
  border-color: rgba(255,255,255,0.12) !important;
}
.el-dialog.report-dialog .el-button--primary {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.75), rgba(103, 194, 58, 0.5)) !important;
  border-color: rgba(64, 158, 255, 0.55) !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 10px !important;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.35) !important;
}
.el-dialog.report-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.92), rgba(103, 194, 58, 0.65)) !important;
  border-color: rgba(126, 200, 255, 0.75) !important;
  color: #fff !important;
}
</style>
