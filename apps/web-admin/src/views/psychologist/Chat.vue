<template>
  <div class="psychologist-chat-container">
    <div class="chat-layout">
      <!-- 用户列表 -->
      <div class="user-list">
        <div class="list-header">
          <h3>咨询用户</h3>
          <span class="user-count" v-if="chatUsers.length > 0">{{ chatUsers.length }} 个会话</span>
        </div>
        <div v-loading="loadingList" class="list-content">
          <div 
            v-for="user in chatUsers" 
            :key="user.appointmentId"
            class="user-item"
            :class="{ active: activeUser?.appointmentId === user.appointmentId, unread: user.unreadCount > 0 }"
            @click="selectUser(user)"
          >
            <el-avatar :size="48" :src="user.userHead">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="user-info">
              <span class="user-name">{{ user.userName || '匿名用户' }}</span>
              <span class="last-msg">{{ user.lastMessage || '暂无消息' }}</span>
            </div>
            <div class="user-meta">
              <span class="last-time">{{ user.lastTime || '' }}</span>
              <el-badge :value="user.unreadCount" :hidden="user.unreadCount === 0" />
            </div>
          </div>
          <el-empty v-if="chatUsers.length === 0 && !loadingList" description="暂无咨询用户" />
        </div>
      </div>

      <!-- 聊天窗口 -->
      <div class="chat-window" v-if="activeUser">
        <div class="chat-header">
          <el-avatar :size="40" :src="activeUser.userHead">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="chat-user-info">
            <span class="user-name">{{ activeUser.userName || '用户' }}</span>
            <span class="user-appointment">
              <el-tag size="small" :type="getServiceTypeTag(activeUser.serviceType)">
                {{ getServiceTypeName(activeUser.serviceType) }}
              </el-tag>
            </span>
          </div>
          <div class="connection-indicator" :class="{ connected: isConnected }">
            <span class="dot"></span>
            {{ isConnected ? '在线' : '连接中' }}
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div v-if="loadingMessages" class="loading-messages">
            <el-icon class="is-loading"><Loading /></el-icon>
            加载消息中...
          </div>
          <div v-else-if="messages.length === 0" class="empty-messages">
            开始与用户对话吧
          </div>
          <div v-else class="message-list">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-item"
              :class="{ 'message-self': msg.isSelf }"
            >
              <!-- 头像 -->
              <el-avatar :size="40" :src="msg.isSelf ? '' : activeUser.userHead" class="message-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <!-- 消息内容 -->
              <div class="message-bubble-wrapper">
                <!-- 文本消息 -->
                <div v-if="msg.contentType === 0 || !msg.contentType" class="message-bubble">
                  <p class="message-content">{{ msg.content }}</p>
                </div>
                <!-- 图片消息 -->
                <div v-else-if="msg.contentType === 1" class="message-bubble image-bubble">
                  <el-image
                    :src="msg.content"
                    :preview-src-list="[msg.content]"
                    fit="cover"
                    class="message-image"
                  />
                </div>
                <!-- 系统消息 -->
                <div v-else-if="msg.contentType === 2" class="system-message">
                  {{ msg.content }}
                </div>
                <span class="message-time">{{ formatTime(msg.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片预览 -->
        <div v-if="previewImage" class="image-preview-bar">
          <div class="preview-item">
            <el-image :src="previewImage" fit="cover" class="preview-img" />
            <el-icon class="preview-close" @click="removePreview"><Close /></el-icon>
          </div>
        </div>

        <div class="message-input">
          <!-- 图片上传 - 仅在允许发送状态时启用 -->
          <el-upload
            :action="uploadUrl"
            :headers="{ Authorization: `Bearer ${token}` }"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-success="handleImageSuccess"
            :on-error="handleImageError"
            accept="image/*"
            :disabled="!canSend"
          >
            <el-button text class="upload-btn" :class="{ disabled: !canSend }">
              <el-icon><Picture /></el-icon>
            </el-button>
          </el-upload>

          <el-input
            v-model="messageInput"
            :placeholder="getInputPlaceholder()"
            @keyup.enter="sendTextMessage"
            :disabled="!canSend || sending"
            class="message-input-field"
          >
          </el-input>
          <el-button
            type="primary"
            @click="sendTextMessage"
            :disabled="!canSend || sending"
            :loading="sending"
            class="send-btn"
          >
            <el-icon v-if="!sending"><Promotion /></el-icon>
            {{ sending ? '发送中' : '发送' }}
          </el-button>
        </div>
      </div>

      <div class="chat-empty" v-else>
        <div class="empty-state">
          <span class="empty-icon">💬</span>
          <p>选择一个用户开始聊天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Promotion, Picture, Loading, Close } from '@element-plus/icons-vue'
import { getConversations, getMessageHistory, sendMessage, sendImageMessage } from '@/api/psychologist'
import { getMyPsychologistProfile } from '@/api/psychologistAdminPage'

// 状态
const loadingList = ref(false)
const loadingMessages = ref(false)
const chatUsers = ref<any[]>([])
const activeUser = ref<any>(null)
const messages = ref<any[]>([])
const messageInput = ref('')
const messagesContainer = ref<any>(null)
const sending = ref(false)
const isConnected = ref(false)
const previewImage = ref('')
const previewFile = ref<File | null>(null)
const currentUserId = ref<number>(0)
const psychologistId = ref<number>(0)  // 心理咨询师ID

// SSE连接
let eventSource: EventSource | null = null

// 配置
const token = localStorage.getItem('token') || ''
const baseApiUrl = import.meta.env.VITE_API_BASE_URL || ''
const uploadUrl = baseApiUrl ? baseApiUrl + '/common/upload' : '/api/common/upload'

// 计算属性 - 图文咨询状态限制
const canSend = computed(() => {
  // 检查是否有消息内容
  if (!messageInput.value.trim() && !previewImage.value) return false
  if (sending.value) return false

  // 检查预约状态 - 不允许在已完成、已取消、已评价状态下发送消息
  // 允许的状态：0-待审核、1-已确认、3-进行中、7-待进行
  if (activeUser.value?.status !== undefined) {
    const allowedStatuses = [0, 1, 3, 7]
    if (!allowedStatuses.includes(activeUser.value.status)) {
      return false
    }
  }

  return true
})

// 初始化
onMounted(async () => {
  // 获取当前用户ID
  const userInfo = localStorage.getItem('user')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      currentUserId.value = user.id
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }

  // 获取心理咨询师ID
  try {
    const profileRes: any = await getMyPsychologistProfile()
    if (profileRes.code === 200 && profileRes.data) {
      // 后端返回的数据结构是 { psychologistId, psychologist }
      psychologistId.value = profileRes.data.psychologistId
      console.log('获取到psychologistId:', psychologistId.value)
      // 获取到ID后再获取对话列表
      fetchConversations()
    } else {
      console.error('获取咨询师信息失败: 未找到数据', profileRes)
    }
  } catch (e) {
    console.error('获取咨询师信息失败', e)
  }
})

// 组件卸载
onUnmounted(() => {
  disconnectSSE()
})

// 获取对话列表
const fetchConversations = async () => {
  loadingList.value = true
  try {
    const res: any = await getConversations()
    if (res.code === 200 && res.data) {
      chatUsers.value = res.data.map((item: any) => ({
        appointmentId: item.appointmentId,
        userId: item.userId,
        userName: '用户', // 后续可从用户信息接口获取
        userHead: '', // 后续可从用户信息接口获取
        serviceType: item.serviceType,
        lastMessage: item.userProblems || '暂无消息',
        lastTime: item.createTime ? formatDate(item.createTime) : '',
        unreadCount: 0,
        status: item.status, // 预约状态
        appointmentInfo: `${item.serviceType} - ¥${item.fee || 0}`
      }))
    }
  } catch (e) {
    console.error('获取对话列表失败', e)
    ElMessage.error('获取对话列表失败')
  } finally {
    loadingList.value = false
  }
}

// 选择用户
const selectUser = async (user: any) => {
  // 断开之前的SSE连接
  disconnectSSE()

  activeUser.value = user
  user.unreadCount = 0
  messages.value = []

  // 加载消息历史
  await loadMessages()

  // 确保psychologistId已获取后再连接SSE
  if (!psychologistId.value) {
    console.warn('等待获取psychologistId...')
    // 等待一段时间后重试
    setTimeout(() => {
      if (psychologistId.value) {
        connectSSE()
      }
    }, 1000)
  } else {
    // 连接SSE
    connectSSE()
  }
}

// 加载消息历史
const loadMessages = async () => {
  if (!activeUser.value) return

  loadingMessages.value = true
  try {
    const res: any = await getMessageHistory(activeUser.value.appointmentId)
    if (res.code === 200 && res.data) {
      messages.value = res.data.map((msg: any) => ({
        ...msg,
        isSelf: msg.senderId === currentUserId.value
      }))
    }
  } catch (e) {
    console.error('加载消息失败', e)
    ElMessage.error('加载消息失败')
  } finally {
    loadingMessages.value = false
    nextTick(() => scrollToBottom())
  }
}

// 连接SSE
const connectSSE = () => {
  // 检查必要参数
  if (!psychologistId.value) {
    console.warn('psychologistId 未获取，等待中...')
    return
  }
  if (!activeUser.value) {
    console.warn('activeUser 未选择，等待中...')
    return
  }
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  // 构建SSE URL - 使用 /api 前缀以便vite代理转发
  const psyId = psychologistId.value
  const encodedToken = encodeURIComponent(token)
  const sseUrl = '/api/psychologist/message/stream/psychologist/' + psyId + '?token=' + encodedToken

  console.log('连接SSE:', sseUrl)

  eventSource = new EventSource(sseUrl)

  // 连接打开时设置状态
  eventSource.onopen = () => {
    console.log('SSE连接已建立')
    isConnected.value = true
  }

  // 使用 addEventListener 监听特定事件
  eventSource.addEventListener('connected', (event: MessageEvent) => {
    console.log('SSE连接确认:', event.data)
    isConnected.value = true
  })

  // 处理所有消息
  eventSource.onmessage = (event: MessageEvent) => {
    try {
      const eventData = event.data
      if (!eventData || eventData === '') {
        return
      }
      const messageData = JSON.parse(String(eventData))
      console.log('收到SSE消息:', messageData)

      // 跳过连接确认消息
      if (messageData.type === 'connected') {
        isConnected.value = true
        return
      }

      // 只处理当前对话的消息
      if (messageData.appointmentId === activeUser.value?.appointmentId) {
        // 去重
        if (messageData.id) {
          const exists = messages.value.some(m => m.id === messageData.id)
          if (!exists) {
            const newMsg = {
              ...messageData,
              isSelf: messageData.senderId === currentUserId.value
            }
            messages.value.push(newMsg)
            nextTick(() => scrollToBottom())
          }
        }
      }

      // 更新用户列表的最后消息
      const chatUser = chatUsers.value.find(u => u.appointmentId === messageData.appointmentId)
      if (chatUser && !messageData.isSelf) {
        chatUser.lastMessage = messageData.contentType === 1 ? '[图片]' : messageData.content
        chatUser.unreadCount++
      }
    } catch (e) {
      console.error('解析SSE消息失败', e)
    }
  }

  eventSource.onerror = (error: Event) => {
    console.error('SSE连接错误', error)
    isConnected.value = false

    // 清理连接
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }

    // 尝试重连
    setTimeout(() => {
      if (activeUser.value) {
        console.log('尝试重连SSE...')
        connectSSE()
      }
    }, 3000)
  }
}

// 断开SSE
const disconnectSSE = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
    isConnected.value = false
  }
}

// 发送文本消息
const sendTextMessage = async () => {
  if (!messageInput.value.trim() || sending.value || !activeUser.value) return

  const content = messageInput.value.trim()
  messageInput.value = ''
  sending.value = true

  try {
    const res: any = await sendMessage({
      appointmentId: activeUser.value.appointmentId,
      receiverId: activeUser.value.userId,
      content: content,
      contentType: 0
    })

    if (res.code === 200) {
      console.log('消息发送成功')
    }
  } catch (e: any) {
    console.error('发送消息失败', e)
    ElMessage.error('发送消息失败')
    messageInput.value = content
  } finally {
    sending.value = false
  }
}

// 图片上传相关
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  previewFile.value = file

  return false
}

const handleImageSuccess = async (res: any) => {
  if (res.code === 200 && res.data) {
    await sendPicMessage(res.data)
  }
}

const handleImageError = () => {
  ElMessage.error('图片上传失败')
  removePreview()
}

// 发送图片消息
const sendPicMessage = async (imageUrl: string) => {
  if (!activeUser.value) return

  sending.value = true
  try {
    const res: any = await sendImageMessage({
      appointmentId: activeUser.value.appointmentId,
      receiverId: activeUser.value.userId,
      imageUrl: imageUrl
    })

    if (res.code === 200) {
      removePreview()
      console.log('图片消息发送成功')
    }
  } catch (e) {
    console.error('发送图片失败', e)
    ElMessage.error('发送图片失败')
  } finally {
    sending.value = false
  }
}

// 移除预览
const removePreview = () => {
  previewImage.value = ''
  previewFile.value = null
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const d = new Date(time)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}/${day}`
}

// 服务类型映射
const serviceTypeMap: Record<string, string> = {
  'TEXT': '图文咨询',
  'VIDEO': '视频咨询',
  'VOICE': '语音咨询',
  'OFFLINE': '线下面询'
}

const getServiceTypeName = (type: string) => serviceTypeMap[type] || type || '咨询'

const getServiceTypeTag = (type: string) => {
  const map: Record<string, string> = {
    'TEXT': '',
    'VIDEO': 'success',
    'VOICE': 'warning',
    'OFFLINE': 'info'
  }
  return map[type] || ''
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 获取输入框占位符 - 根据状态显示不同提示
const getInputPlaceholder = () => {
  if (activeUser.value?.status !== undefined) {
    const allowedStatuses = [0, 1, 3, 7]
    if (!allowedStatuses.includes(activeUser.value.status)) {
      return '当前状态不允许发送消息'
    }
  }
  return '输入消息...'
}
</script>

<style scoped>
.psychologist-chat-container {
  height: calc(100vh - 120px);
  background: #fff;
  padding: 16px;
}

.chat-layout {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 用户列表 */
.user-list {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.list-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.user-count {
  font-size: 12px;
  color: #909399;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.user-item:hover {
  background: #f5f7fa;
}

.user-item.active {
  background: #ecf5ff;
  border: 1px solid #409eff;
}

.user-item.unread .user-name {
  font-weight: 600;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  display: block;
  color: #303133;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-msg {
  display: block;
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.last-time {
  font-size: 11px;
  color: #c0c4cc;
}

/* 聊天窗口 */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.chat-user-info {
  flex: 1;
}

.chat-user-info .user-name {
  display: block;
  color: #303133;
  font-weight: 600;
  font-size: 15px;
}

.user-appointment {
  display: block;
  margin-top: 4px;
}

.connection-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

.connection-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c0c4cc;
}

.connection-indicator.connected {
  color: #67c23a;
}

.connection-indicator.connected .dot {
  background: #67c23a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 消息区域 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  color: #909399;
}

.empty-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 80%;
  margin-bottom: 16px;
}

.message-avatar {
  flex-shrink: 0;
}

/* 对方消息：头像在左，消息在右 */
.message-item {
  flex-direction: row;
}

/* 自己消息：头像在右，消息在左 */
.message-self {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-bubble {
  max-width: 100%;
  padding: 10px 14px;
  background: #fff;
  border-radius: 12px;
  border-top-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-self .message-bubble {
  background: #409eff;
  color: #fff;
  border-top-left-radius: 12px;
  border-top-right-radius: 4px;
}

.message-content {
  margin: 0;
  color: #303133;
  line-height: 1.5;
  word-break: break-word;
}

.message-self .message-content {
  color: #fff;
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
}

.image-bubble {
  padding: 4px;
  background: transparent !important;
  box-shadow: none !important;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.system-message {
  padding: 8px 16px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 8px;
  color: #409eff;
  font-size: 13px;
  text-align: center;
}

.self-avatar {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
}

/* 图片预览 */
.image-preview-bar {
  padding: 8px 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.preview-item {
  position: relative;
  display: inline-block;
}

.preview-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-close {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 输入区域 */
.message-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.upload-btn {
  font-size: 20px;
  color: #909399;
}

.upload-btn:hover {
  color: #409eff;
}

.upload-btn.disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.message-input-field {
  flex: 1;
}

.send-btn {
  padding: 8px 16px;
}

/* 空状态 */
.chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
