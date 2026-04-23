<template>
  <div class="course-list">
    <el-tabs v-model="activeType" @tab-click="handleTabClick">
      <el-tab-pane label="全部" name=""></el-tab-pane>
      <el-tab-pane v-for="cat in categories" :key="cat.code" :label="cat.name" :name="cat.code"></el-tab-pane>
    </el-tabs>

    <div v-loading="loading" class="course-grid">
      <el-card v-for="course in courseList" :key="course.id" class="course-card" shadow="hover" @click="goToDetail(course)">
        <el-image v-if="course.coverUrl" :src="course.coverUrl" fit="cover" class="cover-image"></el-image>
        <div class="info">
          <div class="source-tag" v-if="course.sourceName">
              <el-tag size="small" effect="plain">{{ course.sourceName }}</el-tag>
          </div>
          <h3>{{ course.title }}</h3>
          <p class="desc">{{ (course.description || '').substring(0, 50) }}{{ (course.description || '').length > 50 ? '...' : '' }}</p>
        </div>
      </el-card>
      <el-empty v-if="courseList.length === 0 && !loading" description="暂无课程"></el-empty>
    </div>

    <el-pagination
      v-if="total > 0"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCourses, type Course } from '@/api/content'
import { getEnabledCategories } from '@/api/courseCategory'
import { ElMessage } from 'element-plus'

const courseList = ref<Course[]>([])
const loading = ref(false)
const activeType = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const categories = ref<any[]>([])

const fetchCategories = async () => {
  try {
    const res = await getEnabledCategories() as any
    if (res.code === 200) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchCourses = async () => {
  loading.value = true
  try {
    const res = await getCourses({ page: currentPage.value, size: pageSize.value, type: activeType.value || undefined })
    if (res.code === 200) {
      courseList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleTabClick = (tab: any) => {
  activeType.value = tab.props.name
  currentPage.value = 1
  fetchCourses()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchCourses()
}

const goToDetail = (course: Course) => {
  if (course.mediaUrl && (course.mediaUrl.startsWith('http') || course.mediaUrl.startsWith('https'))) {
    window.open(course.mediaUrl, '_blank')
  } else {
    ElMessage.info('该课程暂不支持在线播放')
  }
}

onMounted(async () => {
  await fetchCategories()
  fetchCourses()
})
</script>

<style scoped>
.course-list {
  padding: 20px;
  color: #fff;
}

/* 分类菜单 - 醒目白字 */
.course-list :deep(.el-tabs__header) {
  background: transparent;
}
.course-list :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
.course-list :deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.3s;
}
.course-list :deep(.el-tabs__item:hover) {
  color: #fff !important;
}
.course-list :deep(.el-tabs__item.is-active) {
  color: #fff !important;
  font-weight: 700;
  font-size: 16px;
}
.course-list :deep(.el-tabs__active-bar) {
  background-color: #FFE9A7 !important;
  height: 3px;
}

/* 所有文本白色 */
.course-list :deep(h1),
.course-list :deep(h2),
.course-list :deep(h3),
.course-list :deep(h4),
.course-list :deep(h5),
.course-list :deep(h6),
.course-list :deep(p),
.course-list :deep(span),
.course-list :deep(.el-text) {
  color: #fff !important;
}

/* 卡片半透明白色背景 */
.course-list :deep(.el-card) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  color: #fff !important;
  transition: background 0.3s, border-color 0.3s, transform 0.2s;
}
.course-list :deep(.el-card:hover) {
  background: rgba(255, 255, 255, 0.16) !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
  transform: translateY(-2px);
}
.course-list :deep(.el-card__body) {
  color: #fff !important;
}

/* 标签 - 课程来源色 */
.course-list :deep(.el-tag) {
  border: none !important;
  font-weight: 600;
}
.course-list :deep(.el-tag--primary) {
  background: rgba(64, 158, 255, 0.25) !important;
  color: #7EC8FF !important;
}
.course-list :deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.25) !important;
  color: #A8E063 !important;
}
.course-list :deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.25) !important;
  color: #FFB347 !important;
}
.course-list :deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.25) !important;
  color: #FF8C9A !important;
}
.course-list :deep(.el-tag--info) {
  background: rgba(144, 147, 153, 0.25) !important;
  color: #B0B8C1 !important;
}

/* 分页白色 */
.course-list :deep(.el-pagination) {
  color: #fff !important;
}
.course-list :deep(.el-pagination button),
.course-list :deep(.el-pager li) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
}
.course-list :deep(.el-pager li.is-active) {
  background: #409EFF !important;
  color: #fff !important;
}

/* 空状态 */
.course-list :deep(.el-empty__description) {
  color: rgba(255, 255, 255, 0.6) !important;
}

/* 基础样式 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}
.course-card {
  cursor: pointer;
}
.cover-image {
  width: 100%;
  height: 150px;
  border-radius: 4px;
}
.info {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
}
.info h3 {
  margin: 0 0 6px 0;
  color: #fff !important;
  font-size: 15px;
}
.source-tag {
  margin-bottom: 5px;
}
.desc {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 12px;
  margin: 0;
}
</style>
