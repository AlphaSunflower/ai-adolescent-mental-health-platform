<template>
  <el-dialog v-model="visible" title="排班设置" width="600px" @close="handleClose">
    <div class="config-container">
        <p>配置该医生的周排班模板，保存后可一键生成具体日期的排班。</p>
        
        <el-tabs v-model="activeDay">
            <el-tab-pane v-for="day in weekDays" :key="day.value" :label="day.label" :name="day.value">
                <div class="shift-selector">
                    <el-checkbox-group v-model="day.shifts">
                        <el-checkbox :label="1">上午</el-checkbox>
                        <el-checkbox :label="2">下午</el-checkbox>
                        <el-checkbox :label="3">晚班</el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="max-patients">
                    <span>最大接诊数：</span>
                    <el-input-number v-model="day.maxPatients" :min="1" :max="100"></el-input-number>
                </div>
            </el-tab-pane>
        </el-tabs>

        <div class="generate-section" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
            <h4>生成排班</h4>
            <div style="display: flex; gap: 10px;">
                <el-date-picker
                    v-model="generateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                />
                <el-button type="success" @click="handleGenerate" :loading="generating">生成</el-button>
            </div>
        </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存配置</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import request from '@/api/user'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  doctorId: number
}>()

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const activeDay = ref(1)
const generating = ref(false)
const generateRange = ref([])

const weekDays = reactive([
    { value: 1, label: '周一', shifts: [] as number[], maxPatients: 20 },
    { value: 2, label: '周二', shifts: [] as number[], maxPatients: 20 },
    { value: 3, label: '周三', shifts: [] as number[], maxPatients: 20 },
    { value: 4, label: '周四', shifts: [] as number[], maxPatients: 20 },
    { value: 5, label: '周五', shifts: [] as number[], maxPatients: 20 },
    { value: 6, label: '周六', shifts: [] as number[], maxPatients: 20 },
    { value: 7, label: '周日', shifts: [] as number[], maxPatients: 20 },
])

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.doctorId) {
      fetchConfig()
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const fetchConfig = async () => {
    try {
        const res = await request.get(`/consultation/admin/schedule-configs/${props.doctorId}`) as any
        if (res.code === 200) {
            // Reset
            weekDays.forEach(d => {
                d.shifts = []
                d.maxPatients = 20
            })
            // Fill
            res.data.forEach((c: any) => {
                const day = weekDays.find(d => d.value === c.dayOfWeek)
                if (day) {
                    day.shifts.push(c.workShift)
                    day.maxPatients = c.maxPatients
                }
            })
        }
    } catch (e) {}
}

const saveConfig = async () => {
    const configs: any[] = []
    weekDays.forEach(day => {
        day.shifts.forEach(shift => {
            configs.push({
                doctorId: props.doctorId,
                dayOfWeek: day.value,
                workShift: shift,
                maxPatients: day.maxPatients
            })
        })
    })
    
    if (configs.length === 0) {
         ElMessage.warning('请至少配置一个班次')
         return
    }

    try {
        const res = await request.post('/consultation/admin/schedule-config', configs) as any
        if (res.code === 200) {
            ElMessage.success('配置保存成功')
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {}
}

const handleGenerate = async () => {
    if (!generateRange.value || generateRange.value.length < 2) {
        ElMessage.warning('请选择生成日期范围')
        return
    }
    generating.value = true
    try {
        const res = await request.post('/consultation/admin/schedule/generate', null, {
            params: {
                doctorId: props.doctorId,
                startDate: generateRange.value[0],
                endDate: generateRange.value[1]
            }
        }) as any
        if (res.code === 200) {
            ElMessage.success(res.data || '生成成功')
        } else {
            ElMessage.error(res.message)
        }
    } catch (e) {
    } finally {
        generating.value = false
    }
}
</script>

<style scoped>
.shift-selector {
    margin-bottom: 20px;
}
</style>
