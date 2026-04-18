<template>
  <div class="article-editor">
    <div class="header">
      <h2>{{ isEdit ? '编辑文章' : '新增文章' }}</h2>
      <el-button @click="goBack">返回列表</el-button>
    </div>

    <el-form :model="form" label-width="80px" v-loading="loading">
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="请输入文章标题"></el-input>
      </el-form-item>
      <el-form-item label="类型" required>
        <el-select v-model="form.type" placeholder="请选择文章类型">
          <el-option
            v-for="tag in articleTags"
            :key="tag.code"
            :label="tag.name"
            :value="tag.code"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="封面图">
        <el-input v-model="form.coverUrl" placeholder="输入图片URL">
            <template #append>
                <el-upload
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleCoverUpload"
                    accept="image/*"
                >
                    <el-button :icon="Upload">上传</el-button>
                </el-upload>
            </template>
        </el-input>
        <div v-if="form.coverUrl" class="cover-preview" style="margin-top: 10px;">
            <el-image :src="form.coverUrl" style="width: 200px; height: 120px; object-fit: cover; border-radius: 4px;"></el-image>
        </div>
      </el-form-item>
      <el-form-item label="内容" required>
        <div class="editor-container" style="width: 100%;">
          <div class="toolbar">
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleMdUpload"
              accept=".md"
            >
              <el-button size="small" type="warning">导入 Markdown</el-button>
            </el-upload>
          </div>
          <v-md-editor
            v-model="form.content"
            height="calc(100vh - 350px)"
            :disabled-menus="[]"
            :include-level="[1, 2, 3, 4, 5, 6]"
            placeholder="请输入文章内容"
            left-toolbar="undo redo clear | h bold italic strikethrough quote | ul ol table hr | link image code | align color"
            :toolbar="toolbar"
            @upload-image="handleEditorUploadImage"
          ></v-md-editor>
        </div>
      </el-form-item>
      <el-form-item label="状态">
        <el-switch
          v-model="form.status"
          :active-value="1"
          :inactive-value="0"
          active-text="发布"
          inactive-text="草稿"
        ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/api/user'
import { getArticleTags } from '@/api/articleTag'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const articleTags = ref<any[]>([])
const form = reactive<any>({
  title: '',
  type: '',
  coverUrl: '',
  content: '',
  status: 1
})
const pendingImages = ref<Map<string, File>>(new Map())
const pendingCover = ref<File | null>(null)

const toolbar = {
  color: {
    title: '字体颜色',
    icon: 'v-md-icon-font',
    text: 'A',
    menus: [
      {
        name: 'red',
        text: '红色',
        action(editor: any) {
          editor.insert((selected: any) => {
            const prefix = '<span style="color: red">';
            const suffix = '</span>';
            const content = selected || '红色文本';
            return {
              text: `${prefix}${content}${suffix}`,
              selected: content,
            };
          });
        },
      },
      {
        name: 'blue',
        text: '蓝色',
        action(editor: any) {
          editor.insert((selected: any) => {
            const prefix = '<span style="color: blue">';
            const suffix = '</span>';
            const content = selected || '蓝色文本';
            return {
              text: `${prefix}${content}${suffix}`,
              selected: content,
            };
          });
        },
      },
      {
        name: 'green',
        text: '绿色',
        action(editor: any) {
          editor.insert((selected: any) => {
            const prefix = '<span style="color: green">';
            const suffix = '</span>';
            const content = selected || '绿色文本';
            return {
              text: `${prefix}${content}${suffix}`,
              selected: content,
            };
          });
        },
      },
      {
        name: 'orange',
        text: '橙色',
        action(editor: any) {
          editor.insert((selected: any) => {
            const prefix = '<span style="color: orange">';
            const suffix = '</span>';
            const content = selected || '橙色文本';
            return {
              text: `${prefix}${content}${suffix}`,
              selected: content,
            };
          });
        },
      },
    ],
  },
}

const isEdit = computed(() => !!route.params.id)

const fetchArticle = async (id: number) => {
  loading.value = true
  try {
    // Assuming we have an API to get article detail by ID for admin or public
    // Reusing the public detail API or creating a new one? 
    // The public API /content/article/{id} should work.
    const res = await request.get(`/content/article/${id}`) as any
    if (res.code === 200) {
      Object.assign(form, res.data)
    } else {
      ElMessage.error(res.message)
    }
  } catch (error) {
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/admin/content/articles')
}

const user = JSON.parse(localStorage.getItem('user') || '{}')

// Markdown Upload
const handleMdUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      form.content = e.target.result as string
    }
  }
  reader.readAsText(file.raw)
}

const handleCoverUpload = (file: any) => {
    if (!file.raw) return
    const isImage = file.raw.type.startsWith('image/')
    if (!isImage) {
        ElMessage.error('请上传图片文件')
        return
    }
    if (file.size / 1024 / 1024 > 2) {
        ElMessage.error('图片大小不能超过 2MB')
        return
    }
    
    pendingCover.value = file.raw
    form.coverUrl = URL.createObjectURL(file.raw)
}

// Editor Image Upload (Defer)
const handleEditorUploadImage = (_event: any, insertImage: Function, files: File[]) => {
  files.forEach(file => {
    const url = URL.createObjectURL(file)
    pendingImages.value.set(url, file)
    insertImage({
      url: url,
      desc: file.name,
      width: 'auto',
      height: 'auto',
    })
  })
}

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'article')
  return request.post('/common/upload', formData)
}

const submitForm = async () => {
  if (!form.title || !form.content) {
    ElMessage.warning('标题和内容不能为空')
    return
  }

  const loadingInstance = ElMessage({
    message: '正在保存...',
    type: 'info',
    duration: 0
  })

  try {
    // 1. Upload Cover if pending
    if (pendingCover.value) {
        const res = await uploadFile(pendingCover.value) as any
        if (res.code === 200) {
            form.coverUrl = res.data
        } else {
            throw new Error(`封面图上传失败: ${res.message}`)
        }
    }

    let newContent = form.content
    const imageEntries = Array.from(pendingImages.value.entries())

    // Find used blob URLs in content
    // We must handle image upload errors gracefully and not block saving if no images changed or upload fails
    // But currently if upload fails, we throw. That's fine.
    
    // Fix: Blob URL detection regex or logic.
    // .includes(blobUrl) might be risky if urls are similar (unlikely for UUIDs).
    // Also, v-md-editor might encode/decode URLs.
    // Let's use a robust replacement.
    
    for (const [blobUrl, file] of imageEntries) {
      if (newContent.includes(blobUrl)) {
        // Upload
        const res = await uploadFile(file) as any
        if (res.code === 200) {
          const ossUrl = res.data
          // Replace all occurrences
          newContent = newContent.split(blobUrl).join(ossUrl)
        } else {
          throw new Error(`图片 ${file.name} 上传失败: ${res.message}`)
        }
      }
    }

    form.content = newContent

    let res;
    if (form.id) {
      res = await request.put('/content/article', form, { params: { role: user.role } }) as any
    } else {
      res = await request.post('/content/article', form, { params: { role: user.role } }) as any
    }
    
    if (res.code === 200) {
      ElMessage.success('保存成功')
      pendingImages.value.clear()
      goBack()
    } else {
      ElMessage.error(res.message)
    }
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    loadingInstance.close()
  }
}

onMounted(async () => {
  // 获取文章标签列表
  try {
    const res = await getArticleTags()
    if (res.code === 200) {
      articleTags.value = res.data.filter((tag: any) => tag.status === 1)
      // 设置默认类型为第一个标签
      if (articleTags.value.length > 0 && !form.type) {
        form.type = articleTags.value[0].code
      }
    }
  } catch (error) {
    console.error('获取标签失败', error)
  }

  if (route.params.id) {
    fetchArticle(Number(route.params.id))
  }
})
</script>

<style scoped>
.article-editor {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.toolbar {
  padding: 5px 10px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}
</style>
