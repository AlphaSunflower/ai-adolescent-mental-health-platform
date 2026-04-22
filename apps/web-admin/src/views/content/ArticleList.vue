<template>
  <div class="article-list">
    <el-tabs v-model="activeType" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane
        v-for="tag in tagTypes"
        :key="tag.code"
        :label="tag.name"
        :name="tag.name"
      ></el-tab-pane>
    </el-tabs>

    <div v-loading="loading">
      <el-empty v-if="!loading && articleList.length === 0" description="暂无文章"></el-empty>
      
      <el-card v-for="item in articleList" :key="item.id" class="article-card" shadow="hover" @click="goToDetail(item)">
        <div class="card-content">
          <el-image v-if="item.coverUrl" :src="item.coverUrl" fit="cover" class="cover-image"></el-image>
          <div class="info">
            <div class="title-row">
              <h3>{{ item.title }}</h3>
              <el-tag v-if="item.tagName" size="small" type="info">{{ item.tagName }}</el-tag>
            </div>
            <p class="desc">{{ (item.content || '').substring(0, 100) }}...</p>
            <span class="date">{{ item.createTime }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <el-pagination
      v-if="total > 0"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticles } from '@/api/content'
import { getArticleTags } from '@/api/articleTag'
import { getAllPublishedArticles } from '@/api/userArticle'
import { ElMessage } from 'element-plus'

const router = useRouter()
const articleList = ref<any[]>([])
const allArticles = ref<any[]>([])
const loading = ref(false)
const activeType = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tagTypes = ref<any[]>([])

const fetchTags = async () => {
  try {
    const res = await getArticleTags()
    if (res.code === 200) {
      tagTypes.value = res.data.filter((tag: any) => tag.status === 1)
    }
  } catch (error) {
    console.error('获取标签失败', error)
  }
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const results: any[] = []
    
    // 获取管理员发布的文章（后端已返回 tagName）
    const adminRes = await getArticles({ page: 1, size: 1000 })
    if (adminRes.code === 200) {
      adminRes.data.records.forEach((article: any) => {
        article._source = 'admin'
        article._detailUrl = `/article/${article.id}`
        // tagName 已由后端设置
        results.push(article)
      })
    }
    
    // 获取用户发布的文章
    const userRes = await getAllPublishedArticles({ page: 1, size: 1000 })
    if (userRes.code === 200) {
      userRes.data.records.forEach((article: any) => {
        article._source = 'user'
        article._detailUrl = `/user-article/${article.userId}/${article.id}`
        results.push(article)
      })
    }
    
    // 按时间排序
    results.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    
    // 保存所有文章
    allArticles.value = results
    
    // 应用筛选
    applyFilter()
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const applyFilter = () => {
  let filtered = allArticles.value
  
  // 根据标签筛选 - 统一使用 tagName 进行匹配
  if (activeType.value !== 'all') {
    filtered = filtered.filter(article => {
      // 管理员文章和用户文章都使用 tagName 进行筛选
      return article.tagName === activeType.value
    })
  }
  
  // 分页
  total.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  articleList.value = filtered.slice(start, start + pageSize.value)
}

const handleTabClick = (tab: any) => {
  activeType.value = tab.props.name
  currentPage.value = 1
  applyFilter()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  applyFilter()
}

const goToDetail = (item: any) => {
  router.push(item._detailUrl)
}

onMounted(() => {
  fetchTags()
  fetchArticles()
})
</script>

<style scoped>
.article-list {
  padding: 20px;
  color: #fff;
}

/* 分类菜单 - 醒目白字 */
.article-list :deep(.el-tabs__header) {
  background: transparent;
}
.article-list :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
.article-list :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s;
}
.article-list :deep(.el-tabs__item:hover) {
  color: #fff !important;
}
.article-list :deep(.el-tabs__item.is-active) {
  color: #fff !important;
  font-weight: 700;
  font-size: 16px;
}
.article-list :deep(.el-tabs__active-bar) {
  background-color: #FFE9A7 !important;
  height: 3px;
}

/* 所有文本白色 */
.article-list :deep(h1),
.article-list :deep(h2),
.article-list :deep(h3),
.article-list :deep(h4),
.article-list :deep(h5),
.article-list :deep(h6),
.article-list :deep(p),
.article-list :deep(span),
.article-list :deep(.el-text) {
  color: #fff !important;
}

/* 卡片半透明白色背景 */
.article-list :deep(.el-card) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  color: #fff !important;
  transition: background 0.3s, border-color 0.3s, transform 0.2s;
}
.article-list :deep(.el-card:hover) {
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
  transform: translateY(-2px);
}
.article-list :deep(.el-card__body) {
  color: #fff !important;
}

/* 链接 */
.article-list :deep(.el-link) {
  color: #E0E0E0 !important;
}
.article-list :deep(.el-link:hover) {
  color: #409EFF !important;
}

/* 分页白色 */
.article-list :deep(.el-pagination) {
  color: #fff !important;
}
.article-list :deep(.el-pagination button),
.article-list :deep(.el-pager li) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
.article-list :deep(.el-pager li.is-active) {
  background: #409EFF !important;
  color: #fff !important;
}

/* 空状态 */
.article-list :deep(.el-empty__description) {
  color: rgba(255, 255, 255, 0.6) !important;
}

/* 标签根据类型着色 - 心理文章特有语义色 */
.article-list :deep(.el-tag) {
  border: none !important;
  font-weight: 600;
  letter-spacing: 0.5px;
}
/* 焦虑类 - 橙色 */
.article-list :deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.25) !important;
  color: #FFB347 !important;
}
/* 抑郁类 - 紫红 */
.article-list :deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.25) !important;
  color: #FF8C9A !important;
}
/* 成长类 - 蓝绿 */
.article-list :deep(.el-tag--primary) {
  background: rgba(64, 158, 255, 0.25) !important;
  color: #7EC8FF !important;
}
/* 关系类 - 粉色 */
.article-list :deep(.el-tag--info) {
  background: rgba(201, 91, 155, 0.25) !important;
  color: #FF99CC !important;
}
/* 成功/积极类 - 绿色 */
.article-list :deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.25) !important;
  color: #A8E063 !important;
}

/* 基础卡片样式 */
.article-card {
  margin-bottom: 20px;
  cursor: pointer;
}
.card-content {
  display: flex;
}
.cover-image {
  width: 200px;
  height: 120px;
  margin-right: 20px;
  flex-shrink: 0;
  border-radius: 4px;
}
.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.title-row h3 {
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fff !important;
  font-size: 16px;
}
.desc {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 14px;
  margin: 0 0 10px 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.date {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 12px;
}
</style>
