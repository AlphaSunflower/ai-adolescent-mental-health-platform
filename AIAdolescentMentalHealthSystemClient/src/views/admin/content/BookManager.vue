<template>
  <div class="book-manager">
    <div class="header">
      <h2>书籍管理</h2>
      <el-button type="primary" @click="handleAdd">新增书籍</el-button>
    </div>

    <div class="search-bar" style="margin-bottom: 20px;">
      <el-select v-model="filterStatus" placeholder="选择状态" style="width: 150px; margin-right: 10px;" clearable @change="fetchBooks">
        <el-option label="全部" value=""></el-option>
        <el-option label="上架" :value="1"></el-option>
        <el-option label="下架" :value="0"></el-option>
      </el-select>
      <el-input v-model="searchQuery" placeholder="搜索书籍标题" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchBooks"></el-input>
      <el-button @click="fetchBooks">搜索</el-button>
    </div>

    <el-table :data="books" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="封面" width="100">
        <template #default="scope">
          <el-image
            v-if="scope.row.coverUrl"
            :src="scope.row.coverUrl"
            style="width: 60px; height: 80px;"
            fit="cover"
            :preview-src-list="[scope.row.coverUrl]"
            preview-teleported
          ></el-image>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200"></el-table-column>
      <el-table-column prop="description" label="简介" min-width="200">
        <template #default="scope">
          <span class="description-text">{{ scope.row.description || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览数" width="100"></el-table-column>
      <el-table-column prop="commentCount" label="评论数" width="100"></el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" @click="handleViewComments(scope.row)">评论管理</el-button>
          <el-button v-if="scope.row.status === 1" size="small" type="warning" @click="handleToggleStatus(scope.row)">下架</el-button>
          <el-button v-else size="small" type="success" @click="handleToggleStatus(scope.row)">上架</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchBooks"
      ></el-pagination>
    </div>

    <!-- 评论管理对话框 -->
    <el-dialog v-model="commentDialogVisible" title="评论管理" width="800px">
      <div class="comment-header">
        <span>书籍：《{{ currentBookTitle }}》</span>
      </div>
      <el-table :data="comments" v-loading="commentLoading" style="width: 100%;" max-height="400">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userNickname" label="用户" width="120">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="24" :src="scope.row.userAvatar">
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
              </el-avatar>
              <span style="margin-left: 8px;">{{ scope.row.userNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容"></el-table-column>
        <el-table-column prop="createTime" label="评论时间" width="180"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDeleteComment(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 评论分页 -->
      <div class="pagination" style="margin-top: 15px;">
        <el-pagination
          v-model:current-page="commentPage"
          v-model:page-size="commentSize"
          :total="commentTotal"
          layout="total, prev, pager, next"
          @current-change="fetchComments"
        ></el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBookAdminList, deleteBook, updateBook, getBookCommentList, deleteBookComment } from '@/api/adminBook'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const books = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref<number | ''>('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 评论相关
const commentDialogVisible = ref(false)
const commentLoading = ref(false)
const comments = ref<any[]>([])
const currentBookId = ref<number | null>(null)
const currentBookTitle = ref('')
const commentPage = ref(1)
const commentSize = ref(10)
const commentTotal = ref(0)

const fetchBooks = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      size: pageSize.value
    }
    if (searchQuery.value) {
      params.keyword = searchQuery.value
    }
    if (filterStatus.value !== '') {
      params.status = filterStatus.value
    }
    const res = await getBookAdminList(params) as any
    if (res.code === 200) {
      books.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/admin/content/books/create')
}

const handleEdit = (row: any) => {
  router.push(`/admin/content/books/edit/${row.id}`)
}

const handleToggleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '上架' : '下架'
  try {
    const res = await updateBook(row.id, { status: newStatus }) as any
    if (res.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchBooks()
    } else {
      ElMessage.error(res.message || `${actionText}失败`)
    }
  } catch (error) {
    ElMessage.error(`${actionText}失败`)
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除这本书吗？删除后无法恢复。', '删除确认', { type: 'warning' }).then(async () => {
    try {
      const res = await deleteBook(row.id) as any
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchBooks()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleViewComments = (row: any) => {
  currentBookId.value = row.id
  currentBookTitle.value = row.title
  commentDialogVisible.value = true
  commentPage.value = 1
  fetchComments()
}

const fetchComments = async () => {
  if (!currentBookId.value) return
  commentLoading.value = true
  try {
    const res = await getBookCommentList(currentBookId.value, {
      page: commentPage.value,
      size: commentSize.value
    }) as any
    if (res.code === 200) {
      comments.value = res.data.records
      commentTotal.value = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    commentLoading.value = false
  }
}

const handleDeleteComment = (row: any) => {
  ElMessageBox.confirm('确定删除这条评论吗？', '删除确认', { type: 'warning' }).then(async () => {
    try {
      const res = await deleteBookComment(row.id) as any
      if (res.code === 200) {
        ElMessage.success('删除成功')
        // 同步减少评论数
        const book = books.value.find(b => b.id === currentBookId.value)
        if (book && book.commentCount > 0) {
          book.commentCount--
        }
        fetchComments()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchBooks()
})
</script>

<style scoped>
.book-manager {
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
.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-info {
  display: flex;
  align-items: center;
}
.comment-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
  color: #409eff;
}
</style>
