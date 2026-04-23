<template>
  <el-container class="layout-container">
    <!-- 星空背景 - 固定定位，覆盖整个页面 -->
    <div class="stars-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="planet planet-1"></div>
      <div class="planet planet-2"></div>
      <div class="planet planet-3"></div>
      <div class="comet"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <el-header>

        <div class="logo">
          <span style="background: linear-gradient(to right, #409EFF, #36cfc9); -webkit-background-clip: text; background-clip: text; color: transparent;">心愈智联</span>
        </div>
        <img class="id" src="/image/title/小可爱.png">
        <el-menu mode="horizontal" router :default-active="$route.path" style="flex: 1; border-bottom: none; justify-content: center;">
          <el-menu-item index="/home">首页</el-menu-item>

          <template v-if="[1, 2, 3, 4].includes(role)">
            <el-menu-item index="/articles">心理文章</el-menu-item>
            <el-menu-item index="/courses">心理课程</el-menu-item>
            <el-menu-item index="/assessments">心理测评</el-menu-item>
            <el-menu-item index="/consultation">心理咨询</el-menu-item>
            <el-menu-item index="/ai-consultation">线上AI咨询</el-menu-item>
            <el-menu-item index="/books">心理书籍</el-menu-item>
            <el-menu-item index="/xiaoai-listen">小爱倾听</el-menu-item>
          </template>
        </el-menu>

        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文章/课程..."
            clearable
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            @clear="clearSearch"
            style="width: 240px;"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>

        <!-- 已登录状态 -->
        <div v-if="isLoggedIn" class="user-info">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="message-badge">
            <el-link type="info" underline="never" @click="$router.push('/my-messages')" style="margin-right: 15px;">消息</el-link>
          </el-badge>
          <el-link type="info" underline="never" @click="handleFeedback" style="margin-right: 20px;">我要反馈</el-link>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link" style="display: flex; align-items: center; cursor: pointer;">
              <el-avatar :size="32" :src="user.headPath" style="margin-right: 8px;">
                <template #default>
                  <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                </template>
              </el-avatar>
              <span>{{ username }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="my-home">个人主页</el-dropdown-item>
                <el-dropdown-item command="my-psychology">我的心理咨询</el-dropdown-item>
                <el-dropdown-item command="my-orders">订单管理</el-dropdown-item>
                <el-dropdown-item command="apply-psychologist">
                  <span style="color: #E6A23C;">申请心理咨询师</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="is_psychologist === 1" command="psychologist-admin">咨询师管理</el-dropdown-item>
                <el-dropdown-item v-if="role > 1" command="backend">进入后台</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 未登录状态 -->
        <div v-else class="user-info">
          <el-button type="primary" @click="goLogin" style="margin-right: 10px;">登录</el-button>
          <el-button @click="goRegister">注册</el-button>
        </div>

        <!-- 申请心理咨询师入口（未登录时显示在右侧，已登录移入下拉菜单） -->
        <el-button
          v-if="!isLoggedIn"
          type="primary"
          plain
          class="apply-psychologist-btn"
          @click="$router.push('/apply-psychologist')"
        >
          申请心理咨询师
        </el-button>
      </el-header>

      <el-main>
        <router-view />
      </el-main>

      <!-- 底部信息 -->
      <el-footer class="footer-container">
        <div class="footer-content">
          <el-row :gutter="20" class="footer-row">
            <!-- 联系方式 -->
            <el-col :xs="24" :sm="8" :md="6" class="footer-section">
              <h3 class="footer-title">联系我们</h3>
              <ul class="footer-list">
                <li>
                  <el-icon><Message /></el-icon>
                  客服邮箱：support@aiyouthmental.com
                </li>
                <li>
                  <el-icon><Phone /></el-icon>
                  客服热线：400-1234-5678
                </li>
                <li>
                  <el-icon><Clock /></el-icon>
                  服务时间：周一至周日 9:00-21:00
                </li>
                <li>
                  <el-icon><Location /></el-icon>
                  公司地址：北京市海淀区心理健康路88号
                </li>
              </ul>
            </el-col>

            <!-- 隐私协议与法律条款 -->
            <el-col :xs="24" :sm="8" :md="6" class="footer-section">
              <h3 class="footer-title">法律声明</h3>
              <ul class="footer-list">
                <li>
                  <el-link type="info" underline="never" @click="$router.push('/privacy')">隐私保护协议</el-link>
                </li>
                <li>
                  <el-link type="info" underline="never" @click="$router.push('/service-agreement')">用户服务协议</el-link>
                </li>
                <li>
                  <el-link type="info" underline="never" @click="$router.push('/disclaimer')">免责声明</el-link>
                </li>
                <li>
                  <el-link type="info" underline="never" @click="$router.push('/child-protection')">未成年人保护指引</el-link>
                </li>
                <li>
                  <el-link type="info" underline="never" @click="$router.push('/feedback')">意见反馈</el-link>
                </li>
                <li>
                  <el-link type="info" underline="never" @click="showPlatformIntro">平台简介</el-link>
                </li>
              </ul>
            </el-col>

            <!-- 备案信息 -->
            <el-col :xs="24" :sm="8" :md="6" class="footer-section">
              <h3 class="footer-title">备案信息</h3>
              <ul class="footer-list">
                <li>
                  <el-icon><Document /></el-icon>
                  京ICP备 202500001号-1
                </li>
                <li>
                  <el-icon><DocumentChecked /></el-icon>
                  京公网安备 11010802030001号
                </li>
                <li>
                  <el-icon><Medal /></el-icon>
                  互联网信息服务许可证
                </li>
                <li>
                  <el-icon><Stamp /></el-icon>
                  心理健康服务备案号：XLJK2025001
                </li>
              </ul>
            </el-col>

            <!-- 小程序二维码 -->
            <el-col :xs="24" :sm="24" :md="6" class="footer-section qrcode-section">
              <h3 class="footer-title">关注我们</h3>
              <div class="qrcode-container">
                <div class="qrcode-item">
                  <img
                    src="/image/2d_code/wechat-miniprogram-qrcode.png"
                    alt="微信小程序"
                    class="qrcode-image"
                    @click="showQrCodeDialog('微信小程序')"
                  />
                  <p>微信小程序</p>
                </div>
                <div class="qrcode-item">
                  <img
                    src="/image/2d_code/wechat-miniprogram-qrcode.png"
                    alt="微信公众号"
                    class="qrcode-image"
                    @click="showQrCodeDialog('微信公众号')"
                  />
                  <p>微信公众号</p>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 版权信息 -->
          <div class="copyright">
            <p>© 2025 AI青少年心理健康平台 版权所有 | 青少年心理健康服务专线：12355</p>
            <p>本平台所有内容，包括文字、图片、音频、视频等，除特别注明外，均为AI青少年心理健康平台版权所有，未经授权禁止转载。</p>
            <p>本平台致力于为青少年提供专业、安全、可靠的心理健康服务，如有紧急情况，请立即联系当地心理援助热线或前往专业医疗机构。</p>
          </div>
        </div>
      </el-footer>
    </div>

    <!-- 反馈对话框 -->
    <el-dialog v-model="feedbackVisible" title="我要反馈" width="500px">
      <el-form :model="feedbackForm">
        <el-form-item label="反馈内容">
          <el-input type="textarea" v-model="feedbackForm.content" :rows="4" placeholder="请输入您的宝贵意见..."></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="feedbackVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 二维码弹窗 -->
    <el-dialog v-model="qrCodeDialogVisible" :title="qrCodeDialogTitle" width="300px" align-center>
      <div class="qr-code-dialog-content">
        <img
          :src="currentQrCodeSrc"
          alt="二维码"
          class="qr-code-large"
        />
        <p class="qr-code-tip">使用微信扫描二维码{{ qrCodeDialogTitle }}</p>
      </div>
    </el-dialog>

    <!-- 平台简介弹窗 -->
    <PlatformIntro
      v-model="platformIntroVisible"
      :title="platformIntroTitle"
      @confirm="handlePlatformIntroConfirm"
    />

    <!-- 全局悬浮按钮 -->
    <FloatingButtons />
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted, computed } from 'vue'
import { ArrowDown, Message, Phone, Clock, Location, Document, DocumentChecked, Medal, Stamp, Search } from '@element-plus/icons-vue'
import { submitPlatformFeedback } from '@/api/feedback'
import { getUnreadCount } from '@/api/message'
import { logout } from '@/api/user'
import { ElMessage } from 'element-plus'
import FloatingButtons from '@/components/FloatingButtons.vue'
import PlatformIntro from '@/components/PlatformIntro.vue'  // 导入平台简介组件

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const username = user.nickname || '用户'
const role = user.role || 1
const is_psychologist = user.isPsychologist || 0

// 平台简介弹窗控制（全局 footer 入口 + 首次登录欢迎）
const platformIntroVisible = ref(false)
const platformIntroTitle = ref('平台简介')

// 检查是否已登录
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token') && !!user.id
})

// 搜索关键词
const searchKeyword = ref('')
const unreadCount = ref(0)
const feedbackVisible = ref(false)
const feedbackForm = reactive({ content: '' })

// 二维码弹窗相关
const qrCodeDialogVisible = ref(false)
const qrCodeDialogTitle = ref('')
const currentQrCodeSrc = ref('')

// 显示平台简介
const showPlatformIntro = () => {
  platformIntroTitle.value = '平台简介'
  platformIntroVisible.value = true
}

const handlePlatformIntroConfirm = () => {
  localStorage.setItem('hasSeenPlatformIntro', 'true')
  localStorage.removeItem('isFirstLogin')
  platformIntroTitle.value = '平台简介'
}

// 搜索处理
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value.trim() }
  })
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
}

const fetchUnreadCount = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await getUnreadCount()
    if (res.code === 200) {
      unreadCount.value = res.data
    }
  } catch (error) {
    console.error('获取未读消息数失败')
  }
}

const handleFeedback = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再提交反馈')
    router.push('/login')
    return
  }
  feedbackForm.content = ''
  feedbackVisible.value = true
}

const submitFeedback = async () => {
  if (!feedbackForm.content) {
    ElMessage.warning('请输入反馈内容')
    return
  }
  const res = await submitPlatformFeedback(feedbackForm) as any
  if (res.code === 200) {
    ElMessage.success('提交成功，感谢您的反馈！')
    feedbackVisible.value = false
  } else {
    ElMessage.error(res.message || '提交失败')
  }
}

// todo 显示二维码弹窗,后面转为动态
const showQrCodeDialog = (type: string) => {
  qrCodeDialogTitle.value = type
  if (type === '微信小程序') {
    currentQrCodeSrc.value = '/image/2d_code/wechat-miniprogram-qrcode.png'
  } else {
    currentQrCodeSrc.value = '/image/2d_code/wechat-miniprogram-qrcode.png'
  }
  qrCodeDialogVisible.value = true
}

const handleCommand = async (command: string) => {
    if (command === 'logout') {
        try {
          await logout()
        } catch (e) {
          // 忽略退出接口错误
        }
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        ElMessage.success('已退出登录')
        router.push('/login')
    } else if (command === 'my-home') {
        router.push('/my-home')
    } else if (command === 'my-psychology') {
        router.push('/my-psychology')
    } else if (command === 'my-orders') {
        router.push('/my-orders')
    } else if (command === 'psychologist-admin') {
        router.push('/psychologist-admin/workbench')
    } else if (command === 'apply-psychologist') {
        router.push('/apply-psychologist')
    } else if (command === 'backend') {
        if (role === 4) router.push('/admin/dashboard')
        else if (role === 3) router.push('/hospital/dashboard')
        else if (role === 2) router.push('/doctor/dashboard')
        else if (is_psychologist === 1) router.push('/psychologist-admin/workbench')
    }
}

const goLogin = () => {
  router.push('/login')
}

const goRegister = () => {
  router.push('/register')
}

onMounted(() => {
  fetchUnreadCount()
})
</script>

<style scoped>
/* 星空背景样式 */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
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

/* 行星样式 */
.planet {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  opacity: 0.7;
  z-index: 0;
}

.planet-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 10%;
  background: radial-gradient(circle at 30% 30%, #ff9a9e, #fad0c4);
  box-shadow: 0 0 40px rgba(255, 154, 158, 0.5);
  animation: float 25s infinite ease-in-out;
}

.planet-2 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 5%;
  background: radial-gradient(circle at 30% 30%, #a1c4fd, #c2e9fb);
  box-shadow: 0 0 50px rgba(161, 196, 253, 0.5);
  animation: float 30s infinite ease-in-out reverse;
}

.planet-3 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 20%;
  background: radial-gradient(circle at 30% 30%, #ffecd2, #fcb69f);
  box-shadow: 0 0 30px rgba(252, 182, 159, 0.5);
  animation: float 20s infinite ease-in-out;
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

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes cometMove {
  0% { transform: translateX(-100px) translateY(-100px) rotate(45deg); }
  100% { transform: translateX(calc(100vw + 100px)) translateY(calc(100vh + 100px)) rotate(45deg); }
}

.layout-container {
  position: relative;
  min-height: 100vh;
  height: auto;
  max-height: none;
  display: flex;
  flex-direction: column;
  /* 覆盖 Element Plus .el-container 的 flex:1，避免整页被锁死在视口高度内 */
  flex: 0 0 auto;
  align-self: stretch;
  width: 100%;

}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  /* 随内容增高，不把 Footer 顶在视口底部 */
  flex: 0 0 auto;
  width: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  padding: 0 20px;
  background: transparent;
  color: #E6E8EB;
  position: relative;
  z-index: 10;
}
.el-header :deep(.el-menu) {
  background-color: transparent !important;
  border-bottom: none !important;
}
.el-header :deep(.el-menu-item) {
  color: #E6E8EB !important;
  background-color: transparent !important;
}
.el-header :deep(.el-menu-item:hover),
.el-header :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #FFE9A7 !important;
}
.el-header :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}
.el-header :deep(.el-input__inner) {
  color: #E6E8EB !important;
}
.el-header :deep(.el-input__inner::placeholder) {
  color: rgba(230, 232, 235, 0.5) !important;
}
.el-header :deep(.el-input-group__append) {
  background-color: rgba(64, 158, 255, 0.6) !important;
  border: none !important;
}
.el-header :deep(.el-dropdown-link) {
  color: #E6E8EB !important;
}
.el-header :deep(.el-text) {
  color: #E6E8EB !important;
}
.el-header :deep(.el-button--text) {
  color: #E6E8EB !important;
}
.el-header :deep(.el-button--text:hover) {
  color: #FFE9A7 !important;
}
.logo {
  font-size: 30px;
  font-weight: bold;
  flex-shrink: 0;
}
.message-badge {
  vertical-align: middle;
}
.user-info {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.apply-psychologist-btn {
  flex-shrink: 0;
  background: linear-gradient(135deg, #FFE9A7, #FFD54F) !important;
  color: #1A2A3A !important;
  border: none !important;
  font-weight: 600;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(255, 233, 167, 0.3);
  transition: all 0.3s ease;
}
.apply-psychologist-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 233, 167, 0.5);
  background: linear-gradient(135deg, #FFD54F, #FFC107) !important;
}
/* z-index 不可高于 footer：子页面内若有 position:fixed 全屏层，会随 main 的堆叠上下文盖住后面的 el-footer */
/* 隔离 el-main 的堆叠上下文，防止子页面 position:fixed 全屏层（stars/background）意外压过 footer */
.el-main {
  isolation: isolate;
  flex: 0 1 auto;
  overflow: visible;
  padding: 20px;
  background: transparent;
  position: relative;
  z-index: 0;
}

/* 搜索框样式 */
.search-container {
  display: flex;
  align-items: center;
  margin-right: 20px;
  flex-shrink: 0;
}
.search-container :deep(.el-input-group__append) {
  background-color: #409EFF;
  color: white;
  border: none;
}
.search-container :deep(.el-input-group__append:hover) {
  background-color: #66b1ff;
}

/* 底部样式：盖过 el-main 内 fixed 全屏装饰层；并取消 EP 默认 el-footer 固定 60px 高度（多列内容会被裁切） */
.footer-container.el-footer {
  --el-footer-height: auto;
  position: relative;
  z-index: 2;
  height: auto !important;
  min-height: 60px;
  overflow: visible;
  background: transparent !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  color: #E6E8EB;
  padding: 40px 20px 20px;
}
.footer-content {
  max-width: 1200px;
  margin: 100px auto;
  background: transparent;
}
.footer-container{
  margin-top: 150px;
}
.footer-content :deep(.el-row) {
  background: transparent;
}
.footer-content :deep(.el-col) {
  background: transparent;
}
.footer-row {
  margin-bottom: 30px;
}
.footer-section {
  margin-bottom: 30px;
}
.footer-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #FFE9A7;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409EFF;

}
.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.footer-list li {
  margin-bottom: 12px;
  color: #B0B8C1;
  font-size: 14px;
  display: flex;
  align-items: center;
  line-height: 1.5;
}
.footer-list li .el-icon {
  margin-right: 8px;
  color: #409EFF;
  font-size: 16px;
}
.footer-list .el-link {
  color: #B0B8C1;
  font-size: 14px;
  transition: color 0.3s;
}
.footer-list .el-link:hover {
  color: #409EFF;
}

/* 二维码区域样式 */
.qrcode-section {
  text-align: center;
}
.qrcode-container {
  display: flex;
  justify-content: center;
  gap: 30px;
}
.qrcode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qrcode-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
  margin-bottom: 8px;
}
.qrcode-image:hover {
  transform: scale(1.05);
}
.qrcode-item p {
  font-size: 14px;
  color: #B0B8C1;
  margin: 0;
}

/* 二维码弹窗内容样式 */
.qr-code-dialog-content {
  text-align: center;
}
.qr-code-large {
  width: 200px;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 8px;
}
.qr-code-tip {
  color: #666;
  font-size: 14px;
}

/* 版权信息样式 */
.copyright {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 13px;
  line-height: 1.6;
}
.copyright p {
  margin: 5px 0;
}
.id{
  width: 70px;
  height: 70px;
}
</style>