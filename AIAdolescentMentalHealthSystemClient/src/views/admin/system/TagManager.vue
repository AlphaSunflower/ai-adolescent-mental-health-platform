<template>
  <div class="tag-manager-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文章标签管理</span>
          <el-button type="primary" @click="handleAdd">添加标签</el-button>
        </div>
      </template>
      
      <el-table :data="tags" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="标签名称" width="150"></el-table-column>
        <el-table-column prop="code" label="标签编码" width="150"></el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 添加/编辑对话框 -->
      <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑标签' : '添加标签'" width="500px">
        <el-form :model="form" label-width="100px">
          <el-form-item label="标签名称" required>
            <el-input v-model="form.name" placeholder="请输入标签名称"></el-input>
          </el-form-item>
          <el-form-item label="标签编码" required>
            <el-input v-model="form.code" placeholder="请输入标签编码，如：ADOLESCENCE"></el-input>
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999"></el-input-number>
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
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticleTags, addArticleTag, updateArticleTag, deleteArticleTag } from '@/api/articleTag'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const tags = ref<any[]>([])

const form = reactive<{
  id: number | undefined;
  name: string;
  code: string;
  sortOrder: number;
  status: number
}>({
  id: undefined,
  name: '',
  code: '',
  sortOrder: 0,
  status: 1
})

const fetchTags = async () => {
  loading.value = true
  try {
    const res = await getArticleTags()
    if (res.code === 200) {
      tags.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.id = undefined
  form.name = ''
  form.code = ''
  form.sortOrder = 0
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.sortOrder = row.sortOrder
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入标签名称')
    return
  }
  if (!form.code.trim()) {
    ElMessage.warning('请输入标签编码')
    return
  }

  submitting.value = true
  try {
    let res
    if (isEdit.value) {
      if (form.id === undefined) {
        ElMessage.warning('标签ID无效')
        submitting.value = false
        return
      }
      res = await updateArticleTag({ id: form.id, name: form.name, code: form.code, sortOrder: form.sortOrder })
    } else {
      res = await addArticleTag({ name: form.name, code: form.code, sortOrder: form.sortOrder })
    }
    if (res.code === 200) {
      ElMessage.success(res.data)
      dialogVisible.value = false
      fetchTags()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个标签吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteArticleTag(row.id)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchTags()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tag-manager-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
