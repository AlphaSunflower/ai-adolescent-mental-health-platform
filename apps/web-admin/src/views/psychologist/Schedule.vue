<template>
  <div class="psychologist-schedule-container">
    <div class="page-header">
      <h1 class="page-title">排班管理</h1>
      <p class="page-subtitle">设置您的咨询时间段（过去及当天不可修改）</p>
    </div>

    <div class="schedule-controls">
      <el-button-group>
        <el-button @click="prevWeek">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button>
          {{ currentWeekLabel }}
        </el-button>
        <el-button @click="nextWeek">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </el-button-group>
      <div class="control-right">
        <el-tag type="warning" effect="plain">
          <el-icon><Lock /></el-icon>
          过去及当天不可修改
        </el-tag>
        <el-button size="small" @click="openDeleteDialog">
          删除历史排班
        </el-button>
      </div>
    </div>

    <div class="schedule-grid">
      <div v-for="(day, index) in weekDays" :key="index" class="day-column">
        <div class="day-header" :class="{ today: isToday(day.date) }">
          <span class="day-name">{{ day.dayName }}</span>
          <span class="day-date">{{ day.dateStr }}</span>
        </div>

        <div class="time-slots">
          <div
            v-for="slot in day.slots"
            :key="slot.type"
            class="slot-item"
            :class="{
              available: slot.status === 1,
              rest: slot.status === 0,
              locked: isLocked(day.date),
              today: isToday(day.date)
            }"
            @click="handleSlotClick(day.date, slot)"
          >
            <span class="slot-name">{{ getSlotName(slot.type) }}</span>
            <span class="slot-status">
              {{ slot.status === 1 ? '可预约' : '休息' }}
            </span>
            <span v-if="slot.status === 1" class="slot-count">
              {{ slot.bookedCount || 0 }}/{{ slot.maxAppointments || 5 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-dot available"></span>
        可预约
      </div>
      <div class="legend-item">
        <span class="legend-dot rest"></span>
        休息
      </div>
      <div class="legend-item locked">
        <el-icon><Lock /></el-icon>
        过去及当天不可修改
      </div>
    </div>

    <!-- 时段详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="detailDialogTitle" width="700px" destroy-on-close>
      <div v-if="!currentSlotDetail" class="detail-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      <div v-else-if="currentSlotDetail.notFound" class="detail-empty">
        <el-empty description="该时段暂无排班记录" />
      </div>
      <div v-else class="slot-detail-content">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日期">{{ currentSlotDetail.scheduleDate }}</el-descriptions-item>
          <el-descriptions-item label="时段">{{ getSlotName(currentSlotDetail.timeSlot) }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentSlotDetail.startTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ currentSlotDetail.endTime || '--' }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="currentSlotDetail.status === 1 ? 'success' : 'info'">
              {{ currentSlotDetail.status === 1 ? '可预约' : '休息' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预约情况">
            {{ currentSlotDetail.bookedCount || 0 }} / {{ editingMax ? localMaxAppointments : currentSlotDetail.maxAppointments || 5 }} 人
            <el-button
              v-if="!detailLocked && !editingMax"
              link
              type="primary"
              size="small"
              style="margin-left: 8px"
              @click="startEditMax"
            >
              编辑
            </el-button>
            <el-input-number
              v-if="editingMax"
              v-model="localMaxAppointments"
              :min="0"
              :max="5"
              size="small"
              style="width: 100px; margin-left: 8px"
              controls-position="right"
            />
            <el-button
              v-if="editingMax"
              type="primary"
              size="small"
              style="margin-left: 6px"
              :loading="savingMax"
              @click="confirmSaveMax"
            >
              保存
            </el-button>
            <el-button
              v-if="editingMax"
              size="small"
              style="margin-left: 4px"
              @click="cancelEditMax"
            >
              取消
            </el-button>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 预约列表 -->
        <div class="appointment-section">
          <div class="section-title">
            <span>预约列表</span>
            <span class="appointment-count">共 {{ currentSlotDetail.appointments?.length || 0 }} 条</span>
          </div>
          <el-table
            v-if="currentSlotDetail.appointments && currentSlotDetail.appointments.length > 0"
            :data="currentSlotDetail.appointments"
            border
            stripe
            size="small"
            style="width: 100%"
          >
            <el-table-column prop="orderNo" label="订单号" min-width="150" />
            <el-table-column prop="appointmentTime" label="预约时间" min-width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.appointmentTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="serviceType" label="服务类型" width="100">
              <template #default="{ row }">
                {{ getServiceTypeName(row.serviceType) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                {{ getStatusName(row.status) }}
              </template>
            </el-table-column>
            <el-table-column prop="userProblems" label="预约问题" min-width="120" show-overflow-tooltip />
          </el-table>
          <el-empty v-else description="暂无预约记录" :image-size="60" />
        </div>
      </div>

      <template #footer>
        <div class="detail-footer">
          <!-- 非7天锁定区间才显示操作按钮 -->
          <template v-if="!detailLocked">
            <el-button
              v-if="currentSlotDetail && !currentSlotDetail.notFound"
              :type="currentSlotDetail.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus"
            >
              {{ currentSlotDetail.status === 1 ? '设为休息' : '设为可预约' }}
            </el-button>
          </template>
          <template v-else>
            <el-tag type="warning">
              <el-icon><Lock /></el-icon>
              过去及当天不可修改
            </el-tag>
          </template>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除历史排班弹窗 -->
    <el-dialog v-model="deleteDialogVisible" title="删除历史排班" width="420px">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        将删除此日期之前（不含当天）所有无预约的排班记录
      </el-alert>
      <el-form>
        <el-form-item label="删除此日期之前">
          <el-date-picker
            v-model="deleteBeforeDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            :clearable="false"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDeleteOld">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight, Lock, Loading } from '@element-plus/icons-vue'
import {
  getMySchedules,
  getScheduleSlotDetail,
  updateScheduleStatus,
  updateSchedule,
  deleteOldSchedules
} from '@/api/psychologistAdminPage'

// ---- 状态 ----
const currentWeekStart = ref('')
const weekDays = ref<any[]>([])

// ---- 初始化本周7天数据（仅在翻页/首次加载时调用）----
function initWeekDays() {
  const days = []
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const start = new Date(currentWeekStart.value)

  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = formatDateStr(date)

    days.push({
      date: dateStr,
      dayName: dayNames[date.getDay()],
      dateStr: `${date.getMonth() + 1}月${date.getDate()}日`,
      slots: [
        { type: 'morning', status: 1, bookedCount: 0, maxAppointments: 5, scheduleId: null },
        { type: 'afternoon', status: 1, bookedCount: 0, maxAppointments: 5, scheduleId: null },
        { type: 'evening', status: 1, bookedCount: 0, maxAppointments: 5, scheduleId: null }
      ]
    })
  }
  weekDays.value = days
}

// ---- 周标签 ----
const currentWeekLabel = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
})

// ---- 工具函数 ----
function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isToday(dateStr: string) {
  return dateStr === formatDate(new Date())
}

// 过去及当天不可修改
function isLocked(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return target <= today
}

function isDetailLocked(dateStr: string): boolean {
  return isLocked(dateStr)
}

function getSlotName(type: string) {
  const names: Record<string, string> = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上'
  }
  return names[type] || type
}

function getServiceTypeName(type: string) {
  const names: Record<string, string> = {
    VIDEO: '视频咨询',
    VOICE: '语音通话',
    TEXT: '文字聊天',
    OFFLINE: '线下咨询'
  }
  return names[type] || type || '--'
}

function getStatusName(status: number) {
  const names: Record<number, string> = {
    0: '待审核',
    1: '已确认',
    2: '已拒绝',
    3: '进行中',
    4: '已完成',
    5: '已取消',
    6: '已爽约'
  }
  return names[status] ?? '--'
}

function formatDateTime(dt: string) {
  if (!dt) return '--'
  return dt.replace('T', ' ').substring(0, 16)
}

// ---- 删除历史排班 ----
function openDeleteDialog() {
  // 默认选择昨天
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  deleteBeforeDate.value = formatDateStr(yesterday)
  deleteDialogVisible.value = true
}

async function confirmDeleteOld() {
  if (!deleteBeforeDate.value) {
    ElMessage.warning('请选择日期')
    return
  }
  try {
    const res: any = await deleteOldSchedules(deleteBeforeDate.value)
    if (res.code === 200) {
      const count = res.data ?? 0
      ElMessage.success(`已删除 ${count} 条历史排班`)
      deleteDialogVisible.value = false
      // 刷新当前排班
      initWeekDays()
      await fetchSchedules()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
  }
}

// ---- 编辑最大预约人数 ----
function startEditMax() {
  localMaxAppointments.value = currentSlotDetail.value?.maxAppointments ?? 5
  editingMax.value = true
}

function cancelEditMax() {
  editingMax.value = false
}

async function confirmSaveMax() {
  if (!currentSlotDetail.value?.scheduleId) return
  savingMax.value = true
  try {
    const res: any = await updateSchedule(currentSlotDetail.value.scheduleId, localMaxAppointments.value)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      editingMax.value = false
      // 更新本地状态
      currentSlotDetail.value.maxAppointments = localMaxAppointments.value
      // 同步更新 weekDays 中的值
      const day = weekDays.value.find(d => d.date === currentDetailDate.value)
      if (day) {
        const slot = day.slots.find((s: any) => s.type === currentDetailSlot.value.type)
        if (slot) slot.maxAppointments = localMaxAppointments.value
      }
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    savingMax.value = false
  }
}

// ---- 详情弹窗状态 ----
const detailDialogVisible = ref(false)
const detailDialogTitle = ref('')
const currentSlotDetail = ref<any>(null)
const currentDetailDate = ref('')
const currentDetailSlot = ref<any>(null)
const detailLocked = ref(false)
const editingMax = ref(false)
const localMaxAppointments = ref(5)
const savingMax = ref(false)

// ---- 删除历史排班弹窗 ----
const deleteDialogVisible = ref(false)
const deleteBeforeDate = ref('')

// ---- 点击时段：查看详情 ----
async function handleSlotClick(date: string, slot: any) {
  currentDetailDate.value = date
  currentDetailSlot.value = slot
  detailLocked.value = isDetailLocked(date)
  detailDialogTitle.value = `${date} ${getSlotName(slot.type)} 时段详情`
  detailDialogVisible.value = true
  currentSlotDetail.value = null

  try {
    const res: any = await getScheduleSlotDetail(date, slot.type.toUpperCase())
    if (res.code === 200) {
      currentSlotDetail.value = res.data
    } else {
      currentSlotDetail.value = { notFound: true }
      ElMessage.error(res.message || '加载失败')
    }
  } catch (error: any) {
    currentSlotDetail.value = { notFound: true }
    ElMessage.error(error.message || '加载失败')
  }
}

// ---- 切换休息/可预约状态 ----
async function handleToggleStatus() {
  if (!currentSlotDetail.value || currentSlotDetail.value.notFound) return
  if (detailLocked.value) {
    ElMessage.warning('近7天内的排班不可修改')
    return
  }

  const newStatus = currentSlotDetail.value.status === 1 ? 0 : 1
  const actionText = newStatus === 0 ? '休息' : '可预约'

  try {
    await ElMessageBox.confirm(
      `确定将该时段设置为【${actionText}】状态吗？`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  try {
    const res: any = await updateScheduleStatus(currentSlotDetail.value.scheduleId, newStatus)
    if (res.code === 200) {
      ElMessage.success(`已设置为${actionText}`)
      // 更新本地状态
      currentSlotDetail.value.status = newStatus
      // 更新weekDays中的状态
      const day = weekDays.value.find(d => d.date === currentDetailDate.value)
      if (day) {
        const localSlot = day.slots.find((s: any) => s.type === currentDetailSlot.value.type)
        if (localSlot) localSlot.status = newStatus
      }
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// ---- 获取排班数据 ----
async function fetchSchedules() {
  const startDate = formatDateStr(new Date(currentWeekStart.value))
  const endDateObj = new Date(currentWeekStart.value)
  endDateObj.setDate(endDateObj.getDate() + 6)
  const endDate = formatDateStr(endDateObj)

  try {
    const res: any = await getMySchedules(startDate, endDate)
    if (res.code === 200 && res.data) {
      const schedules = res.data as Array<{ date: string; slots: any[] }>
      schedules.forEach((schedule: any) => {
        const day = weekDays.value.find(d => d.date === schedule.date)
        if (day && schedule.slots) {
          schedule.slots.forEach((serverSlot: any) => {
            const localSlot = day.slots.find((s: any) => {
              const typeMap: Record<string, string> = {
                MORNING: 'morning',
                AFTERNOON: 'afternoon',
                EVENING: 'evening'
              }
              return s.type === typeMap[serverSlot.timeSlot]
            })
            if (localSlot) {
              localSlot.status = serverSlot.status
              localSlot.bookedCount = serverSlot.bookedCount ?? 0
              localSlot.maxAppointments = serverSlot.maxAppointments ?? 5
              localSlot.scheduleId = serverSlot.id
            }
          })
        }
      })
    }
  } catch (error: any) {
    console.error('获取排班失败:', error)
  }
}

// ---- 翻页 ----
// 导航限制：仅允许查看距今2个月内的排班
function prevWeek() {
  const today = new Date()
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  // 不得早于2个月前
  const limitDate = new Date(today)
  limitDate.setMonth(today.getMonth() - 2)
  limitDate.setDate(1)
  if (newDate < limitDate) {
    ElMessage.warning('仅支持查看近两个月的排班')
    return
  }
  currentWeekStart.value = formatDateStr(newDate)
  initWeekDays()
  fetchSchedules()
}

function nextWeek() {
  const today = new Date()
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  // 不得晚于2个月后
  const limitDate = new Date(today)
  limitDate.setMonth(today.getMonth() + 2)
  limitDate.setDate(1)
  if (newDate > limitDate) {
    ElMessage.warning('仅支持查看近两个月的排班')
    return
  }
  currentWeekStart.value = formatDateStr(newDate)
  initWeekDays()
  fetchSchedules()
}

onMounted(async () => {
  // 修正起始日期为本周一
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  currentWeekStart.value = formatDateStr(monday)
  // 先初始化本周7天的静态结构
  initWeekDays()
  // 再从后端拉取真实排班数据并覆盖
  await fetchSchedules()
})
</script>

<style scoped>
.psychologist-schedule-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: #fff;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
}

.page-subtitle {
  color: #909399;
  margin: 0;
}

.schedule-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.control-right {
  display: flex;
  gap: 12px;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
}

.day-column {
  min-height: 400px;
}

.day-header {
  text-align: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 12px;
  margin-bottom: 12px;
}

.day-header.today {
  background: #ecf5ff;
  border: 1px solid #409eff;
}

.day-name {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.day-date {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.time-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-item {
  padding: 16px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
  background: #fff;
}

.slot-item.available {
  background: #ecfdf5;
  border-color: #10b981;
}

.slot-item.available:hover {
  background: #d1fae5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.slot-item.rest {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.slot-item.rest:hover {
  background: #ebeef5;
  transform: translateY(-2px);
}

.slot-item.today {
  opacity: 0.55;
  cursor: not-allowed;
  border-style: dashed;
}

.slot-item.locked {
  opacity: 0.55;
  cursor: not-allowed;
}

.slot-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.slot-status {
  font-size: 11px;
  color: #909399;
  display: block;
}

.slot-count {
  font-size: 11px;
  color: #10b981;
  display: block;
  margin-top: 2px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-dot.available {
  background: #d1fae5;
  border: 1px solid #10b981;
}

.legend-dot.rest {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
}

.legend-item.locked {
  color: #909399;
}

/* 详情弹窗 */
.detail-loading {
  text-align: center;
  padding: 40px;
  color: #909399;
  font-size: 14px;
}

.detail-loading .el-icon {
  font-size: 24px;
  margin-right: 8px;
}

.detail-empty {
  padding: 20px 0;
}

.slot-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.appointment-section {
  margin-top: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.appointment-count {
  font-size: 13px;
  font-weight: 400;
  color: #909399;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 1200px) {
  .schedule-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .schedule-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
