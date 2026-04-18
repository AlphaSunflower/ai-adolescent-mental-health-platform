<template>
  <div class="psychologist-profile-container">
    <div class="page-header">
      <h1 class="page-title">我的资料</h1>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div class="tab-content">
          <el-form :model="basicForm" label-width="120px" class="profile-form">
            <el-form-item label="头像">
              <div class="avatar-upload">
                <el-avatar :size="100" :src="basicForm.headPath" class="avatar-preview">
                  <el-icon :size="50"><User /></el-icon>
                </el-avatar>
                <el-upload
                  action="/api/psychologist-apply/upload"
                  :headers="{ token: token }"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  accept="image/*"
                >
                  <el-button size="small" class="upload-btn">更换头像</el-button>
                </el-upload>
              </div>
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="basicForm.realName" class />
              <span class="form-tip">无需审核</span>
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="basicForm.sex">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="basicForm.introduction" type="textarea" :rows="4" class />
            </el-form-item>
            <el-form-item label="线下咨询地区">
              <el-input v-model="basicForm.offlineRegion" placeholder="如：北京市朝阳区" class />
            </el-form-item>
            <el-form-item label="详细地址">
              <el-input v-model="basicForm.offlineAddress" class />
            </el-form-item>
            <el-form-item label="语言能力">
              <el-select v-model="basicForm.languages" multiple class >
                <el-option label="普通话" value="普通话" />
                <el-option label="英语" value="英语" />
                <el-option label="粤语" value="粤语" />
                <el-option label="上海话" value="上海话" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasic" :loading="saving">保存</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 资质与擅长 -->
      <el-tab-pane label="资质与擅长" name="qualification">
        <div class="tab-content">
          <el-form label-width="120px" class="profile-form">
            <el-form-item label="咨询经验年限">
              <el-input-number v-model="qualificationForm.yearsExperience" :min="0" :max="50" class />
              <span class="form-tip">无需审核</span>
            </el-form-item>
            <el-form-item label="擅长领域">
              <el-select v-model="qualificationForm.fieldIds" multiple class >
                <el-option v-for="field in allFields" :key="field.id" :label="field.name" :value="field.id" />
              </el-select>
              <span class="form-tip">修改需要审核</span>
            </el-form-item>
            <el-form-item label="资质证书">
              <el-select v-model="qualificationForm.qualificationIds" multiple class >
                <el-option v-for="q in allQualifications" :key="q.id" :label="q.name" :value="q.id" />
              </el-select>
              <span class="form-tip">修改需要审核</span>
            </el-form-item>
            <el-form-item label="教育背景">
              <el-input v-model="qualificationForm.educationBackground" type="textarea" :rows="3" class />
            </el-form-item>
            <el-form-item label="受训经历">
              <el-input v-model="qualificationForm.trainingExperience" type="textarea" :rows="3" class />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="openAuditDialog" :loading="saving">保存并提交审核</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 服务与价格 -->
      <el-tab-pane label="服务与价格" name="service">
        <div class="tab-content">
          <div class="price-section">
            <div class="price-card online">
              <div class="price-card-header">
                <span class="price-card-title">线上咨询价格</span>
                <el-tag type="primary" size="small">视频 + 语音</el-tag>
              </div>
              <div class="price-card-body">
                <span class="price-currency">¥</span>
                <span class="price-amount">{{ currentPrice }}</span>
                <span class="price-unit">/次</span>
              </div>
              <div class="price-card-footer">
                <el-button type="primary" plain size="small" @click="openPriceDialog('online')">修改价格</el-button>
              </div>
            </div>

            <div class="price-card offline">
              <div class="price-card-header">
                <span class="price-card-title">线下咨询价格</span>
                <el-tag type="warning" size="small">面询</el-tag>
              </div>
              <div class="price-card-body">
                <span class="price-currency">¥</span>
                <span class="price-amount">{{ offlinePrice }}</span>
                <span class="price-unit">/次</span>
              </div>
              <div class="price-card-footer">
                <el-button type="primary" plain size="small" @click="openPriceDialog('offline')">修改价格</el-button>
              </div>
            </div>
          </div>

          <div class="service-list">
            <div v-for="service in serviceForm.services" :key="service.serviceType" class="service-item">
              <div class="service-header">
                <div class="service-info">
                  <span class="service-type">{{ getServiceTypeName(service.serviceType) }}</span>
                  <span v-if="service.serviceType === 'text'" class="service-note">(不计费)</span>
                </div>
                <el-tag v-if="service.status === 1" type="success" size="small">已启用</el-tag>
                <el-tag v-else type="info" size="small">已禁用</el-tag>
              </div>
              <div class="service-action">
                <el-switch
                  v-model="service.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleServiceToggle(service)"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </div>
            </div>
          </div>
          <div class="service-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>启用/禁用服务即时生效，价格修改需要管理员审核</span>
          </div>
        </div>
      </el-tab-pane>

      <!-- 审核记录 -->
      <el-tab-pane label="审核记录" name="audit">
        <div class="tab-content">
          <el-table :data="auditRecords" v-loading="auditLoading">
            <el-table-column prop="createTime" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="fieldName" label="修改字段" width="150" />
            <el-table-column prop="oldValue" label="原值" />
            <el-table-column prop="newValue" label="新值" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getAuditStatusType(row.status)" size="small">
                  {{ getAuditStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="审核备注" />
          </el-table>
          <el-empty v-if="auditRecords.length === 0 && !auditLoading" description="暂无审核记录" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 审核提交弹窗 -->
    <el-dialog v-model="auditDialogVisible" title="提交资料变更审核" width="600px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="变更说明">
          <el-input
            v-model="auditForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请简要说明本次修改的原因（必填）"
          />
        </el-form-item>
        <el-form-item label="证明材料">
          <div class="proof-upload">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :file-list="auditForm.proofFiles"
              :on-change="handleProofChange"
              :on-remove="handleProofRemove"
              :limit="5"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">最多上传5张图片，支持 JPG、PNG 格式，每张不超过 2MB</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="submitting">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- 价格修改弹窗 -->
    <el-dialog v-model="priceDialogVisible" :title="priceForm.priceType === 'online' ? '修改线上咨询价格' : '修改线下咨询价格'" width="500px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="当前价格">
          <span class="current-price">¥{{ priceForm.priceType === 'online' ? currentPrice : offlinePrice }} /次</span>
        </el-form-item>
        <el-form-item label="新价格" required>
          <div class="price-edit">
            <span class="currency">¥</span>
            <el-input-number v-model="priceForm.newPrice" :min="0" :precision="2" controls-position="right" class="price-input-inner" />
            <span class="unit">/次</span>
          </div>
        </el-form-item>
        <el-form-item label="修改理由" required>
          <el-input
            v-model="priceForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请说明修改价格的原因（必填）"
          />
        </el-form-item>
        <el-form-item label="证明材料">
          <div class="proof-upload">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :file-list="priceForm.proofFiles"
              :on-change="handlePriceProofChange"
              :on-remove="handlePriceProofRemove"
              :limit="5"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">最多上传5张图片，支持 JPG、PNG 格式，每张不超过 2MB</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="priceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPriceChange" :loading="priceSubmitting">确认提交审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, InfoFilled, Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 上传图片到 OSS
const uploadImageToOss = async (file: File): Promise<string | null> => {
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res: any = await request.post('/api/common/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.code === 200) {
      return res.data
    }
    return null
  } catch (e) {
    return null
  }
}

const activeTab = ref('basic')
const saving = ref(false)
const auditLoading = ref(false)
const token = ref(localStorage.getItem('token') || '')
const psychologistId = ref<number | null>(null)
const currentPrice = ref<string>('0')
const offlinePrice = ref<string>('0')

const basicForm = reactive({
  headPath: '',
  realName: '',
  sex: 1,
  introduction: '',
  offlineRegion: '',
  offlineAddress: '',
  languages: [] as string[]
})

const qualificationForm = reactive({
  yearsExperience: 0,
  fieldIds: [] as number[],
  qualificationIds: [] as number[],
  educationBackground: '',
  trainingExperience: ''
})

const serviceForm = reactive({
  services: [
    { serviceType: 'text', price: 100, description: '文字+图片咨询，方便快捷', status: 1 },
    { serviceType: 'video', price: 300, description: '视频通话咨询，实时沟通', status: 1 },
    { serviceType: 'voice', price: 200, description: '语音通话咨询，保护隐私', status: 1 },
    { serviceType: 'offline', price: 500, description: '线下面询，面对面沟通', status: 0 }
  ]
})

const allFields = ref<any[]>([])
const allQualifications = ref<any[]>([])
const auditRecords = ref<any[]>([])

// 审核弹窗相关
const auditDialogVisible = ref(false)
const submitting = ref(false)
const auditForm = reactive({
  reason: '',
  proofFiles: [] as any[]
})

// 价格修改弹窗相关
const priceDialogVisible = ref(false)
const priceSubmitting = ref(false)
const priceForm = reactive({
  priceType: 'online', // 'online' 或 'offline'
  newPrice: 0,
  reason: '',
  proofFiles: [] as any[]
})

const serviceTypeMap: Record<string, string> = {
  text: '图文咨询',
  video: '视频咨询',
  voice: '语音咨询',
  offline: '线下面询'
}

const getServiceTypeName = (type: string) => serviceTypeMap[type] || type

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getAuditStatusType = (status: number) => {
  const types: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }
  return types[status] || 'info'
}

const getAuditStatusName = (status: number) => {
  const names: Record<number, string> = { 0: '待审核', 1: '审核中', 2: '已通过', 3: '已拒绝' }
  return names[status] || '未知'
}

// 头像上传
const handleAvatarSuccess = (res: any) => {
  if (res.code === 200) {
    basicForm.headPath = res.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 加载所有数据
const loadAllData = async () => {
  try {
    // 获取心理咨询师信息
    const res: any = await request({
      url: '/api/psychologist/admin/profile',
      method: 'get'
    })
    if (res.code === 200 && res.data) {
      const data = res.data
      psychologistId.value = data.id

      // 基本信息
      basicForm.headPath = data.headPath || ''
      basicForm.realName = data.realName || ''
      basicForm.sex = data.sex || 1
      basicForm.introduction = data.introduction || ''
      basicForm.offlineRegion = data.offlineRegion || ''
      basicForm.offlineAddress = data.offlineAddress || ''
      basicForm.languages = data.languages ? data.languages.split(',') : []
      currentPrice.value = data.consultationPrice || '0'
      offlinePrice.value = data.offlinePrice || '0'

      // 资质信息
      qualificationForm.yearsExperience = data.yearsExperience || 0
      qualificationForm.educationBackground = data.educationBackground || ''
      qualificationForm.trainingExperience = data.trainingExperience || ''

      // 加载擅长领域列表
      await loadFields()

      // 加载资质列表
      await loadQualifications()

      // 设置已选中的领域和资质
      if (data.fields && data.fields.length > 0) {
        qualificationForm.fieldIds = data.fields.map((f: any) => f.fieldId || f.id)
      }
      if (data.qualifications && data.qualifications.length > 0) {
        qualificationForm.qualificationIds = data.qualifications.map((q: any) => q.qualificationId || q.id)
      }

      // 加载服务信息
      await loadServices()

      // 加载审核记录
      await loadAuditRecords()
    }
  } catch (e) {
    console.error('加载数据失败', e)
  }
}

// 加载擅长领域列表
const loadFields = async () => {
  try {
    const res: any = await request({
      url: '/api/psychologist/admin/fields/options',
      method: 'get'
    })
    if (res.code === 200) {
      allFields.value = res.data || []
    }
  } catch (e) {
    console.error('加载领域列表失败', e)
  }
}

// 加载资质列表
const loadQualifications = async () => {
  try {
    const res: any = await request({
      url: '/api/psychologist/admin/qualifications/options',
      method: 'get'
    })
    if (res.code === 200) {
      allQualifications.value = res.data || []
    }
  } catch (e) {
    console.error('加载资质列表失败', e)
  }
}

// 加载服务信息
const loadServices = async () => {
  if (!psychologistId.value) return
  try {
    const res: any = await request({
      url: `/api/psychologist/admin/${psychologistId.value}/services`,
      method: 'get'
    })
    if (res.code === 200 && res.data && res.data.length > 0) {
      res.data.forEach((service: any) => {
        // 忽略大小写匹配
        const existing = serviceForm.services.find(s => 
          s.serviceType.toUpperCase() === service.serviceType.toUpperCase()
        )
        if (existing) {
          existing.price = service.price
          existing.description = service.description || ''
          existing.status = service.status
        }
      })
    }
  } catch (e) {
    console.error('加载服务信息失败', e)
  }
}

// 加载审核记录
const loadAuditRecords = async () => {
  if (!psychologistId.value) return
  auditLoading.value = true
  try {
    const res: any = await request({
      url: '/api/psychologist/admin/profile/audit/list',
      method: 'get',
      params: { page: 1, size: 50 }
    })
    if (res.code === 200) {
      auditRecords.value = res.data?.records || []
    }
  } catch (e) {
    console.error('加载审核记录失败', e)
  } finally {
    auditLoading.value = false
  }
}

// 保存基本信息
const saveBasic = async () => {
  saving.value = true
  try {
    const data = {
      headPath: basicForm.headPath,
      realName: basicForm.realName,
      sex: basicForm.sex,
      introduction: basicForm.introduction,
      offlineRegion: basicForm.offlineRegion,
      offlineAddress: basicForm.offlineAddress,
      languages: basicForm.languages.join(',')
    }
    const res: any = await request({
      url: '/api/psychologist/admin/profile',
      method: 'put',
      data
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 打开审核提交弹窗
const openAuditDialog = () => {
  auditForm.reason = ''
  auditForm.proofFiles = []
  auditDialogVisible.value = true
}

// 处理证明材料文件变化
const handleProofChange = (file: any, fileList: any[]) => {
  const isImage = file.raw?.type.startsWith('image/')
  const isLt2M = file.raw?.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    fileList.pop()
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    fileList.pop()
    return
  }
  auditForm.proofFiles = fileList
}

// 移除证明材料
const handleProofRemove = (file: any, fileList: any[]) => {
  auditForm.proofFiles = fileList
}

// 提交审核
const submitAudit = async () => {
  if (!auditForm.reason.trim()) {
    ElMessage.warning('请填写变更说明')
    return
  }

  submitting.value = true
  try {
      // 上传证明材料
      let proofUrls: string[] = []
      if (auditForm.proofFiles.length > 0) {
        ElMessage.info('正在上传证明材料...')
        for (const file of auditForm.proofFiles) {
          const url = await uploadImageToOss(file.raw)
          if (url) {
            proofUrls.push(url)
          }
        }
        if (proofUrls.length === 0 && auditForm.proofFiles.length > 0) {
          ElMessage.warning('证明材料上传失败，将继续提交审核（无证明材料）')
        }
      }

    // 先保存基本信息（咨询经验年限、教育背景等无需审核的字段）
    const basicRes: any = await request({
      url: '/api/psychologist/admin/profile',
      method: 'put',
      data: {
        yearsExperience: qualificationForm.yearsExperience,
        educationBackground: qualificationForm.educationBackground,
        trainingExperience: qualificationForm.trainingExperience
      }
    })

    // 提交审核申请
    const auditRes: any = await request({
      url: '/api/psychologist/admin/profile/audit/apply',
      method: 'post',
      data: {
        fieldIds: qualificationForm.fieldIds,
        qualificationIds: qualificationForm.qualificationIds,
        reason: auditForm.reason,
        proofUrls: JSON.stringify(proofUrls)
      }
    })

    if (auditRes.code === 200) {
      ElMessage.success('已提交审核，请等待管理员处理')
      auditDialogVisible.value = false
      await loadAuditRecords()
    } else {
      ElMessage.error(auditRes.message || '提交失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 保存单个服务（仅启用/禁用，无需审核）
const saveService = async (service: any) => {
  try {
    const res: any = await request({
      url: `/api/psychologist/admin/${psychologistId.value}/services/${service.serviceType}`,
      method: 'post',
      data: {
        status: service.status
      }
    })
    if (res.code === 200) {
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

// 启用/禁用服务
const handleServiceToggle = async (service: any) => {
  await saveService(service)
}

// 打开价格修改弹窗
const openPriceDialog = (priceType: 'online' | 'offline') => {
  priceForm.priceType = priceType
  if (priceType === 'offline') {
    priceForm.newPrice = parseFloat(offlinePrice.value) || 0
  } else {
    priceForm.newPrice = parseFloat(currentPrice.value) || 0
  }
  priceForm.reason = ''
  priceForm.proofFiles = []
  priceDialogVisible.value = true
}

// 价格证明材料文件变化
const handlePriceProofChange = (file: any, fileList: any[]) => {
  const isImage = file.raw?.type.startsWith('image/')
  const isLt2M = file.raw?.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    fileList.pop()
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    fileList.pop()
    return
  }
  priceForm.proofFiles = fileList
}

// 移除价格证明材料
const handlePriceProofRemove = (file: any, fileList: any[]) => {
  priceForm.proofFiles = fileList
}

// 提交价格修改审核
const submitPriceChange = async () => {
  if (!priceForm.reason.trim()) {
    ElMessage.warning('请填写修改理由')
    return
  }
  if (priceForm.newPrice < 0) {
    ElMessage.warning('价格不能为负数')
    return
  }

  priceSubmitting.value = true
  try {
    // 上传证明材料
    let proofUrls: string[] = []
    if (priceForm.proofFiles.length > 0) {
      ElMessage.info('正在上传证明材料...')
      for (const file of priceForm.proofFiles) {
        const url = await uploadImageToOss(file.raw)
        if (url) {
          proofUrls.push(url)
        }
      }
    }

    // 根据价格类型选择接口
    const apiUrl = priceForm.priceType === 'offline'
      ? '/api/psychologist/admin/profile/offline-price/audit/apply'
      : '/api/psychologist/admin/profile/price/audit/apply'

    // 提交价格修改审核
    const res: any = await request({
      url: apiUrl,
      method: 'post',
      data: {
        newPrice: priceForm.newPrice,
        reason: priceForm.reason,
        proofUrls: JSON.stringify(proofUrls)
      }
    })

    if (res.code === 200) {
      ElMessage.success('已提交价格修改审核，请等待管理员处理')
      priceDialogVisible.value = false
      // 刷新审核记录
      await loadAuditRecords()
      // 切换到审核记录tab
      activeTab.value = 'audit'
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '提交失败')
  } finally {
    priceSubmitting.value = false
  }
}

// Tab 切换时加载审核记录
const handleTabChange = (tab: string) => {
  if (tab === 'audit' && psychologistId.value) {
    loadAuditRecords()
  }
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.psychologist-profile-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1000px;
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

.profile-tabs {
  background: #fff;
}

.tab-content {
  padding: 20px 0;
}

.profile-form {
  max-width: 600px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  border: 3px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  color: #fff;
}

.price-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.price-card {
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.price-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.price-card.online {
  border-top: 3px solid #409eff;
}

.price-card.offline {
  border-top: 3px solid #e6a23c;
}

.price-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.price-card-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.price-card-body {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
}

.price-currency {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.price-amount {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  margin: 0 4px;
}

.price-unit {
  font-size: 14px;
  color: #909399;
}

.price-card-footer {
  text-align: right;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.price-edit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-item {
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-note {
  font-size: 12px;
  color: #909399;
}

.service-type {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.service-content {
  margin-bottom: 16px;
}

.price-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.currency {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.price-input-inner {
  width: 150px;
}

.unit {
  font-size: 14px;
  color: #909399;
}

.service-action {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.service-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ecf5ff;
  border: 1px solid #c6e2ff;
  border-radius: 10px;
  margin-top: 20px;
  color: #606266;
  font-size: 13px;
}

.proof-upload {
  width: 100%;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
