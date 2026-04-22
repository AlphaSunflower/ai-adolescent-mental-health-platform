<template>
  <div class="article-audit-container">
    <el-card>
      <template #header>
        <span>文章审核管理</span>
      </template>
      
      <el-table :data="articles" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="文章标题" min-width="200">
          <template #default="{ row }">
            <div class="article-title-cell">
              <img v-if="row.coverUrl" :src="row.coverUrl" class="cover-thumb" />
              <span class="title-text">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布者" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :src="row.userAvatar">
                <template #default>
                  <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                </template>
              </el-avatar>
              <span class="nickname" @click="goToUserHome(row.userId)" style="cursor:pointer;color:#409eff;">{{ row.userNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="tagName" label="标签" width="100">
          <template #default="{ row }">
            <el-tag size="small" v-if="row.tagName">{{ row.tagName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180"></el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row)">查看</el-button>
            <el-button size="small" type="success" @click="handleAudit(row, 1)">通过</el-button>
            <el-button size="small" type="danger" @click="handleReject(row)">拒绝</el-button>
            <el-button size="small" type="warning" @click="handleOffline(row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-if="total > 0"
        class="pagination"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      ></el-pagination>
      
      <!-- 查看详情对话框 -->
      <el-dialog v-model="detailVisible" title="文章详情" width="800px">
        <div v-if="currentArticle" class="article-detail">
          <h2>{{ currentArticle.title }}</h2>
          <div class="meta">
            <span>发布者：{{ currentArticle.userNickname }}</span>
            <span>标签：{{ currentArticle.tagName }}</span>
            <span>时间：{{ currentArticle.createTime }}</span>
          </div>
          <div class="cover" v-if="currentArticle.coverUrl">
            <img :src="currentArticle.coverUrl" alt="封面" />
          </div>
          <div class="content">
            <v-md-editor :model-value="currentArticle.content" mode="preview"></v-md-editor>
          </div>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button type="success" @click="handleAudit(currentArticle, 1)">通过</el-button>
          <el-button type="danger" @click="handleReject(currentArticle)">拒绝</el-button>
        </template>
      </el-dialog>
      
      <!-- 拒绝原因对话框 -->
      <el-dialog v-model="rejectVisible" title="拒绝原因" width="500px">
        <el-form :model="rejectForm" label-width="100px">
          <el-form-item label="拒绝原因" required>
            <el-input
              v-model="rejectForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入拒绝原因，以便作者了解问题"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="rejectVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确认拒绝</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingArticles, auditArticle, offlineArticle, type UserArticleVO } from '@/api/userArticle'

const router = useRouter()
const loading = ref(false)
const articles = ref<UserArticleVO[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const currentArticle = ref<UserArticleVO | null>(null)
const rejectVisible = ref(false)
const rejectForm = reactive<{ reason: string; articleId: number | null }>({ reason: '', articleId: null })

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await getPendingArticles({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      articles.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取待审核文章失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = (row: UserArticleVO) => {
  currentArticle.value = row
  detailVisible.value = true
}

const handleAudit = async (row: UserArticleVO | null, action: number) => {
  if (!row) return
  try {
    await ElMessageBox.confirm(
      action === 1 ? '确定通过这篇文章吗？' : '确定拒绝这篇文章吗？',
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await auditArticle(row.id, { action, reason: '' })
    if (res.code === 200) {
      ElMessage.success(res.data)
      detailVisible.value = false
      fetchArticles()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleReject = (row: UserArticleVO | null) => {
  if (!row) return
  rejectForm.articleId = row.id
  rejectForm.reason = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  try {
    const res = await auditArticle(rejectForm.articleId!, { action: 2, reason: rejectForm.reason })
    if (res.code === 200) {
      ElMessage.success(res.data)
      rejectVisible.value = false
      detailVisible.value = false
      fetchArticles()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const goToUserHome = (userId: number) => {
  router.push(`/user-home/${userId}`)
}

const handleOffline = async (row: UserArticleVO | null) => {
  if (!row) return
  try {
    await ElMessageBox.confirm('确定要下架这篇文章吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    const res = await offlineArticle(row.id, '管理员下架')
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchArticles()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchArticles()
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-audit-container {
  padding: 20px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-cell .nickname {
  font-size: 13px;
}

.article-title-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cover-thumb {
  width: 50px;
  height: 35px;
  object-fit: cover;
  border-radius: 4px;
}

.title-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}

.article-detail h2 {
  margin-top: 0;
}

.article-detail .meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
}

.article-detail .cover img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.article-detail .content {
  max-height: 400px;
  overflow-y: auto;
}
</style>
