<template>
  <div class="hospital-list">
    <div class="header">
      <h2>医院管理</h2>
      <el-button type="primary" @click="handleAdd">新增医院</el-button>
    </div>
    <div class="search-bar" style="margin-bottom: 20px;">
        <el-input v-model="searchQuery" placeholder="搜索医院名称" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchHospitals"></el-input>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 100px; margin-right: 10px;" clearable>
            <el-option label="正常" :value="1"></el-option>
            <el-option label="停用" :value="0"></el-option>
        </el-select>
        <el-button @click="fetchHospitals">搜索</el-button>
    </div>

    <el-table :data="hospitals" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="医院名称"></el-table-column>
      <el-table-column prop="code" label="编码"></el-table-column>
      <el-table-column prop="contactPhone" label="联系电话"></el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '正常' : '停用' }}
            </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑医院' : '新增医院'">
      <el-form :model="form" label-width="100px">
        <el-form-item label="医院名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="封面图">
            <el-upload
                class="avatar-uploader"
                action="/api/common/upload"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
            >
                <img v-if="form.picture" :src="form.picture" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
        </el-form-item>
        <el-form-item label="编码">
          <el-input v-model="form.code"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone"></el-input>
        </el-form-item>
        <el-form-item label="地址">
            <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="form.introduction"></el-input>
        </el-form-item>
        <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用"></el-switch>
        </el-form-item>
        <el-form-item label="管理员ID">
           <div style="display: flex; gap: 10px; width: 100%;">
                <el-input v-model="form.adminUserId" placeholder="请输入管理员用户ID" style="flex: 1"></el-input>
                <el-button type="primary" @click="handleCheckUser" :disabled="!form.adminUserId">校验绑定</el-button>
           </div>
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
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'

const hospitals = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive<any>({})
const searchQuery = ref('')
const statusFilter = ref<number | undefined>(undefined)

const uploadHeaders = {
    'token': localStorage.getItem('token') || ''
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
    if (response.code === 200) {
        form.picture = response.data
    } else {
        ElMessage.error(response.message || '上传失败')
    }
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('Picture must be JPG or PNG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Picture size can not exceed 2MB!')
    return false
  }
  return true
}

const fetchHospitals = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/hospitals', {
        params: {
            name: searchQuery.value,
            status: statusFilter.value
        }
    }) as any
    if (res.code === 200) {
      hospitals.value = res.data.records
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCheckUser = async () => {
    if (!form.adminUserId) return;
    try {
        const res = await request.get(`/admin/user/${form.adminUserId}`) as any;
        if (res.code === 200) {
            const user = res.data;
            await ElMessageBox.confirm(
                `确认绑定该用户为医院管理员吗？\n用户名: ${user.username}\n昵称: ${user.nickname}\n电话: ${user.phone}`,
                '确认绑定',
                { type: 'info', confirmButtonText: '确认', cancelButtonText: '取消' }
            );
            ElMessage.success('校验通过，保存后将生效');
        } else {
            ElMessage.error(res.message || '用户不存在');
            form.adminUserId = '';
        }
    } catch (e) {
        if (e !== 'cancel') {
             ElMessage.error('查询失败或用户不存在');
        }
        // If cancel, keep the ID or clear? Usually keep allows retry, but user might want to clear.
        // Let's not clear on cancel to allow user to see what they typed.
        // But if query failed, clear.
        if (e !== 'cancel') form.adminUserId = '';
    }
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => delete form[key])
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定删除吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await request.delete(`/admin/hospital/${id}`) as any
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchHospitals()
    }
  })
}

const submitForm = async () => {
  if (form.adminUserId === '') {
      form.adminUserId = null
  }
  const res = await request.post('/admin/hospital', form) as any
  if (res.code === 200) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchHospitals()
  } else {
    ElMessage.error(res.message)
  }
}

onMounted(() => {
  fetchHospitals()
})
</script>

<style scoped>
.hospital-list {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>
