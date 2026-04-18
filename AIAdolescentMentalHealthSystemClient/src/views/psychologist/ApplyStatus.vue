<template>
  <div class="apply-status-page">
    <!-- 背景动效 -->
    <div class="bg-effects">
      <div class="bg-gradient"></div>
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
    </div>

    <div class="status-container">
      <div class="status-card">
        <div class="card-header">
          <h2 class="card-title">入驻申请进度</h2>
          <p class="card-desc">查看您的入驻申请审核进度</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 已是心理咨询师 -->
        <div v-else-if="statusData.isPsychologist" class="success-state">
          <div class="success-icon">
            <el-icon color="#67C23A"><CircleCheck /></el-icon>
          </div>
          <h3>您已是心理咨询师</h3>
          <p>恭喜！您已成功入驻心愈智联平台</p>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </div>

        <!-- 无申请记录 -->
        <div v-else-if="!statusData.hasApply" class="empty-state">
          <div class="empty-icon">
            <el-icon><Document /></el-icon>
          </div>
          <h3>暂无入驻申请</h3>
          <p>您还没有提交入驻申请</p>
          <el-button type="primary" @click="goApply">立即申请</el-button>
        </div>

        <!-- 有申请记录 -->
        <div v-else class="status-content">
          <!-- 进度流程图 -->
          <div class="progress-section">
            <div class="progress-steps">
              <div
                v-for="(step, index) in progressSteps"
                :key="index"
                class="progress-step"
                :class="{ active: currentStepIndex >= index, current: currentStepIndex === index }"
              >
                <div class="step-indicator">
                  <div class="step-dot">
                    <el-icon v-if="currentStepIndex > index"><Check /></el-icon>
                    <el-icon v-else-if="currentStepIndex === index" class="pulse"><Loading /></el-icon>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <div class="step-line" v-if="index < progressSteps.length - 1"></div>
                </div>
                <div class="step-content">
                  <h4>{{ step.name }}</h4>
                  <p>{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 当前状态详情 -->
          <div class="detail-section">
            <div class="detail-card">
              <div class="detail-header">
                <h3>当前状态</h3>
                <el-tag :type="getStatusType(statusData.status)" size="large">
                  {{ statusData.statusName }}
                </el-tag>
              </div>

              <div class="detail-body">
                <div class="detail-item">
                  <span class="label">申请编号</span>
                  <span class="value">#{{ statusData.applyId }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">当前阶段</span>
                  <span class="value">{{ statusData.stepName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">申请次数</span>
                  <span class="value">第 {{ statusData.applyCount }} / 3 次</span>
                </div>

                <!-- 笔试信息 -->
                <template v-if="statusData.examDeadline && statusData.paperResult === 0">
                  <div class="detail-item warning">
                    <span class="label">笔试截止时间</span>
                    <span class="value">{{ formatDate(statusData.examDeadline) }}</span>
                  </div>
                </template>

                <!-- 面试信息 -->
                <template v-if="statusData.interviewTime">
                  <div class="detail-item">
                    <span class="label">面谈时间</span>
                    <span class="value">{{ formatDate(statusData.interviewTime) }}</span>
                  </div>
                  <div class="detail-item" v-if="statusData.interviewLocation">
                    <span class="label">面谈地点</span>
                    <span class="value">{{ statusData.interviewLocation }}</span>
                  </div>
                </template>

                <!-- 驳回原因 -->
                <template v-if="statusData.rejectReason">
                  <div class="detail-item danger">
                    <span class="label">驳回原因</span>
                    <span class="value">{{ statusData.rejectReason }}</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- 笔试结果 -->
            <div v-if="statusData.paperResult !== undefined && statusData.paperResult !== null" class="result-card">
              <h3>笔试结果</h3>
              <div class="result-badge" :class="statusData.paperResult === 1 ? 'pass' : 'fail'">
                {{ statusData.paperResult === 1 ? '通过' : '未通过' }}
              </div>
            </div>

            <!-- 案例报告结果 -->
            <div v-if="statusData.reportResult !== undefined && statusData.reportResult !== null" class="result-card">
              <h3>案例报告结果</h3>
              <div class="result-badge" :class="statusData.reportResult === 1 ? 'pass' : 'fail'">
                {{ statusData.reportResult === 1 ? '通过' : '未通过' }}
              </div>
            </div>

            <!-- 面谈结果 -->
            <div v-if="statusData.interviewResult !== undefined && statusData.interviewResult !== null" class="result-card">
              <h3>面谈结果</h3>
              <div class="result-badge" :class="statusData.interviewResult === 1 ? 'pass' : 'fail'">
                {{ statusData.interviewResult === 1 ? '通过' : '未通过' }}
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button @click="goBack">返回</el-button>
            <el-button v-if="statusData.status === 'FILLING' || statusData.status === 'REVIEWING'" type="primary" @click="continueApply">
              继续申请
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, CircleCheck, Document, Loading } from '@element-plus/icons-vue'
import { getApplyStatus } from '../../api/psychologistApply'

const router = useRouter()
const loading = ref(true)

const statusData = reactive({
  hasApply: false,
  isPsychologist: false,
  applyId: null as number | null,
  status: '',
  statusName: '',
  step: '',
  stepName: '',
  applyCount: 0,
  rejectReason: '',
  examDeadline: '',
  paperResult: null as number | null,
  reportResult: null as number | null,
  interviewResult: null as number | null,
  interviewTime: '',
  interviewLocation: ''
})

const progressSteps = [
  { name: '填写资料', desc: '提交基本信息' },
  { name: '资料审核', desc: '管理员审核' },
  { name: '笔试考核', desc: '1周期限' },
  { name: '案例报告', desc: '提交材料' },
  { name: '线下面谈', desc: '最终审核' },
  { name: '入驻成功', desc: '成为咨询师' }
]

const currentStepIndex = computed(() => {
  const status = statusData.status
  switch (status) {
    case 'FILLING': return 0
    case 'REVIEWING': return 1
    case 'PAPER': return 2
    case 'REPORT': return 3
    case 'INTERVIEW': return 4
    case 'APPROVED': return 5
    case 'REJECTED': return statusData.step === 'BASIC' ? 0 : statusData.step === 'PAPER' ? 2 : statusData.step === 'REPORT' ? 3 : 4
    default: return 0
  }
})

const getStatusType = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'danger'
    case 'FILLING':
    case 'REVIEWING':
    case 'PAPER':
    case 'REPORT':
    case 'INTERVIEW': return 'warning'
    default: return 'info'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const fetchStatus = async () => {
  loading.value = true
  try {
    const res = await getApplyStatus() as any
    if (res.code === 200) {
      const data = res.data
      statusData.hasApply = data.hasApply || false
      statusData.isPsychologist = data.isPsychologist || false
      statusData.applyId = data.applyId || null
      statusData.status = data.status || ''
      statusData.statusName = data.statusName || ''
      statusData.step = data.step || ''
      statusData.stepName = data.stepName || ''
      statusData.applyCount = data.applyCount || 0
      statusData.rejectReason = data.rejectReason || ''
      statusData.examDeadline = data.examDeadline || ''
      statusData.paperResult = data.paperResult ?? null
      statusData.reportResult = data.reportResult ?? null
      statusData.interviewResult = data.interviewResult ?? null
      statusData.interviewTime = data.interviewTime || ''
      statusData.interviewLocation = data.interviewLocation || ''
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取申请状态失败')
  } finally {
    loading.value = false
  }
}

const goHome = () => router.push('/home')
const goApply = () => router.push('/apply-psychologist')
const goBack = () => router.push('/apply-psychologist')
const continueApply = () => router.push('/apply-psychologist/form')

onMounted(() => {
  fetchStatus()
})
</script>

<style scoped>
.apply-status-page {
  min-height: 100vh;
  background: #f5f7fa;
  position: relative;
  overflow-x: hidden;
}

.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(64,158,255,0.03) 0%, rgba(56,249,215,0.03) 100%);
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  animation: floatShape ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(64,158,255,0.05) 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation-duration: 15s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(56,249,215,0.05) 0%, transparent 70%);
  bottom: -50px;
  left: -50px;
  animation-duration: 18s;
  animation-delay: -5s;
}

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

.status-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
  position: relative;
  z-index: 1;
}

.status-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  padding: 40px;
}

.card-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.card-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: #909399;
}

.loading-state .el-icon {
  font-size: 32px;
}

.success-state,
.empty-state {
  text-align: center;
  padding: 60px 0;
}

.success-icon,
.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f9eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.success-icon .el-icon {
  font-size: 48px;
}

.empty-icon .el-icon {
  font-size: 48px;
  color: #909399;
}

.success-state h3,
.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
}

.success-state p,
.empty-state p {
  font-size: 14px;
  color: #909399;
  margin: 0 0 32px;
}

.progress-section {
  margin-bottom: 40px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  opacity: 0.5;
  transition: all 0.3s;
}

.progress-step.active {
  opacity: 1;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.progress-step.active .step-dot {
  background: #409EFF;
  color: white;
}

.progress-step.current .step-dot {
  background: linear-gradient(135deg, #409EFF, #36cfc9);
  color: white;
  box-shadow: 0 4px 15px rgba(64,158,255,0.4);
}

.step-dot .pulse {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.step-line {
  width: 100%;
  height: 3px;
  background: #e5e7eb;
  position: absolute;
  top: 20px;
  left: 50%;
  z-index: 1;
}

.progress-step.active .step-line {
  background: linear-gradient(90deg, #409EFF, #36cfc9);
}

.step-content {
  margin-top: 12px;
  text-align: center;
}

.step-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: #909399;
  margin: 0 0 4px;
}

.progress-step.active .step-content h4 {
  color: #303133;
}

.step-content p {
  font-size: 11px;
  color: #c0c4cc;
  margin: 0;
  display: none;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.detail-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.detail-body {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #909399;
}

.detail-item .value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.detail-item.warning .value {
  color: #E6A23C;
}

.detail-item.danger .value {
  color: #F56C6C;
}

.result-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.result-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.result-badge.pass {
  background: #f0f9eb;
  color: #67C23A;
}

.result-badge.fail {
  background: #fef0f0;
  color: #F56C6C;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .status-card {
    padding: 24px 16px;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 16px;
  }

  .progress-step {
    flex: 0 0 calc(33.33% - 12px);
  }

  .step-line {
    display: none;
  }

  .detail-body {
    grid-template-columns: 1fr;
  }
}
</style>
