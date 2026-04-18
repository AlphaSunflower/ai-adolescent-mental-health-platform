<template>
  <div class="feedback-manager">
    <div class="header">
      <h2>咨询/挂号反馈管理</h2>
      <el-select v-model="statusFilter" placeholder="状态筛选" @change="fetchFeedbacks" clearable>
        <el-option label="已反馈" :value="0"></el-option>
        <el-option label="已接收" :value="1"></el-option>
        <el-option label="已拒收" :value="2"></el-option>
      </el-select>
    </div>

    <el-table :data="feedbacks" v-loading="loading" style="width: 100%">
      <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
      <el-table-column prop="doctorName" label="相关医生">
           <!-- Ideally fetch doctor name or join in backend -->
           <template #default="scope">
               医生ID: {{ scope.row.doctorId }}
           </template>
      </el-table-column>
      <el-table-column prop="content" label="反馈内容"></el-table-column>
      <el-table-column prop="rating" label="评分" width="80"></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
           <el-tag :type="getStatusType(scope.row.status)">
             {{ getStatusText(scope.row.status) }}
           </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="回复/理由">
         <template #default="scope">
           <div v-if="scope.row.status === 1">回复: {{ scope.row.replyContent }}</div>
           <div v-else-if="scope.row.status === 2">理由: {{ scope.row.rejectReason }}</div>
           <div v-else>-</div>
         </template>
      </el-table-column>
      <el-table-column prop="createTime" label="提交时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" v-if="scope.row.status === 0" @click="handleProcess(scope.row, 1)">接收并回复</el-button>
          <el-button size="small" type="danger" v-if="scope.row.status === 0" @click="handleProcess(scope.row, 2)">拒收</el-button>
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

    <!-- Process Dialog -->
    <el-dialog v-model="dialogVisible" :title="processType === 1 ? '接收反馈' : '拒收反馈'" width="500px">
      <el-form :model="processForm">
        <el-form-item :label="processType === 1 ? '回复内容' : '拒收理由'">
          <el-input type="textarea" v-model="processForm.content" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProcess">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getConsultationFeedbacks, processConsultationFeedback } from '@/api/feedback'
import { ElMessage } from 'element-plus'

const feedbacks = ref([])
const loading = ref(false)
const statusFilter = ref<number | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const processType = ref(1) // 1-Accept, 2-Reject
const processForm = reactive({ id: 0, content: '' })

const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const res = await getConsultationFeedbacks({ 
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
  const map: any = { 0: '已反馈', 1: '已接收', 2: '已拒收' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: any = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const handleProcess = (row: any, type: number) => {
  processType.value = type
  processForm.id = row.id
  processForm.content = ''
  dialogVisible.value = true
}

const submitProcess = async () => {
  if (!processForm.content) {
    ElMessage.warning(processType.value === 1 ? '请输入回复内容' : '请输入拒收理由')
    return
  }
  
  const data: any = { status: processType.value }
  if (processType.value === 1) data.replyContent = processForm.content
  else data.rejectReason = processForm.content

  const res = await processConsultationFeedback(processForm.id, data) as any
  if (res.code === 200) {
    ElMessage.success('处理成功')
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
