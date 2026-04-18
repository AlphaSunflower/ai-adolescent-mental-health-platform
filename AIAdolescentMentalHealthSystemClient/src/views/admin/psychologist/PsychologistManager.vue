<template>
  <div class="psychologist-manager">
    <div class="header">
      <h2>心理咨询师入驻管理</h2>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="入驻申请列表" name="apply-list">
        <div class="filter-bar">
          <el-select v-model="statusFilter" placeholder="筛选状态" clearable @change="fetchApplyList" style="width: 150px;">
            <el-option label="全部" value=""></el-option>
            <el-option label="填写资料中" value="FILLING"></el-option>
            <el-option label="管理员审核中" value="REVIEWING"></el-option>
            <el-option label="笔试考核阶段" value="PAPER"></el-option>
            <el-option label="案例报告阶段" value="REPORT"></el-option>
            <el-option label="线下面谈阶段" value="INTERVIEW"></el-option>
            <el-option label="入驻成功" value="APPROVED"></el-option>
            <el-option label="入驻失败" value="REJECTED"></el-option>
          </el-select>
        </div>

        <el-table :data="applyList" v-loading="loading" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="userNickname" label="申请人" width="120">
            <template #default="scope">
              <div class="user-info">
                <el-avatar v-if="scope.row.userAvatar" :src="scope.row.userAvatar" size="small"></el-avatar>
                <span>{{ scope.row.userNickname || '用户' + scope.row.userId }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="姓名" width="100"></el-table-column>
          <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
          <el-table-column prop="education" label="学历专业" width="150"></el-table-column>
          <el-table-column prop="statusName" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="paperResultName" label="笔试结果" width="100">
            <template #default="scope">
              <span v-if="scope.row.paperResult !== null && scope.row.paperResult !== undefined">
                {{ scope.row.paperResultName }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="reportResultName" label="报告结果" width="100">
            <template #default="scope">
              <span v-if="scope.row.reportResult !== null && scope.row.reportResult !== undefined">
                {{ scope.row.reportResultName }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="申请时间" width="160"></el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
              <el-button v-if="scope.row.status === 'REVIEWING'" size="small" type="primary" @click="showReviewDialog(scope.row)">审核</el-button>
              <el-button v-if="scope.row.status === 'PAPER'" size="small" type="warning" @click="showPaperDialog(scope.row)">笔试结果</el-button>
              <el-button v-if="scope.row.status === 'REPORT'" size="small" type="warning" @click="showReportDialog(scope.row)">报告结果</el-button>
              <el-button v-if="scope.row.status === 'INTERVIEW'" size="small" type="success" @click="showInterviewDialog(scope.row)">面谈结果</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="已入驻咨询师" name="psychologist-list">
        <el-table :data="psychologistList" v-loading="loading" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="userNickname" label="咨询师" width="150">
            <template #default="scope">
              <div class="user-info">
                <el-avatar v-if="scope.row.userAvatar" :src="scope.row.userAvatar" size="small"></el-avatar>
                <span>{{ scope.row.userNickname || '咨询师' + scope.row.userId }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="真实姓名" width="100"></el-table-column>
          <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
          <el-table-column prop="consultationPrice" label="咨询定价" width="100">
            <template #default="scope">
              <span>¥{{ scope.row.consultationPrice }}/小时</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="入驻时间" width="160"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" @click="viewDetail(scope.row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 申请详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="申请详情" width="700px">
      <div v-if="currentApply" class="apply-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人">{{ currentApply.userNickname || '用户' + currentApply.userId }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">
            <el-tag :type="getStatusType(currentApply.status)">{{ currentApply.statusName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentApply.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentApply.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="国家/地区">{{ currentApply.country || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentApply.contactWechat || '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询个案时长">{{ currentApply.caseHoursName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="个体督导时长">{{ currentApply.supervisionHoursName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询定价">¥{{ currentApply.consultationPrice || 0 }}/小时</el-descriptions-item>
          <el-descriptions-item label="学历及相关专业">{{ currentApply.education || '-' }}</el-descriptions-item>
          <el-descriptions-item label="个人简历" :span="2">
            <a v-if="currentApply.resumeUrl" :href="currentApply.resumeUrl" target="_blank">查看简历</a>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>审核进度</el-divider>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="笔试结果">{{ currentApply.paperResultName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="笔试截止时间">{{ currentApply.examDeadline || '-' }}</el-descriptions-item>
          <el-descriptions-item label="案例报告结果">{{ currentApply.reportResultName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="面谈时间">{{ currentApply.interviewTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="面谈地点" :span="2">{{ currentApply.interviewLocation || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="currentApply.selfNarration" style="margin-top: 16px;">
          <h4>个人自我叙述</h4>
          <p>{{ currentApply.selfNarration }}</p>
        </div>

        <div v-if="currentApply.rejectReason" style="margin-top: 16px;">
          <el-alert type="warning" :closable="false">
            拒绝原因：{{ currentApply.rejectReason }}
          </el-alert>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="reviewDialogVisible" title="审核基本资料" width="500px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="reviewForm.approved">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">不通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!reviewForm.approved" label="拒绝原因">
          <el-input v-model="reviewForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>

    <!-- 笔试结果对话框 -->
    <el-dialog v-model="paperDialogVisible" title="标记笔试结果" width="500px">
      <el-form :model="paperForm" label-width="100px">
        <el-form-item label="笔试结果">
          <el-radio-group v-model="paperForm.passed">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">未通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!paperForm.passed" label="失败原因">
          <el-input v-model="paperForm.reason" type="textarea" :rows="3" placeholder="请输入失败原因"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paperDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPaperResult" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>

    <!-- 案例报告结果对话框 -->
    <el-dialog v-model="reportDialogVisible" title="标记案例报告结果" width="500px">
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="报告结果">
          <el-radio-group v-model="reportForm.passed">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">未通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!reportForm.passed" label="失败原因">
          <el-input v-model="reportForm.reason" type="textarea" :rows="3" placeholder="请输入失败原因"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReportResult" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>

    <!-- 面谈结果对话框 -->
    <el-dialog v-model="interviewDialogVisible" title="标记面谈结果" width="500px">
      <el-form :model="interviewForm" label-width="100px">
        <el-form-item label="面谈结果">
          <el-radio-group v-model="interviewForm.approved">
            <el-radio :label="true">通过（入驻成功）</el-radio>
            <el-radio :label="false">未通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="面谈时间">
          <el-date-picker v-model="interviewForm.interviewTime" type="datetime" placeholder="选择面谈时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="面谈地点">
          <el-input v-model="interviewForm.interviewLocation" placeholder="请输入面谈地点"></el-input>
        </el-form-item>
        <el-form-item v-if="!interviewForm.approved" label="失败原因">
          <el-input v-model="interviewForm.reason" type="textarea" :rows="3" placeholder="请输入失败原因"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="interviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInterviewResult" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminApplyList, getApprovedPsychologists, reviewApply, markPaperResult, markReportResult, markInterviewResult, type ApplyDetailVO } from '@/api/psychologistApply'

const activeTab = ref('apply-list')
const loading = ref(false)
const applyList = ref<ApplyDetailVO[]>([])
const psychologistList = ref<ApplyDetailVO[]>([])
const statusFilter = ref('')

// 详情对话框
const detailDialogVisible = ref(false)
const currentApply = ref<ApplyDetailVO | null>(null)

// 审核对话框
const reviewDialogVisible = ref(false)
const reviewForm = reactive({
  approved: true,
  reason: ''
})

// 笔试对话框
const paperDialogVisible = ref(false)
const paperForm = reactive({
  passed: true,
  reason: ''
})

// 报告对话框
const reportDialogVisible = ref(false)
const reportForm = reactive({
  passed: true,
  reason: ''
})

// 面谈对话框
const interviewDialogVisible = ref(false)
const interviewForm = reactive({
  approved: true,
  interviewTime: null as Date | null,
  interviewLocation: '',
  reason: ''
})

const submitting = ref(false)

const getStatusType = (status: string) => {
  switch (status) {
    case 'FILLING': return 'info'
    case 'REVIEWING': return 'warning'
    case 'PAPER': return 'warning'
    case 'REPORT': return 'warning'
    case 'INTERVIEW': return 'warning'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'danger'
    default: return 'info'
  }
}

const fetchApplyList = async () => {
  loading.value = true
  try {
    const res = await getAdminApplyList(statusFilter.value || undefined) as any
    if (res.code === 200) {
      applyList.value = res.data || []
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchPsychologistList = async () => {
  loading.value = true
  try {
    const res = await getApprovedPsychologists() as any
    if (res.code === 200) {
      psychologistList.value = res.data || []
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  if (activeTab.value === 'apply-list') {
    fetchApplyList()
  } else {
    fetchPsychologistList()
  }
}

const viewDetail = (row: ApplyDetailVO) => {
  currentApply.value = row
  detailDialogVisible.value = true
}

// 审核
const showReviewDialog = (row: ApplyDetailVO) => {
  currentApply.value = row
  reviewForm.approved = true
  reviewForm.reason = ''
  reviewDialogVisible.value = true
}

const submitReview = async () => {
  if (!currentApply.value) return
  submitting.value = true
  try {
    const res = await reviewApply(currentApply.value.id, reviewForm.approved, reviewForm.reason) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '操作成功')
      reviewDialogVisible.value = false
      fetchApplyList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 笔试结果
const showPaperDialog = (row: ApplyDetailVO) => {
  currentApply.value = row
  paperForm.passed = true
  paperForm.reason = ''
  paperDialogVisible.value = true
}

const submitPaperResult = async () => {
  if (!currentApply.value) return
  submitting.value = true
  try {
    const res = await markPaperResult(currentApply.value.id, paperForm.passed, paperForm.reason) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '操作成功')
      paperDialogVisible.value = false
      fetchApplyList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 案例报告结果
const showReportDialog = (row: ApplyDetailVO) => {
  currentApply.value = row
  reportForm.passed = true
  reportForm.reason = ''
  reportDialogVisible.value = true
}

const submitReportResult = async () => {
  if (!currentApply.value) return
  submitting.value = true
  try {
    const res = await markReportResult(currentApply.value.id, reportForm.passed, reportForm.reason) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '操作成功')
      reportDialogVisible.value = false
      fetchApplyList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

// 面谈结果
const showInterviewDialog = (row: ApplyDetailVO) => {
  currentApply.value = row
  interviewForm.approved = true
  interviewForm.interviewTime = null
  interviewForm.interviewLocation = ''
  interviewForm.reason = ''
  interviewDialogVisible.value = true
}

const submitInterviewResult = async () => {
  if (!currentApply.value) return
  submitting.value = true
  try {
    const res = await markInterviewResult(
      currentApply.value.id,
      interviewForm.approved,
      interviewForm.interviewTime ? interviewForm.interviewTime.toISOString() : undefined,
      interviewForm.interviewLocation || undefined,
      interviewForm.reason || undefined
    ) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '操作成功')
      interviewDialogVisible.value = false
      fetchApplyList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchApplyList()
})
</script>

<style scoped>
.psychologist-manager {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.filter-bar {
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-detail {
  padding: 0 8px;
}

.apply-detail h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
}

.apply-detail p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style>
