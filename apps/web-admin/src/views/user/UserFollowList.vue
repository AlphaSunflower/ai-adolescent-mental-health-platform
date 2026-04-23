<template>
  <div class="user-follow-list-container">
    <el-card>
      <div class="page-header">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>{{ targetNickname }}的关注</h2>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="关注" name="followings">
          <div class="user-list" v-loading="loading">
            <el-empty v-if="!loading && users.length === 0" description="还没有关注任何人"></el-empty>

            <div v-for="user in users" :key="user.userId" class="user-item">
              <el-avatar :size="50" :src="user.headPath" @click.native="visitHome(user.userId)" class="clickable-avatar">
                <template #default>
                  <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                </template>
              </el-avatar>
              <div class="user-info">
                <div class="nickname" @click="visitHome(user.userId)">{{ user.nickname }}</div>
                <div class="signature" v-if="user.signature">{{ user.signature }}</div>
              </div>
              <div class="user-actions">
                <el-button size="small" @click="visitHome(user.userId)">访问主页</el-button>
                <el-button v-if="!isOwnPage(user.userId)" size="small" type="danger" @click="handleUnfollow(user.userId)">取消关注</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="粉丝" name="followers">
          <div class="user-list" v-loading="loading">
            <el-empty v-if="!loading && users.length === 0" description="还没有粉丝"></el-empty>

            <div v-for="user in users" :key="user.userId" class="user-item">
              <el-avatar :size="50" :src="user.headPath" @click.native="visitHome(user.userId)" class="clickable-avatar">
                <template #default>
                  <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                </template>
              </el-avatar>
              <div class="user-info">
                <div class="nickname" @click="visitHome(user.userId)">{{ user.nickname }}</div>
                <div class="signature" v-if="user.signature">{{ user.signature }}</div>
              </div>
              <div class="user-actions">
                <el-button size="small" @click="visitHome(user.userId)">访问主页</el-button>
                <el-button v-if="!isOwnPage(user.userId) && !user.isFollowing" size="small" type="primary" @click="handleFollow(user.userId)">回关</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-pagination
        v-if="total > 0"
        class="pagination"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getUserFollowings, getUserFollowers, followUser, unfollowUser, type UserInfoVO } from '@/api/follow'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const activeTab = ref(route.query.tab === 'followers' ? 'followers' : 'followings')
const users = ref<UserInfoVO[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
const targetUserId = computed(() => Number(route.params.userId))
const targetNickname = computed(() => route.query.nickname || '该用户')

const isOwnPage = (userId: number) => currentUserId === userId

const fetchFollowings = async () => {
  loading.value = true
  try {
    const res = await getUserFollowings(targetUserId.value, { page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      users.value = res.data.records
      total.value = res.data.total
    } else if (res.code === 403) {
      users.value = []
      total.value = 0
      ElMessage.warning(res.message || '该用户设置了隐私，不允许查看关注列表')
    }
  } catch (error) {
    ElMessage.error('获取关注列表失败')
  } finally {
    loading.value = false
  }
}

const fetchFollowers = async () => {
  loading.value = true
  try {
    const res = await getUserFollowers(targetUserId.value, { page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      users.value = res.data.records
      total.value = res.data.total
    } else if (res.code === 403) {
      users.value = []
      total.value = 0
      ElMessage.warning(res.message || '该用户设置了隐私，不允许查看粉丝列表')
    }
  } catch (error) {
    ElMessage.error('获取粉丝列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = async (page: number) => {
  currentPage.value = page
  if (activeTab.value === 'followings') {
    await fetchFollowings()
  } else {
    await fetchFollowers()
  }
}

const visitHome = (userId: number) => {
  router.push(`/user-home/${userId}`)
}

const handleFollow = async (userId: number) => {
  try {
    const res = await followUser(userId)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchFollowers()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '关注失败')
  }
}

const handleUnfollow = async (userId: number) => {
  try {
    await ElMessageBox.confirm('确定要取消关注吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await unfollowUser(userId)
    if (res.code === 200) {
      ElMessage.success(res.data)
      fetchFollowings()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消关注失败')
    }
  }
}

const goBack = () => {
  router.back()
}

watch([activeTab, () => route.params.userId], () => {
  currentPage.value = 1
  if (activeTab.value === 'followings') {
    fetchFollowings()
  } else {
    fetchFollowers()
  }
}, { immediate: true })

onMounted(() => {
  if (activeTab.value === 'followings') {
    fetchFollowings()
  } else {
    fetchFollowers()
  }
})
</script>

<style scoped>
.user-follow-list-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.user-list {
  margin-top: 15px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.user-item:last-child {
  border-bottom: none;
}

.clickable-avatar {
  cursor: pointer;
  transition: transform 0.2s;
}

.clickable-avatar:hover {
  transform: scale(1.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  cursor: pointer;
  color: #409eff;
}

.nickname:hover {
  text-decoration: underline;
}

.signature {
  font-size: 13px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>
