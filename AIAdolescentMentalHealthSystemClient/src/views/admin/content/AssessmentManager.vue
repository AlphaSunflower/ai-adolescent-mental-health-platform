<template>
  <div class="assessment-manager">
    <div class="header">
      <h2>心理测评管理</h2>
      <el-button type="primary" @click="handleAdd">新增量表</el-button>
    </div>
    
    <div class="search-bar" style="margin-bottom: 20px;">
        <el-input v-model="searchQuery" placeholder="搜索量表标题" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchTemplates"></el-input>
        <el-button @click="fetchTemplates">搜索</el-button>
    </div>

    <el-table :data="templates" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="type" label="类型">
          <template #default="scope">
              <el-tag v-if="scope.row.type === 'TRADITIONAL'">传统</el-tag>
              <el-tag v-else-if="scope.row.type === 'QUICK'" type="warning">快速</el-tag>
              <el-tag v-else type="success">动态</el-tag>
          </template>
      </el-table-column>
      <el-table-column prop="isPublic" label="可见性">
          <template #default="scope">
              <el-tag :type="scope.row.isPublic === 1 ? 'success' : 'warning'">{{ scope.row.isPublic === 1 ? '公开' : '仅医生可见' }}</el-tag>
          </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
          <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '已发布' : '草稿' }}</el-tag>
          </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const templates = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')

const fetchTemplates = async () => {
  loading.value = true
  try {
    const res = await request.get('/assessment/admin/templates', { params: { title: searchQuery.value } }) as any
    if (res.code === 200) {
      templates.value = res.data.records
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/admin/content/assessments/create')
}

const handleEdit = (row: any) => {
  router.push(`/admin/content/assessments/edit/${row.id}`)
}

const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/assessment/template/${id}`) as any
        if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchTemplates()
        }
    })
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.assessment-manager {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>
