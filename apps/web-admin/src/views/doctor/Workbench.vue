<template>
  <div class="doctor-workbench">
    <el-tabs v-model="activeTab">
        <el-tab-pane label="预约管理" name="appointments">
             <div class="filter-bar" style="margin-bottom: 20px; display: flex; gap: 10px;">
                 <el-select v-model="statusFilter" placeholder="预约状态" clearable @change="fetchAppointments">
                     <el-option label="待就诊" :value="0"></el-option>
                     <el-option label="已完成" :value="1"></el-option>
                     <el-option label="已取消" :value="2"></el-option>
                     <el-option label="爽约" :value="3"></el-option>
                 </el-select>
                 <el-select v-model="typeFilter" placeholder="预约类型" clearable @change="fetchAppointments">
                     <el-option label="线下挂号" :value="0"></el-option>
                     <el-option label="线上咨询" :value="1"></el-option>
                 </el-select>
             </div>
             <el-table :data="appointments" v-loading="loadingAppt">
                 <el-table-column prop="workDate" label="日期" width="120"></el-table-column>
                 <el-table-column prop="workShift" label="班次" width="80">
                     <template #default="scope">{{ scope.row.workShift === 1 ? '上午' : scope.row.workShift === 2 ? '下午' : '晚班' }}</template>
                 </el-table-column>
                 <el-table-column prop="type" label="类型" width="100">
                     <template #default="scope">
                         <el-tag :type="scope.row.type === 1 ? 'warning' : 'info'">
                             {{ scope.row.type === 1 ? '线上咨询' : '线下挂号' }}
                         </el-tag>
                     </template>
                 </el-table-column>
                 <el-table-column prop="patientName" label="患者姓名" width="120"></el-table-column>
                 <el-table-column prop="patientPhone" label="联系电话" width="150"></el-table-column>
                 <el-table-column prop="description" label="病情描述" min-width="200" show-overflow-tooltip></el-table-column>
                 <el-table-column prop="status" label="状态" width="100">
                     <template #default="scope">
                         <el-tag v-if="scope.row.status === 0" type="primary">待就诊</el-tag>
                         <el-tag v-else-if="scope.row.status === 1" type="success">已完成</el-tag>
                         <el-tag v-else-if="scope.row.status === 2" type="info">已取消</el-tag>
                         <el-tag v-else-if="scope.row.status === 3" type="danger">爽约</el-tag>
                         <el-tag v-else type="warning">待支付</el-tag>
                     </template>
                 </el-table-column>
                 <el-table-column label="操作" min-width="400" fixed="right">
                     <template #default="scope">
                        <div class="action-buttons">
                            <el-button v-if="scope.row.status === 0 && scope.row.type === 1" size="small" type="warning" @click="openChat(scope.row)">进入咨询</el-button>
                            <el-button v-if="scope.row.status === 0" size="small" type="primary" @click="handleComplete(scope.row)">完成就诊</el-button>
                            <el-button v-if="scope.row.status === 0" size="small" type="danger" @click="markMissed(scope.row)">标记爽约</el-button>
                            <el-button v-if="scope.row.status === 0" size="small" type="info" @click="handleReschedule(scope.row)">退回改期</el-button>
                            <el-button size="small" @click="handleHistory(scope.row)">历史记录</el-button>
                            <el-button size="small" @click="viewPatient(scope.row.patientId)">查看患者</el-button>
                        </div>
                     </template>
                 </el-table-column>
             </el-table>
        </el-tab-pane>
        <el-tab-pane label="在线咨询" name="chat">
            <div class="chat-workbench">
                <div class="chat-list">
                    <el-empty v-if="activeChats.length === 0" description="暂无进行中的线上咨询"></el-empty>
                    <div v-else v-for="chat in activeChats" :key="chat.id" class="chat-item" :class="{ active: currentChat?.id === chat.id }" @click="selectChat(chat)">
                        <el-avatar :src="chat.patientAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"></el-avatar>
                        <div class="info">
                            <div class="name">{{ chat.patientName }}</div>
                            <div class="last-msg">{{ chat.lastMessage }}</div>
                        </div>
                    </div>
                </div>
                <div class="chat-room" v-if="currentChat">
                    <div class="chat-header">
                        <span>与 {{ currentChat.patientName }} 咨询中</span>
                        <el-button type="primary" size="small" @click="handleComplete(currentChat)">结束咨询</el-button>
                    </div>
                    <div class="messages" ref="messageBox">
                        <div v-for="msg in messages" :key="msg.id" class="message-row" :class="{ 'self': msg.isSelf }">
                            <el-avatar v-if="!msg.isSelf" :src="currentChat.patientAvatar"></el-avatar>
                            <div class="message-content">
                                <div v-if="msg.type === 0" class="text-msg" v-html="getRenderedText(msg)" @click="handleMemeClick"></div>
                                <div v-if="msg.type === 1" class="image-msg">
                                    <el-image :src="msg.content" :preview-src-list="[msg.content]"></el-image>
                                </div>
                            </div>
                            <el-avatar v-if="msg.isSelf" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
                        </div>
                    </div>
                    <div class="input-area">
                        <el-upload
                            action="/api/common/upload"
                            :headers="uploadHeaders"
                            :show-file-list="false"
                            :on-success="handleChatImageUpload"
                        >
                            <el-button icon="Picture" circle></el-button>
                        </el-upload>
                        <el-input v-model="chatInput" placeholder="请输入消息..." @keyup.enter="sendChatMessage"></el-input>
                        <el-button type="primary" @click="sendChatMessage">发送</el-button>
                    </div>
                </div>
            </div>
        </el-tab-pane>
    </el-tabs>

    <!-- Appointment Detail Dialog -->
    <el-dialog v-model="detailVisible" title="预约详情" width="600px">
        <el-descriptions v-if="appointmentDetail" :column="2" border>
            <el-descriptions-item label="患者姓名">{{ appointmentDetail.patientName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ appointmentDetail.patientPhone }}</el-descriptions-item>
            <el-descriptions-item label="就诊日期">{{ appointmentDetail.workDate }}</el-descriptions-item>
            <el-descriptions-item label="班次">{{ appointmentDetail.workShift === 1 ? '上午' : '下午' }}</el-descriptions-item>
            <el-descriptions-item label="挂号费">¥ {{ appointmentDetail.fee }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ getStatusText(appointmentDetail.status) }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">{{ appointmentDetail.description }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="appointmentDetail?.medicalRecord" class="medical-record-info" style="margin-top: 20px;">
            <h3>就诊记录</h3>
            <el-descriptions :column="1" border>
                <el-descriptions-item label="科室">{{ appointmentDetail.medicalRecord.department }}</el-descriptions-item>
                <el-descriptions-item label="诊断">{{ appointmentDetail.medicalRecord.symptoms }}</el-descriptions-item>
                <el-descriptions-item label="备注">{{ appointmentDetail.medicalRecord.remarks }}</el-descriptions-item>
                <el-descriptions-item label="病历图片">
                    <div class="image-list">
                        <el-image 
                            v-for="img in appointmentDetail.medicalRecord.images" 
                            :key="img" 
                            :src="img" 
                            :preview-src-list="appointmentDetail.medicalRecord.images"
                            style="width: 100px; height: 100px; margin-right: 10px; margin-bottom: 10px;"
                            fit="cover"
                        ></el-image>
                    </div>
                </el-descriptions-item>
            </el-descriptions>
        </div>
        <template #footer>
            <el-button @click="detailVisible = false">关闭</el-button>
        </template>
    </el-dialog>

    <!-- History Dialog -->
    <el-dialog v-model="historyVisible" title="历史记录" width="800px">
      <el-tabs type="border-card">
        <el-tab-pane label="历史病历">
          <el-timeline v-if="historyRecords.length > 0">
            <el-timeline-item v-for="(record, index) in historyRecords" :key="index" :timestamp="record.visitDate" placement="top">
              <el-card>
                <h4>{{ record.hospital }} - {{ record.department }}</h4>
                <p><strong>病症：</strong>{{ record.symptoms }}</p>
                <p v-if="record.remarks"><strong>备注：</strong>{{ record.remarks }}</p>
                <div v-if="record.images && record.images.length > 0" style="margin-top: 10px;">
                   <el-image 
                      v-for="img in record.images" 
                      :key="img" 
                      :src="img" 
                      :preview-src-list="record.images"
                      style="width: 80px; height: 80px; margin-right: 8px;"
                      fit="cover"
                   ></el-image>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无历史病历记录"></el-empty>
        </el-tab-pane>
        
        <el-tab-pane label="测评记录">
          <el-table :data="assessmentRecords" stripe style="width: 100%">
            <el-table-column prop="templateTitle" label="量表名称" min-width="150"></el-table-column>
            <el-table-column prop="record.createTime" label="测评时间" width="160"></el-table-column>
            <el-table-column prop="record.resultScore" label="得分" width="80"></el-table-column>
            <el-table-column prop="record.resultAnalysis" label="结果分析" show-overflow-tooltip></el-table-column>
          </el-table>
          <el-empty v-if="assessmentRecords.length === 0" description="暂无测评记录"></el-empty>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <el-button @click="historyVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Complete Appointment Dialog -->
    <el-dialog v-model="completeVisible" title="填写就诊病历" width="600px">
      <el-form :model="completeForm" label-width="100px">
        <el-form-item label="就诊科室" required>
          <el-input v-model="completeForm.department"></el-input>
        </el-form-item>
        <el-form-item label="就诊医院">
          <el-input v-model="completeForm.hospital"></el-input>
        </el-form-item>
        <el-form-item label="症状/诊断" required>
          <el-input type="textarea" v-model="completeForm.symptoms" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="病历图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :on-change="handleChange"
            :on-remove="handleRemoveImage"
            :file-list="fileList"
            :auto-upload="false"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="completeForm.remarks" :rows="2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplete" :loading="completeLoading">完成就诊</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPatients, markAppointmentMissed as markMissedApi } from '@/api/doctor'
import { 
    rescheduleAppointment, 
    sendMessage as apiSendMessage, 
    getMessageHistory 
} from '@/api/consultation'
import { getUserRecords } from '@/api/assessment'
import request from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { recognizeMemesBatch, getMemeDetail } from '@/api/meme'

const user = JSON.parse(localStorage.getItem('user') || '{}')
const doctorId = computed(() => user.id)
const router = useRouter()

const activeTab = ref('appointments')

// Appointments
const appointments = ref([])
const loadingAppt = ref(false)
const statusFilter = ref<number | undefined>(0) // Default to Pending Diagnosis
const typeFilter = ref<number | undefined>(undefined)

// Chat logic
const activeChats = ref<any[]>([])
const currentChat = ref<any>(null)
const messages = ref<any[]>([])
const chatInput = ref('')
const messageBox = ref<any>(null)
let sse: EventSource | null = null

const fetchActiveChats = () => {
    // Active chats are appointments with status 0 and type 1
    activeChats.value = appointments.value
        .filter((a: any) => a.status === 0 && a.type === 1)
        .map((a: any) => ({
            id: a.id,
            patientName: a.patientName,
            patientAvatar: a.patientAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
            lastMessage: '点击开始咨询'
        }))
}

const selectChat = async (chat: any) => {
    currentChat.value = chat
    await fetchChatHistory(chat.id)
    await runMemeRecognitionInBatches()
    setupSse(chat.id)
}

const openChat = (row: any) => {
    activeTab.value = 'chat'
    const chat = {
        id: row.id,
        patientName: row.patientName,
        patientAvatar: row.patientAvatar
    }
    selectChat(chat)
}

const setupSse = (appointmentId: number) => {
    if (sse) {
        sse.close()
    }
    const token = localStorage.getItem('token') || ''
    sse = new EventSource(`/api/consultation/message/stream/${appointmentId}?token=${encodeURIComponent(token)}`)
    sse.onmessage = async (e) => {
        try {
            const m = JSON.parse(e.data)
            if (m.senderId === doctorId.value) return
            messages.value.push({ id: m.id, content: m.content, type: m.type, isSelf: false })
            if (m.type === 0) {
                try {
                    const res:any = await recognizeMemesBatch([m.content])
                    if (res.code === 200 && res.data && res.data[0] && res.data[0].length) {
                        memeMatches.value[m.id] = res.data[0]
                    }
                } catch {}
            }
            scrollToBottom()
        } catch {}
    }
}

const fetchChatHistory = async (appointmentId: number) => {
    try {
        const res = await getMessageHistory(appointmentId)
        if (res.code === 200) {
            messages.value = res.data.map((m: any) => ({
                id: m.id,
                content: m.content,
                type: m.type,
                isSelf: m.senderId === doctorId.value
            }))
            scrollToBottom()
        }
    } catch (e) {
        ElMessage.error('获取聊天历史失败')
    }
}

const sendChatMessage = async () => {
    if (!chatInput.value || !currentChat.value) return
    try {
        const res = await apiSendMessage({
            appointmentId: currentChat.value.id,
            content: chatInput.value,
            type: 0 // Text
        })
        if (res.code === 200) {
            messages.value.push({
                id: Date.now(),
                content: chatInput.value,
                type: 0,
                isSelf: true
            })
            chatInput.value = ''
            scrollToBottom()
        }
    } catch (e) {
        ElMessage.error('发送失败')
    }
}

const handleChatImageUpload = async (res: any) => {
    if (res.code === 200 && currentChat.value) {
        const imageUrl = res.data
        try {
            await apiSendMessage({
                appointmentId: currentChat.value.id,
                content: imageUrl,
                type: 1 // Image
            })
            messages.value.push({
                id: Date.now(),
                content: imageUrl,
                type: 1,
                isSelf: true
            })
            scrollToBottom()
        } catch (e) {
            ElMessage.error('图片发送失败')
        }
    }
}

const scrollToBottom = () => {
    nextTick(() => {
        if (messageBox.value) {
            messageBox.value.scrollTop = messageBox.value.scrollHeight
        }
    })
}

const handleReschedule = async (row: any) => {
    // Reschedule requires picking a new schedule. 
    // For simplicity, let's open a dialog or pick next available.
    // Here we'll just show an example of calling the API if we had the newScheduleId.
    ElMessageBox.prompt('请输入新的排班ID进行改期（实际应从列表选择）', '退回改期', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    }).then(async (action) => {
        const value = (action as any).value
        if (!value) return
        try {
            const res = await rescheduleAppointment(row.id, parseInt(value))
            if (res.code === 200) {
                ElMessage.success('已成功退回并改期')
                fetchAppointments()
            } else {
                ElMessage.error(res.message)
            }
        } catch (e) {
            ElMessage.error('改期失败')
        }
    })
}

// Detail view
const detailVisible = ref(false)
const appointmentDetail = ref<any>(null)

// History logic
const historyVisible = ref(false)
const historyRecords = ref<any[]>([])
const assessmentRecords = ref<any[]>([])

const handleHistory = async (_row: any) => {
    if (!_row.patientContactId) return
    historyVisible.value = true
    
    // 获取历史病历
    try {
        const res = await request.get(`/medical-record/list/${_row.patientContactId}`) as any
        if (res.code === 200) {
            historyRecords.value = res.data
        }
    } catch (e) {
        ElMessage.error('获取历史病历失败')
    }
    
    // 获取测评记录
    try {
        const res = await getUserRecords({ patientContactId: _row.patientContactId, size: 50 })
        if (res.code === 200) {
            assessmentRecords.value = res.data.records
        }
    } catch (e) {
        console.error('获取测评记录失败', e)
    }
}

const getStatusText = (status: number) => {
  const map: any = { 0: '待就诊', 1: '已完成', 2: '已取消', 3: '爽约', 4: '待支付' }
  return map[status] || '未知'
}

const fetchAppointments = async () => {
    loadingAppt.value = true
    try {
        const res = await request.get('/consultation/doctor/appointments', {
            params: { 
                status: statusFilter.value,
                type: typeFilter.value
            }
        }) as any
        if (res.code === 200) {
            appointments.value = res.data.records
            fetchActiveChats()
        }
    } catch (e) {} finally {
        loadingAppt.value = false
    }
}

// Complete Appointment logic
const completeVisible = ref(false)
const completeLoading = ref(false)
const fileList = ref<any[]>([])
const completeForm = reactive<any>({
    id: null,
    symptoms: '',
    department: '',
    hospital: '',
    remarks: '',
    images: []
})

const uploadHeaders = computed(() => {
    return {
        token: localStorage.getItem('token') || ''
    }
})

const memeMatches = ref<Record<number, Array<{id:number, meme:string}>>>({})

const escapeHtml = (str:string) => str.replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s] as string))

const getRenderedText = (msg:any) => {
    let text = escapeHtml(msg.content || '')
    const matches = memeMatches.value[msg.id] || []
    for (const m of matches) {
        const safe = m.meme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const re = new RegExp(safe, 'g')
        text = text.replace(re, `<span class="meme-link" data-id="${m.id}">${escapeHtml(m.meme)}</span>`)
        }
    return text
}

const handleMemeClick = async (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target && target.classList.contains('meme-link')) {
        const id = Number(target.getAttribute('data-id'))
        try {
            const res:any = await getMemeDetail(id)
            if (res.code === 200) {
                const explain = res.data.explain || '暂无解释'
                // 将字面量 \n 转换为真正的换行，然后在每个换行后添加两个全角空格（段首缩进）
                const formattedExplain = explain.replace(/\\n/g, '\n').replace(/\n/g, '<br>    ')
                ElMessageBox.alert(
                    `<div style="white-space: pre-wrap; line-height: 1.8;">  ${formattedExplain}</div>`,
                    res.data.meme || '热梗',
                    {
                        confirmButtonText: '关闭',
                        dangerouslyUseHTMLString: true
                    }
                )
            }
        } catch {}
    }
}

const runMemeRecognitionInBatches = async () => {
    const texts = messages.value.filter((m:any)=>m.type===0).map((m:any)=>({msg:m, text:m.content}))
    for (let i=0;i<texts.length;i+=5) {
        const slice = texts.slice(i,i+5)
        try {
            const res:any = await recognizeMemesBatch(slice.map(s=>s.text))
            if (res.code === 200) {
                const results = res.data
                slice.forEach((s, idx) => {
                    const matches = results[idx] || []
                    if (matches && matches.length) {
                        memeMatches.value[s.msg.id] = matches
                    }
                })
            }
        } catch {}
    }
}

const handleComplete = (row: any) => {
    Object.assign(completeForm, {
        id: row.id,
        symptoms: row.description || '',
        department: '',
        hospital: row.hospitalName || '',
        remarks: '',
        images: []
    })
    fileList.value = []
    completeVisible.value = true
}

const handleUploadError = (error: any) => {
  let message = '上传失败'
  try {
    const response = JSON.parse(error.message)
    message = response.message || message
  } catch (e) {
    if (error.message && error.message.includes('400')) {
       message = '文件上传异常,文件不能超过3MB' // Fallback if backend JSON is not parsed by axios error
    }
  }
  ElMessage.error(message)
}

const beforeUpload = (file: any) => {
  const isLt3M = file.size / 1024 / 1024 < 3
  if (!isLt3M) {
    ElMessage.error('上传头像图片大小不能超过 3MB!')
    return false
  }
  fileList.value.push(file)
  return false // Prevent auto upload
}

const handleChange = (uploadFile: any, uploadFiles: any[]) => {
   fileList.value = uploadFiles
   if (uploadFile.size / 1024 / 1024 > 3) {
     ElMessage.error('上传图片大小不能超过 3MB!')
     const idx = fileList.value.indexOf(uploadFile)
     if (idx > -1) fileList.value.splice(idx, 1)
   }
}

const handleRemoveImage = (file: any) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'medical-record')
    return request.post('/common/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

const submitComplete = async () => {
    if (!completeForm.symptoms || !completeForm.department) {
        ElMessage.warning('请填写症状和科室')
        return
    }
    
    // Upload pending files
    const pendingFiles = fileList.value.filter((f: any) => f.raw)
    const newImageUrls: string[] = []
    
    if (pendingFiles.length > 0) {
        const loadingMsg = ElMessage({
            message: '正在上传图片...',
            type: 'info',
            duration: 0
        })
        try {
            for (const file of pendingFiles) {
                const res = await uploadFile(file.raw) as any
                if (res.code === 200) {
                    newImageUrls.push(res.data)
                } else {
                    throw new Error(res.message || '上传失败')
                }
            }
            loadingMsg.close()
        } catch (e: any) {
            loadingMsg.close()
            ElMessage.error(e.message || '图片上传失败')
            return
        }
    }
    
    completeForm.images = newImageUrls
    
    completeLoading.value = true
    try {
        const res = await request.post('/consultation/appointment/complete', completeForm) as any
        if (res.code === 200) {
            ElMessage.success('就诊已完成')
            completeVisible.value = false
            fetchAppointments()
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
        ElMessage.error('操作失败')
    } finally {
        completeLoading.value = false
    }
}

const markMissed = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认标记为爽约吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })

    await markMissedApi(row.id)
    ElMessage.success('已标记为爽约')
    fetchAppointments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '标记爽约失败')
    }
  }
}

// Patients
const patients = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchPatients = async () => {
  loading.value = true
  try {
    const res = await getMyPatients({ page: currentPage.value, size: pageSize.value })
    if (res.code === 200) {
      patients.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const viewPatient = (id: number) => {
  router.push(`/doctor/patient/${id}`)
}

watch(activeTab, (val) => {
    if (val === 'appointments') fetchAppointments()
    else fetchPatients()
})

onMounted(() => {
  fetchAppointments()
})

onUnmounted(() => {
  if (sse) sse.close()
})
</script>

<style scoped>
.doctor-workbench {
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 5px;
  justify-content: flex-start;
  flex-wrap: nowrap;
}

.chat-workbench {
    height: 600px;
    display: flex;
    border: 1px solid #e4e7ed;
}
.chat-list {
    width: 250px;
    border-right: 1px solid #e4e7ed;
    overflow-y: auto;
}
.chat-item {
    display: flex;
    padding: 10px;
    gap: 10px;
    cursor: pointer;
}
.chat-item.active {
    background: #f0f2f5;
}
.chat-item .info {
    flex: 1;
    overflow: hidden;
}
.chat-item .name {
    font-weight: bold;
    font-size: 14px;
}
.chat-item .last-msg {
    font-size: 12px;
    color: #909399;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.chat-room {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.chat-header {
    padding: 10px 20px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f5f7fa;
}
.message-row {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}
.message-row.self {
    flex-direction: row-reverse;
}
.message-content {
    max-width: 60%;
}
.text-msg {
    background: #fff;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.self .text-msg {
    background: #95d475;
}
:deep(.meme-link) {
    /* background: #fde2e2; */
    color: #f56c6c;
    cursor: pointer;
    padding: 0 4px;
    border-radius: 4px;
    font-weight: bold;
    text-decoration: underline;
    text-decoration-style: dashed;
}
.input-area {
    padding: 10px 20px;
    border-top: 1px solid #e4e7ed;
    display: flex;
    gap: 10px;
}
</style>
