<template>
  <div class="schedule-manager">
    <div class="header">
      <h2>排班管理</h2>
    </div>

    <el-calendar v-model="currentDate">
      <template #date-cell="{ data }">
        <div class="date-cell" :class="{ 'is-selected': data.isSelected }">
          <p>{{ data.day.split('-').slice(1).join('-') }}</p>
          <div v-for="s in getSchedules(data.day)" :key="s.id" class="schedule-item">
            <el-tag size="small" :type="s.status === 1 ? 'success' : 'info'">
                {{ getShiftName(s.workShift) }} ({{ s.bookedCount }}/{{ s.maxPatients }})
            </el-tag>
          </div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/api/user'

import dayjs from 'dayjs'

const currentDate = ref(new Date())
const schedules = ref<any[]>([])

// Fetch schedules for current month (simplified, fetches all or range)
const fetchSchedules = async () => {
    const start = dayjs(currentDate.value).startOf('month').format('YYYY-MM-DD')
    const end = dayjs(currentDate.value).endOf('month').format('YYYY-MM-DD')
    
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    try {
        const res = await request.get('/consultation/schedules', { 
            params: { 
                doctorId: user.id,
                startDate: start,
                endDate: end
            } 
        }) as any
        if (res.code === 200) {
            schedules.value = res.data
        }
    } catch (e) {}
}

const getSchedules = (day: string) => {
    return schedules.value.filter(s => s.workDate === day)
}

const getShiftName = (shift: number) => {
    return shift === 1 ? '上午' : shift === 2 ? '下午' : '晚班'
}

onMounted(() => {
    fetchSchedules()
})
</script>

<style scoped>
.schedule-manager {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.header {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
}
.date-cell {
    height: 100%;
    padding: 5px;
}
.schedule-item {
    margin-top: 2px;
}
</style>
