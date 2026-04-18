<template>
  <div class="article-page-wrapper" v-if="detail">
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

    <!-- 左侧目录导航 -->
    <div class="left-sidebar" :class="{ 'collapsed': !showCatalog }">
      <div class="sidebar-toggle" @click="showCatalog = !showCatalog">
        <el-icon><Menu /></el-icon>
        <span>目录</span>
      </div>
      <div class="catalog-content" v-show="showCatalog">
        <div
          v-for="title in catalog"
          :key="title.id"
          :class="['catalog-item', `level-${title.level}`]"
          @click="scrollToAnchor(title.id)"
        >
          {{ title.text }}
        </div>
        <el-empty v-if="catalog.length === 0" description="无目录" :image-size="40"></el-empty>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content-container">
      <div class="back-bar">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回文章列表
        </el-button>
      </div>

      <div class="article-card">
        <h1>{{ detail.article.title }}</h1>

        <!-- 作者信息展示 -->
        <div class="author-info-bar">
          <el-avatar :size="48" :src="detail.authorAvatar">
            <template #default>
              <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
            </template>
          </el-avatar>
          <div class="author-meta">
            <div class="author-top">
              <span class="author-nickname">{{ detail.authorName }}</span>
              <el-tag v-if="detail.authorRole === 4" size="small" type="danger" effect="dark" class="official-tag">官方</el-tag>
              <el-tag v-else-if="detail.authorRole === 3 && detail.hospitalName" size="small" type="success" effect="plain" class="hospital-tag">{{ detail.hospitalName }}</el-tag>
            </div>
            <div class="article-meta-info">
              <span>发布时间：{{ detail.article.createTime }}</span>
              <span class="type-tag">{{ detail.article.type === 'SCIENCE' ? '科普' : '案例' }}</span>
              <span class="view-stats"><el-icon><View /></el-icon> {{ detail.article.view_count || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="article-content">
          <v-md-editor :model-value="detail.article.content" mode="preview"></v-md-editor>
        </div>
      </div>

      <!-- 底部互动栏 -->
      <div class="fixed-interaction-bar">
        <div class="bar-content">
          <div class="action-item" :class="{ 'active': detail.liked }" @click="handleInteract(1)">
            <el-icon><Pointer /></el-icon>
            <span>{{ detail.article.like_count || 0 }} 点赞</span>
          </div>
          <div class="action-item" :class="{ 'active': detail.disliked }" @click="handleInteract(2)">
            <el-icon><Bottom /></el-icon>
            <span>{{ detail.article.dislike_count || 0 }} 踩</span>
          </div>
          <div class="action-item" :class="{ 'active': detail.collected }" @click="handleInteract(3)">
            <el-icon><Star /></el-icon>
            <span>{{ detail.article.collection_count || 0 }} 收藏</span>
          </div>
          <div class="action-item" @click="showComments = true">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ detail.article.comment_count || 0 }} 评论</span>
          </div>
          <div class="action-item" @click="copyLink">
            <el-icon><Share /></el-icon>
            <span>分享</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮按钮组（仅保留返回顶部） -->
    <div class="floating-btns">
      <el-backtop :right="40" :bottom="160" target=".el-main">
        <div class="fab-container">
          <div class="fab-btn-inner">
            <el-icon class="icon"><CaretTop /></el-icon>
            <span class="text">返回顶部</span>
          </div>
        </div>
      </el-backtop>
    </div>

    <!-- 右侧推荐栏 -->
    <div class="right-sidebar">
      <div class="sidebar-section">
        <h3>推荐文章</h3>
        <div v-for="item in detail.recommendedArticles" :key="item.id" class="recommend-item" @click="goToArticle(item.id)">
          {{ item.title }}
        </div>
        <el-empty v-if="!detail.recommendedArticles || detail.recommendedArticles.length === 0" description="暂无推荐" :image-size="40"></el-empty>
      </div>
      <div class="sidebar-section">
        <h3>热门课程</h3>
        <div v-for="item in detail.recommendedCourses" :key="item.id" class="recommend-item" @click="goToCourse(item.id)">
          {{ item.title }}
        </div>
        <el-empty v-if="!detail.recommendedCourses || detail.recommendedCourses.length === 0" description="暂无课程" :image-size="40"></el-empty>
      </div>
      <div class="sidebar-section">
        <h3>心理测评</h3>
        <div v-for="item in detail.recommendedAssessments" :key="item.id" class="recommend-item" @click="goToAssessment(item.id)">
          {{ item.title }}
        </div>
        <el-empty v-if="!detail.recommendedAssessments || detail.recommendedAssessments.length === 0" description="暂无测评" :image-size="40"></el-empty>
      </div>
    </div>

    <!-- 评论区 -->
    <el-drawer v-model="showComments" title="全部评论" size="450px" direction="rtl">
      <div class="comment-section">
        <div class="comment-input-box">
          <div class="input-with-avatar">
            <el-avatar :size="32" :src="user.headPath"></el-avatar>
            <el-input
              v-model="newComment"
              type="textarea"
              :rows="3"
              placeholder="欢迎发表评论..."
              maxlength="1000"
              show-word-limit
            ></el-input>
          </div>
          <div class="input-footer">
            <div class="emoji-trigger" @click="toggleEmoji">😊</div>
            <el-button type="primary" size="small" @click="submitComment">评论</el-button>
          </div>
          <div v-if="showEmojiPicker" class="emoji-picker">
            <span v-for="e in emojis" :key="e" @click="addEmoji(e)">{{ e }}</span>
          </div>
        </div>

        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-user">
              <el-avatar :size="32" :src="comment.headPath"></el-avatar>
              <div class="user-info">
                <span class="nickname">{{ comment.nickname }}</span>
                <span class="time">{{ comment.createTime }}</span>
              </div>
              <div class="comment-actions">
                <span :class="{ 'liked': comment.liked }" @click="handleLikeComment(comment)">
                  <el-icon><Pointer /></el-icon> {{ comment.likeCount }}
                </span>
                <span @click="handleReply(comment)">回复</span>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-header">
                  <span class="nickname">{{ reply.nickname }}</span>
                  <span class="reply-text">回复</span>
                  <span class="nickname">@{{ reply.replyToNickname }}</span>
                  <span class="time">{{ reply.createTime }}</span>
                </div>
                <div class="reply-content">{{ reply.content }}</div>
              </div>
            </div>

            <!-- 回复框 -->
            <div v-if="replyingId === comment.id" class="reply-input-box">
              <el-input v-model="replyContent" size="small" :placeholder="'回复 @' + comment.nickname"></el-input>
              <div class="reply-buttons">
                <el-button size="small" @click="replyingId = null">取消</el-button>
                <el-button type="primary" size="small" @click="submitReply(comment)">确定</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
  <el-empty v-else description="加载中..."></el-empty>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getArticleDetail,
  interactArticle,
  getArticleComments,
  addArticleComment,
  likeArticleComment,
  type ArticleDetailVO,
  type ArticleCommentVO
} from '@/api/content'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, View, Pointer, Star, Share,
  ChatDotRound, Bottom, Menu, CaretTop
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const detail = ref<ArticleDetailVO | null>(null)
const comments = ref<ArticleCommentVO[]>([])
const catalog = ref<{ id: string, text: string, level: number }[]>([])
const showCatalog = ref(true)
const showComments = ref(false)
const newComment = ref('')
const replyingId = ref<number | null>(null)
const replyContent = ref('')
const showEmojiPicker = ref(false)
const interacting = ref(false)
const user = JSON.parse(localStorage.getItem('user') || '{}')
const emojis = ['😊', '😂', '😍', '🤔', '👍', '🔥', '❤️', '👏', '🙌', '😢', '😡', '😎']

const fetchDetail = async () => {
  const id = Number(route.params.id)
  try {
    const res = await getArticleDetail(id)
    if (res.code === 200) {
      detail.value = res.data
      generateCatalog(res.data.article.content)
      fetchComments()
    }
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const generateCatalog = (content: string) => {
  if (!content) {
    catalog.value = []
    return
  }

  const lines = content.split('\n')
  const titles: { id: string, text: string, level: number }[] = []
  let inCodeBlock = false

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      return
    }

    if (!inCodeBlock) {
      const match = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/)
      if (match) {
        const level = match[1]?.length ?? 0
        const text = match[2]?.trim() ?? ''
        const id = text.toLowerCase()
          .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
          .replace(/\s+/g, '-')
        titles.push({ id, text, level })
      }
    }
  })
  catalog.value = titles
}

const scrollToAnchor = (id: string) => {
  let anchor = document.getElementById(id)

  if (!anchor) {
    const headers = document.querySelectorAll('.v-md-editor-preview h1, .v-md-editor-preview h2, .v-md-editor-preview h3, .v-md-editor-preview h4, .v-md-editor-preview h5, .v-md-editor-preview h6')
    for (const h of Array.from(headers)) {
      const headerText = h.textContent?.trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-')
      if (headerText === id) {
        anchor = h as HTMLElement
        break
      }
    }
  }

  if (anchor) {
    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const fetchComments = async () => {
  if (!detail.value) return
  try {
    const res = await getArticleComments(detail.value.article.id)
    if (res.code === 200) {
      comments.value = res.data
    }
  } catch (error) {}
}

const goBack = () => {
  router.push('/articles')
}

const handleInteract = async (type: number) => {
  if (!detail.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }

  interacting.value = true
  const article = detail.value.article
  try {
    const res = await interactArticle(article.id, type)
    if (res.code === 200) {
      ElMessage.success(res.data)
      if (type === 1) {
        if (detail.value.liked) {
          article.like_count = Math.max(0, (article.like_count || 1) - 1)
          detail.value.liked = false
        } else {
          article.like_count = (article.like_count || 0) + 1
          detail.value.liked = true
          if (detail.value.disliked) {
            article.dislike_count = Math.max(0, (article.dislike_count || 1) - 1)
            detail.value.disliked = false
          }
        }
      } else if (type === 2) {
        if (detail.value.disliked) {
          article.dislike_count = Math.max(0, (article.dislike_count || 1) - 1)
          detail.value.disliked = false
        } else {
          article.dislike_count = (article.dislike_count || 0) + 1
          detail.value.disliked = true
          if (detail.value.liked) {
            article.like_count = Math.max(0, (article.like_count || 1) - 1)
            detail.value.liked = false
          }
        }
      } else if (type === 3) {
        if (detail.value.collected) {
          article.collection_count = Math.max(0, (article.collection_count || 1) - 1)
          detail.value.collected = false
        } else {
          article.collection_count = (article.collection_count || 0) + 1
          detail.value.collected = true
        }
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    interacting.value = false
  }
}

const copyLink = () => {
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

const submitComment = async () => {
  if (!newComment.value.trim() || !detail.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }

  interacting.value = true
  try {
    const res = await addArticleComment({
      articleId: detail.value.article.id,
      content: newComment.value,
      parentId: 0
    })
    if (res.code === 200) {
      ElMessage.success('评论成功')
      newComment.value = ''
      fetchComments()
      detail.value.article.comment_count = (detail.value.article.comment_count || 0) + 1
    }
  } catch (error) {
    ElMessage.error('评论失败')
  } finally {
    interacting.value = false
  }
}

const handleLikeComment = async (comment: ArticleCommentVO) => {
  if (interacting.value) return
  interacting.value = true
  try {
    const res = await likeArticleComment(comment.id)
    if (res.code === 200) {
      fetchComments()
    }
  } catch (error) {
  } finally {
    interacting.value = false
  }
}

const handleReply = (comment: ArticleCommentVO) => {
  replyingId.value = comment.id
  replyContent.value = ''
}

const submitReply = async (parent: ArticleCommentVO) => {
  if (!replyContent.value.trim() || !detail.value) return
  if (interacting.value) {
    ElMessage.warning('操作太频繁，请稍后再试')
    return
  }

  interacting.value = true
  try {
    const res = await addArticleComment({
      articleId: detail.value.article.id,
      content: replyContent.value,
      parentId: parent.id,
      replyToUserId: parent.userId
    })
    if (res.code === 200) {
      ElMessage.success('回复成功')
      replyingId.value = null
      replyContent.value = ''
      fetchComments()
      detail.value.article.comment_count = (detail.value.article.comment_count || 0) + 1
    }
  } catch (error) {
    ElMessage.error('回复失败')
  } finally {
    interacting.value = false
  }
}

const toggleEmoji = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji: string) => {
  newComment.value += emoji
  showEmojiPicker.value = false
}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

const goToCourse = (id: number) => {
  router.push(`/course/${id}`)
}

const goToAssessment = (id: number) => {
  router.push(`/assessment/${id}`)
}

watch(() => route.params.id, () => {
  fetchDetail()
})

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
/* ==================== 星空背景 ==================== */
.article-page-wrapper {
  position: relative;
  display: flex;
  min-height: 100vh;
  padding: 20px;
  gap: 20px;
  padding-bottom: 80px;
  color: #fff;
}

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

/* 行星 */
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

/* ==================== 左侧目录栏 ==================== */
.left-sidebar {
  width: 260px;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s;
  height: calc(100vh - 120px);
  position: sticky;
  top: 20px;
  overflow-y: auto;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}
.left-sidebar.collapsed {
  width: 50px;
  padding: 10px;
  overflow: hidden;
}
.sidebar-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: bold;
}
.catalog-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.catalog-item {
  cursor: pointer;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7) !important;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.catalog-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #7EC8FF !important;
}
.catalog-item.level-1 { font-weight: bold; color: #fff !important; }
.catalog-item.level-2 { padding-left: 20px; font-size: 13px; }
.catalog-item.level-3 { padding-left: 30px; font-size: 12px; }

/* ==================== 主内容区 ==================== */
.main-content-container {
  flex: 1;
  min-width: 0;
}
.back-bar {
  margin-bottom: 15px;
}
.back-bar :deep(.el-link) {
  color: rgba(255, 255, 255, 0.7) !important;
}
.back-bar :deep(.el-link:hover) {
  color: #7EC8FF !important;
}

/* ==================== 文章卡片 ==================== */
.article-card {
  background: rgba(255, 255, 255, 0.1) !important;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  color: #fff !important;
}
.article-card h1 {
  margin-top: 0;
  font-size: 28px;
  line-height: 1.4;
  margin-bottom: 20px;
  color: #fff !important;
}

/* 作者信息栏 */
.author-info-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.author-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.author-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.author-nickname {
  font-size: 18px;
  font-weight: bold;
  color: #fff !important;
}
.official-tag {
  font-weight: bold;
  letter-spacing: 1px;
}
.hospital-tag {
  font-weight: 500;
  border-radius: 4px;
}
.article-meta-info {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5) !important;
  align-items: center;
}
.type-tag {
  background: rgba(64, 158, 255, 0.2) !important;
  color: #7EC8FF !important;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.view-stats {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 文章内容 */
.article-content {
  line-height: 1.8;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* ==================== 底部互动栏 ==================== */
.fixed-interaction-bar {
  position: sticky;
  bottom: 0;
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  margin-top: 20px;
  border-radius: 8px;
}
.bar-content {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-around;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6) !important;
  transition: all 0.2s;
  font-size: 12px;
  padding: 5px 15px;
  border-radius: 20px;
}
.action-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #7EC8FF !important;
}
.action-item.active {
  color: #7EC8FF !important;
}
.action-item.active .el-icon {
  color: #FF8C9A !important;
}

/* ==================== 悬浮按钮组 ==================== */
.floating-btns {
  position: fixed;
  right: 40px;
  bottom: 160px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1001;
}
.fab-container {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.fab-btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}
.fab-btn-inner .icon {
  font-size: 20px;
  color: #7EC8FF !important;
  transition: all 0.3s;
}
.fab-btn-inner .text {
  position: absolute;
  font-size: 12px;
  color: #fff;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s;
  white-space: nowrap;
  font-weight: bold;
}
.fab-container:hover {
  width: 100px;
  border-radius: 24px;
  background: rgba(64, 158, 255, 0.4) !important;
  border-color: rgba(64, 158, 255, 0.6) !important;
}
.fab-container:hover .icon {
  opacity: 1;
  transform: translateX(-20px);
  color: #fff !important;
}
.fab-container:hover .text {
  opacity: 1;
  transform: translateX(15px);
  color: #fff !important;
}
:deep(.el-backtop) {
  position: static !important;
  width: auto !important;
  height: auto !important;
  background-color: transparent !important;
  box-shadow: none !important;
  display: block !important;
}

/* ==================== 右侧推荐栏 ==================== */
.right-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}
.sidebar-section {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}
.sidebar-section h3 {
  margin-top: 0;
  font-size: 16px;
  border-left: 3px solid rgba(64, 158, 255, 0.6) !important;
  padding-left: 10px;
  margin-bottom: 15px;
  color: #fff !important;
}
.recommend-item {
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7) !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}
.recommend-item:hover {
  color: #7EC8FF !important;
}

/* ==================== 评论区 ==================== */
.comment-section {
  padding: 0 20px;
  color: #fff;
}
.comment-input-box {
  margin-bottom: 30px;
  position: relative;
}
.input-with-avatar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.input-footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 44px;
}
.emoji-trigger {
  font-size: 20px;
  cursor: pointer;
}
.emoji-picker {
  position: absolute;
  top: 100%;
  left: 44px;
  background: rgba(20, 20, 50, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  z-index: 100;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
}
.emoji-picker span {
  cursor: pointer;
  font-size: 18px;
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.comment-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding-bottom: 15px;
}
.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.nickname {
  font-weight: bold;
  font-size: 14px;
  color: #fff !important;
}
.time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4) !important;
}
.comment-actions {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5) !important;
  display: flex;
  gap: 15px;
}
.comment-actions span {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.comment-actions span.liked {
  color: #7EC8FF !important;
}
.comment-content {
  padding-left: 42px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85) !important;
}
.replies-list {
  margin-top: 10px;
  margin-left: 42px;
  background: rgba(255, 255, 255, 0.05) !important;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.reply-item {
  margin-bottom: 8px;
}
.reply-item:last-child {
  margin-bottom: 0;
}
.reply-header {
  font-size: 12px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.reply-text {
  color: rgba(255, 255, 255, 0.7) !important;
}
.reply-content {
  font-size: 13px;
  padding-left: 0;
}
.reply-input-box {
  margin-top: 10px;
  margin-left: 42px;
}
.reply-buttons {
  margin-top: 5px;
  text-align: right;
}

/* ==================== Element Plus 适配星空主题 ==================== */
/* 输入框 */
:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
}
:deep(.el-input__inner) {
  color: #fff !important;
}
:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}
:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  box-shadow: none !important;
}
:deep(.el-textarea__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

/* 按钮 */
:deep(.el-button--primary) {
  background: rgba(64, 158, 255, 0.4) !important;
  border-color: rgba(64, 158, 255, 0.6) !important;
}
:deep(.el-button--primary:hover) {
  background: rgba(64, 158, 255, 0.6) !important;
  border-color: rgba(64, 158, 255, 0.8) !important;
}

/* 标签 */
:deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.3) !important;
  border-color: rgba(245, 108, 108, 0.5) !important;
  color: #FF8C9A !important;
}
:deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.2) !important;
  border-color: rgba(103, 194, 58, 0.4) !important;
  color: #A8E063 !important;
}
:deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.2) !important;
  border-color: rgba(230, 162, 60, 0.4) !important;
  color: #FFB347 !important;
}

/* 抽屉 */
:deep(.el-drawer) {
  background: rgba(15, 15, 45, 0.95) !important;
  backdrop-filter: blur(10px);
}
:deep(.el-drawer__header) {
  color: #fff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
:deep(.el-drawer__body) {
  background: rgba(15, 15, 45, 0.95) !important;
}

/* 空状态 */
:deep(.el-empty__description) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 头像 */
:deep(.el-avatar) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

/* Markdown：覆盖 v-md-editor 默认 #fff 底 + 卡片继承白字 */
.article-content :deep(.v-md-editor) {
  background: transparent !important;
  box-shadow: none !important;
}
.article-content :deep(.v-md-editor__preview-wrapper) {
  background: transparent !important;
}
.article-content :deep(.v-md-editor-preview) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.92) !important;
}
.article-content :deep(.github-markdown-body) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.92) !important;
}
.article-content :deep(.github-markdown-body p),
.article-content :deep(.github-markdown-body li),
.article-content :deep(.github-markdown-body td),
.article-content :deep(.github-markdown-body th),
.article-content :deep(.github-markdown-body dd),
.article-content :deep(.github-markdown-body dt) {
  color: rgba(255, 255, 255, 0.92) !important;
}
.article-content :deep(.github-markdown-body h1),
.article-content :deep(.github-markdown-body h2),
.article-content :deep(.github-markdown-body h3),
.article-content :deep(.github-markdown-body h4),
.article-content :deep(.github-markdown-body h5) {
  color: #fff !important;
  border-bottom-color: rgba(255, 255, 255, 0.12) !important;
}
.article-content :deep(.github-markdown-body h6) {
  color: rgba(255, 255, 255, 0.65) !important;
}
.article-content :deep(.github-markdown-body a) {
  color: #7ec8ff !important;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.article-content :deep(.github-markdown-body a:hover) {
  color: #b8e0ff !important;
}
.article-content :deep(.github-markdown-body code:not(pre code)) {
  background: rgba(0, 0, 0, 0.35) !important;
  color: #aed9ff !important;
  border: 1px solid rgba(126, 200, 255, 0.28);
  border-radius: 4px;
}
.article-content :deep(.github-markdown-body pre) {
  background: rgba(10, 14, 28, 0.92) !important;
  border: 1px solid rgba(126, 200, 255, 0.22) !important;
  border-radius: 8px;
}
.article-content :deep(.github-markdown-body pre code),
.article-content :deep(.github-markdown-body pre tt) {
  color: #e6edf3 !important;
  background: transparent !important;
}
.article-content :deep(.github-markdown-body div[class*='v-md-pre-wrapper-']) {
  background: rgba(10, 14, 28, 0.92) !important;
  border-radius: 8px;
  border: 1px solid rgba(126, 200, 255, 0.15);
}
.article-content :deep(.github-markdown-body div[class*='v-md-pre-wrapper-'].line-numbers-mode::after) {
  background: rgba(8, 12, 24, 0.95) !important;
  border-right-color: rgba(126, 200, 255, 0.2) !important;
}
.article-content :deep(.github-markdown-body .hljs) {
  background: transparent !important;
  color: #e6edf3 !important;
}
.article-content :deep(.github-markdown-body .hljs-comment),
.article-content :deep(.github-markdown-body .hljs-quote) {
  color: #8b949e !important;
}
.article-content :deep(.github-markdown-body .hljs-keyword),
.article-content :deep(.github-markdown-body .hljs-selector-tag),
.article-content :deep(.github-markdown-body .hljs-subst) {
  color: #ff7b72 !important;
}
.article-content :deep(.github-markdown-body .hljs-number),
.article-content :deep(.github-markdown-body .hljs-literal),
.article-content :deep(.github-markdown-body .hljs-string),
.article-content :deep(.github-markdown-body .hljs-doctag) {
  color: #a5d6ff !important;
}
.article-content :deep(.github-markdown-body .hljs-title),
.article-content :deep(.github-markdown-body .hljs-section) {
  color: #d2a8ff !important;
}
.article-content :deep(.github-markdown-body blockquote) {
  background: rgba(255, 255, 255, 0.06) !important;
  border-left-color: rgba(126, 200, 255, 0.55) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}
.article-content :deep(.github-markdown-body hr) {
  background-color: rgba(255, 255, 255, 0.18) !important;
}
.article-content :deep(.github-markdown-body table) {
  border-color: rgba(255, 255, 255, 0.15) !important;
}
.article-content :deep(.github-markdown-body table th),
.article-content :deep(.github-markdown-body table td) {
  border-color: rgba(255, 255, 255, 0.12) !important;
}
.article-content :deep(.github-markdown-body table tr) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.article-content :deep(.github-markdown-body table tr:nth-child(2n)) {
  background: rgba(0, 0, 0, 0.22) !important;
}
.article-content :deep(.github-markdown-body table th) {
  background: rgba(126, 200, 255, 0.12) !important;
  color: #fff !important;
}
.article-content :deep(.github-markdown-body img) {
  background: transparent !important;
}
.article-content :deep(.github-markdown-body kbd) {
  background: rgba(0, 0, 0, 0.35) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
}
</style>
