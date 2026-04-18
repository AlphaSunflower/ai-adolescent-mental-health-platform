<template>
  <div class="doctor-list">
    <div class="header">
      <h2>医生管理</h2>
      <el-button type="primary" @click="handleAdd">新增医生</el-button>
    </div>

    <div class="search-bar" style="margin-bottom: 20px;">
        <el-input v-model="searchQuery" placeholder="搜索医生姓名/用户名" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchDoctors"></el-input>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 100px; margin-right: 10px;" clearable>
            <el-option label="正常" :value="1"></el-option>
            <el-option label="停用" :value="0"></el-option>
        </el-select>
        <el-button @click="fetchDoctors">搜索</el-button>
    </div>

    <el-table :data="doctors" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="realName" label="真实姓名"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="specialty" label="专长" min-width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="title" label="职称"></el-table-column>
      <el-table-column prop="departmentId" label="所属科室">
          <template #default="scope">
              {{ getDepartmentName(scope.row.departmentId) }}
          </template>
      </el-table-column>
      <el-table-column prop="consultationPrice" label="咨询价格" width="100">
        <template #default="scope">¥ {{ scope.row.consultationPrice ?? 0 }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号"></el-table-column>
      <el-table-column label="线上咨询" width="120">
        <template #default="scope">
          <el-switch
            :model-value="scope.row.onlineConsultEnabled === 1"
            @change="(val: any) => handleToggleConsultation(scope.row, 'online', val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="线下咨询" width="120">
        <template #default="scope">
          <el-switch
            :model-value="scope.row.offlineConsultEnabled === 1"
            @change="(val: any) => handleToggleConsultation(scope.row, 'offline', val)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
          <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '正常' : '停用' }}
              </el-tag>
          </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="success" @click="handleSchedule(scope.row)">排班设置</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchDoctors"
      />
    </div>

    <!-- Schedule Config Dialog -->
    <ScheduleConfigDialog v-model="scheduleVisible" :doctorId="currentDoctorId" />

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑医生' : '新增医生'">
      <el-form :model="form" label-width="100px">
        <template v-if="!isEdit">
             <el-form-item label="绑定现有用户">
                <div style="display: flex; gap: 10px; width: 100%;">
                    <el-input v-model="bindUsername" placeholder="输入用户名查找" style="flex: 1"></el-input>
                    <el-button type="primary" @click="checkUser">查找</el-button>
                </div>
            </el-form-item>
        </template>
        
        <el-divider v-if="!isEdit && !foundUser">或者新建用户</el-divider>
        <el-divider v-if="foundUser">确认绑定用户</el-divider>

        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="isEdit || foundUser"></el-input>
        </el-form-item>
        <el-form-item label="密码" v-if="!isEdit && !foundUser">
          <el-input v-model="form.password" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName"></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" :disabled="foundUser"></el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" :disabled="foundUser"></el-input>
        </el-form-item>
        <el-form-item label="所属科室">
            <el-select v-model="form.departmentId" placeholder="请选择科室" style="width: 100%">
                <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="职称">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="专长">
          <el-input v-model="form.specialty"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="form.introduction"></el-input>
        </el-form-item>
        <el-form-item label="咨询价格">
          <el-input-number v-model="form.consultationPrice" :precision="2" :step="10"></el-input-number>
        </el-form-item>
        <el-form-item label="状态">
             <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用"></el-switch>
        </el-form-item>
        <el-form-item label="线上咨询">
             <el-switch v-model="form.onlineConsultEnabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用"></el-switch>
        </el-form-item>
        <el-form-item label="线下咨询">
             <el-switch v-model="form.offlineConsultEnabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import request from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import ScheduleConfigDialog from './ScheduleConfigDialog.vue'

const doctors = ref<any[]>([])
const departments = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const scheduleVisible = ref(false)
const currentDoctorId = ref(0)
const isEdit = ref(false)
const form = reactive<any>({})
const searchQuery = ref('')
const statusFilter = ref<number | undefined>(undefined)
const bindUsername = ref('')
const foundUser = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)

const handleSchedule = (row: any) => {
    currentDoctorId.value = row.id
    scheduleVisible.value = true
}

const fetchDoctors = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/hospital/doctors', {
        params: {
            page: page.value,
            size: size.value,
            name: searchQuery.value,
            status: statusFilter.value
        }
    }) as any
    if (res.code === 200) {
      doctors.value = res.data.records
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
    try {
        const res = await request.get('/hospital/department/list', { params: { size: 100 } }) as any
        if (res.code === 200) {
            departments.value = res.data.records
        }
    } catch (e) {}
}

const getDepartmentName = (id: number) => {
    const dept = departments.value.find(d => d.id === id)
    return dept ? dept.name : '未分配'
}

const checkUser = async () => {
    if (!bindUsername.value) return;
    try {
        const res = await request.get('/admin/users', { params: { username: bindUsername.value } }) as any
        if (res.code === 200 && res.data.records.length > 0) {
            const user = res.data.records[0]
            if (user.username === bindUsername.value) {
                await ElMessageBox.confirm(`找到用户：${user.nickname} (${user.username})，确认绑定吗？`, '确认', { type: 'info' })
                foundUser.value = true
                // Fill form
                form.username = user.username
                form.nickname = user.nickname
                form.phone = user.phone
                form.status = user.status
                // Keep password empty as we don't change it for existing user unless needed, but API expects it if new.
                // For binding, we don't need password.
            }
        } else {
            ElMessage.warning('未找到用户')
        }
    } catch (e) {}
}

const handleAdd = () => {
  isEdit.value = false
  foundUser.value = false
  bindUsername.value = ''
  Object.keys(form).forEach(key => delete form[key])
  form.status = 1
  form.onlineConsultEnabled = 1
  form.offlineConsultEnabled = 1
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  foundUser.value = false // Editing existing doctor, treated as "found" user effectively but disabled inputs handle it
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/admin/hospital/doctor/${id}`) as any
        if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchDoctors()
        }
    })
}

const handleToggleConsultation = async (row: any, type: 'online' | 'offline', value: boolean) => {
  const params: any = {}
  if (type === 'online') {
    params.onlineEnabled = value ? 1 : 0
  } else {
    params.offlineEnabled = value ? 1 : 0
  }
  try {
    const res = await request.put(`/admin/hospital/doctor/${row.id}/consultation-switch`, null, { params }) as any
    if (res.code === 200) {
      ElMessage.success('咨询权限已更新')
      fetchDoctors()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

const submitForm = async () => {
    const res = await request.post('/admin/hospital/doctor', form) as any
    if (res.code === 200) {
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchDoctors()
    } else {
        ElMessage.error(res.message)
    }
}

onMounted(() => {
  fetchDepartments()
  fetchDoctors()
})
</script>

<style scoped>
.doctor-list {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>
