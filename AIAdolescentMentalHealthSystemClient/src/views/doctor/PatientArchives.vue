<template>
  <div class="patient-archives">
    <div class="header">
      <h2>我的患者/预约管理</h2>
      <el-select v-model="statusFilter" placeholder="状态筛选" @change="fetchAppointments" clearable style="width: 150px;">
        <el-option label="待就诊" :value="0"></el-option>
        <el-option label="已完成" :value="1"></el-option>
        <el-option label="已取消" :value="2"></el-option>
        <el-option label="爽约" :value="3"></el-option>
      </el-select>
    </div>

    <el-table :data="appointments" v-loading="loading" style="width: 100%">
      <el-table-column prop="patientName" label="患者姓名"></el-table-column>
      <el-table-column prop="patientPhone" label="联系电话"></el-table-column>
      <el-table-column label="预约时间">
          <template #default="scope">
              {{ scope.row.workDate }} {{ scope.row.workShift === 1 ? '上午' : '下午' }}
          </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
          <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
              </el-tag>
          </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button size="small" @click="handleViewDetail(scope.row)">查看详情</el-button>
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
        @current-change="fetchAppointments"
      ></el-pagination>
    </div>

    <!-- Appointment Detail Dialog -->
    <el-dialog v-model="detailVisible" title="预约详情" width="600px">
        <el-descriptions v-if="appointmentDetail" :column="2" border>
            <el-descriptions-item label="患者姓名">{{ appointmentDetail.patientName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ appointmentDetail.patientPhone }}</el-descriptions-item>
            <el-descriptions-item label="就诊日期">{{ appointmentDetail.workDate }}</el-descriptions-item>
            <el-descriptions-item label="班次">{{ appointmentDetail.workShift === 1 ? '上午' : '下午' }}</el-descriptions-item>
            <el-descriptions-item label="挂号费">¥ {{ appointmentDetail.fee }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ getStatusText(appointmentDetail.status) }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ appointmentDetail.description }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="appointmentDetail?.medicalRecord" class="medical-record-info" style="margin-top: 20px;">
            <h3>就诊记录</h3>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="科室">{{ appointmentDetail.medicalRecord.department }}</el-descriptions-item>
                <el-descriptions-item label="诊断">{{ appointmentDetail.medicalRecord.symptoms }}</el-descriptions-item>
                <el-descriptions-item label="备注">{{ appointmentDetail.medicalRecord.remarks }}</el-descriptions-item>
                <el-descriptions-item label="病历图片">
                    <div class="image-list">
                        <el-image 
                            v-for="img in appointmentDetail.medicalRecord.images" 
                            :key="img" 
                            :src="img" 
                            :preview-src-list="appointmentDetail.medicalRecord.images"
                            style="width: 100px; height: 100px; margin-right: 10px; margin-bottom: 10px;"
                            fit="cover"
                        ></el-image>
                    </div>
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDoctorAppointments } from '@/api/consultation'
import request from '@/api/user'
import { ElMessage } from 'element-plus'

const appointments = ref([])
const loading = ref(false)
const statusFilter = ref<number | undefined>(undefined)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// Detail view
const detailVisible = ref(false)
const appointmentDetail = ref<any>(null)

const handleViewDetail = async (row: any) => {
    try {
        const res = await request.get(`/consultation/appointment/${row.id}/detail`) as any
        if (res.code === 200) {
            appointmentDetail.value = res.data
            detailVisible.value = true
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('获取详情失败')
    }
}

const fetchAppointments = async () => {
  loading.value = true
  try {
    const res = await getDoctorAppointments({ 
      page: currentPage.value, 
      size: pageSize.value,
      status: statusFilter.value 
    }) as any
    if (res.code === 200) {
      appointments.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getStatusText = (status: number) => {
  const map: any = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: any = { 0: 'primary', 1: 'success', 2: 'info', 3: 'danger' }
  return map[status] || 'info'
}

onMounted(() => {
  fetchAppointments()
})
</script>

<style scoped>
.patient-archives {
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
