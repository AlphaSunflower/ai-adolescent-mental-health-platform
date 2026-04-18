<template>
  <div class="course-manager">
    <div class="header">
      <h2>心理课程管理</h2>
      <div>
        <el-button type="primary" @click="openCategoryDialog">分类管理</el-button>
        <el-button type="primary" @click="handleAdd">新增课程</el-button>
      </div>
    </div>

    <div class="search-bar" style="margin-bottom: 20px;">
        <el-select v-model="filterType" placeholder="选择分类" style="width: 150px; margin-right: 10px;" clearable @change="fetchCourses">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.code"></el-option>
        </el-select>
        <el-input v-model="searchQuery" placeholder="搜索课程标题" style="width: 200px; margin-right: 10px;" @keyup.enter="fetchCourses"></el-input>
        <el-button @click="fetchCourses">搜索</el-button>
    </div>

    <el-table :data="courses" v-loading="loading" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="type" label="分类">
          <template #default="scope">
              {{ getCategoryName(scope.row.type) }}
          </template>
      </el-table-column>
      <el-table-column prop="mediaUrl" label="来源">
          <template #default="scope">
              {{ scope.row.mediaUrl ? (scope.row.mediaUrl.startsWith('http') ? '第三方/OSS' : '本地') : '-' }}
          </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
          <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 课程编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '新增课程'" width="700px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.type" placeholder="请选择分类">
              <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="form.description"></el-input>
        </el-form-item>

        <el-divider>资源配置</el-divider>
        <el-form-item label="来源模式">
             <el-radio-group v-model="form.sourceType">
                 <el-radio label="third_party">第三方平台</el-radio>
                 <el-radio label="self_hosted">自有存储</el-radio>
             </el-radio-group>
        </el-form-item>

        <template v-if="form.sourceType === 'third_party'">
            <el-form-item label="平台名称">
                <el-input v-model="form.sourceName" placeholder="如：B站、腾讯视频"></el-input>
            </el-form-item>
            <el-form-item label="视频链接">
                <el-input v-model="form.sourceUrl" placeholder="第三方视频播放页URL"></el-input>
            </el-form-item>
            <el-form-item label="封面链接">
                <el-input v-model="form.coverUrl" placeholder="第三方封面图URL"></el-input>
            </el-form-item>
        </template>

        <template v-if="form.sourceType === 'self_hosted'">
            <el-form-item label="存储源">
                <el-select v-model="form.storageProvider">
                    <el-option label="阿里云OSS" value="oss"></el-option>
                    <el-option label="本地存储" value="local"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="资源地址">
                <el-input v-model="form.sourceUrl" placeholder="视频/音频文件直链"></el-input>
            </el-form-item>
            <el-form-item label="封面上传">
                <el-upload
                    class="avatar-uploader"
                    action="/api/content/course/cover/upload"
                    :headers="uploadHeaders"
                    :show-file-list="false"
                    :on-success="handleCoverSuccess"
                    :before-upload="beforeCoverUpload"
                >
                    <img v-if="form.coverUrl" :src="form.coverUrl" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
            </el-form-item>
        </template>

        <el-form-item label="状态">
             <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="上架" inactive-text="下架"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分类管理对话框 -->
    <el-dialog v-model="categoryDialogVisible" title="课程分类管理" width="600px">
      <div class="category-header">
        <el-button type="primary" size="small" @click="openCategoryForm">新增分类</el-button>
      </div>

      <el-table :data="categoryList" style="width: 100%; margin-top: 10px;" v-loading="categoryLoading">
        <el-table-column prop="name" label="分类名称" width="120"></el-table-column>
        <el-table-column prop="code" label="分类编码" width="120"></el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80"></el-table-column>
        <el-table-column prop="status" label="状态">
            <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
                    {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
            <template #default="scope">
                <el-button size="small" @click="editCategory(scope.row)" :disabled="scope.row.isSystem === 1">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteCategory(scope.row)" :disabled="scope.row.isSystem === 1">删除</el-button>
            </template>
        </el-table-column>
      </el-table>

      <!-- 分类编辑表单 -->
      <div v-if="categoryFormVisible" class="category-form" style="margin-top: 20px; padding: 15px; border: 1px solid #ebeef5; border-radius: 4px;">
        <h4>{{ categoryForm.id ? '编辑分类' : '新增分类' }}</h4>
        <el-form :model="categoryForm" label-width="80px" style="margin-top: 10px;">
            <el-form-item label="分类名称">
                <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
            </el-form-item>
            <el-form-item label="分类编码">
                <el-input v-model="categoryForm.code" placeholder="请输入分类编码（英文）" :disabled="!!categoryForm.id"></el-input>
            </el-form-item>
            <el-form-item label="排序">
                <el-input-number v-model="categoryForm.sortOrder" :min="0" :max="999"></el-input-number>
            </el-form-item>
            <el-form-item label="状态">
                <el-switch v-model="categoryForm.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用"></el-switch>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="saveCategory">保存</el-button>
                <el-button @click="cancelCategoryForm">取消</el-button>
            </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import request from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { getCourseCategories, addCourseCategory, updateCourseCategory, deleteCourseCategory } from '@/api/courseCategory'

const courses = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive<any>({})
const searchQuery = ref('')
const filterType = ref('')
const categories = ref<any[]>([])

// 分类管理相关
const categoryDialogVisible = ref(false)
const categoryLoading = ref(false)
const categoryList = ref<any[]>([])
const categoryFormVisible = ref(false)
const categoryForm = reactive<any>({
    name: '',
    code: '',
    sortOrder: 0,
    status: 1
})

const uploadHeaders = {
    'token': localStorage.getItem('token') || ''
}

const getCategoryName = (code: string) => {
    const cat = categories.value.find(c => c.code === code)
    return cat ? cat.name : code
}

const fetchCategories = async () => {
    try {
        const res = await getCourseCategories() as any
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
    const res = await request.get('/content/admin/courses', {
        params: {
            title: searchQuery.value,
            type: filterType.value
        }
    }) as any
    if (res.code === 200) {
      courses.value = res.data.records
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 分类管理相关方法
const openCategoryDialog = async () => {
    categoryDialogVisible.value = true
    await fetchCategoryList()
}

const fetchCategoryList = async () => {
    categoryLoading.value = true
    try {
        const res = await getCourseCategories() as any
        if (res.code === 200) {
            categoryList.value = res.data || []
        }
    } catch (error) {
        console.error(error)
    } finally {
        categoryLoading.value = false
    }
}

const openCategoryForm = () => {
    Object.keys(categoryForm).forEach(key => delete categoryForm[key])
    categoryForm.sortOrder = 0
    categoryForm.status = 1
    categoryFormVisible.value = true
}

const editCategory = (row: any) => {
    Object.assign(categoryForm, {
        id: row.id,
        name: row.name,
        code: row.code,
        sortOrder: row.sortOrder,
        status: row.status
    })
    categoryFormVisible.value = true
}

const cancelCategoryForm = () => {
    categoryFormVisible.value = false
    Object.keys(categoryForm).forEach(key => delete categoryForm[key])
}

const saveCategory = async () => {
    if (!categoryForm.name || !categoryForm.name.trim()) {
        ElMessage.error('分类名称不能为空')
        return
    }
    if (!categoryForm.code || !categoryForm.code.trim()) {
        ElMessage.error('分类编码不能为空')
        return
    }

    try {
        let res
        if (categoryForm.id) {
            res = await updateCourseCategory(categoryForm.id, categoryForm) as any
        } else {
            res = await addCourseCategory(categoryForm) as any
        }
        if (res.code === 200) {
            ElMessage.success('保存成功')
            cancelCategoryForm()
            await fetchCategoryList()
            await fetchCategories()
        } else {
            ElMessage.error(res.message || '保存失败')
        }
    } catch (error) {
        ElMessage.error('保存失败')
    }
}

const deleteCategory = (row: any) => {
    ElMessageBox.confirm('确定删除该分类吗？删除后，该分类下的课程将变为"未分类"状态。', '删除确认', { type: 'warning' })
        .then(async () => {
            try {
                const res = await deleteCourseCategory(row.id) as any
                if (res.code === 200) {
                    ElMessage.success('删除成功')
                    await fetchCategoryList()
                    await fetchCategories()
                } else {
                    ElMessage.error(res.message || '删除失败')
                }
            } catch (error) {
                ElMessage.error('删除失败')
            }
        })
        .catch(() => {})
}

const handleCoverSuccess: UploadProps['onSuccess'] = (response) => {
    if (response.code === 200) {
        form.coverUrl = response.data
        form.coverType = 'self_hosted'
    } else {
        ElMessage.error(response.message || '上传失败')
    }
}

const beforeCoverUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('Avatar picture must be JPG or PNG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('Picture size can not exceed 5MB!')
    return false
  }
  return true
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => delete form[key])
  form.status = 1
  form.type = filterType.value || 'VIDEO'
  form.sourceType = 'third_party'
  form.coverType = 'third_party'
  dialogVisible.value = true
}

const handleEdit = async (row: any) => {
  isEdit.value = true
  try {
    const res = await request.get(`/content/admin/course/${row.id}`) as any
    if (res.code === 200) {
        Object.assign(form, res.data)
        dialogVisible.value = true
    } else {
        ElMessage.error(res.message || '获取详情失败')
    }
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }).then(async () => {
        const res = await request.delete(`/content/course/${id}`) as any
        if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchCourses()
        }
    })
}

watch(() => form.sourceType, (newVal) => {
    if (newVal === 'third_party') {
        form.coverType = 'third_party'
    }
})

const submitForm = async () => {
    const res = await request.post('/content/course', form) as any
    if (res.code === 200) {
        ElMessage.success('保存成功')
        dialogVisible.value = false
        fetchCourses()
    } else {
        ElMessage.error(res.message || '保存失败')
    }
}

onMounted(() => {
  fetchCategories().then(() => {
      fetchCourses()
  })
})
</script>

<style scoped>
.course-manager {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.category-header {
  margin-bottom: 10px;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>
