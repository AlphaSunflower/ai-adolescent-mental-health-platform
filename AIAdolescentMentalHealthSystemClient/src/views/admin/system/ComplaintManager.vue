<template>
  <div class="complaint-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>投诉管理</span>
        </div>
      </template>
      
      <el-table :data="complaints" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userId" label="投诉人ID" width="100"></el-table-column>
        <el-table-column prop="doctorId" label="被投诉医生ID" width="120"></el-table-column>
        <el-table-column prop="content" label="投诉内容" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column label="证明图片" width="120">
          <template #default="scope">
            <el-button v-if="scope.row.proofImages?.length" size="small" @click="viewImages(scope.row.proofImages)">查看图片</el-button>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已处理</el-tag>
            <el-tag v-else type="danger">已驳回</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="投诉时间" width="160"></el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 0 && isSuperAdmin" size="small" type="primary" @click="openAuditDialog(scope.row)">审核</el-button>
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button v-if="isAdmin" size="small" type="danger" @click="handleRestrict(scope.row.doctorId)">限制医生</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchComplaints"
        />
      </div>
    </el-card>

    <!-- Audit Dialog -->
    <el-dialog v-model="auditVisible" title="投诉审核" width="500px">
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="1">通过 (退费并处理)</el-radio>
            <el-radio :label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注">
          <el-input type="textarea" v-model="auditForm.auditRemark" :rows="3" placeholder="请输入审核备注..."></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- Image Viewer -->
    <el-dialog v-model="imageVisible" title="证明图片" width="600px">
      <div class="image-list">
        <el-image 
          v-for="img in currentImages" 
          :key="img" 
          :src="img" 
          :preview-src-list="currentImages"
          style="width: 150px; height: 150px; margin: 10px;"
          fit="cover"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getComplaintList, auditComplaint, restrictDoctor } from '@/api/consultation'
import { ElMessage, ElMessageBox } from 'element-plus'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const isSuperAdmin = computed(() => user.role === 4)
const isAdmin = computed(() => user.role === 3 || user.role === 4)

const loading = ref(false)
const complaints = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchComplaints = async () => {
  loading.value = true
  try {
    const res = await getComplaintList({
      page: currentPage.value,
      size: pageSize.value,
      role: user.role
    }) as any
    if (res.code === 200) {
      complaints.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const auditVisible = ref(false)
const auditForm = ref({
  id: 0,
  status: 1,
  auditRemark: ''
})
const submitting = ref(false)

const openAuditDialog = (row: any) => {
  auditForm.value.id = row.id
  auditForm.value.status = 1
  auditForm.value.auditRemark = ''
  auditVisible.value = true
}

const submitAudit = async () => {
  submitting.value = true
  try {
    const res = await auditComplaint(auditForm.value.id, auditForm.value.status, auditForm.value.auditRemark) as any
    if (res.code === 200) {
      ElMessage.success('审核完成')
      auditVisible.value = false
      fetchComplaints()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const imageVisible = ref(false)
const currentImages = ref<string[]>([])
const viewImages = (images: string[]) => {
  currentImages.value = images
  imageVisible.value = true
}

const viewDetail = (_row: any) => {
  // Logic to view full complaint details and audit history
}

const handleRestrict = async (doctorId: number) => {
  try {
    await ElMessageBox.confirm('确认限制该医生的线上咨询权限吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await restrictDoctor(doctorId, false) as any
    if (res.code === 200) {
      ElMessage.success('已成功限制医生权限')
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {}
}

onMounted(() => {
  fetchComplaints()
})
</script>

<style scoped>
.complaint-manager {
  padding: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
