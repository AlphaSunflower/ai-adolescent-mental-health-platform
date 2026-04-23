<template>
  <el-container class="admin-layout" :class="{ 'light-theme': isPsychologistRoute }">
    <el-aside width="200px" class="aside">
      <div class="logo">
        <span>管理后台</span>
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/home">
            <el-icon><HomeFilled /></el-icon>
            <span>返回首页</span>
        </el-menu-item>

        <!-- 超级管理员 (Role 4) - 仅在 /admin 路径下显示 -->
        <template v-if="role === 4 && isAdminRoute">
             <el-menu-item index="/admin/dashboard">
                <el-icon><DataBoard /></el-icon>
                <span>工作概览</span>
             </el-menu-item>
             <el-menu-item index="/admin/hospitals">
                <el-icon><School /></el-icon>
                <span>医院管理</span>
             </el-menu-item>
             <el-menu-item index="/admin/users">
                <el-icon><UserFilled /></el-icon>
                <span>用户管理</span>
             </el-menu-item>
             <el-menu-item index="/admin/psychologist">
                <el-icon><Service /></el-icon>
                <span>心理咨询师管理</span>
             </el-menu-item>
             <el-menu-item index="/admin/psychologist-fields">
                <el-icon><Collection /></el-icon>
                <span>擅长领域管理</span>
             </el-menu-item>
             <el-menu-item index="/admin/psychologist-qualifications">
                <el-icon><Medal /></el-icon>
                <span>资质管理</span>
             </el-menu-item>
             <el-menu-item index="/admin/psychologist/audit">
                <el-icon><DocumentChecked /></el-icon>
                <span>资料审核</span>
             </el-menu-item>
             <el-sub-menu index="/admin/content">
                <template #title>
                    <el-icon><Reading /></el-icon>
                    <span>内容管理</span>
                </template>
                <el-menu-item index="/admin/content/articles">心理文章</el-menu-item>
                <el-menu-item index="/admin/content/courses">心理课程</el-menu-item>
                <el-menu-item index="/admin/content/assessments">心理测评</el-menu-item>
                <el-menu-item index="/admin/content/books">心理书籍</el-menu-item>
                <el-menu-item index="/admin/system/quotes">每日语录</el-menu-item>
               <el-menu-item index="/admin/content/tag">标签管理</el-menu-item>
               <el-menu-item index="/admin/content/audit">审核管理</el-menu-item>
             </el-sub-menu>
             <el-menu-item index="/admin/system/platform-income">
                <el-icon><ChatLineSquare /></el-icon>
                <span>平台收入</span>
             </el-menu-item>

             <el-menu-item index="/admin/complaints">
                <el-icon><Warning /></el-icon>
                <span>投诉审核</span>
             </el-menu-item>
          <el-menu-item index="/admin/meme">
            <el-icon><Warning /></el-icon>
            <span>热梗管理</span>
          </el-menu-item>

        </template>

        <!-- Hospital Admin (Role 3) - 仅在 /hospital 路径下显示 -->
        <template v-if="role === 3 && isHospitalRoute">
             <el-menu-item index="/hospital/dashboard">
                <el-icon><DataBoard /></el-icon>
                <span>工作概览</span>
             </el-menu-item>
             <el-menu-item index="/hospital/doctors">
                <el-icon><User /></el-icon>
                <span>医生管理</span>
             </el-menu-item>
             <el-menu-item index="/hospital/departments">
                <el-icon><OfficeBuilding /></el-icon>
                <span>科室管理</span>
             </el-menu-item>
             <el-menu-item index="/hospital/feedbacks">
                <el-icon><ChatDotSquare /></el-icon>
                <span>咨询反馈管理</span>
             </el-menu-item>
             <el-menu-item index="/hospital/complaints">
                <el-icon><Warning /></el-icon>
                <span>投诉管理</span>
             </el-menu-item>
             <el-menu-item index="/admin/content/articles">
                <el-icon><Reading /></el-icon>
                <span>心理文章管理</span>
             </el-menu-item>
        </template>

        <!-- Doctor (Role 2) - 仅在 /doctor 路径下显示 -->
        <template v-if="role === 2 && isDoctorRoute">
             <el-menu-item index="/doctor/dashboard">
                <el-icon><DataBoard /></el-icon>
                <span>工作概览</span>
             </el-menu-item>
             <el-menu-item index="/doctor/workbench">
                <el-icon><Setting /></el-icon>
                <span>工作台</span>
             </el-menu-item>
             <el-menu-item index="/doctor/schedule">
                <el-icon><Calendar /></el-icon>
                <span>排班管理</span>
             </el-menu-item>
             <el-menu-item index="/doctor/patients">
                <el-icon><Files /></el-icon>
                <span>患者档案</span>
             </el-menu-item>
        </template>

        <!-- 心理咨询师入口 - 仅在 /psychologist-admin 路径下显示 -->
        <template v-if="isPsychologist && isPsychologistRoute">
          <el-menu-item index="/psychologist-admin/workbench">
            <el-icon><DataBoard /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          <el-menu-item index="/psychologist-admin/schedule">
            <el-icon><Calendar /></el-icon>
            <span>排班管理</span>
          </el-menu-item>
          <el-menu-item index="/psychologist-admin/appointments">
            <el-icon><Files /></el-icon>
            <span>预约管理</span>
          </el-menu-item>
          <el-menu-item index="/psychologist-admin/income">
            <el-icon><Money /></el-icon>
            <span>收入管理</span>
          </el-menu-item>
          <el-menu-item index="/psychologist-admin/chat">
            <el-icon><ChatDotRound /></el-icon>
            <span>在线咨询</span>
          </el-menu-item>
          <el-menu-item index="/psychologist-admin/profile">
            <el-icon><UserFilled /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
        </template>

      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="breadcrumb">
            <!-- Breadcrumb placeholder -->
        </div>
        <div class="user-info">
            <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                    <el-avatar :size="32" :src="user.headPath" style="margin-right: 8px;">
                        <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
                    </el-avatar>
                    <span>{{ username }}</span>
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="home">返回前台</el-dropdown-item>
                        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import {
  HomeFilled, User, OfficeBuilding, DataBoard, Files,
  School, UserFilled, ArrowDown, Reading, Calendar,
  ChatDotSquare, ChatDotRound, ChatLineSquare, Warning, Setting,
  Edit, Money, Service, Collection, Medal
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const user = JSON.parse(localStorage.getItem('user') || '{}')
const username = user.nickname || '管理员'
const role = user.role || 0
const isPsychologist = user.isPsychologist === 1

// 根据路径判断菜单类型
const isPsychologistRoute = route.path.startsWith('/psychologist-admin')
const isAdminRoute = route.path.startsWith('/admin')
const isHospitalRoute = route.path.startsWith('/hospital')
const isDoctorRoute = route.path.startsWith('/doctor')

const handleCommand = (command: string) => {
    if (command === 'logout') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    } else if (command === 'home') {
        router.push('/home')
    }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}
.light-theme .el-main {
  background-color: #f5f7fa;
}
.aside {
  background-color: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #2b2f3a;
  color: #fff;
}
.el-menu-vertical {
  border-right: none;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
.user-info {
    cursor: pointer;
}
.el-dropdown-link {
    display: flex;
    align-items: center;
}

/* 心理咨询师路由 - 白色主题覆盖 */
.light-theme .psychologist-income-container,
.light-theme .psychologist-schedule-container,
.light-theme .psychologist-appointments-container,
.light-theme .psychologist-chat-container,
.light-theme .psychologist-profile-container,
.light-theme .psychologist-workbench-container {
  background-color: #f5f7fa !important;
}
</style>
