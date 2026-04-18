<template>
  <div class="my-home-privacy">
    <h2>隐私设置</h2>
    
    <el-form :model="form" label-width="200px" v-loading="loading">
      <el-form-item label="允许他人查看我的文章">
        <el-switch v-model="form.allowViewArticles" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      
      <el-form-item label="允许他人查看我的点赞">
        <el-switch v-model="form.allowViewLikes" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      
      <el-form-item label="允许他人查看我的收藏">
        <el-switch v-model="form.allowViewCollections" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      
      <el-form-item label="允许他人查看我的关注列表">
        <el-switch v-model="form.allowViewFollowings" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      
      <el-form-item label="允许他人查看我的粉丝列表">
        <el-switch v-model="form.allowViewFans" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">保存设置</el-button>
      </el-form-item>
    </el-form>
    
    <el-alert type="info" :closable="false" style="margin-top: 20px;">
      <template #title>
        <span id="privacy-font">温馨提示：设置"允许他人查看"后，其他用户可以在您的个人主页中查看对应的内容。关闭后，其他用户将无法查看这些信息。</span>
      </template>
    </el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPrivacySetting, updatePrivacySetting, type UserPrivacySetting } from '@/api/userStats'

const loading = ref(false)
const saving = ref(false)

const form = reactive<UserPrivacySetting>({
  allowViewArticles: 1,
  allowViewLikes: 1,
  allowViewCollections: 1,
  allowViewFollowings: 0,
  allowViewFans: 0
})

const fetchPrivacy = async () => {
  loading.value = true
  try {
    const res = await getPrivacySetting()
    if (res.code === 200) {
      form.allowViewArticles = res.data.allowViewArticles ? 1 : 0
      form.allowViewLikes = res.data.allowViewLikes ? 1 : 0
      form.allowViewCollections = res.data.allowViewCollections ? 1 : 0
      form.allowViewFollowings = res.data.allowViewFollowings ? 1 : 0
      form.allowViewFans = res.data.allowViewFans ? 1 : 0
    }
  } catch (error) {
    ElMessage.error('获取隐私设置失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    const res = await updatePrivacySetting(form)
    if (res.code === 200) {
      ElMessage.success(res.data)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchPrivacy()
})
</script>

<style scoped>
.my-home-privacy h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #fff ;
}
#privacy-font {
  color: gray !important;
}
</style>
