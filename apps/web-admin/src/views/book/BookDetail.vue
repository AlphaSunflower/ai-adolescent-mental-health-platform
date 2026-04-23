<template>
  <div class="book-detail-page">
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

    <div class="book-detail-content" v-if="!loading">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-link type="info" underline="never" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回书籍列表
        </el-link>
      </div>

      <!-- 书籍主信息 -->
      <div class="book-main glass-card">
        <div class="book-header">
          <div class="cover-section">
            <el-image
              :src="book.coverUrl || '/default-book-cover.png'"
              :alt="book.title"
              fit="cover"
              class="main-cover"
              :preview-src-list="[]"
            >
              <template #error>
                <div class="cover-error">
                  <el-icon><Picture /></el-icon>
                  <span>暂无封面</span>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="info-section">
            <h1 class="book-title">{{ book.title }}</h1>
            
            <div class="book-meta">
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>浏览：{{ formatCount(book.viewCount || 0) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>评论：{{ formatCount(book.commentCount || 0) }}</span>
              </div>
              <div v-if="book.createTime" class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>发布时间：{{ formatTime(book.createTime) }}</span>
              </div>
            </div>
            
            <div class="book-description">
              <h3>书籍简介</h3>
              <p>{{ book.description || '暂无简介' }}</p>
            </div>
            
            <!-- 跳转按钮 -->
            <div class="action-buttons">
              <el-button
                v-if="book.address"
                type="primary"
                size="large"
                @click="handleReadOnline"
                class="read-btn"
              >
                <el-icon><Link /></el-icon>
                在线阅读
              </el-button>
              <el-button
                v-else
                type="info"
                size="large"
                disabled
                class="read-btn"
              >
                暂无在线阅读链接
              </el-button>
              
              <el-button
                type="success"
                size="large"
                @click="showCommentDialog = true"
                :disabled="!isLoggedIn"
                class="comment-btn"
              >
                <el-icon><Edit /></el-icon>
                发表评论
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section glass-card">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon><ChatDotRound /></el-icon>
            读者评论
            <span class="comment-count">({{ totalComments }})</span>
          </h2>
        </div>
        
        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <el-avatar :size="40" :src="comment.userAvatar" class="user-avatar">
                {{ comment.userNickname?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-info">
                <div class="user-name">{{ comment.userNickname || '匿名用户' }}</div>
                <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
              </div>
            </div>
            <div class="comment-content">
              {{ comment.content }}
            </div>
          </div>
        </div>
        
        <!-- 无评论 -->
        <div v-else class="no-comments">
          <el-empty description="暂无评论，快来发表第一条评论吧！">
            <el-button type="primary" @click="showCommentDialog = true" :disabled="!isLoggedIn">
              发表评论
            </el-button>
          </el-empty>
        </div>
        
        <!-- 评论分页 -->
        <div v-if="totalComments > 0" class="comment-pagination">
          <el-pagination
            v-model:current-page="commentPage"
            v-model:page-size="commentSize"
            :page-sizes="[5, 10, 20]"
            :total="totalComments"
            layout="total, sizes, prev, pager, next"
            @size-change="handleCommentSizeChange"
            @current-change="handleCommentPageChange"
          />
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="loading">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 发表评论对话框 -->
    <el-dialog
      v-model="showCommentDialog"
      title="发表评论"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="commentForm" :rules="commentRules" ref="commentFormRef">
        <el-form-item label="评论内容" prop="content">
          <el-input
            type="textarea"
            v-model="commentForm.content"
            :rows="4"
            placeholder="请输入您的评论..."
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCommentDialog = false">取消</el-button>
          <el-button type="primary" @click="submitComment" :loading="submitting">
            发表评论
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  View,
  ChatDotRound,
  Clock,
  Picture,
  Link,
  Edit
} from '@element-plus/icons-vue'
import {
  getBookDetail,
  getBookComments,
  type Book,
  type Comment,
  type CommentForm
} from '@/api/book'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const bookId = Number(route.params.id)

// 书籍详情
const book = ref<Book>({
  id: 0,
  title: '',
  coverUrl: '',
  description: '',
  address: '',
  viewCount: 0,
  commentCount: 0
})

// 评论相关
const comments = ref<Comment[]>([])
const commentPage = ref(1)
const commentSize = ref(10)
const totalComments = ref(0)
const showCommentDialog = ref(false)
const commentForm = ref<CommentForm>({
  bookId: bookId,
  content: ''
})
const commentFormRef = ref<FormInstance>()
const submitting = ref(false)

// 加载状态
const loading = ref(true)

// 用户登录状态
const user = JSON.parse(localStorage.getItem('user') || '{}')
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token') && !!user.id
})

// 表单验证规则
const commentRules: FormRules = {
  content: [
    { required: true, message: '请输入评论内容', trigger: 'blur' },
    { min: 5, message: '评论内容至少5个字符', trigger: 'blur' },
    { max: 500, message: '评论内容不能超过500个字符', trigger: 'blur' }
  ]
}

// 工具函数
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

const formatTime = (time: string) => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 获取书籍详情
const fetchBookDetail = async () => {
  loading.value = true
  try {
    const res = await getBookDetail(bookId)
    if (res.code === 200) {
      book.value = res.data
    } else {
      ElMessage.error(res.message || '获取书籍详情失败')
      router.push('/books')
    }
  } catch (error) {
    console.error('获取书籍详情失败:', error)
    ElMessage.error('获取书籍详情失败，请稍后重试')
    router.push('/books')
  } finally {
    loading.value = false
  }
}

// 增加浏览数
const incrementViewCount = async () => {
  try {
    // 使用 get 方法模拟增加浏览数
    const response = await fetch(`http://localhost:8080/book/${bookId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.code === 200) {
        console.log('浏览数增加成功');
      }
    }
  } catch (error) {
    console.error('增加浏览数失败:', error)
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const res = await getBookComments(bookId, {
      page: commentPage.value,
      size: commentSize.value
    })
    if (res.code === 200) {
      comments.value = res.data.records || []
      totalComments.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取评论失败')
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    ElMessage.error('获取评论失败，请稍后重试')
  }
}

// 提交评论
const submitComment = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再发表评论')
    router.push('/login')
    return
  }

  if (!commentFormRef.value) return
  
  await commentFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/book/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentForm.value)
      })
      
      if (response.ok) {
        const res = await response.json()
        if (res.code === 200) {
          ElMessage.success('评论发表成功')
          showCommentDialog.value = false
          commentForm.value.content = ''
          
          // 刷新评论列表
          commentPage.value = 1
          await fetchComments()
          
          // 刷新书籍详情（更新评论数）
          await fetchBookDetail()
        } else {
          ElMessage.error(res.message || '评论发表失败')
        }
      } else {
        ElMessage.error('评论发表失败')
      }
    } catch (error) {
      console.error('提交评论失败:', error)
      ElMessage.error('评论发表失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 在线阅读处理
const handleReadOnline = async () => {
  if (!book.value.address) {
    ElMessage.warning('暂无在线阅读链接')
    return
  }

  // 先增加浏览数
  try {
    await incrementViewCount()
  } catch (error) {
    console.error('增加浏览数失败:', error)
  }

  // 补全协议头，避免浏览器将地址当作相对路径拼接
  let fullUrl = book.value.address.trim()
  if (!/^https?:\/\//i.test(fullUrl)) {
    fullUrl = 'https://' + fullUrl
  }

  window.open(fullUrl, '_blank')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 评论分页处理
const handleCommentSizeChange = (newSize: number) => {
  commentSize.value = newSize
  commentPage.value = 1
  fetchComments()
}

const handleCommentPageChange = (newPage: number) => {
  commentPage.value = newPage
  fetchComments()
}

onMounted(async () => {
  // 先增加浏览数
  await incrementViewCount()
  
  // 获取书籍详情
  await fetchBookDetail()
  
  // 获取评论列表
  await fetchComments()
})
</script>

<style scoped>
/* ==================== 页面整体布局 ==================== */
.book-detail-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 40px 20px;
}

/* ==================== 星空背景 ==================== */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: radial-gradient(ellipse at 20% 80%, #0a1628 0%, #050d1a 50%, #020408 100%);
}

/* 星星层 */
.stars,
.stars2,
.stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.stars {
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9) 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.8) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.9) 0%, transparent 100%),
    radial-gradient(2px 2px at 15% 85%, rgba(200,220,255,1) 0%, transparent 100%),
    radial-gradient(1px 1px at 45% 35%, rgba(255,255,255,0.8) 0%, transparent 100%),
    radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 25% 50%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(2px 2px at 85% 55%, rgba(180,200,255,1) 0%, transparent 100%);
  animation: twinkle 8s ease-in-out infinite;
}

.stars2 {
  background-image:
    radial-gradient(1px 1px at 5% 45%, rgba(255,255,255,0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 20% 75%, rgba(255,255,255,0.8) 0%, transparent 100%),
    radial-gradient(2px 2px at 40% 25%, rgba(200,220,255,1) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 85%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 5%, rgba(255,255,255,0.9) 0%, transparent 100%),
    radial-gradient(1px 1px at 35% 55%, rgba(255,255,255,0.7) 0%, transparent 100%),
    radial-gradient(2px 2px at 95% 30%, rgba(180,210,255,1) 0%, transparent 100%);
  animation: twinkle 12s ease-in-out infinite reverse;
}

.stars3 {
  background-image:
    radial-gradient(1.5px 1.5px at 12% 38%, rgba(220,235,255,1) 0%, transparent 100%),
    radial-gradient(1px 1px at 28% 92%, rgba(255,255,255,0.8) 0%, transparent 100%),
    radial-gradient(1px 1px at 55% 68%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(2px 2px at 72% 78%, rgba(200,220,255,1) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 12%, rgba(255,255,255,0.7) 0%, transparent 100%);
  animation: twinkle 15s ease-in-out infinite;
}

/* 行星 */
.planet-1 {
  position: absolute;
  width: 300px;
  height: 300px;
  top: -80px;
  right: -80px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%,
    rgba(80, 120, 200, 0.5) 0%,
    rgba(40, 60, 120, 0.4) 40%,
    rgba(20, 30, 60, 0.3) 70%,
    transparent 100%);
  box-shadow:
    inset -20px -20px 60px rgba(0, 0, 0, 0.4),
    0 0 80px rgba(60, 100, 180, 0.3),
    0 0 120px rgba(40, 80, 160, 0.15);
  animation: planetFloat 30s ease-in-out infinite;
}

.planet-2 {
  position: absolute;
  width: 180px;
  height: 180px;
  bottom: 15%;
  left: -50px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%,
    rgba(120, 80, 160, 0.4) 0%,
    rgba(60, 40, 100, 0.3) 50%,
    transparent 100%);
  box-shadow:
    inset -10px -10px 40px rgba(0, 0, 0, 0.3),
    0 0 50px rgba(100, 60, 150, 0.2);
  animation: planetFloat 25s ease-in-out infinite reverse;
}

.planet-3 {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 40%;
  right: 8%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%,
    rgba(255, 160, 80, 0.35) 0%,
    rgba(200, 100, 40, 0.25) 50%,
    transparent 100%);
  box-shadow:
    inset -8px -8px 25px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(200, 120, 60, 0.2);
  animation: planetFloat 20s ease-in-out infinite;
}

.comet {
  position: absolute;
  top: 15%;
  right: 20%;
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(180, 200, 255, 0.8), transparent);
  border-radius: 50%;
  transform: rotate(-30deg);
  opacity: 0.4;
  animation: cometMove 20s linear infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes planetFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

@keyframes cometMove {
  0% { transform: rotate(-30deg) translateX(0); opacity: 0; }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% { transform: rotate(-30deg) translateX(-500px); opacity: 0; }
}

/* ==================== 内容层 ==================== */
.book-detail-content {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

/* ==================== 玻璃卡片通用样式 ==================== */
.glass-card {
  background: linear-gradient(135deg,
    rgba(15, 30, 60, 0.55) 0%,
    rgba(10, 20, 45, 0.45) 50%,
    rgba(5, 15, 35, 0.35) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(100, 140, 200, 0.2);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(100, 160, 255, 0.05);
  transition: all 0.3s ease;
}

/*
 * 注意：.book-main (书籍主信息卡片) 不使用 backdrop-filter，
 * 因为其子元素 el-image 的预览弹窗会被父级模糊滤镜干扰导致闪烁/无法交互。
 * 评论区 .comments-section 保留 backdrop-filter（无图片预览）。
 */
.book-main {
  /* 背景渐变不带模糊滤镜，避免 el-image 预览弹窗冲突 */
  background: linear-gradient(135deg,
    rgba(15, 30, 60, 0.7) 0%,
    rgba(10, 20, 45, 0.6) 50%,
    rgba(5, 15, 35, 0.5) 100%) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.glass-card:hover {
  border-color: rgba(100, 140, 200, 0.3);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(100, 160, 255, 0.08);
}

/* ==================== 返回按钮 ==================== */
.back-button {
  margin-bottom: 24px;
}

.back-btn {
  color: rgba(220, 230, 255, 0.8);
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(10, 20, 40, 0.4);
  border: 1px solid rgba(100, 140, 200, 0.15);
  border-radius: 8px;
  padding: 8px 16px;
}

.back-btn:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(30, 50, 90, 0.5);
  border-color: rgba(100, 160, 220, 0.35);
}

/* ==================== 书籍主信息卡片 ==================== */
.book-main {
  padding: 36px;
  margin-bottom: 28px;
}

.book-header {
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

/* 封面缩小到 30%：原尺寸 200x280 -> 126x176 */
.cover-section {
  flex-shrink: 0;
  width: 126px;
  height: 176px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(5, 10, 20, 0.6);
  border: 1px solid rgba(100, 140, 200, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.cover-section:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}

.main-cover {
  width: 100%;
  height: 100%;
  cursor: zoom-in;
}

.cover-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(180, 200, 240, 0.5);
  font-size: 12px;
  gap: 8px;
}

/* ==================== 右侧信息区 ==================== */
.info-section {
  flex: 1;
  min-width: 0;
}

/* 标题 */
.book-title {
  font-size: 26px;
  font-weight: 700;
  color: rgba(240, 245, 255, 0.95);
  margin: 0 0 16px 0;
  line-height: 1.3;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

/* 元信息（浏览、评论、时间） */
.book-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(200, 215, 240, 0.8);
}

.meta-item .el-icon {
  font-size: 15px;
  color: rgba(150, 180, 230, 0.8);
}

/* 书籍简介 */
.book-description {
  margin-bottom: 24px;
}

.book-description h3 {
  font-size: 15px;
  font-weight: 600;
  color: rgba(210, 225, 255, 0.9);
  margin: 0 0 10px 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.book-description p {
  font-size: 14px;
  color: rgba(200, 215, 240, 0.85);
  line-height: 1.8;
  margin: 0;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

/* 按钮样式 */
.read-btn,
.comment-btn {
  border-radius: 10px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.read-btn {
  background: linear-gradient(135deg, rgba(64, 120, 220, 0.7), rgba(80, 100, 180, 0.6)) !important;
  border-color: rgba(100, 150, 230, 0.3) !important;
  color: rgba(230, 240, 255, 0.95) !important;
  box-shadow: 0 4px 15px rgba(50, 100, 200, 0.25);
}

.read-btn:hover {
  background: linear-gradient(135deg, rgba(80, 140, 240, 0.8), rgba(100, 120, 200, 0.7)) !important;
  border-color: rgba(120, 170, 255, 0.5) !important;
  box-shadow: 0 6px 20px rgba(50, 100, 200, 0.35);
  transform: translateY(-1px);
}

.comment-btn {
  background: linear-gradient(135deg, rgba(40, 160, 100, 0.65), rgba(50, 130, 80, 0.55)) !important;
  border-color: rgba(80, 200, 140, 0.25) !important;
  color: rgba(220, 245, 235, 0.95) !important;
  box-shadow: 0 4px 15px rgba(40, 150, 90, 0.2);
}

.comment-btn:hover {
  background: linear-gradient(135deg, rgba(50, 180, 110, 0.75), rgba(60, 150, 95, 0.65)) !important;
  border-color: rgba(100, 220, 160, 0.4) !important;
  box-shadow: 0 6px 20px rgba(40, 150, 90, 0.3);
  transform: translateY(-1px);
}

/* ==================== 评论区域 ==================== */
.comments-section {
  padding: 28px 32px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(100, 140, 200, 0.12);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(235, 245, 255, 0.95);
  margin: 0;
}

.section-title .el-icon {
  color: rgba(140, 180, 240, 0.9);
  font-size: 20px;
}

.comment-count {
  font-size: 14px;
  font-weight: 400;
  color: rgba(180, 200, 240, 0.6);
  margin-left: 4px;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 18px 20px;
  background: rgba(10, 20, 45, 0.4);
  border: 1px solid rgba(80, 120, 180, 0.12);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  background: rgba(15, 30, 60, 0.5);
  border-color: rgba(80, 120, 180, 0.2);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar {
  border: 1px solid rgba(100, 140, 200, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(220, 235, 255, 0.9);
}

.comment-time {
  font-size: 12px;
  color: rgba(160, 185, 225, 0.6);
  margin-top: 2px;
}

.comment-content {
  font-size: 14px;
  color: rgba(200, 220, 250, 0.88);
  line-height: 1.7;
  padding-left: 52px;
}

/* 无评论 */
.no-comments {
  padding: 20px 0;
}

.no-comments :deep(.el-empty__description p) {
  color: rgba(180, 200, 240, 0.7) !important;
  font-size: 14px;
}

/* 评论分页 */
.comment-pagination {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(100, 140, 200, 0.1);
  display: flex;
  justify-content: center;
}

/* 分页颜色覆盖 */
.comment-pagination :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: rgba(20, 40, 80, 0.6);
  --el-pagination-hover-color: rgba(100, 160, 240, 0.8);
  --el-pagination-text-color: rgba(200, 220, 255, 0.8);
  --el-pagination-button-color: rgba(200, 220, 255, 0.7);
}

/* ==================== 加载状态 ==================== */
.loading {
  padding: 40px;
}

.loading :deep(.el-skeleton__item) {
  background: linear-gradient(90deg,
    rgba(20, 40, 80, 0.3) 25%,
    rgba(30, 50, 100, 0.4) 50%,
    rgba(20, 40, 80, 0.3) 75%) !important;
  background-size: 200% 100% !important;
}

/* ==================== 对话框 ==================== */
:deep(.el-dialog) {
  background: linear-gradient(135deg,
    rgba(15, 30, 60, 0.95) 0%,
    rgba(10, 20, 45, 0.95) 100%) !important;
  backdrop-filter: blur(30px);
  border: 1px solid rgba(100, 140, 200, 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6) !important;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(100, 140, 200, 0.12);
  padding: 20px 24px !important;
}

:deep(.el-dialog__title) {
  color: rgba(230, 240, 255, 0.95) !important;
  font-weight: 600;
}

:deep(.el-dialog__close) {
  color: rgba(180, 200, 240, 0.6) !important;
}

:deep(.el-dialog__close:hover) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-dialog__body) {
  padding: 24px !important;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid rgba(100, 140, 200, 0.1);
  padding: 16px 24px !important;
}

/* 对话框表单 */
:deep(.el-form-item__label) {
  color: rgba(210, 225, 255, 0.85) !important;
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  background: rgba(5, 15, 35, 0.6) !important;
  border-color: rgba(80, 120, 180, 0.2) !important;
  color: rgba(220, 235, 255, 0.9) !important;
  border-radius: 10px;
}

:deep(.el-textarea__inner:focus) {
  border-color: rgba(100, 160, 240, 0.5) !important;
  box-shadow: 0 0 0 2px rgba(80, 140, 240, 0.15) !important;
}

:deep(.el-input__wrapper) {
  background: rgba(5, 15, 35, 0.6) !important;
  border-color: rgba(80, 120, 180, 0.2) !important;
  border-radius: 10px;
}

:deep(.el-input__inner) {
  color: rgba(220, 235, 255, 0.9) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(160, 185, 225, 0.45) !important;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, rgba(64, 120, 220, 0.7), rgba(80, 100, 180, 0.6)) !important;
  border-color: rgba(100, 150, 230, 0.3) !important;
  color: rgba(230, 240, 255, 0.95) !important;
  border-radius: 10px;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, rgba(80, 140, 240, 0.8), rgba(100, 120, 200, 0.7)) !important;
  border-color: rgba(120, 170, 255, 0.5) !important;
}

:deep(.el-button) {
  border-radius: 10px;
  background: rgba(20, 40, 80, 0.5) !important;
  border-color: rgba(80, 120, 180, 0.2) !important;
  color: rgba(200, 220, 255, 0.85) !important;
}

:deep(.el-button:hover) {
  background: rgba(30, 55, 100, 0.6) !important;
  border-color: rgba(100, 150, 220, 0.35) !important;
  color: rgba(230, 240, 255, 0.95) !important;
}

/* ==================== 响应式适配 ==================== */
@media (max-width: 768px) {
  .book-detail-page {
    padding: 20px 12px;
  }

  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .cover-section {
    width: 126px;
    height: 176px;
  }

  .book-meta {
    justify-content: center;
  }

  .action-buttons {
    justify-content: center;
  }

  .book-title {
    font-size: 22px;
  }

  .book-description p {
    text-align: left;
  }

  .comment-content {
    padding-left: 0;
  }
}
</style>