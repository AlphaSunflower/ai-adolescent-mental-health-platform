<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElTable, ElTableColumn, ElButton, ElTag } from 'element-plus'

const props = defineProps<{
  orders: any[]
  loading: boolean
  type: string
}>()

const emit = defineEmits<{
  (e: 'view-detail', row: any): void
}>()

const router = useRouter()

const statusMap: Record<number, string> = {
  0: '待审核', 1: '已确认', 2: '已拒绝', 3: '进行中', 4: '已完成', 5: '已取消', 6: '已爽约', 8: '已评价'
}

const statusTypeMap: Record<number, string> = {
  0: 'warning', 1: 'success', 2: 'danger', 3: 'primary', 4: 'info', 5: 'info', 6: 'danger', 8: 'success'
}

const serviceTypeMap: Record<string, string> = {
  text: '图文咨询', video: '视频咨询', voice: '语音咨询', offline: '线下面询'
}

const timeSlotMap: Record<string, string> = {
  MORNING: '上午', AFTERNOON: '下午', EVENING: '晚上', morning: '上午', afternoon: '下午', evening: '晚上'
}

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const handleViewDetail = (row: any) => {
  emit('view-detail', row)
}
</script>

<template>
  <div class="order-table-wrapper">
    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else-if="!orders?.length" class="empty-state">
      <div class="empty-icon">📋</div>
      <p class="empty-text">暂无订单</p>
      <el-button type="primary" @click="router.push('/consultation/psychologist')">去预约</el-button>
    </div>
    <el-table
      v-else
      :data="orders"
      stripe
      class="order-table"
      row-class-name="order-row"
    >
      <el-table-column prop="orderNo" label="订单号" width="200">
        <template #default="{ row }">
          <span class="order-no">{{ row.orderNo || '-' }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="psychologistName" label="咨询师" min-width="120">
        <template #default="{ row }">
          <div class="psychologist-cell">
            <span class="psychologist-name">{{ row.psychologistName || '-' }}</span>
            <span class="service-type">{{ serviceTypeMap[row.serviceType] || row.subtitle || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="appointmentTime" label="预约时间" width="160">
        <template #default="{ row }">
          <span class="time-text">
            {{ row.appointmentTime ? formatDateShort(row.appointmentTime) : '-' }}
            {{ row.timeSlot ? timeSlotMap[row.timeSlot] || row.timeSlot : '' }}
          </span>
        </template>
      </el-table-column>
      
      <el-table-column prop="fee" label="金额" width="100" align="center">
        <template #default="{ row }">
          <span class="price">¥{{ row.fee || row.price || 0 }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTypeMap[row.status] || 'info'" size="small">
            {{ statusMap[row.status] || row.statusText || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="createTime" label="下单时间" width="120">
        <template #default="{ row }">
          <span class="create-time">{{ formatDateShort(row.createTime) }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="actions" label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            link
            @click.stop="handleViewDetail(row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.order-table-wrapper {
  min-height: 300px;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
  color: rgba(255, 255, 255, 0.7);
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.order-no {
  font-family: 'Consolas', 'Monaco', monospace;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.psychologist-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.psychologist-name {
  font-weight: 500;
  color: #ffffff;
}

.service-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.time-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.price {
  font-weight: 600;
  color: #fbbf24;
}

.create-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
