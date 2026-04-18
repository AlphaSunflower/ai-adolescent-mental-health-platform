<template>
  <div class="article-manager">
    <div class="header">
      <h2>心理文章管理</h2>
      <el-button type="primary" @click="handleAdd">新增文章</el-button>
    </div>
    
    <div class="search-bar" style="margin-bottom: 20px;">
        <el-input v-model="searchQuery" placeholder="搜索文章标题" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchArticles"></el-input>
        <el-button @click="fetchArticles">搜索</el-button>
    </div>

    <el-table :data="articles" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="tagName" label="类型">
        <template #default="scope">
          <el-tag v-if="scope.row.tagName" size="small" type="info">{{ scope.row.tagName }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="authorNickname" label="作者">
        <template #default="scope">
          <span>{{ scope.row.authorNickname || '-' }}</span>
          <el-tag v-if="scope.row.authorRole" size="small" type="warning" style="margin-left: 5px;">
            {{ getRoleName(scope.row.authorRole) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
          <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
          </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <!-- 管理员文章可以编辑 -->
          <el-button v-if="scope.row.source === 'admin' && scope.row.editable" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <!-- 用户文章只能上架/下架 -->
          <template v-if="scope.row.source === 'user'">
            <!-- 待审核文章(status=0): 可以上架或下架 -->
            <el-button v-if="scope.row.status === 0" size="small" type="success" @click="handleOnline(scope.row)">上架</el-button>
            <el-button v-if="scope.row.status === 0" size="small" type="warning" @click="handleOffline(scope.row)">下架</el-button>
            <!-- 已发布文章(status=1): 只能下架 -->
            <el-button v-if="scope.row.status === 1" size="small" type="warning" @click="handleOffline(scope.row)">下架</el-button>
            <!-- 已下架文章(status=2): 可以重新上架 -->
            <el-button v-if="scope.row.status === 2" size="small" type="success" @click="handleRepublish(scope.row)">重新上架</el-button>
          </template>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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
import { offlineUserArticle, onlineUserArticle } from '@/api/userArticle'

const router = useRouter()
const articles = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const user = JSON.parse(localStorage.getItem('user') || '{}')

const getRoleName = (role: number) => {
  const roleMap: Record<number, string> = {
    1: '用户',
    2: '医生',
    3: '医院管理员',
    4: '超级管理员'
  }
  return roleMap[role] || '用户'
}

const getStatusName = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: '已发布',
    2: '已下架'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'info'
  }
  return typeMap[status] || 'info'
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await request.get('/content/admin/articles', { 
      params: { 
        title: searchQuery.value,
        role: user.role
      } 
    }) as any
    if (res.code === 200) {
      articles.value = res.data.records
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/admin/content/articles/create')
}

const handleEdit = (row: any) => {
  router.push(`/admin/content/articles/edit/${row.id}`)
}

const handleOnline = async (row: any) => {
  try {
    const res = await onlineUserArticle(row.id) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '上架成功')
      fetchArticles()
    } else {
      ElMessage.error(res.message || '上架失败')
    }
  } catch (error) {
    ElMessage.error('上架失败')
  }
}

// 重新上架已下架的文章
const handleRepublish = async (row: any) => {
  try {
    const res = await onlineUserArticle(row.id) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '重新上架成功')
      fetchArticles()
    } else {
      ElMessage.error(res.message || '重新上架失败')
    }
  } catch (error) {
    ElMessage.error('重新上架失败')
  }
}

const handleOffline = async (row: any) => {
  try {
    const res = await offlineUserArticle(row.id) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '下架成功')
      fetchArticles()
    } else {
      ElMessage.error(res.message || '下架失败')
    }
  } catch (error) {
    ElMessage.error('下架失败')
  }
}

const handleDelete = (row: any) => {
    ElMessageBox.confirm('确定删除这篇文章吗？此操作不可恢复。', '删除确认', { type: 'warning' }).then(async () => {
        if (row.source === 'admin') {
            // 管理员文章走管理员API
            const res = await request.delete(`/content/article/${row.id}`, { params: { role: user.role } }) as any
            if (res.code === 200) {
                ElMessage.success('删除成功')
                fetchArticles()
            } else {
                ElMessage.error(res.message)
            }
        } else {
            // 用户文章走用户文章API
            const res = await request.delete(`/article/user/${row.id}`) as any
            if (res.code === 200) {
                ElMessage.success('删除成功')
                fetchArticles()
            } else {
                ElMessage.error(res.message)
            }
        }
    })
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-manager {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>
