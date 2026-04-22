<template>
  <div class="assessment-editor">
    <div class="header">
      <h2>{{ isEdit ? '编辑量表' : '新增量表' }}</h2>
      <div>
        <el-button type="info" @click="save(0)" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="save(1)" :loading="saving">发布</el-button>
        <el-button @click="goBack">返回列表</el-button>
      </div>
    </div>

    <el-form :model="form" label-width="100px" ref="formRef" class="main-form">
      <el-card shadow="never" class="section-card">
        <template #header><span>基本信息</span></template>
        <el-form-item label="量表标题" prop="title" :rules="{ required: true, message: '请输入标题' }">
          <el-input v-model="form.title" placeholder="请输入测评量表名称"></el-input>
        </el-form-item>
        <el-form-item label="量表描述" prop="description">
          <el-input type="textarea" v-model="form.description" rows="3" placeholder="量表简介与指导语"></el-input>
        </el-form-item>
        <el-form-item label="可见性">
          <el-radio-group v-model="form.isPublic">
            <el-radio :label="1">公开 (用户端可见)</el-radio>
            <el-radio :label="0">私有 (仅医生可见)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="card-header-flex">
            <span>题目配置</span>
            <el-button type="primary" size="small" plain @click="addQuestion">
              <el-icon><Plus /></el-icon> 添加题目
            </el-button>
          </div>
        </template>
        
        <!-- 题目列表容器 -->
        <div class="questions-container">
          <div v-for="(q, index) in questions" :key="q._key" class="question-card">
            <div class="q-header">
              <span class="q-index">题目 {{ index + 1 }}</span>
              <div class="q-actions">
                <el-button size="small" circle @click="moveUp(index)" :disabled="index === 0"><el-icon><Top /></el-icon></el-button>
                <el-button size="small" circle @click="moveDown(index)" :disabled="index === questions.length - 1"><el-icon><Bottom /></el-icon></el-button>
                <el-button size="small" type="danger" circle @click="removeQuestion(index)"><el-icon><Delete /></el-icon></el-button>
              </div>
            </div>
            
            <div class="q-body">
              <el-form-item label="题干" label-width="60px" :prop="`questions.${index}.text`">
                <el-input type="textarea" v-model="q.text" rows="2" placeholder="请输入题目正文"></el-input>
              </el-form-item>
              
              <el-form-item label="选项配置" label-width="60px">
                <div class="options-list">
                  <div v-for="(opt, optIndex) in q.options" :key="optIndex" class="option-item">
                    <el-input v-model="opt.label" placeholder="选项文案" style="width: 200px;"></el-input>
                    <span class="score-label">分值:</span>
                    <el-input-number v-model="opt.value" :min="0" :max="100" style="width: 100px;"></el-input-number>
                    <el-button type="danger" link @click="removeOption(q, Number(optIndex))" style="margin-left: 10px;"><el-icon><Close /></el-icon></el-button>
                  </div>
                  <el-button size="small" dashed @click="addOption(q)">+ 添加选项</el-button>
                </div>
              </el-form-item>
            </div>
          </div>
        </div>
        <el-empty v-if="questions.length === 0" description="暂无题目，请点击上方按钮添加"></el-empty>
      </el-card>

      <el-card shadow="never" class="section-card">
        <template #header>
          <div class="card-header-flex">
            <span>计分规则配置</span>
            <el-button type="primary" size="small" plain @click="addRule">
              <el-icon><Plus /></el-icon> 添加结果区间
            </el-button>
          </div>
        </template>
        
        <div class="rules-container">
          <div v-for="(rule, rIndex) in scoringRules.rules" :key="rIndex" class="rule-card">
             <div class="rule-header">
               <span>区间 {{ rIndex + 1 }}</span>
               <el-button type="danger" link @click="removeRule(rIndex)"><el-icon><Delete /></el-icon></el-button>
             </div>
             <div class="rule-body">
                <el-form-item label="分数范围" label-width="80px">
                  <el-input-number v-model="rule.min" :min="0" placeholder="最低分"></el-input-number>
                  <span style="margin: 0 10px;">~</span>
                  <el-input-number v-model="rule.max" :min="0" placeholder="最高分"></el-input-number>
                </el-form-item>
                <el-form-item label="风险等级" label-width="80px">
                  <el-input v-model="rule.level" placeholder="如：健康、轻度抑郁等"></el-input>
                </el-form-item>
                <el-form-item label="分析建议" label-width="80px">
                  <el-input type="textarea" v-model="rule.analysis" rows="3" placeholder="给用户的分析报告及建议"></el-input>
                </el-form-item>
             </div>
          </div>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Delete, Top, Bottom, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/api/user'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)

const formRef = ref()
const saving = ref(false)

const form = reactive<any>({
  title: '',
  description: '',
  type: 'TRADITIONAL',
  isPublic: 1,
  status: 1
})

// 题目列表
const questions = ref<any[]>([])

// 计分规则
const scoringRules = reactive<{rules: any[]}>({
  rules: []
})

// 生成唯一key，用于v-for
const generateKey = () => Math.random().toString(36).substring(2, 9)

const fetchTemplate = async () => {
  try {
    const res = await request.get(`/assessment/template/${route.params.id}`) as any
    if (res.code === 200) {
      Object.assign(form, res.data)
      
      // 解析 JSON
      if (res.data.questionsJson) {
        let qJson = typeof res.data.questionsJson === 'string' ? JSON.parse(res.data.questionsJson) : res.data.questionsJson
        questions.value = qJson.map((q: any) => ({ ...q, _key: generateKey() }))
      }
      
      if (res.data.scoringRulesJson) {
        let rJson = typeof res.data.scoringRulesJson === 'string' ? JSON.parse(res.data.scoringRulesJson) : res.data.scoringRulesJson
        if (rJson.rules) scoringRules.rules = rJson.rules
      }
    }
  } catch (e) {
    ElMessage.error('加载数据失败')
  }
}

// 题目操作
const addQuestion = () => {
  questions.value.push({
    _key: generateKey(),
    id: `q${Date.now()}`,
    text: '',
    options: [
      { label: '从不', value: 0 },
      { label: '偶尔', value: 1 },
      { label: '经常', value: 2 },
      { label: '总是', value: 3 }
    ]
  })
}

const removeQuestion = (index: number) => {
  questions.value.splice(index, 1)
}

const moveUp = (index: number) => {
  if (index > 0) {
    const temp = questions.value[index]
    questions.value[index] = questions.value[index - 1]
    questions.value[index - 1] = temp
  }
}

const moveDown = (index: number) => {
  if (index < questions.value.length - 1) {
    const temp = questions.value[index]
    questions.value[index] = questions.value[index + 1]
    questions.value[index + 1] = temp
  }
}

// 选项操作
const addOption = (question: any) => {
  question.options.push({ label: '', value: 0 })
}

const removeOption = (question: any, optIndex: number) => {
  question.options.splice(optIndex, 1)
}

// 规则操作
const addRule = () => {
  scoringRules.rules.push({ min: 0, max: 0, level: '', analysis: '' })
}

const removeRule = (index: number) => {
  scoringRules.rules.splice(index, 1)
}

const save = async (status: number) => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (questions.value.length === 0) {
        ElMessage.warning('请至少添加一道题目')
        return
      }

      form.status = status
      
      // 移除临时 _key
      const cleanQuestions = questions.value.map(q => {
        const { _key, ...rest } = q
        return rest
      })
      
      form.questionsJson = JSON.stringify(cleanQuestions)
      form.scoringRulesJson = JSON.stringify(scoringRules)

      saving.value = true
      try {
        const res = await request.post('/assessment/template', form) as any
        if (res.code === 200) {
          ElMessage.success(status === 1 ? '发布成功' : '草稿保存成功')
          goBack()
        } else {
          ElMessage.error(res.message)
        }
      } catch (e) {
        ElMessage.error('保存失败')
      } finally {
        saving.value = false
      }
    }
  })
}

const goBack = () => {
  router.push('/admin/content/assessments')
}

onMounted(() => {
  if (isEdit.value) {
    fetchTemplate()
  } else {
    // 默认提供一题示例
    addQuestion()
    addRule()
  }
})
</script>

<style scoped>
.assessment-editor {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.main-form {
  max-width: 1000px;
}

.section-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
}

.q-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 6px 6px 0 0;
}

.q-index {
  font-weight: bold;
  color: #606266;
}

.q-body {
  padding: 15px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  padding: 8px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.score-label {
  font-size: 13px;
  color: #909399;
}

.rule-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 15px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: #fdf6ec;
  border-bottom: 1px solid #faecd8;
  font-weight: bold;
  color: #e6a23c;
}

.rule-body {
  padding: 15px;
}
</style>