<template>
  <div class="psychologist-appointments-container">
    <div class="page-header">
      <h1 class="page-title">预约管理</h1>
    </div>

    <el-tabs v-model="statusFilter" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待审核" name="0" />
      <el-tab-pane label="已确认" name="1" />
      <el-tab-pane label="已拒绝" name="2" />
      <el-tab-pane label="进行中" name="3" />
      <el-tab-pane label="已完成" name="4" />
      <el-tab-pane label="已取消" name="5" />
      <el-tab-pane label="待进行" name="7" />
      <el-tab-pane label="已评价" name="8" />
    </el-tabs>

    <div v-loading="loading" class="appointments-list">
      <el-empty v-if="appointments.length === 0 && !loading" description="暂无预约记录" />

      <div v-else class="appointment-cards">
        <div 
          v-for="item in appointments"
          :key="item.id"
          class="appointment-card"
        >
          <div class="card-header">
            <div class="user-info">
              <el-avatar :size="48" :src="item.userHead">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="info-text">
                <span class="user-name">{{ item.userName || '匿名用户' }}</span>
                <span class="appointment-time">{{ formatDateTime(item.createTime) }}</span>
              </div>
            </div>
            <el-tag :type="getStatusType(item.status)">{{ item.statusText || getStatusName(item.status) }}</el-tag>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">咨询方式：</span>
              <span class="value">{{ getServiceTypeName(item.serviceType) }}</span>
            </div>
            <div class="info-row">
              <span class="label">预约时间：</span>
              <span class="value">{{ formatDateTime(item.appointmentTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">咨询费用：</span>
              <span class="value price">{{ item.fee ? `¥${item.fee}` : '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">用户问题：</span>
              <span class="value problem">{{ item.userBasicInfo?.problems || '-' }}</span>
            </div>
            <div class="info-row" v-if="item.rejectReason">
              <span class="label">拒绝原因：</span>
              <span class="value">{{ item.rejectReason }}</span>
            </div>
            <div class="info-row" v-if="item.videoLink">
              <span class="label">视频链接：</span>
              <el-link type="primary" :href="item.videoLink" target="_blank">{{ item.videoLink }}</el-link>
            </div>
            <div class="info-row" v-if="item.startTime">
              <span class="label">开始时间：</span>
              <span class="value">{{ formatDateTime(item.startTime) }}</span>
            </div>
            <div class="info-row" v-if="item.endTime">
              <span class="label">结束时间：</span>
              <span class="value">{{ formatDateTime(item.endTime) }}</span>
            </div>
            <div class="info-row" v-if="item.ratingScore">
              <span class="label">用户评分：</span>
              <el-rate v-model="item.ratingScore" disabled show-score />
            </div>
            <div class="info-row" v-if="item.ratingContent">
              <span class="label">评价内容：</span>
              <span class="value">{{ item.ratingContent }}</span>
            </div>
          </div>

          <div class="card-footer">
            <template v-if="item.status === 0">
              <el-button type="primary" size="small" @click="showConfirmDialog(item)">
                <el-icon><CircleCheck /></el-icon>
                接受预约
              </el-button>
              <el-button type="danger" size="small" @click="showRejectDialog(item)">
                <el-icon><Close /></el-icon>
                拒绝预约
              </el-button>
            </template>
            <template v-else-if="item.status === 1">
              <el-button type="success" size="small" @click="showVideoLinkDialog(item)">
                <el-icon><VideoCamera /></el-icon>
                发送视频/地址
              </el-button>
              <el-button type="primary" size="small" @click="openChat(item)">
                <el-icon><ChatDotRound /></el-icon>
                图文咨询
              </el-button>
            </template>
            <template v-else-if="item.status === 7">
              <el-button type="warning" size="small" @click="showStartDialog(item)">
                <el-icon><VideoPlay /></el-icon>
                开始咨询
              </el-button>
              <el-button type="primary" size="small" @click="openChat(item)">
                <el-icon><ChatDotRound /></el-icon>
                图文咨询
              </el-button>
            </template>
            <template v-else-if="item.status === 3">
              <el-button type="success" size="small" @click="completeConsultation(item)">
                <el-icon><CircleCheck /></el-icon>
                完成咨询
              </el-button>
              <el-button type="primary" size="small" @click="openChat(item)">
                <el-icon><ChatDotRound /></el-icon>
                图文咨询
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="small" @click="showDetailDialog(item)">查看详情</el-button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="fetchAppointments"
      />
    </div>

    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="预约详情"
      width="650px"
      class="detail-dialog"
    >
      <div v-if="detailLoading" class="detail-loading">加载中...</div>
      <div v-else-if="detailData" class="detail-content">
        <!-- 用户信息 -->
        <div class="detail-section">
          <h3 class="section-title">用户信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">用户昵称</span>
              <span class="info-value">{{ detailData.userName || '匿名用户' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">用户电话</span>
              <span class="info-value">{{ detailData.userPhone || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 预约信息 -->
        <div class="detail-section">
          <h3 class="section-title">预约信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">订单编号</span>
              <span class="info-value order-no">{{ detailData.orderNo || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">预约状态</span>
              <el-tag :type="getStatusType(detailData.status)">{{ detailData.statusText }}</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">咨询方式</span>
              <span class="info-value">{{ detailData.serviceTypeText }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">预约时间</span>
              <span class="info-value">{{ formatDateTime(detailData.appointmentTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">订单金额</span>
              <span class="info-value price">¥{{ detailData.fee || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">支付状态</span>
              <span class="info-value">{{ detailData.payStatusText }}</span>
            </div>
            <div class="info-item full-width" v-if="detailData.rejectReason">
              <span class="info-label">拒绝原因</span>
              <span class="info-value reject">{{ detailData.rejectReason }}</span>
            </div>
            <div class="info-item full-width" v-if="detailData.videoLink">
              <span class="info-label">视频链接</span>
              <el-link type="primary" :href="detailData.videoLink" target="_blank">{{ detailData.videoLink }}</el-link>
            </div>
            <div class="info-item full-width" v-if="detailData.offlineAddress">
              <span class="info-label">面询地址</span>
              <span class="info-value">{{ detailData.offlineAddress }}</span>
            </div>
          </div>
        </div>

        <!-- 咨询信息 -->
        <div class="detail-section">
          <h3 class="section-title">咨询信息</h3>
          <div class="info-grid">
            <div class="info-item" v-if="detailData.startTime">
              <span class="info-label">开始时间</span>
              <span class="info-value">{{ formatDateTime(detailData.startTime) }}</span>
            </div>
            <div class="info-item" v-if="detailData.endTime">
              <span class="info-label">结束时间</span>
              <span class="info-value">{{ formatDateTime(detailData.endTime) }}</span>
            </div>
            <div class="info-item" v-if="detailData.completeTime">
              <span class="info-label">完成时间</span>
              <span class="info-value">{{ formatDateTime(detailData.completeTime) }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">问题描述</span>
              <span class="info-value">{{ formatUserBasicInfo(detailData.userBasicInfo) }}</span>
            </div>
          </div>
        </div>

        <!-- 评价信息（已评价状态显示） -->
        <div class="detail-section" v-if="detailData.ratingScore">
          <h3 class="section-title">
            <el-icon class="title-icon"><Star /></el-icon>
            评价信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">评分</span>
              <span class="info-value rating">
                <el-icon><Star /></el-icon>
                {{ detailData.ratingScore }}分
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">评价时间</span>
              <span class="info-value">{{ formatDateTime(detailData.ratingTime) }}</span>
            </div>
            <div class="info-item full-width" v-if="detailData.ratingContent">
              <span class="info-label">评价内容</span>
              <span class="info-value">{{ detailData.ratingContent }}</span>
            </div>
          </div>
        </div>

        <!-- 收入信息（已评价状态显示） -->
        <div class="detail-section income-section" v-if="detailData.psychologistIncome">
          <h3 class="section-title">
            <el-icon class="title-icon"><Wallet /></el-icon>
            收入信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">订单总金额</span>
              <span class="info-value price">¥{{ detailData.totalFee || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">抽成比例</span>
              <span class="info-value commission">{{ (detailData.commissionRate * 100).toFixed(0) }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">平台抽成</span>
              <span class="info-value">¥{{ detailData.commissionAmount?.toFixed(2) || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">咨询师收入</span>
              <span class="info-value income">¥{{ detailData.psychologistIncome?.toFixed(2) || 0 }}</span>
            </div>
          </div>
          <div class="income-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>收入计算规则：评分0-1.5分抽成60%，1.5-3分抽成45%，3-4.5分抽成30%，4.5-5分抽成15%</span>
          </div>
        </div>

        <!-- 时间记录 -->
        <div class="detail-section">
          <h3 class="section-title">时间记录</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">下单时间</span>
              <span class="info-value">{{ formatDateTime(detailData.createTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间</span>
              <span class="info-value">{{ formatDateTime(detailData.updateTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝预约" width="400px">
      <el-form>
        <el-form-item label="拒绝原因" required>
          <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 接受预约对话框 -->
    <el-dialog v-model="confirmDialogVisible" title="接受预约" width="500px">
      <el-form label-width="100px">
        <el-form-item label="咨询方式">
          <span>{{ getServiceTypeName(currentAppointment?.serviceType) }}</span>
        </el-form-item>
        <el-form-item label="预约时间">
          <span>{{ formatDateTime(currentAppointment?.appointmentTime) }}</span>
        </el-form-item>
      </el-form>
      <div class="accept-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>接受后，用户可以正常咨询。如需发送视频链接或线下地址，请到已确认状态下操作。</span>
      </div>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmAccept">确认接受</el-button>
      </template>
    </el-dialog>

    <!-- 发送视频链接/线下地址对话框 -->
    <el-dialog v-model="videoLinkDialogVisible" title="发送视频链接/线下地址" width="500px">
      <el-form label-width="100px">
        <el-form-item label="咨询方式">
          <span>{{ getServiceTypeName(currentAppointment?.serviceType) }}</span>
        </el-form-item>
        <template v-if="currentAppointment?.serviceType === 'VIDEO' || currentAppointment?.serviceType === 'video' || currentAppointment?.serviceType === 'VOICE' || currentAppointment?.serviceType === 'voice'">
          <el-form-item label="视频链接">
            <el-input v-model="videoLink" placeholder="请输入视频会议链接" />
          </el-form-item>
          <el-form-item label="会议日期">
            <span>{{ formatVideoDate }}</span>
          </el-form-item>
          <el-form-item label="时段">
            <el-tag type="warning">{{ timeSlot }}</el-tag>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-time-picker
              v-model="videoStartTime"
              placeholder="选择开始时间"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-time-picker
              v-model="videoEndTime"
              placeholder="选择结束时间"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </template>
        <template v-else-if="currentAppointment?.serviceType === 'OFFLINE' || currentAppointment?.serviceType === 'offline' || currentAppointment?.serviceType === 'OFFLINE'">
          <el-form-item label="线下地址">
            <el-input v-model="offlineAddress" type="textarea" :rows="2" placeholder="请输入线下面询地址" />
          </el-form-item>
          <el-form-item label="会议日期">
            <span>{{ formatVideoDate }}</span>
          </el-form-item>
          <el-form-item label="时段">
            <el-tag type="warning">{{ timeSlot }}</el-tag>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-time-picker
              v-model="videoStartTime"
              placeholder="选择开始时间"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-time-picker
              v-model="videoEndTime"
              placeholder="选择结束时间"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="视频链接">
            <el-input v-model="videoLink" placeholder="请输入视频会议链接（可选）" />
          </el-form-item>
          <el-form-item label="会议日期">
            <span>{{ formatVideoDate }}</span>
          </el-form-item>
          <el-form-item label="时段">
            <el-tag type="warning">{{ timeSlot }}</el-tag>
          </el-form-item>
          <el-form-item label="开始时间">
            <el-time-picker
              v-model="videoStartTime"
              placeholder="选择开始时间"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="videoLinkDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmSendVideoLink">确认发送</el-button>
      </template>
    </el-dialog>

    <!-- 开始咨询对话框 -->
    <el-dialog v-model="startDialogVisible" title="开始咨询" width="400px">
      <el-form label-width="100px">
        <el-form-item label="咨询开始时间">
          <el-date-picker
            v-model="startTime"
            type="datetime"
            placeholder="选择开始时间（可选）"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="视频链接" v-if="currentAppointment?.videoLink">
          <el-link type="primary" :href="currentAppointment?.videoLink" target="_blank">
            {{ currentAppointment?.videoLink }}
          </el-link>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="startDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmStartConsultation">开始咨询</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ChatDotRound, VideoPlay, CircleCheck, VideoCamera, Close, Star, Wallet } from '@element-plus/icons-vue'
import { getMyAppointments, handleAppointment, startConsultation, completeConsultationApi, sendVideoLink, getAppointmentDetail } from '@/api/psychologistAdminPage'

const router = useRouter()

const loading = ref(false)
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const appointments = ref<any[]>([])

// 详情弹窗
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<any>(null)

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const currentRejectItem = ref<any>(null)

// 接受预约对话框
const confirmDialogVisible = ref(false)
const confirmVideoLink = ref('')
const confirmOfflineAddress = ref('')

// 开始咨询对话框
const startDialogVisible = ref(false)
const startTime = ref('')
const currentAppointment = ref<any>(null)

// 视频链接/线下地址对话框
const videoLinkDialogVisible = ref(false)
const videoLink = ref('')
const offlineAddress = ref('')
const videoStartTime = ref('')
const videoEndTime = ref('')

const serviceTypeMap: Record<string, string> = {
  text: '图文咨询', video: '视频咨询', voice: '语音咨询', offline: '线下面询',
  TEXT: '图文咨询', VIDEO: '视频咨询', VOICE: '语音咨询', OFFLINE: '线下面询'
}

const statusMap: Record<number, string> = {
  0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 7: '待进行', 8: '已评价'
}

const getServiceTypeName = (type: string) => serviceTypeMap[type] || type
const getStatusName = (status: number) => statusMap[status] || '未知'

const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning', 1: 'info', 2: 'danger', 3: 'primary', 4: 'success', 5: 'info', 6: 'danger', 7: 'warning', 8: 'success'
  }
  return types[status] || 'info'
}

const handleTabChange = () => {
  currentPage.value = 1
  fetchAppointments()
}

const formatDateTime = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 格式化视频日期 - 从预约时间获取
const formatVideoDate = computed(() => {
  if (!currentAppointment.value?.appointmentTime) return '-'
  const d = new Date(currentAppointment.value.appointmentTime)
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// 时段判断：9点-14点为上午，14点-19点为下午，19点后为晚上
const timeSlot = computed(() => {
  if (!currentAppointment.value?.appointmentTime) return ''
  const d = new Date(currentAppointment.value.appointmentTime)
  if (isNaN(d.getTime())) return ''
  const hour = d.getHours()
  if (hour >= 9 && hour < 14) return '上午'
  if (hour >= 14 && hour < 19) return '下午'
  return '晚上'
})

// 时间选择器校验方法 - 结束时间不能早于开始时间
const isEndTimeValid = (time: string) => {
  if (!videoStartTime.value || !time) return true
  return time > videoStartTime.value
}

const fetchAppointments = () => {
  loading.value = true
  const params: any = { page: currentPage.value, size: pageSize.value }
  if (statusFilter.value !== 'all') {
    params.status = parseInt(statusFilter.value)
  }
  getMyAppointments(params).then((res: any) => {
    if (res.code === 200) {
      appointments.value = res.data?.records || []
      total.value = res.data?.total || 0
    } else {
      ElMessage.error(res.message || '获取预约列表失败')
    }
    loading.value = false
  }).catch((err: any) => {
    console.error('获取预约列表失败:', err)
    loading.value = false
  })
}

const showConfirmDialog = (item: any) => {
  currentAppointment.value = item
  confirmVideoLink.value = ''
  confirmOfflineAddress.value = ''
  confirmDialogVisible.value = true
}

const confirmAccept = async () => {
  try {
    // 接受预约后状态变为"已确认"
    // 线上咨询的视频链接由咨询师在"已确认"状态下通过"发送视频链接"功能发送
    const res: any = await handleAppointment(currentAppointment.value.id, true)
    if (res.code === 200) {
      ElMessage.success('已接受预约')
      confirmDialogVisible.value = false
      fetchAppointments()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const showRejectDialog = (item: any) => {
  currentRejectItem.value = item
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  try {
    const res: any = await handleAppointment(currentRejectItem.value.id, false, '', rejectReason.value)
    if (res.code === 200) {
      ElMessage.success('已拒绝')
      rejectDialogVisible.value = false
      fetchAppointments()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const openChat = (item: any) => {
  router.push(`/psychologist-admin/chat?appointmentId=${item.id}`)
}

const showStartDialog = (item: any) => {
  currentAppointment.value = item
  startTime.value = ''
  startDialogVisible.value = true
}

const confirmStartConsultation = async () => {
  try {
    const res: any = await startConsultation({
      appointmentId: currentAppointment.value.id,
      startTime: startTime.value || undefined
    })
    if (res.code === 200) {
      ElMessage.success('咨询已开始')
      startDialogVisible.value = false
      fetchAppointments()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const showVideoLinkDialog = (item: any) => {
  currentAppointment.value = item
  videoLink.value = item.videoLink || ''
  offlineAddress.value = ''
  videoStartTime.value = ''
  videoEndTime.value = ''
  videoLinkDialogVisible.value = true
}

const confirmSendVideoLink = async () => {
  try {
    const serviceType = currentAppointment.value?.serviceType
    let videoLinkData = ''
    let offlineAddressData = ''

    // 根据服务类型决定传递什么参数
    if (serviceType === 'VIDEO' || serviceType === 'video' || serviceType === 'VOICE' || serviceType === 'voice') {
      if (!videoLink.value.trim()) {
        ElMessage.warning('请输入视频链接')
        return
      }
      videoLinkData = videoLink.value
    } else if (serviceType === 'OFFLINE' || serviceType === 'offline') {
      if (!offlineAddress.value.trim()) {
        ElMessage.warning('请输入线下地址')
        return
      }
      offlineAddressData = offlineAddress.value
    } else {
      videoLinkData = videoLink.value
    }

    // 将 HH:mm 格式转换为 YYYY-MM-DDTHH:mm:ss 格式
    const appointmentDate = currentAppointment.value?.appointmentTime?.split('T')[0] || ''
    const startTimeFormatted = videoStartTime.value ? `${appointmentDate}T${videoStartTime.value}:00` : undefined
    const endTimeFormatted = videoEndTime.value ? `${appointmentDate}T${videoEndTime.value}:00` : undefined

    const res: any = await sendVideoLink({
      appointmentId: currentAppointment.value.id,
      videoLink: videoLinkData || undefined,
      offlineAddress: offlineAddressData || undefined,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted
    })
    if (res.code === 200) {
      ElMessage.success('已发送并进入待进行状态')
      videoLinkDialogVisible.value = false
      fetchAppointments()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const completeConsultation = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要完成此咨询吗？完成后用户可以进行评价。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await completeConsultationApi(item.id)
    if (res.code === 200) {
      ElMessage.success('咨询已完成')
      fetchAppointments()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const showDetailDialog = async (item: any) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  detailData.value = null
  
  try {
    const res = await getAppointmentDetail(item.id)
    if (res.code === 200) {
      detailData.value = res.data
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (e) {
    console.error('获取详情失败', e)
    ElMessage.error('获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

const formatUserBasicInfo = (value: any): string => {
  if (!value) return '-'
  if (typeof value === 'object') {
    return value.problems || value.personalSituation || '-'
  }
  try {
    const parsed = JSON.parse(value)
    return parsed.problems || parsed.personalSituation || '-'
  } catch {
    return value || '-'
  }
}

onMounted(() => {
  fetchAppointments()
})
</script>

<style scoped>
.psychologist-appointments-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.status-tabs {
  margin-bottom: 24px;
}

.appointment-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appointment-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.appointment-time {
  font-size: 12px;
  color: #909399;
}

.card-body {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 10px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
}

.label {
  color: #909399;
  width: 100px;
  flex-shrink: 0;
}

.value {
  color: #303133;
}

.value.price {
  color: #409eff;
  font-weight: 600;
}

.value.problem {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  gap: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.accept-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #fdf6ec;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: #e6a23c;
}

.accept-tip .el-icon {
  margin-top: 2px;
}

/* 详情弹窗样式 */
.detail-loading {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  color: #f0a020;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  font-size: 12px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
}

.info-value.order-no {
  font-family: 'Consolas', 'Monaco', monospace;
  color: #606266;
  font-size: 13px;
}

.info-value.price {
  color: #409eff;
  font-weight: 600;
}

.info-value.reject {
  color: #f56c6c;
}

.info-value.rating {
  color: #f0a020;
  font-weight: 600;
}

.info-value.commission {
  color: #e6a23c;
  font-weight: 600;
}

.info-value.income {
  color: #67c23a;
  font-weight: 700;
  font-size: 16px;
}

.income-section {
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e1 100%);
  border: 1px solid #c2e7b0;
}

.income-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(103, 194, 58, 0.1);
  border-radius: 6px;
  font-size: 12px;
  color: #67c23a;
}

.income-tip .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
  max-height: 70vh;
  overflow-y: auto;
}
</style>
