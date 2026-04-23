<template>
  <div class="qualification-admin-page">
    <div class="page-header">
      <h2>资质类型管理</h2>
      <el-button type="primary" @click="openDialog('add')">
        <el-icon><Plus /></el-icon> 新增资质
      </el-button>
    </div>

    <el-table :data="qualificationList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="资质名称" min-width="200"></el-table-column>
      <el-table-column prop="code" label="资质代码" width="150"></el-table-column>
      <el-table-column prop="description" label="描述" min-width="250"></el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80"></el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" link @click="openDialog('edit', scope.row)">编辑</el-button>
          <el-button size="small" type="danger" link @click="deleteQualification(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增资质' : '编辑资质'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="资质名称" required>
          <el-input v-model="form.name" placeholder="请输入资质名称" />
        </el-form-item>
        <el-form-item label="资质代码" required>
          <el-input v-model="form.code" placeholder="请输入资质代码" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQualification" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const qualificationList = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const form = reactive({
  id: null as number | null,
  name: '',
  code: '',
  description: '',
  sortOrder: 0,
  status: 1
})

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await request({
      url: '/api/admin/psychologist/qualifications',
      method: 'get'
    })
    if (res.code === 200) {
      qualificationList.value = res.data || []
      total.value = qualificationList.value.length
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const openDialog = (type: 'add' | 'edit', row?: any) => {
  dialogType.value = type
  if (type === 'add') {
    form.id = null
    form.name = ''
    form.code = ''
    form.description = ''
    form.sortOrder = 0
    form.status = 1
  } else {
    form.id = row.id
    form.name = row.name
    form.code = row.code
    form.description = row.description || ''
    form.sortOrder = row.sortOrder || 0
    form.status = row.status
  }
  dialogVisible.value = true
}

const saveQualification = async () => {
  if (!form.name || !form.code) {
    ElMessage.warning('请填写必填项')
    return
  }
  loading.value = true
  try {
    const res: any = await request({
      url: dialogType.value === 'add' ? '/api/admin/psychologist/qualification' : `/api/admin/psychologist/qualification/${form.id}`,
      method: dialogType.value === 'add' ? 'post' : 'put',
      data: form
    })
    if (res.code === 200) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const deleteQualification = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该资质吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await request({
      url: `/api/admin/psychologist/qualification/${id}`,
      method: 'delete'
    })
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.qualification-admin-page {
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
  margin: 0;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
