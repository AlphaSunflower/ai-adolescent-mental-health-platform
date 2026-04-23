<template>
  <div class="apply-form-page">
    <!-- 背景动效 -->
    <div class="bg-effects">
      <div class="bg-gradient"></div>
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
    </div>

    <div class="form-container">
      <!-- 左侧流程图 -->
      <div class="flow-sidebar">
        <div class="flow-card">
          <h2 class="flow-title">入驻流程</h2>
          <div class="flow-steps">
            <div
              v-for="(step, index) in flowSteps"
              :key="index"
              class="flow-step-item"
              :class="{ active: currentStepIndex >= index, current: currentStepIndex === index, clickable: index === currentStepIndex }"
              @click="jumpToStep(index)"
            >
              <div class="step-indicator">
                <div class="step-dot">
                  <el-icon v-if="currentStepIndex > index"><Check /></el-icon>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="step-line" v-if="index < flowSteps.length - 1"></div>
              </div>
              <div class="step-content">
                <h4>{{ step.name }}</h4>
                <p>{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-main">
        <div class="form-card">
          <!-- 基本资料表单 -->
          <div v-show="currentStepIndex === 0" class="step-panel">
            <div class="panel-header">
              <h2 class="panel-title">填写基本资料</h2>
              <p class="panel-desc">请填写真实的个人信息用于审核</p>
            </div>
            <el-form :model="basicForm" :rules="basicRules" ref="basicFormRef" label-position="top" class="apply-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="basicForm.realName" placeholder="请输入真实姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="basicForm.phone" placeholder="请输入手机号码" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="国家/地区" prop="country">
                <el-input v-model="basicForm.country" placeholder="请输入国家/地区" />
              </el-form-item>

              <el-form-item label="联系方式（微信/邮箱）" prop="contactWechat">
                <el-input v-model="basicForm.contactWechat" placeholder="请输入微信号或邮箱" />
              </el-form-item>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="咨询个案时长" prop="caseHours">
                    <el-select v-model="basicForm.caseHours" placeholder="请选择咨询个案时长" class="full-width">
                      <el-option label="少于500小时" value="less_500" />
                      <el-option label="500-1000小时" value="500_1000" />
                      <el-option label="1000-3000小时" value="1000_3000" />
                      <el-option label="3000小时以上" value="more_3000" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="个体督导时长" prop="supervisionHours">
                    <el-select v-model="basicForm.supervisionHours" placeholder="请选择个体督导时长" class="full-width">
                      <el-option label="少于80小时" value="less_80" />
                      <el-option label="80-150小时" value="80_150" />
                      <el-option label="150小时以上" value="more_150" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="咨询定价（元/小时）" prop="consultationPrice">
                    <el-input-number v-model="basicForm.consultationPrice" :min="0" :step="50" class="full-width" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="学历及相关专业" prop="education">
                    <el-input v-model="basicForm.education" placeholder="如：心理学硕士" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="个人简历" prop="resumeUrl">
                <el-upload
                  class="upload-area"
                  action="/api/psychologist-apply/upload"
                  :headers="{ token: token }"
                  :on-success="handleResumeSuccess"
                  :before-upload="beforeUpload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  :limit="1"
                >
                  <el-button type="primary" plain>
                    <el-icon><Upload /></el-icon> 上传简历
                  </el-button>
                  <template #tip>
                    <div class="upload-tip">支持 PDF、Word、图片格式，单个文件不超过10MB</div>
                  </template>
                </el-upload>
                <div v-if="basicForm.resumeUrl" class="uploaded-file">
                  <el-icon color="#67C23A"><Document /></el-icon>
                  <span>{{ getFileName(basicForm.resumeUrl) }}</span>
                  <el-button type="danger" link @click="basicForm.resumeUrl = ''">删除</el-button>
                </div>
              </el-form-item>

              <div class="form-actions">
                <el-button @click="goBack">返回</el-button>
                <el-button type="primary" :loading="submitting" @click="submitBasicInfo">
                  提交基本资料
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Upload, Document, ArrowRight } from '@element-plus/icons-vue'
import { submitBasicInfo as apiSubmitBasicInfo } from '../../api/psychologistApply'

const router = useRouter()

const token = localStorage.getItem('token') || ''
const submitting = ref(false)
const currentStepIndex = ref(0)
const basicFormRef = ref()

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

const flowSteps = [
  { name: '填写基本资料', desc: '提交个人信息' },
  { name: '管理员审核', desc: '1-3个工作日' },
  { name: '笔试考核', desc: '1周期限' },
  { name: '提交案例报告', desc: '准备材料' },
  { name: '线下面谈', desc: '最终考核' },
  { name: '入驻成功', desc: '成为咨询师' }
]

const basicRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  contactWechat: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  caseHours: [{ required: true, message: '请选择咨询个案时长', trigger: 'change' }],
  supervisionHours: [{ required: true, message: '请选择个体督导时长', trigger: 'change' }],
  education: [{ required: true, message: '请输入学历及相关专业', trigger: 'blur' }]
}

const jumpToStep = (index: number) => {
  if (index <= currentStepIndex.value) {
    currentStepIndex.value = index
  }
}

const getFileName = (url: string) => {
  if (!url) return ''
  const parts = url.split('/')
  return parts[parts.length - 1] || url
}

const handleResumeSuccess = (response: any) => {
  if (response.code === 200 || response.code === 0) {
    basicForm.resumeUrl = response.data || response.url
    ElMessage.success('简历上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
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
      ElMessage.success('基本资料提交成功，等待管理员审核')
      router.push('/apply-psychologist/status')
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/apply-psychologist')
}

onMounted(async () => {
  currentStepIndex.value = 0
})
</script>

<style scoped>
.apply-form-page {
  min-height: 100vh;
  background: #f5f7fa;
  position: relative;
  overflow-x: hidden;
}

.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(64,158,255,0.03) 0%, rgba(56,249,215,0.03) 100%);
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  animation: floatShape ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(64,158,255,0.05) 0%, transparent 70%);
  top: -100px;
  right: -100px;
  animation-duration: 15s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(56,249,215,0.05) 0%, transparent 70%);
  bottom: -50px;
  left: -50px;
  animation-duration: 18s;
  animation-delay: -5s;
}

@keyframes floatShape {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

.form-container {
  display: flex;
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  position: relative;
  z-index: 1;
}

.flow-sidebar {
  flex: 0 0 320px;
}

.flow-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  position: sticky;
  top: 32px;
}

.flow-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.flow-steps {
  display: flex;
  flex-direction: column;
}

.flow-step-item {
  display: flex;
  gap: 16px;
  position: relative;
  padding-bottom: 8px;
}

.flow-step-item.clickable {
  cursor: pointer;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  flex-shrink: 0;
}

.flow-step-item.active .step-dot {
  background: #409EFF;
  color: white;
}

.flow-step-item.current .step-dot {
  background: linear-gradient(135deg, #409EFF, #36cfc9);
  color: white;
  box-shadow: 0 4px 15px rgba(64,158,255,0.3);
}

.step-line {
  width: 2px;
  height: 40px;
  background: #e5e7eb;
  margin-top: 4px;
}

.flow-step-item.active .step-line {
  background: #409EFF;
}

.step-content h4 {
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  margin: 4px 0;
  transition: color 0.3s;
}

.flow-step-item.active .step-content h4 {
  color: #303133;
}

.step-content p {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
}

.form-main {
  flex: 1;
  min-width: 0;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  padding: 32px;
}

.panel-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px;
}

.panel-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.apply-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
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
  color: #909399;
  margin-top: 4px;
}

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 16px;
  background: #f0f9eb;
  border-radius: 8px;
  border: 1px solid #e1f3d8;
  font-size: 14px;
  color: #67C23A;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1024px) {
  .form-container {
    flex-direction: column;
  }

  .flow-sidebar {
    flex: none;
  }

  .flow-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .form-container {
    padding: 16px;
  }

  .form-card {
    padding: 24px 16px;
  }
}
</style>
