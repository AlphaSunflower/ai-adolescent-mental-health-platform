<template>
  <div class="quote-manager">
    <div class="header">
      <h2>每日正能量语录管理</h2>
      <el-button type="primary" @click="handleAdd">新增语录</el-button>
    </div>

    <el-table :data="quotes" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="content" label="内容"></el-table-column>
      <el-table-column prop="author" label="作者/出处"></el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
        @current-change="fetchQuotes"
      ></el-pagination>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑语录' : '新增语录'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="内容">
          <el-input type="textarea" v-model="form.content" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author"></el-input>
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
import { ref, reactive, onMounted } from 'vue'
import { getQuotes, saveQuote, deleteQuote } from '@/api/quote'
import { ElMessage, ElMessageBox } from 'element-plus'

const quotes = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({ id: undefined, content: '', author: '' })
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchQuotes = async () => {
  loading.value = true
  try {
    const res = await getQuotes() as any
    if (res.code === 200) {
      quotes.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.id = undefined
  form.content = ''
  form.author = ''
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.id = row.id
  form.content = row.content
  form.author = row.author
  dialogVisible.value = true
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
    const res = await deleteQuote(id) as any
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchQuotes()
    }
  })
}

const submitForm = async () => {
  if (!form.content) {
    ElMessage.error('内容不能为空')
    return
  }
  const res = await saveQuote(form as any) as any
  if (res.code === 200) {
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchQuotes()
  } else {
    ElMessage.error(res.message || '保存失败')
  }
}

onMounted(() => {
  fetchQuotes()
})
</script>

<style scoped>
.quote-manager {
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
