<template>
  <div class="department-list">
    <div class="header">
      <h2>科室管理</h2>
      <el-button type="primary" @click="handleAdd">新增科室</el-button>
    </div>

    <div class="search-bar" style="margin-bottom: 20px;">
        <el-input v-model="searchQuery" placeholder="搜索科室名称" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchDepartments"></el-input>
        <el-button @click="fetchDepartments">搜索</el-button>
    </div>

    <el-table :data="departments" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="科室名称"></el-table-column>
      <el-table-column prop="description" label="介绍"></el-table-column>
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

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑科室' : '新增科室'">
      <el-form :model="form" label-width="100px">
        <el-form-item label="科室名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="介绍">
          <el-input type="textarea" v-model="form.description"></el-input>
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

const departments = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive<any>({})
const searchQuery = ref('')

const fetchDepartments = async () => {
  loading.value = true
  try {
    const res = await request.get('/hospital/department/list', {
        params: {
            name: searchQuery.value
        }
    }) as any
    if (res.code === 200) {
      departments.value = res.data.records
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => delete form[key])
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/hospital/department/${id}`) as any
        if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchDepartments()
        }
    })
}

const submitForm = async () => {
    const res = await request.post('/hospital/department', form) as any
    if (res.code === 200) {
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchDepartments()
    } else {
        ElMessage.error(res.message)
    }
}

onMounted(() => {
  fetchDepartments()
})
</script>

<style scoped>
.department-list {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>
