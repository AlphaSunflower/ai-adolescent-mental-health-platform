<template>
  <div class="book-editor">
    <div class="header">
      <h2>{{ isEdit ? '编辑书籍' : '新增书籍' }}</h2>
      <div>
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </div>

    <el-card class="form-card">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="书籍标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入书籍标题" maxlength="200" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="封面图片" prop="coverUrl">
          <div class="cover-upload">
            <el-upload
              class="avatar-uploader"
              action="/api/content/course/cover/upload"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleCoverSuccess"
              :before-upload="beforeCoverUpload"
            >
              <img v-if="form.coverUrl" :src="form.coverUrl" class="cover-preview" />
              <div v-else class="cover-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span>点击上传封面</span>
              </div>
            </el-upload>
            <div class="cover-tip">
              <p>支持 JPG、PNG 格式</p>
              <p>建议尺寸：200x280 像素</p>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="书籍简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入书籍简介"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="跳转地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入跳转地址（外部链接）">
            <template #prepend>https://</template>
          </el-input>
        </el-form-item>

        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" :step="1"></el-input-number>
          <span class="sort-tip">数值越大排序越靠前</span>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
          ></el-switch>
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getBookAdminDetail, addBook, updateBook } from '@/api/adminBook'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { UploadProps } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  coverUrl: '',
  description: '',
  address: '',
  sortOrder: 0,
  status: 1
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入书籍标题', trigger: 'blur' }
  ]
}

const uploadHeaders = {
  'token': localStorage.getItem('token') || ''
}

const handleCoverSuccess: UploadProps['onSuccess'] = (response: any) => {
  if (response.code === 200) {
    form.coverUrl = response.data
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error(response.message || '封面上传失败')
  }
}

const beforeCoverUpload: UploadProps['beforeUpload'] = (rawFile: any) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('封面图片必须是 JPG 或 PNG 格式')
    return false
  } else if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('封面图片大小不能超过 5MB')
    return false
  }
  return true
}

const fetchBookDetail = async (id: number) => {
  try {
    const res = await getBookAdminDetail(id) as any
    if (res.code === 200) {
      Object.assign(form, res.data)
    } else {
      ElMessage.error(res.message || '获取书籍详情失败')
    }
  } catch (error) {
    ElMessage.error('获取书籍详情失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  submitting.value = true
  try {
    const submitData = {
      title: form.title,
      coverUrl: form.coverUrl,
      description: form.description,
      address: form.address,
      sortOrder: form.sortOrder,
      status: form.status
    }

    let res: any
    if (isEdit.value && form.id) {
      res = await updateBook(form.id, submitData)
    } else {
      res = await addBook(submitData)
    }

    if (res.code === 200) {
      ElMessage.success('保存成功')
      goBack()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/admin/content/books')
}

onMounted(() => {
  const bookId = route.params.id
  if (bookId) {
    fetchBookDetail(Number(bookId))
  }
})
</script>

<style scoped>
.book-editor {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.form-card {
  max-width: 800px;
}
.cover-upload {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}
.cover-preview {
  width: 200px;
  height: 280px;
  display: block;
  object-fit: cover;
}
.cover-placeholder {
  width: 200px;
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  background-color: #fafafa;
}
.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}
.cover-placeholder span {
  font-size: 14px;
}
.cover-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.8;
}
.sort-tip {
  margin-left: 15px;
  color: #909399;
  font-size: 12px;
}
</style>
