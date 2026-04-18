<template>
  <div class="publish-article-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发布文章</span>
          <el-button @click="$router.push('/my-articles')">返回我的发布</el-button>
        </div>
      </template>
      
      <el-form :model="form" label-width="100px" v-loading="loading">
        <el-form-item label="文章标题" required>
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="100" show-word-limit></el-input>
        </el-form-item>
        
        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            action="#"
            :show-file-list="false"
            :on-change="handleCoverChange"
            :before-upload="beforeCoverUpload"
            :auto-upload="false"
          >
            <img v-if="coverPreview || form.coverUrl" :src="coverPreview || form.coverUrl" class="cover" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG/PNG，建议尺寸 800x450</div>
        </el-form-item>
        
        <el-form-item label="文章标签" required>
          <el-select v-model="form.tagId" placeholder="请选择标签" style="width: 200px;">
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="文章内容" required>
          <v-md-editor
            v-model="form.content"
            height="400px"
            placeholder="请输入文章内容..."
            @upload-image="handleUploadImage"
          ></v-md-editor>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交审核</el-button>
          <el-button @click="$router.push('/my-articles')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { publishArticle, uploadArticleCover, type UserArticle } from '@/api/userArticle'
import { getArticleTags } from '@/api/articleTag'
import request from '@/api/user'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const tags = ref<any[]>([])

const form = reactive<UserArticle>({
  title: '',
  content: '',
  coverUrl: '',
  tagId: undefined
})

const coverFile = ref<File | null>(null)
const coverPreview = ref<string>('')

const fetchTags = async () => {
  try {
    const res = await getArticleTags()
    if (res.code === 200) {
      tags.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取标签失败')
  }
}

const beforeCoverUpload = (file: File) => {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    ElMessage.error('封面图片必须是 JPG 或 PNG 格式!')
    return false
  }
  if (file.size / 1024 / 1024 > 3) {
    ElMessage.error('封面图片大小不能超过 3MB!')
    return false
  }
  return true
}

const handleCoverChange = (uploadFile: any) => {
  if (uploadFile.raw) {
    if (!beforeCoverUpload(uploadFile.raw)) return
    coverFile.value = uploadFile.raw
    coverPreview.value = URL.createObjectURL(uploadFile.raw)
  }
}

const handleUploadImage = async (_event: any, file: File, callback: Function) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request.post('/common/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }) as any
    if (res.code === 200) {
      callback(res.data)
    }
  } catch (error) {
    ElMessage.error('图片上传失败')
  }
}

const handleSubmit = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }
  if (!form.tagId) {
    ElMessage.warning('请选择文章标签')
    return
  }

  submitting.value = true
  try {
    // 先上传封面
    if (coverFile.value) {
      const res = await uploadArticleCover(coverFile.value) as any
      if (res.code === 200) {
        form.coverUrl = res.data
      }
    }

    const res = await publishArticle(form)
    if (res.code === 200) {
      ElMessage.success(res.data)
      router.push('/my-articles')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.publish-article-container {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cover-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.cover {
  width: 200px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
