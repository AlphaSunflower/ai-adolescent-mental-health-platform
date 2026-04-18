<template>
  <div class="profile-audit-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>资料审核管理</h2>
      <div class="audit-stats">
        <div class="stat-item pending">
          <span class="label">待审核</span>
          <span class="value">{{ statsData.pendingCount }}</span>
        </div>
        <div class="stat-item approved">
          <span class="label">已通过</span>
          <span class="value">{{ statsData.approvedCount }}</span>
        </div>
        <div class="stat-item rejected">
          <span class="label">已拒绝</span>
          <span class="value">{{ statsData.rejectedCount }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-select v-model="statusFilter" placeholder="审核状态" clearable @change="handleSearch" style="width: 150px;">
        <el-option label="全部" :value="null"></el-option>
        <el-option label="待审核" :value="0"></el-option>
        <el-option label="已通过" :value="1"></el-option>
        <el-option label="已拒绝" :value="2"></el-option>
      </el-select>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon> 重置
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="auditList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="咨询师信息" min-width="180">
        <template #default="scope">
          <div class="psychologist-info">
            <el-avatar :size="36" :src="scope.row.userAvatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="info-detail">
              <div class="name">{{ scope.row.psychologistName || '-' }}</div>
              <div class="username">{{ scope.row.userNickname || '-' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="变更字段" width="120">
        <template #default="scope">
          <el-tag type="info" size="small">{{ scope.row.fieldNameText || scope.row.fieldName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="变更内容" min-width="160">
        <template #default="scope">
          <div class="change-content">
            <div class="change-item">
              <span class="label">原值：</span>
              <span class="value old">{{ scope.row.oldValue || '(空)' }}</span>
            </div>
            <div class="change-item">
              <span class="label">新值：</span>
              <span class="value new">{{ scope.row.newValue || '(空)' }}</span>
            </div>
            <div v-if="scope.row.reason" class="change-item">
              <span class="label">理由：</span>
              <span class="value reason">{{ scope.row.reason }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="证明材料" width="80">
        <template #default="scope">
          <el-button
            v-if="scope.row.proofUrls"
            size="small"
            type="primary"
            link
            @click="handleViewProof(scope.row)"
          >
            查看
          </el-button>
          <span v-else class="no-proof">-</span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" width="90">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.auditStatus)" size="small">
            {{ scope.row.auditStatusText || getStatusText(scope.row.auditStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="150">
        <template #default="scope">
          <span>{{ scope.row.createTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <template v-if="scope.row.auditStatus === 0">
            <el-button size="small" type="primary" @click="handleApprove(scope.row)">
              通过
            </el-button>
            <el-button size="small" type="danger" @click="handleReject(scope.row)">
              拒绝
            </el-button>
          </template>
          <el-button size="small" @click="handleViewDetail(scope.row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="审核详情" width="600px">
      <div v-if="currentAudit" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="咨询师">{{ currentAudit.psychologistName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="变更字段">{{ currentAudit.fieldNameText || currentAudit.fieldName }}</el-descriptions-item>
          <el-descriptions-item label="原值" :span="2">
            <span class="value old">{{ currentAudit.oldValue || '(空)' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="新值" :span="2">
            <span class="value new">{{ currentAudit.newValue || '(空)' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请理由" :span="2">{{ currentAudit.reason || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentAudit.auditStatus)" size="small">
              {{ currentAudit.auditStatusText || getStatusText(currentAudit.auditStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentAudit.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间" :span="2">{{ currentAudit.auditTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核备注" :span="2">{{ currentAudit.auditRemark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 证明材料 -->
        <div v-if="currentAudit.proofUrls" class="proof-section">
          <h4>证明材料</h4>
          <div class="proof-images">
            <el-image
              v-for="(url, index) in parseProofUrls(currentAudit.proofUrls)"
              :key="index"
              :src="url"
              :preview-src-list="parseProofUrls(currentAudit.proofUrls)"
              fit="contain"
              style="width: 100px; height: 100px; margin-right: 10px; border-radius: 4px;"
            />
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="auditDialogVisible" :title="auditAction === 'approve' ? '通过审核' : '拒绝审核'" width="500px">
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核备注">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="auditAction === 'approve' ? '可选：添加通过备注' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button :type="auditAction === 'approve' ? 'primary' : 'danger'" @click="confirmAudit" :loading="auditLoading">
          确认{{ auditAction === 'approve' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 证明材料查看对话框 -->
    <el-dialog v-model="proofDialogVisible" title="证明材料" width="800px">
      <div class="proof-gallery">
        <el-image
          v-for="(url, index) in currentProofUrls"
          :key="index"
          :src="url"
          :preview-src-list="currentProofUrls"
          fit="contain"
          style="width: 100%; margin-bottom: 10px;"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, User
} from '@element-plus/icons-vue'
import {
  getProfileAuditList,
  getProfileAuditDetail,
  approveProfileAudit,
  rejectProfileAudit
} from '@/api/psychologistAdmin'

const loading = ref(false)
const auditLoading = ref(false)
const statusFilter = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const auditList = ref<any[]>([])

const statsData = reactive({
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0
})

const detailDialogVisible = ref(false)
const auditDialogVisible = ref(false)
const proofDialogVisible = ref(false)
const currentAudit = ref<any>(null)
const currentProofUrls = ref<string[]>([])
const auditAction = ref<'approve' | 'reject'>('approve')
const auditForm = reactive({
  remark: ''
})

// 获取列表数据
const fetchList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      size: pageSize.value
    }
    if (statusFilter.value !== null) {
      params.status = statusFilter.value
    }

    const res: any = await getProfileAuditList(params)
    if (res.code === 200) {
      auditList.value = res.data?.records || []
      total.value = res.data?.total || 0

      // 统计计算
      const list = res.data?.records || []
      statsData.pendingCount = list.filter((a: any) => a.auditStatus === 0).length
      statsData.approvedCount = list.filter((a: any) => a.auditStatus === 1).length
      statsData.rejectedCount = list.filter((a: any) => a.auditStatus === 2).length
    } else {
      ElMessage.error(res.message || '获取列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审核'
    case 1: return '已通过'
    case 2: return '已拒绝'
    default: return '未知'
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}

// 重置
const handleReset = () => {
  statusFilter.value = null
  currentPage.value = 1
  fetchList()
}

// 分页
const handleSizeChange = () => {
  currentPage.value = 1
  fetchList()
}

const handleCurrentChange = () => {
  fetchList()
}

// 查看详情
const handleViewDetail = async (row: any) => {
  try {
    const res: any = await getProfileAuditDetail(row.id)
    if (res.code === 200) {
      currentAudit.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

// 查看证明材料
const handleViewProof = (row: any) => {
  currentProofUrls.value = parseProofUrls(row.proofUrls)
  proofDialogVisible.value = true
}

// 解析证明材料URLs
const parseProofUrls = (proofUrls: string) => {
  if (!proofUrls) return []
  try {
    return JSON.parse(proofUrls)
  } catch {
    return proofUrls.split(',')
  }
}

// 审核通过
const handleApprove = (row: any) => {
  auditAction.value = 'approve'
  auditForm.remark = ''
  currentAudit.value = row
  auditDialogVisible.value = true
}

// 审核拒绝
const handleReject = (row: any) => {
  auditAction.value = 'reject'
  auditForm.remark = ''
  currentAudit.value = row
  auditDialogVisible.value = true
}

// 确认审核
const confirmAudit = async () => {
  if (auditAction.value === 'reject' && !auditForm.remark) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  auditLoading.value = true
  try {
    let res: any
    if (auditAction.value === 'approve') {
      res = await approveProfileAudit(currentAudit.value.id, auditForm.remark)
    } else {
      res = await rejectProfileAudit(currentAudit.value.id, auditForm.remark)
    }

    if (res.code === 200) {
      ElMessage.success(auditAction.value === 'approve' ? '审核已通过' : '已拒绝')
      auditDialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    auditLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.profile-audit-page {
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

.audit-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: #f5f7fa;
}

.stat-item .label {
  color: #909399;
  font-size: 14px;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 600;
}

.stat-item.pending .value { color: #e6a23c; }
.stat-item.approved .value { color: #67c23a; }
.stat-item.rejected .value { color: #f56c6c; }

.filter-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.psychologist-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-detail .name {
  font-weight: 500;
  color: #303133;
}

.info-detail .username {
  font-size: 12px;
  color: #909399;
}

.change-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.change-item {
  display: flex;
  align-items: center;
}

.change-item .label {
  color: #909399;
  font-size: 12px;
  min-width: 40px;
}

.change-item .value {
  font-size: 13px;
}

.change-item .value.old {
  color: #909399;
  text-decoration: line-through;
}

.change-item .value.new {
  color: #409eff;
  font-weight: 500;
}

.change-item .value.reason {
  color: #909399;
  font-style: italic;
}

.no-proof {
  color: #c0c4cc;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.detail-content {
  padding: 10px 0;
}

.detail-content .value.old {
  color: #909399;
  text-decoration: line-through;
}

.detail-content .value.new {
  color: #409eff;
  font-weight: 500;
}

.proof-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.proof-section h4 {
  margin-bottom: 10px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.proof-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.proof-gallery {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
