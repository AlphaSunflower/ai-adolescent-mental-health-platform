<template>
  <div class="apply-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">心理咨询师入驻申请</h1>
      <p class="page-desc">加入我们，成为专业的心理咨询师</p>
    </div>

    <!-- 入驻流程 -->
    <div class="flow-section">
      <h2 class="section-title">入驻流程</h2>
      <div class="flow-steps">
        <div class="flow-step" v-for="(step, index) in flowSteps" :key="index"
             :class="{ active: currentStepIndex >= index, current: currentStepIndex === index }">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-info">
            <div class="step-name">{{ step.name }}</div>
            <div class="step-desc">{{ step.desc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申请表单 -->
    <div class="form-section">
      <!-- 基本资料表单 -->
      <div v-if="formStep === 'basic'" class="form-card">
        <h3 class="card-title">填写基本资料</h3>
        <el-form :model="basicForm" :rules="basicRules" ref="basicFormRef" label-position="top" class="apply-form">
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="basicForm.realName" placeholder="请输入真实姓名" />
          </el-form-item>

          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="basicForm.phone" placeholder="请输入手机号码" />
          </el-form-item>

          <el-form-item label="国家/地区" prop="country">
            <el-input v-model="basicForm.country" placeholder="请输入国家/地区" />
          </el-form-item>

          <el-form-item label="联系方式（微信/邮箱）" prop="contactWechat">
            <el-input v-model="basicForm.contactWechat" placeholder="请输入微信号或邮箱" />
          </el-form-item>

          <el-form-item label="咨询个案时长" prop="caseHours">
            <el-select v-model="basicForm.caseHours" placeholder="请选择咨询个案时长" class="full-width">
              <el-option label="少于500小时" value="less_500" />
              <el-option label="500-1000小时" value="500_1000" />
              <el-option label="1000-3000小时" value="1000_3000" />
              <el-option label="3000小时以上" value="more_3000" />
            </el-select>
          </el-form-item>

          <el-form-item label="个体督导时长" prop="supervisionHours">
            <el-select v-model="basicForm.supervisionHours" placeholder="请选择个体督导时长" class="full-width">
              <el-option label="少于80小时" value="less_80" />
              <el-option label="80-150小时" value="80_150" />
              <el-option label="150小时以上" value="more_150" />
            </el-select>
          </el-form-item>

          <el-form-item label="咨询定价（元/小时）" prop="consultationPrice">
            <el-input-number v-model="basicForm.consultationPrice" :min="0" :step="50" class="full-width" />
          </el-form-item>

          <el-form-item label="学历及相关专业" prop="education">
            <el-input v-model="basicForm.education" placeholder="请输入学历及相关专业" />
          </el-form-item>

          <el-form-item label="个人简历（PDF/Word/图片）" prop="resumeUrl">
            <el-upload
              class="upload-area"
              action="/api/psychologist-apply/upload"
              :headers="{ token: token }"
              :on-success="handleResumeSuccess"
              :before-upload="beforeUpload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              :limit="1"
            >
              <el-button type="default" plain>上传简历</el-button>
              <template #tip>
                <div class="upload-tip">支持 PDF、Word、图片格式，单个文件不超过10MB</div>
              </template>
            </el-upload>
            <div v-if="basicForm.resumeUrl" class="uploaded-file">
              <span>已上传: {{ basicForm.resumeUrl }}</span>
            </div>
          </el-form-item>

          <div class="form-actions">
            <el-button type="primary" size="large" :loading="submitting" @click="submitBasicInfo">
              提交基本资料
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 案例报告表单 -->
      <div v-if="formStep === 'report'" class="form-card">
        <h3 class="card-title">提交案例报告</h3>
        <el-form :model="reportForm" :rules="reportRules" ref="reportFormRef" label-position="top" class="apply-form">
          <el-form-item label="专业资质材料附件">
            <el-upload
              class="upload-area"
              action="/api/psychologist-apply/upload"
              :headers="{ token: token }"
              :on-success="handleQualificationSuccess"
              :before-upload="beforeUpload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            >
              <el-button type="default" plain>上传资质材料</el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="督导证明附件">
            <el-upload
              class="upload-area"
              action="/api/psychologist-apply/upload"
              :headers="{ token: token }"
              :on-success="handleSupervisionSuccess"
              :before-upload="beforeUpload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            >
              <el-button type="default" plain>上传督导证明</el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="个人体验证明（如有）">
            <el-upload
              class="upload-area"
              action="/api/psychologist-apply/upload"
              :headers="{ token: token }"
              :on-success="handleExperienceSuccess"
              :before-upload="beforeUpload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            >
              <el-button type="default" plain>上传体验证明</el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="其他相关证明">
            <el-upload
              class="upload-area"
              action="/api/psychologist-apply/upload"
              :headers="{ token: token }"
              :on-success="handleOtherSuccess"
              :before-upload="beforeUpload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            >
              <el-button type="default" plain>上传其他证明</el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="个人自我叙述" prop="selfNarration">
            <el-input
              type="textarea"
              v-model="reportForm.selfNarration"
              :rows="6"
              placeholder="请简要叙述您的职业经历、咨询理念等"
            />
          </el-form-item>

          <div class="form-actions">
            <el-button size="large" @click="goBack">返回</el-button>
            <el-button type="primary" size="large" :loading="submitting" @click="submitReport">
              提交案例报告
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkApplyEligibility, getApplyStatus, submitBasicInfo as apiSubmitBasicInfo, submitReport as apiSubmitReport } from '@/api/psychologistApply'

const router = useRouter()

const token = localStorage.getItem('token') || ''
const submitting = ref(false)
const currentStepIndex = ref(0)
const formStep = ref('basic')

const basicFormRef = ref()
const reportFormRef = ref()

const basicForm = reactive({
  realName: '',
  phone: '',
  country: '中国',
  contactWechat: '',
  caseHours: '',
  supervisionHours: '',
  consultationPrice: 0,
  resumeUrl: '',
  education: ''
})

const reportForm = reactive({
  qualificationUrls: [] as string[],
  supervisionProofUrls: [] as string[],
  experienceProofUrls: [] as string[],
  otherProofUrls: [] as string[],
  selfNarration: ''
})

const flowSteps = [
  { name: '填写基本资料', desc: '提交个人信息' },
  { name: '资料审核', desc: '管理员审核' },
  { name: '笔试考核', desc: '1周期限' },
  { name: '提交案例报告', desc: '准备材料' },
  { name: '线下面谈', desc: '最终考核' }
]

const basicRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  contactWechat: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  caseHours: [{ required: true, message: '请选择咨询个案时长', trigger: 'change' }],
  supervisionHours: [{ required: true, message: '请选择个体督导时长', trigger: 'change' }],
  education: [{ required: true, message: '请输入学历及相关专业', trigger: 'blur' }]
}

const reportRules = {
  selfNarration: [{ required: true, message: '请输入个人自我叙述', trigger: 'blur' }]
}

const handleResumeSuccess = (response: any) => {
  if (response.code === 200) {
    basicForm.resumeUrl = response.data
    ElMessage.success('简历上传成功')
  }
}

const handleQualificationSuccess = (response: any) => {
  if (response.code === 200) {
    reportForm.qualificationUrls.push(response.data)
    ElMessage.success('文件上传成功')
  }
}

const handleSupervisionSuccess = (response: any) => {
  if (response.code === 200) {
    reportForm.supervisionProofUrls.push(response.data)
    ElMessage.success('文件上传成功')
  }
}

const handleExperienceSuccess = (response: any) => {
  if (response.code === 200) {
    reportForm.experienceProofUrls.push(response.data)
    ElMessage.success('文件上传成功')
  }
}

const handleOtherSuccess = (response: any) => {
  if (response.code === 200) {
    reportForm.otherProofUrls.push(response.data)
    ElMessage.success('文件上传成功')
  }
}

const beforeUpload = (file: any) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

const submitBasicInfo = async () => {
  try {
    await basicFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const res = await apiSubmitBasicInfo(basicForm) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '提交成功')
      // 刷新状态
      await fetchStatus()
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const submitReport = async () => {
  try {
    await reportFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const res = await apiSubmitReport(reportForm) as any
    if (res.code === 200) {
      ElMessage.success(res.data || '提交成功')
      await fetchStatus()
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}

const fetchStatus = async () => {
  try {
    const res = await getApplyStatus() as any
    if (res.code === 200) {
      const status = res.data
      if (status.status === 'FILLING' || status.status === 'REVIEWING') {
        formStep.value = 'basic'
        currentStepIndex.value = 0
      } else if (status.status === 'PAPER') {
        formStep.value = 'report'
        currentStepIndex.value = 2
      } else if (status.status === 'REPORT') {
        formStep.value = 'report'
        currentStepIndex.value = 3
      }
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  // 检查申请资格
  try {
    const res = await checkApplyEligibility() as any
    if (res.code === 200) {
      if (!res.data.eligible) {
        ElMessage.warning(res.data.reason)
      }
    }
  } catch (error) {
    console.error(error)
  }

  // 获取当前状态
  await fetchStatus()
})
</script>

<style scoped>
.apply-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px;
}

.page-desc {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px;
}

.flow-section {
  margin-bottom: 48px;
}

.flow-steps {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.flow-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0.5;
  transition: all 0.2s;
}

.flow-step.active {
  opacity: 1;
}

.flow-step.current .step-number {
  background: #374151;
  color: #fff;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E5E7EB;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
}

.step-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 12px;
  color: #6B7280;
}

.form-section {
  margin-bottom: 48px;
}

.form-card {
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px;
}

.apply-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.full-width {
  width: 100%;
}

.upload-area {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
}

.uploaded-file {
  margin-top: 8px;
  font-size: 14px;
  color: #059669;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.form-actions .el-button {
  min-width: 120px;
}

@media (max-width: 768px) {
  .flow-steps {
    flex-direction: column;
  }

  .flow-step {
    flex-direction: row;
    text-align: left;
    gap: 16px;
  }

  .step-number {
    margin-bottom: 0;
  }
}
</style>
