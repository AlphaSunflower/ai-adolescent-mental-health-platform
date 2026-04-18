<template>
  <div class="user-list">
    <div class="header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>
    
    <div class="search-bar" style="margin-bottom: 20px;">
        <el-input v-model="searchQuery" placeholder="搜索用户名" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchUsers"></el-input>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 100px; margin-right: 10px;" clearable>
            <el-option label="正常" :value="1"></el-option>
            <el-option label="停用" :value="0"></el-option>
        </el-select>
        <el-button @click="fetchUsers">搜索</el-button>
    </div>

    <el-table :data="users" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="nickname" label="昵称"></el-table-column>
      <el-table-column prop="role" label="角色">
        <template #default="scope">
            <el-tag v-if="scope.row.role === 1">普通用户</el-tag>
            <el-tag v-else-if="scope.row.role === 2" type="success">医生</el-tag>
            <el-tag v-else-if="scope.row.role === 3" type="warning">医院管理员</el-tag>
            <el-tag v-else-if="scope.row.role === 4" type="danger">超级管理员</el-tag>
            <el-tag v-else type="info">游客</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号"></el-table-column>
      <el-table-column prop="status" label="状态">
          <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '正常' : '停用' }}
              </el-tag>
          </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="size"
            :current-page="page"
            @current-change="handlePageChange"
        />
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'">
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="isEdit"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="不修改请留空" show-password></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="普通用户" :value="1"></el-option>
            <el-option label="医生" :value="2"></el-option>
            <el-option label="医院管理员" :value="3"></el-option>
            <el-option label="超级管理员" :value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone"></el-input>
        </el-form-item>
        <el-form-item label="状态">
             <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用"></el-switch>
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

const users = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive<any>({})
const searchQuery = ref('')
const statusFilter = ref<number | undefined>(undefined)
const page = ref(1)
const size = ref(10)
const total = ref(0)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/users', {
        params: {
            page: page.value,
            size: size.value,
            username: searchQuery.value,
            status: statusFilter.value
        }
    }) as any
    if (res.code === 200) {
      users.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (val: number) => {
    page.value = val
    fetchUsers()
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => delete form[key])
  form.role = 1 // default
  form.status = 1 // default
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, row)
  form.password = '' // Don't show password hash
  dialogVisible.value = true
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定删除吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await request.delete(`/admin/user/${id}`) as any
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchUsers()
    }
  })
}

const submitForm = async () => {
  const res = await request.post('/admin/user', form) as any
  if (res.code === 200) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    fetchUsers()
  } else {
    ElMessage.error(res.message)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>
