<template>
  <div class="book-list-page">
    <!-- 星空背景 -->
    <div class="stars-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="planet-1"></div>
      <div class="planet-2"></div>
      <div class="planet-3"></div>
      <div class="comet"></div>
    </div>

    <div class="book-content">
      <!-- 头部搜索和筛选 -->
      <div class="book-header glass-card">
        <div class="header-content">
          <h1 class="page-title">心理书籍/期刊</h1>
          <p class="page-subtitle">探索青少年心理健康领域的专业书籍与期刊</p>
          
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索书籍标题..."
              size="large"
              clearable
              @keyup.enter="handleSearch"
              @clear="clearSearch"
            >
              <template #prepend>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 书籍列表 -->
      <div class="book-list-container">
        <!-- 加载中 -->
        <div v-if="loading" class="loading">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- 无数据 -->
        <div v-else-if="books.length === 0" class="no-data">
          <el-empty description="暂无书籍数据">
            <el-button type="primary" @click="refresh">刷新</el-button>
          </el-empty>
        </div>

        <!-- 书籍网格 -->
        <div v-else class="book-grid">
          <div
            v-for="book in books"
            :key="book.id"
            class="book-card glass-card"
            @click="goToBook(book)"
          >
            <div class="book-cover">
              <el-image
                :src="book.coverUrl || '/default-book-cover.png'"
                :alt="book.title"
                fit="cover"
                class="cover-image"
                :preview-src-list="[book.coverUrl]"
              >
                <template #error>
                  <div class="cover-error">
                    <el-icon><Picture /></el-icon>
                    <span>暂无封面</span>
                  </div>
                </template>
              </el-image>
            </div>
            
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-desc">{{ truncateText(book.description, 80) }}</p>
              
              <div class="book-stats">
                <div class="stat-item">
                  <el-icon><View /></el-icon>
                  <span>{{ formatCount(book.viewCount || 0) }}</span>
                </div>
                <div class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>{{ formatCount(book.commentCount || 0) }}</span>
                </div>
              </div>
              
              <div v-if="book.address" class="external-link-tag">
                <el-tag type="success" size="small">可在线阅读</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="size"
            :page-sizes="[10, 20, 30, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, View, ChatDotRound, Picture } from '@element-plus/icons-vue'
import { getBookList, type Book, type BookListParams } from '@/api/book'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 搜索参数
const searchKeyword = ref('')
const page = ref(1)
const size = ref(12)
const total = ref(0)

// 书籍数据
const books = ref<Book[]>([])
const loading = ref(false)

// 工具函数
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '暂无简介'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 获取书籍列表
const fetchBooks = async () => {
  loading.value = true
  try {
    const params: BookListParams = {
      page: page.value,
      size: size.value
    }
    
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    
    const res = await getBookList(params)
    if (res.code === 200) {
      books.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取书籍列表失败')
      books.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取书籍列表失败:', error)
    ElMessage.error('获取书籍列表失败，请稍后重试')
    books.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  page.value = 1
  fetchBooks()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  page.value = 1
  fetchBooks()
}

// 刷新
const refresh = () => {
  fetchBooks()
}

// 分页处理
const handleSizeChange = (newSize: number) => {
  size.value = newSize
  page.value = 1
  fetchBooks()
}

const handleCurrentChange = (newPage: number) => {
  page.value = newPage
  fetchBooks()
}

// 跳转到书籍
const goToBook = (book: Book) => {
  router.push(`/book/${book.id}`)
}

// 监听路由参数
watch(() => router.currentRoute.value.query, (newQuery) => {
  if (newQuery.keyword) {
    searchKeyword.value = newQuery.keyword as string
  }
  fetchBooks()
})

onMounted(() => {
  fetchBooks()
})
</script>

<style scoped>
.book-list-page {
  position: relative;
  min-height: calc(100vh - 60px);
  overflow-x: hidden;
}

/* 星空背景样式复用自SearchResults.vue */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  background: linear-gradient(to bottom, #0a0a2a, #1a1a4a, #2a2a6a);
  overflow: hidden;
  pointer-events: none;
}

.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars:before, .stars:after,
.stars2:before, .stars2:after,
.stars3:before, .stars3:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars:before {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 100px 100px;
  animation: starsMove 200s linear infinite;
}

.stars:after {
  background-image: radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 150px 150px;
  animation: starsMove 150s linear infinite;
}

.stars2:before {
  background-image: radial-gradient(1px 1px at 90px 120px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: starsMove 100s linear infinite;
}

.stars3:before {
  background-image: radial-gradient(3px 3px at 150px 200px, #ddd, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 300px 300px;
  animation: starsMove 250s linear infinite;
}

@keyframes starsMove {
  from { transform: translateY(0px) }
  to { transform: translateY(-2000px) }
}

/* 行星样式 */
.planet-1 {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 10%;
  right: 10%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff9a9e, #fad0c4);
  box-shadow: 0 0 40px rgba(255, 154, 158, 0.5);
  animation: float 25s infinite ease-in-out;
  filter: blur(1px);
  opacity: 0.7;
}

.planet-2 {
  position: absolute;
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 5%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #a1c4fd, #c2e9fb);
  box-shadow: 0 0 50px rgba(161, 196, 253, 0.5);
  animation: float 30s infinite ease-in-out reverse;
  filter: blur(1px);
  opacity: 0.7;
}

.planet-3 {
  position: absolute;
  width: 80px;
  height: 80px;
  top: 60%;
  right: 20%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffecd2, #fcb69f);
  box-shadow: 0 0 30px rgba(252, 182, 159, 0.5);
  animation: float 20s infinite ease-in-out;
  filter: blur(1px);
  opacity: 0.7;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* 彗星 */
.comet {
  position: absolute;
  top: 20%;
  left: -50px;
  width: 150px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  animation: cometMove 20s linear infinite;
}

@keyframes cometMove {
  0% { transform: translateX(-100px) translateY(-100px) rotate(45deg); }
  100% { transform: translateX(calc(100vw + 100px)) translateY(calc(100vh + 100px)) rotate(45deg); }
}

.book-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 玻璃态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  padding: 24px;
}

.book-header {
  margin-bottom: 30px;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
  background: linear-gradient(to right, #FFE9A7, #7EC8FF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  line-height: 1.6;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  color: #fff !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.el-input-group__prepend) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.el-input-group__append) {
  background: rgba(64, 158, 255, 0.6) !important;
  border-color: rgba(64, 158, 255, 0.6) !important;
  color: #fff !important;
}

/* 书籍网格 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.book-card {
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(64, 158, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.book-cover {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}

.cover-error .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

.book-desc {
  flex: 1;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.book-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.stat-item .el-icon {
  font-size: 1rem;
}

.external-link-tag {
  align-self: flex-start;
}

/* 加载中 */
.loading {
  padding: 60px 0;
}

/* 无数据 */
.no-data {
  text-align: center;
  padding: 60px 0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-pagination) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-pagination button),
:deep(.el-pager li) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-pager li.is-active) {
  background: rgba(64, 158, 255, 0.4) !important;
}

:deep(.el-pagination .el-pagination__total) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .book-content {
    padding: 15px 10px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .book-cover {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .book-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}
</style>