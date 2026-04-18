<template>
  <div class="complaint-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>热梗管理</span>
          <div class="search-box">
            <el-button type="primary" @click="openAddDialog">新增热梗</el-button>
            <el-input
              v-model="searchKeyword"
              placeholder="请输入梗名称搜索"
              clearable
              style="width: 300px; margin-right: 10px;"
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </div>
      </template>

      <el-table :data="memeList" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="meme" label="热梗" width="150"></el-table-column>
        <el-table-column prop="explain" label="热梗解释内容" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <div class="explain-content">{{ formatContent(scope.row.explain) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteMeme(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="fetchMemeList"
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="热梗详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentMeme?.id }}</el-descriptions-item>
        <el-descriptions-item label="梗名称">{{ currentMeme?.meme }}</el-descriptions-item>
        <el-descriptions-item label="梗内容">
          <div class="explain-content detail-explain">{{ formatContent(currentMeme?.explain) }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑热梗' : '新增热梗'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="梗名称">
          <el-input v-model="form.meme" placeholder="请输入梗名称"></el-input>
        </el-form-item>
        <el-form-item label="梗内容">
          <el-input v-model="form.explain" type="textarea" :rows="4" placeholder="请输入梗内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMemeList, getMemeDetail, saveMeme, updateMeme, deleteMeme as deleteMemeApi } from '@/api/meme'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const memeList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')

const fetchMemeList = async () => {
  loading.value = true
  try {
    const res = await getMemeList({
      page: currentPage.value,
      size: pageSize.value,
      memeName: searchKeyword.value || undefined
    }) as any
    if (res.code === 200) {
      memeList.value = res.data.records
      total.value = res.data.total
    }
  } catch (e) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchMemeList()
}

const resetSearch = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  fetchMemeList()
}

// Detail
const detailVisible = ref(false)
const currentMeme = ref<any>(null)

const viewDetail = async (row: any) => {
  try {
    const res = await getMemeDetail(row.id) as any
    if (res.code === 200) {
      currentMeme.value = res.data
      detailVisible.value = true
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

// Add/Edit
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: 0,
  meme: '',
  explain: ''
})
const submitting = ref(false)

const openAddDialog = () => {
  isEdit.value = false
  form.value = {
    id: 0,
    meme: '',
    explain: ''
  }
  dialogVisible.value = true
}

const openEditDialog = (row: any) => {
  isEdit.value = true
  // 使用 Object.assign 确保响应式
  Object.assign(form.value, {
    id: row.id,
    meme: row.meme || '',
    explain: row.explain || ''
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  // 严格验证
  if (!form.value.meme || !form.value.meme.trim()) {
    ElMessage.warning('请填写梗名称')
    return
  }
  if (!form.value.explain || !form.value.explain.trim()) {
    ElMessage.warning('请填写梗内容')
    return
  }

  submitting.value = true
  try {
    let res: any
    if (isEdit.value) {
      console.log('更新热梗:', form.value)
      res = await updateMeme(form.value) as any
    } else {
      const saveData = {
        meme: form.value.meme.trim(),
        explain: form.value.explain.trim()
      }
      console.log('保存热梗:', saveData)
      res = await saveMeme(saveData) as any
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchMemeList()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e: any) {
    console.error('请求错误:', e)
    ElMessage.error(e?.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const deleteMeme = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认要删除这个热梗吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteMemeApi(id) as any
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchMemeList()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {}
}

const formatContent = (content: string) => {
  if (!content) return ''
  return content.replace(/\\n/g, '\n')
}

onMounted(() => {
  fetchMemeList()
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
}
.explain-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
.detail-explain {
  max-height: 300px;
  overflow-y: auto;
}
</style>
