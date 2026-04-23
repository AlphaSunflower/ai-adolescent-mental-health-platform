<template>
  <div class="psychologist-admin-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>心理咨询师管理</h2>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statsData.totalCount || 0 }}</div>
          <div class="stat-label">咨询师总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statsData.enabledCount || 0 }}</div>
          <div class="stat-label">已启用</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><CloseBold /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statsData.disabledCount || 0 }}</div>
          <div class="stat-label">已禁用</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon><StarFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ (statsData.avgRating || 0).toFixed(1) }}</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索咨询师姓名/用户名"
        clearable
        @clear="handleSearch"
        style="width: 250px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px;">
        <el-option label="全部" :value="null"></el-option>
        <el-option label="已启用" :value="1"></el-option>
        <el-option label="已禁用" :value="0"></el-option>
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon> 搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon> 重置
      </el-button>
      <el-button type="success" @click="openAddDialog">
        <el-icon><Plus /></el-icon> 新增咨询师
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="psychologistList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column label="咨询师信息" min-width="150">
        <template #default="scope">
          <div class="psychologist-info">
            <el-avatar :size="40" :src="scope.row.headPath">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="info-detail">
              <div class="name">{{ scope.row.realName || '未设置' }}</div>
              <div class="username">{{ scope.row.userNickname || '-' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="联系方式" width="150">
        <template #default="scope">
          <div>{{ scope.row.phone || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="咨询定价" width="120">
        <template #default="scope">
          <span class="price">¥{{ scope.row.consultationPrice || '未设置' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分" width="150">
        <template #default="scope">
          <el-rate v-model="scope.row.rating" disabled size="small" :max="5" :allow-half="true" />
          <span class="rating-text">{{ scope.row.rating ? scope.row.rating.toFixed(1) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="咨询次数" width="100">
        <template #default="scope">
          <span>{{ scope.row.consultationCount || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="在线状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.onlineStatus === 1 ? 'success' : 'info'" size="small">
            {{ scope.row.onlineStatus === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
            {{ scope.row.status === 1 ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="入驻时间" width="160">
        <template #default="scope">
          <span>{{ scope.row.createTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" link @click="handleViewDetail(scope.row)">
            查看详情
          </el-button>
          <el-button size="small" type="warning" link @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button size="small" type="danger" link @click="handleDelete(scope.row)">
            删除
          </el-button>
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
            size="small"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formDialogType === 'add' ? '新增咨询师' : '编辑咨询师'"
      width="600px"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="关联用户" prop="userId" v-if="formDialogType === 'add'">
          <el-select
            v-model="formData.userId"
            filterable
            placeholder="请选择关联的用户"
            style="width: 100%"
            @focus="loadUserOptions"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.nickname || user.username} (${user.username})`"
              :value="user.id"
            >
              <span style="float: left">{{ user.nickname || user.username }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px;">{{ user.username }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="咨询师姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入咨询师姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="formData.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload-wrapper">
            <el-avatar :size="80" :src="formData.headPath" class="avatar-preview">
              <el-icon :size="30"><User /></el-icon>
            </el-avatar>
            <el-upload
              class="avatar-uploader"
              action="/api/psychologist-apply/upload"
              :headers="{ token: token }"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
              accept="image/*"
            >
              <el-button size="small" type="primary">上传头像</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="咨询定价" prop="consultationPrice">
          <el-input-number v-model="formData.consultationPrice" :min="0" :precision="2" :step="50" />
          <span class="unit-label">元/小时</span>
        </el-form-item>
        <el-form-item label="从业年数">
          <el-input-number v-model="formData.yearsExperience" :min="0" :max="50" />
        </el-form-item>
        <el-form-item label="专业认证">
          <div class="qualification-select">
            <el-select
              v-model="selectedQualificationId"
              placeholder="选择资质类型"
              style="width: 200px;"
              @focus="loadQualificationOptions"
            >
              <el-option
                v-for="q in qualificationOptions"
                :key="q.id"
                :label="q.name"
                :value="q.id"
              />
            </el-select>
            <el-button type="primary" @click="addQualificationTag" :disabled="!selectedQualificationId">添加</el-button>
          </div>
          <div class="qualification-tags" v-if="formData.qualificationIds.length > 0">
            <el-tag
              v-for="qid in formData.qualificationIds"
              :key="qid"
              closable
              @close="removeQualificationTag(qid)"
            >
              {{ getQualificationName(qid) }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="擅长领域">
          <div class="qualification-select">
            <el-select
              v-model="selectedFieldId"
              placeholder="选择擅长领域"
              style="width: 200px;"
              @focus="loadFieldOptions"
            >
              <el-option
                v-for="f in fieldOptions"
                :key="f.id"
                :label="f.name"
                :value="f.id"
              />
            </el-select>
            <el-button type="primary" @click="addFieldTag" :disabled="!selectedFieldId">添加</el-button>
          </div>
          <div class="qualification-tags" v-if="formData.fieldIds.length > 0">
            <el-tag
              v-for="fid in formData.fieldIds"
              :key="fid"
              closable
              @close="removeFieldTag(fid)"
            >
              {{ getFieldName(fid) }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="formLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="咨询师详情" width="900px">
      <div v-if="currentPsychologist" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="咨询师姓名">{{ currentPsychologist.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentPsychologist.userNickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentPsychologist.sex === 1 ? '男' : currentPsychologist.sex === 2 ? '女' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentPsychologist.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询定价">¥{{ currentPsychologist.consultationPrice || '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询经验">{{ currentPsychologist.yearsExperience || '-' }}年</el-descriptions-item>
          <el-descriptions-item label="评分" :span="2">{{ currentPsychologist.rating ? currentPsychologist.rating.toFixed(1) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="咨询次数" :span="2">{{ currentPsychologist.consultationCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="个人简介" :span="2">
            <div class="bio-content">{{ currentPsychologist.bio || '暂无简介' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentPsychologist.status === 1 ? 'success' : 'danger'">
              {{ currentPsychologist.status === 1 ? '已启用' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="在线状态">
            <el-tag :type="currentPsychologist.onlineStatus === 1 ? 'success' : 'info'">
              {{ currentPsychologist.onlineStatus === 1 ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 擅长领域管理 -->
        <div class="section">
          <div class="section-header">
            <h4>擅长领域</h4>
            <el-button type="primary" size="small" @click="openFieldDialog('add')">
              <el-icon><Plus /></el-icon> 添加
            </el-button>
          </div>
          <el-table :data="psychologistFields" stripe size="small" max-height="200">
            <el-table-column prop="fieldName" label="领域名称" min-width="120"></el-table-column>
            <el-table-column prop="fieldCode" label="领域代码" width="120"></el-table-column>
            <el-table-column prop="subTags" label="细分标签" min-width="150">
              <template #default="scope">
                <span>{{ scope.row.subTags || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="openFieldDialog('edit', scope.row)">编辑</el-button>
                <el-button size="small" type="danger" link @click="deleteField(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 资质管理 -->
        <div class="section">
          <div class="section-header">
            <h4>资质证书</h4>
            <el-button type="primary" size="small" @click="openQualificationDialog('add')">
              <el-icon><Plus /></el-icon> 添加
            </el-button>
          </div>
          <el-table :data="psychologistQualifications" stripe size="small" max-height="200">
            <el-table-column prop="qualificationName" label="资质名称" min-width="150"></el-table-column>
            <el-table-column prop="qualificationCode" label="资质代码" width="120"></el-table-column>
            <el-table-column prop="certificateUrl" label="证书图片" min-width="150">
              <template #default="scope">
                <span v-if="scope.row.certificateUrl">{{ scope.row.certificateUrl }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="isVerified" label="认证状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.isVerified === 1 ? 'success' : 'info'" size="small">
                  {{ scope.row.isVerified === 1 ? '已认证' : '未认证' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="openQualificationDialog('edit', scope.row)">编辑</el-button>
                <el-button size="small" type="danger" link @click="deleteQualification(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑擅长领域对话框 -->
    <el-dialog v-model="fieldDialogVisible" :title="fieldDialogType === 'add' ? '添加擅长领域' : '编辑擅长领域'" width="500px">
      <el-form :model="fieldForm" label-width="100px">
        <el-form-item label="咨询领域" required>
          <el-select v-model="fieldForm.fieldId" placeholder="请选择咨询领域" style="width: 100%">
            <el-option v-for="item in fieldOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="细分标签">
          <el-input v-model="fieldForm.subTags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fieldDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveField" :loading="fieldLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑资质对话框 -->
    <el-dialog v-model="qualificationDialogVisible" :title="qualificationDialogType === 'add' ? '添加资质' : '编辑资质'" width="500px">
      <el-form :model="qualificationForm" label-width="100px">
        <el-form-item label="资质类型" required>
          <el-select v-model="qualificationForm.qualificationId" placeholder="请选择资质类型" style="width: 100%">
            <el-option v-for="item in qualificationOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="证书图片">
          <el-upload
            class="certificate-uploader"
            action="/api/psychologist-apply/upload"
            :headers="{ token: token }"
            :show-file-list="false"
            :on-success="handleCertificateSuccess"
            :before-upload="beforeCertificateUpload"
            accept="image/*"
          >
            <img v-if="qualificationForm.certificateUrl" :src="qualificationForm.certificateUrl" class="certificate-preview" />
            <el-icon v-else class="certificate-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-radio-group v-model="qualificationForm.isVerified">
            <el-radio :label="1">已认证</el-radio>
            <el-radio :label="0">未认证</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="qualificationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQualification" :loading="qualificationLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, User, UserFilled, CircleCheck, CloseBold,
  StarFilled, Plus
} from '@element-plus/icons-vue'
import {
  getAdminPsychologistList,
  updatePsychologistStatus,
  getAdminPsychologistDetail,
  getPsychologistFields,
  addPsychologistField,
  updatePsychologistField,
  deletePsychologistField,
  getFieldOptions,
  getPsychologistQualifications,
  addPsychologistQualification,
  updatePsychologistQualification,
  deletePsychologistQualification,
  getQualificationOptions,
  addPsychologist,
  updatePsychologist,
  deletePsychologist
} from '@/api/psychologistAdmin'
import request from '@/utils/request'

const loading = ref(false)
const keyword = ref('')
const statusFilter = ref<number | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const psychologistList = ref<any[]>([])
const statsData = reactive({
  totalCount: 0,
  enabledCount: 0,
  disabledCount: 0,
  avgRating: 0
})

// 新增/编辑表单相关
const formDialogVisible = ref(false)
const formDialogType = ref<'add' | 'edit'>('add')
const formLoading = ref(false)
const formRef = ref()
const formData = reactive({
  id: null as number | null,
  userId: null as number | null,
  realName: '',
  sex: 0,
  headPath: '',
  yearsExperience: 0,
  consultationPrice: 0,
  qualificationIds: [] as number[],
  fieldIds: [] as number[],
  status: 1
})
const formRules = {
  userId: [{ required: true, message: '请选择关联用户', trigger: 'change' }],
  realName: [{ required: true, message: '请输入咨询师姓名', trigger: 'blur' }],
  consultationPrice: [{ required: true, message: '请输入咨询定价', trigger: 'blur' }]
}
const userOptions = ref<any[]>([])
const token = ref(localStorage.getItem('token') || '')
const selectedQualificationId = ref<number | null>(null)
const qualificationOptions = ref<any[]>([])
const selectedFieldId = ref<number | null>(null)
const fieldOptions = ref<any[]>([])

const detailDialogVisible = ref(false)
const currentPsychologist = ref<any>(null)

// 擅长领域相关
const psychologistFields = ref<any[]>([])
const fieldDialogVisible = ref(false)
const fieldDialogType = ref<'add' | 'edit'>('add')
const fieldForm = reactive({
  id: null as number | null,
  fieldId: null as number | null,
  subTags: ''
})
const fieldLoading = ref(false)

// 资质相关
const psychologistQualifications = ref<any[]>([])
const qualificationDialogVisible = ref(false)
const qualificationDialogType = ref<'add' | 'edit'>('add')
const qualificationForm = reactive({
  id: null as number | null,
  qualificationId: null as number | null,
  certificateUrl: '',
  isVerified: 0
})
const qualificationLoading = ref(false)

// 获取列表数据
const fetchList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      size: pageSize.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    if (statusFilter.value !== null) {
      params.status = statusFilter.value
    }

    const res: any = await getAdminPsychologistList(params)
    if (res.code === 200) {
      // 兼容 records 和 list 两种返回格式
      psychologistList.value = res.data?.records || res.data?.list || []
      total.value = res.data?.total || 0

      // 统计计算
      statsData.totalCount = res.data?.total || 0
      statsData.enabledCount = psychologistList.value.filter(p => p.status === 1).length
      statsData.disabledCount = psychologistList.value.filter(p => p.status === 0).length
      const totalRating = psychologistList.value.reduce((sum, p) => sum + (p.rating || 0), 0)
      statsData.avgRating = psychologistList.value.length > 0 ? totalRating / psychologistList.value.length : 0
    } else {
      ElMessage.error(res.message || '获取列表失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}

// 重置
const handleReset = () => {
  keyword.value = ''
  statusFilter.value = null
  currentPage.value = 1
  fetchList()
}

// 分页
const handleSizeChange = () => {
  currentPage.value = 1
  fetchList()
}

const handleCurrentChange = () => {
  fetchList()
}

// 查看详情
const handleViewDetail = async (row: any) => {
  try {
    const res: any = await getAdminPsychologistDetail(row.id)
    if (res.code === 200) {
      currentPsychologist.value = res.data
      detailDialogVisible.value = true
      // 加载擅长领域和资质列表
      loadPsychologistRelations(row.id)
    } else {
      ElMessage.error(res.message || '获取详情失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

// 加载擅长领域和资质列表
const loadPsychologistRelations = async (psychologistId: number) => {
  try {
    // 加载擅长领域
    const fieldsRes: any = await getPsychologistFields(psychologistId)
    if (fieldsRes.code === 200) {
      psychologistFields.value = fieldsRes.data || []
    }
    // 加载资质
    const qualRes: any = await getPsychologistQualifications(psychologistId)
    if (qualRes.code === 200) {
      psychologistQualifications.value = qualRes.data || []
    }
    // 加载选项
    const optionsRes: any = await Promise.all([getFieldOptions(), getQualificationOptions()])
    if (optionsRes[0].code === 200) {
      fieldOptions.value = optionsRes[0].data || []
    }
    if (optionsRes[1].code === 200) {
      qualificationOptions.value = optionsRes[1].data || []
    }
  } catch (error: any) {
    ElMessage.error('加载关联数据失败')
  }
}

// 擅长领域对话框
const openFieldDialog = (type: 'add' | 'edit', row?: any) => {
  fieldDialogType.value = type
  if (type === 'add') {
    fieldForm.id = null
    fieldForm.fieldId = null
    fieldForm.subTags = ''
  } else {
    fieldForm.id = row.id
    fieldForm.fieldId = row.fieldId
    fieldForm.subTags = row.subTags || ''
  }
  fieldDialogVisible.value = true
}

// 保存擅长领域
const saveField = async () => {
  if (!fieldForm.fieldId) {
    ElMessage.warning('请选择咨询领域')
    return
  }
  fieldLoading.value = true
  try {
    let res: any
    if (fieldDialogType.value === 'add') {
      res = await addPsychologistField(currentPsychologist.value.id, {
        fieldId: fieldForm.fieldId,
        subTags: fieldForm.subTags
      })
    } else {
      res = await updatePsychologistField(fieldForm.id!, {
        fieldId: fieldForm.fieldId,
        subTags: fieldForm.subTags
      })
    }
    if (res.code === 200) {
      ElMessage.success(fieldDialogType.value === 'add' ? '添加成功' : '更新成功')
      fieldDialogVisible.value = false
      // 重新加载列表
      const fieldsRes: any = await getPsychologistFields(currentPsychologist.value.id)
      if (fieldsRes.code === 200) {
        psychologistFields.value = fieldsRes.data || []
      }
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    fieldLoading.value = false
  }
}

// 删除擅长领域
const deleteField = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该擅长领域吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await deletePsychologistField(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      // 重新加载列表
      const fieldsRes: any = await getPsychologistFields(currentPsychologist.value.id)
      if (fieldsRes.code === 200) {
        psychologistFields.value = fieldsRes.data || []
      }
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 资质对话框
const openQualificationDialog = (type: 'add' | 'edit', row?: any) => {
  qualificationDialogType.value = type
  if (type === 'add') {
    qualificationForm.id = null
    qualificationForm.qualificationId = null
    qualificationForm.certificateUrl = ''
    qualificationForm.isVerified = 0
  } else {
    qualificationForm.id = row.id
    qualificationForm.qualificationId = row.qualificationId
    qualificationForm.certificateUrl = row.certificateUrl || ''
    qualificationForm.isVerified = row.isVerified || 0
  }
  qualificationDialogVisible.value = true
}

// 保存资质
const saveQualification = async () => {
  if (!qualificationForm.qualificationId) {
    ElMessage.warning('请选择资质类型')
    return
  }
  qualificationLoading.value = true
  try {
    let res: any
    if (qualificationDialogType.value === 'add') {
      res = await addPsychologistQualification(currentPsychologist.value.id, {
        qualificationId: qualificationForm.qualificationId,
        certificateUrl: qualificationForm.certificateUrl,
        isVerified: qualificationForm.isVerified
      })
    } else {
      res = await updatePsychologistQualification(qualificationForm.id!, {
        qualificationId: qualificationForm.qualificationId,
        certificateUrl: qualificationForm.certificateUrl,
        isVerified: qualificationForm.isVerified
      })
    }
    if (res.code === 200) {
      ElMessage.success(qualificationDialogType.value === 'add' ? '添加成功' : '更新成功')
      qualificationDialogVisible.value = false
      // 重新加载列表
      const qualRes: any = await getPsychologistQualifications(currentPsychologist.value.id)
      if (qualRes.code === 200) {
        psychologistQualifications.value = qualRes.data || []
      }
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    qualificationLoading.value = false
  }
}

// 删除资质
const deleteQualification = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该资质吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res: any = await deletePsychologistQualification(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      // 重新加载列表
      const qualRes: any = await getPsychologistQualifications(currentPsychologist.value.id)
      if (qualRes.code === 200) {
        psychologistQualifications.value = qualRes.data || []
      }
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 状态切换
const handleStatusChange = async (row: any) => {
  try {
    const res: any = await updatePsychologistStatus(row.id, row.status === 1)
    if (res.code === 200) {
      ElMessage.success(row.status === 1 ? '已启用' : '已禁用')
    } else {
      ElMessage.error(res.message || '操作失败')
      // 恢复原状态
      row.status = row.status === 1 ? 0 : 1
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

// 加载用户选项
const loadUserOptions = async () => {
  if (userOptions.value.length > 0) return
  try {
    const res: any = await request({
      url: '/api/admin/users',
      method: 'get',
      params: { page: 1, size: 100 }
    })
    if (res.code === 200) {
      const users = res.data?.records || res.data?.list || []
      // 过滤掉已经是心理咨询师的用户
      userOptions.value = users
    }
  } catch (e) {
    console.error('加载用户列表失败', e)
  }
}

// 打开新增对话框
const openAddDialog = () => {
  formDialogType.value = 'add'
  formData.id = null
  formData.userId = null
  formData.realName = ''
  formData.sex = 0
  formData.headPath = ''
  formData.yearsExperience = 0
  formData.consultationPrice = 0
  formData.qualificationIds = []
  formData.fieldIds = []
  formData.status = 1
  userOptions.value = []
  selectedQualificationId.value = null
  qualificationOptions.value = []
  selectedFieldId.value = null
  fieldOptions.value = []
  formDialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = async (row: any) => {
  formDialogType.value = 'edit'
  formData.id = row.id
  formData.userId = row.userId
  formData.realName = row.realName
  formData.sex = row.sex || 0
  formData.headPath = row.headPath || ''
  formData.yearsExperience = row.yearsExperience || 0
  formData.consultationPrice = row.consultationPrice || 0
  formData.qualificationIds = row.qualificationIds || []
  formData.fieldIds = row.fieldIds || []
  formData.status = row.status || 0
  selectedQualificationId.value = null
  selectedFieldId.value = null

  // 加载资质选项和擅长领域选项
  await loadQualificationOptions()
  await loadFieldOptions()
  formDialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  formLoading.value = true
  try {
    const data = {
      realName: formData.realName,
      sex: formData.sex,
      headPath: formData.headPath,
      yearsExperience: formData.yearsExperience,
      consultationPrice: formData.consultationPrice,
      qualificationIds: formData.qualificationIds,
      fieldIds: formData.fieldIds,
      status: formData.status
    }

    let res: any
    if (formDialogType.value === 'add') {
      if (formData.userId === null) {
        ElMessage.warning('请选择关联用户')
        return
      }
      res = await addPsychologist({ ...data, userId: formData.userId })
    } else {
      res = await updatePsychologist(formData.id!, data)
    }
    if (res.code === 200) {
      ElMessage.success(formDialogType.value === 'add' ? '添加成功' : '更新成功')
      formDialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

// 删除咨询师
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除咨询师"${row.realName}"吗？删除后不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res: any = await deletePsychologist(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 资质相关方法
const loadQualificationOptions = async () => {
  if (qualificationOptions.value.length > 0) return
  try {
    const res: any = await request({
      url: '/api/admin/psychologist/qualifications/options',
      method: 'get'
    })
    if (res.code === 200) {
      qualificationOptions.value = res.data || []
    }
  } catch (e) {
    console.error('加载资质列表失败', e)
  }
}

const addQualificationTag = () => {
  if (selectedQualificationId.value && !formData.qualificationIds.includes(selectedQualificationId.value)) {
    formData.qualificationIds.push(selectedQualificationId.value)
  }
  selectedQualificationId.value = null
}

const removeQualificationTag = (qid: number) => {
  const index = formData.qualificationIds.indexOf(qid)
  if (index > -1) {
    formData.qualificationIds.splice(index, 1)
  }
}

const getQualificationName = (qid: number) => {
  const q = qualificationOptions.value.find(item => item.id === qid)
  return q ? q.name : ''
}

// 擅长领域相关方法
const loadFieldOptions = async () => {
  if (fieldOptions.value.length > 0) return
  try {
    const res: any = await request({
      url: '/api/admin/psychologist/fields/options',
      method: 'get'
    })
    if (res.code === 200) {
      fieldOptions.value = res.data || []
    }
  } catch (e) {
    console.error('加载擅长领域列表失败', e)
  }
}

const addFieldTag = () => {
  if (selectedFieldId.value && !formData.fieldIds.includes(selectedFieldId.value)) {
    formData.fieldIds.push(selectedFieldId.value)
  }
  selectedFieldId.value = null
}

const removeFieldTag = (fid: number) => {
  const index = formData.fieldIds.indexOf(fid)
  if (index > -1) {
    formData.fieldIds.splice(index, 1)
  }
}

const getFieldName = (fid: number) => {
  const f = fieldOptions.value.find(item => item.id === fid)
  return f ? f.name : ''
}

// 头像上传相关
const handleAvatarSuccess = (res: any) => {
  if (res.code === 200) {
    formData.headPath = res.data
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

// 证书上传相关
const handleCertificateSuccess = (res: any) => {
  if (res.code === 200) {
    qualificationForm.certificateUrl = res.data
    ElMessage.success('证书上传成功')
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

const beforeCertificateUpload = (file: File) => {
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

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.psychologist-admin-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.green { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.stat-icon.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.purple { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.filter-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.psychologist-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-detail .name {
  font-weight: 500;
  color: #303133;
}

.info-detail .username {
  font-size: 12px;
  color: #909399;
}

.price {
  color: #f56c6c;
  font-weight: 500;
}

.rating-text {
  margin-left: 5px;
  font-size: 12px;
  color: #909399;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.detail-content {
  padding: 10px 0;
}

.bio-content {
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.section {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  border: 2px solid #dcdfe6;
}

.unit-label {
  margin-left: 8px;
  color: #606266;
}

.qualification-select {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.qualification-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.certificate-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.certificate-uploader:hover {
  border-color: #409eff;
}

.certificate-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.certificate-uploader-icon {
  font-size: 28px;
  color: #8c9399;
}
</style>
