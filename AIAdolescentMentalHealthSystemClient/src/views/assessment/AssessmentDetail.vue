<template>
  <div class="assessment-detail" v-if="template">
    <h1>{{ template.title }}</h1>
    <p class="description">{{ template.description }}</p>

    <!-- 就诊人选择 -->
    <el-card shadow="never" class="patient-card">
      <div class="card-header">
        <span>选择测评对象（就诊人）</span>
      </div>
      <el-radio-group v-model="selectedPatientId" class="patient-radios">
        <el-radio v-for="p in patients" :key="p.id" :label="p.id" border>
          {{ p.name }} ({{ p.relationship }})
        </el-radio>
      </el-radio-group>
      <div v-if="patients.length === 0" class="empty-patient-tip">
        暂无就诊人，<el-button link type="primary" @click="router.push('/user/patient')">去添加</el-button>
      </div>
      <div v-else-if="!selectedPatientId" class="error-tip">请先选择就诊人</div>
    </el-card>

    <el-form ref="formRef" :model="answers" label-position="top">
      <div v-for="(q, index) in questions" :key="index" class="question-item">
        <h3>{{ index + 1 }}. {{ q.text }}</h3>
        <el-form-item :prop="`q${index}`" :rules="{ required: true, message: '请选择', trigger: 'change' }">
          <el-radio-group v-model="answers[`q${index}`]">
            <el-radio v-for="opt in q.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <el-button type="primary" @click="submit" :loading="submitting">提交测评</el-button>
    </el-form>
  </div>
  <el-empty v-else description="加载中..."></el-empty>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {getTemplate, submitAssessment} from '@/api/assessment'
import { getPatientContacts } from '@/api/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const template = ref<any>(null)
const questions = ref<any[]>([])
const loading = ref(false)
const answers = reactive<Record<string, any>>({})
const submitting = ref(false)
const formRef = ref()

const patients = ref<any[]>([])
const selectedPatientId = ref<number>()

const fetchPatients = async () => {
  try {
    const res = await getPatientContacts()
    if (res.code === 200) {
      patients.value = res.data
      if (patients.value.length > 0) {
        selectedPatientId.value = patients.value[0].id
      }
    }
  } catch (e) {
    ElMessage.error('加载就诊人失败')
  }
}

const fetchTemplate = async () => {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const res = await getTemplate(id)
    if (res.code === 200) {
      template.value = res.data
      const json = typeof res.data.questionsJson === 'string' 
        ? JSON.parse(res.data.questionsJson) 
        : res.data.questionsJson
      questions.value = json
    } else {
      ElMessage.error(res.message || '加载量表失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!selectedPatientId.value) {
    ElMessage.warning('请选择测评对象')
    return
  }
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await submitAssessment(template.value.id!, selectedPatientId.value!, answers)
        if (res.code === 200) {
          ElMessage.success('提交成功')
          router.push('/assessment-history')
        } else {
          ElMessage.error(res.message)
        }
      } catch (error) {
        ElMessage.error('提交失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchTemplate()
  fetchPatients()
})
</script>

<style scoped>
.assessment-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.patient-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
  margin-bottom: 15px;
}

.patient-radios {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.error-tip {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 10px;
}

.question-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}
</style>
