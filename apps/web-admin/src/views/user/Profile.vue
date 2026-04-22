<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      <el-form :model="userForm" label-width="100px" v-loading="loading">
        <el-form-item label="头像">
            <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :on-change="handleAvatarChange"
                :before-upload="beforeAvatarUpload"
                :auto-upload="false"
            >
                <img v-if="avatarPreview || userForm.headPath" :src="avatarPreview || userForm.headPath" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="userForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="userForm.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker v-model="userForm.birthday" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"></el-date-picker>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input type="textarea" v-model="userForm.signature"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleUpdate">保存修改</el-button>

        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, updateUserInfo, type User } from '@/api/user'
import request from '@/api/user' // For upload
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'

const loading = ref(false)
const userForm = ref<Partial<User>>({
  username: '',
  nickname: '',
  sex: 0,
  birthday: '',
  phone: '',
  email: '',
  signature: '',
  headPath: ''
})

const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')

const handleAvatarChange: UploadProps['onChange'] = (uploadFile) => {
    if (uploadFile.raw) {
        if (!beforeAvatarUpload(uploadFile.raw)) return
        
        avatarFile.value = uploadFile.raw
        // Create local preview
        avatarPreview.value = URL.createObjectURL(uploadFile.raw)
    }
}

const beforeAvatarUpload = (rawFile: File) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('Avatar picture must be JPG or PNG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}

const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'avatar')
    return request.post('/common/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await getUserInfo()
    if (res.code === 200) {
      userForm.value = res.data
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  loading.value = true
  try {
    if (avatarFile.value) {
        const res = await uploadAvatar(avatarFile.value) as any
        if (res.code === 200) {
            userForm.value.headPath = res.data
        } else {
            throw new Error(res.message || '头像上传失败')
        }
    }
      
    const res = await updateUserInfo(userForm.value)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      // 更新本地存储的用户信息（如果需要）
      localStorage.setItem('user', JSON.stringify(res.data))
      avatarFile.value = null // Reset
      avatarPreview.value = ''
    } else {
      ElMessage.error(res.message)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
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
