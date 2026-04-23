<template>
  <div class="feedback-manager">
    <div class="header">
      <h2>平台反馈管理</h2>
      <el-select v-model="statusFilter" placeholder="状态筛选" @change="fetchFeedbacks" clearable>
        <el-option label="已反馈" :value="0"></el-option>
        <el-option label="待解决" :value="1"></el-option>
        <el-option label="已解决" :value="2"></el-option>
        <el-option label="已取消" :value="3"></el-option>
      </el-select>
    </div>

    <el-table :data="feedbacks" v-loading="loading" style="width: 100%">
      <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="content" label="反馈内容"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
           <el-tag :type="getStatusType(scope.row.status)">
             {{ getStatusText(scope.row.status) }}
           </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cancelReason" label="取消理由"></el-table-column>
      <el-table-column prop="createTime" label="提交时间" width="180"></el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button size="small" type="warning" v-if="scope.row.status === 0" @click="handleStatus(scope.row, 1)">标记待解决</el-button>
          <el-button size="small" type="success" v-if="scope.row.status !== 2 && scope.row.status !== 3" @click="handleStatus(scope.row, 2)">标记已解决</el-button>
          <el-button size="small" type="danger" v-if="scope.row.status !== 3" @click="handleCancel(scope.row)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchFeedbacks"
      ></el-pagination>
    </div>

    <!-- Cancel Dialog -->
    <el-dialog v-model="dialogVisible" title="取消反馈" width="500px">
      <el-form :model="cancelForm">
        <el-form-item label="取消理由">
          <el-input type="textarea" v-model="cancelForm.reason" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCancel">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getPlatformFeedbacks, updatePlatformFeedbackStatus } from '@/api/feedback'
import { ElMessage } from 'element-plus'

const feedbacks = ref([])
const loading = ref(false)
const statusFilter = ref<number | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const cancelForm = reactive({ id: 0, reason: '' })

const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const res = await getPlatformFeedbacks({ 
      page: currentPage.value, 
      size: pageSize.value,
      status: statusFilter.value 
    }) as any
    if (res.code === 200) {
      feedbacks.value = res.data.records
      total.value = res.data.total
    }
  } finally {
    loading.value = false
  }
}

const getStatusText = (status: number) => {
  const map: any = { 0: '已反馈', 1: '待解决', 2: '已解决', 3: '已取消' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: any = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return map[status] || 'info'
}

const handleStatus = async (row: any, status: number) => {
  const res = await updatePlatformFeedbackStatus(row.id, { status }) as any
  if (res.code === 200) {
    ElMessage.success('更新成功')
    fetchFeedbacks()
  } else {
    ElMessage.error(res.message || '更新失败')
  }
}

const handleCancel = (row: any) => {
  cancelForm.id = row.id
  cancelForm.reason = ''
  dialogVisible.value = true
}

const submitCancel = async () => {
  if (!cancelForm.reason) {
    ElMessage.warning('请输入取消理由')
    return
  }
  const res = await updatePlatformFeedbackStatus(cancelForm.id, { status: 3, cancelReason: cancelForm.reason }) as any
  if (res.code === 200) {
    ElMessage.success('取消成功')
    dialogVisible.value = false
    fetchFeedbacks()
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.feedback-manager {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
