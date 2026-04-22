<!-- src/components/PlatformIntro.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="60%"
    class="platform-intro-dialog"
  >
    <div class="intro-content">
      <!-- 平台简介标题 -->
      <div class="intro-section">
        <h2>AI青少年健康网站简介</h2>
        <p>该网站将打造一个"AI+专业心理健康"的平台用于辅助医生更好的了解患者的情绪，融合多模态情感识别与网络热梗语义分析技术，实时感知用户情绪状态与心理倾向。通过AI算法提供个性化心理疏导建议，辅助教育机构与家庭开展早期心理干预，提升心理健康服务的精准性与亲和力。</p>
      </div>

      <!-- 网站特点 -->
      <div class="intro-section">
        <h3>网站主要特点包括：</h3>
        <ol class="features-list">
          <li>整合了包括心理文章、心理课程、心理评测、心理咨询、医院预约、线上AI咨询、热梗识别系统、多模态情感感知等功能。</li>
          <li>按不同资源进行分类，用户可以进行快捷的查找不同资源。</li>
          <li>用户可通过线上AI咨询，能够实现提供倾诉的陪伴、缓解情绪、为用户提供帮助等功能。</li>
          <li>提供医院预约功能，该网站与医院挂号系统进行连接，用户能方便的在线上进行快捷预约挂号，金额支付。</li>
          <li>热梗识别系统可帮助医生更好了解用户的语言，可对用户的流行性词汇进行详细说明，利于医生更好判断患者的情绪和状态。</li>
          <li>线上心理咨询能够实现用户在线上与心理医生取得联系，无需以线下的方式进行，更能方便用户使用，降低了用户的心理负担。</li>
          <li>多模态情感识别，通过摄像头采集和判断用户脸部表情，为医生提供用户的情绪、状态等信息，利于医生全面了解患者各项信息，为心理疗愈提供参考。</li>
        </ol>
      </div>

      <!-- 用户群体 -->
      <div class="intro-section">
        <h3>用户群体：</h3>
        <ul class="user-groups">
          <li><strong>青少年群体：</strong>进行线上咨询、挂号、心理咨询、心理评测。</li>
          <li><strong>医生：</strong>了解患者心理状况，挂号预约情况。</li>
          <li><strong>心理咨询师：</strong>查看用户预约咨询情况，线上、线下对患者提供心理咨询。</li>
          <li><strong>普通用户：</strong>提供丰富的心理健康资源查找，提供各类心理学知识频道。</li>
        </ul>
      </div>

      <!-- 联系信息 -->
      <div class="intro-section">
        <h3>与我联系：</h3>
        <p>希望AI青少年心理健康网站能为大家提供帮助，如有疑问或建议请通过该邮箱与我们取得联系。</p>
        <p><strong>邮箱：</strong>support@aiyouthmental.com</p>
      </div>

      <!-- 声明 -->
      <div class="intro-section disclaimer">
        <p><strong>声明：</strong>网站内部分资源来源于网上，如侵犯您的合法权益，请用以上的方式联系我们，我们将移除该部分内容并道歉。</p>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">我已了解</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '平台简介'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const dialogVisible = ref(props.modelValue)

// 监听prop变化
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

// 监听组件内部变化
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  emit('confirm')
  dialogVisible.value = false
}
</script>

<style scoped>
.platform-intro-dialog :deep(.el-dialog) {
  border-radius: 12px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.platform-intro-dialog :deep(.el-dialog__body) {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  color: #606266;
}

.intro-content {
  line-height: 1.6;
}

.intro-section {
  margin-bottom: 24px;
}

.intro-section h2 {
  color: #409EFF;
  border-left: 4px solid #409EFF;
  padding-left: 12px;
  margin-bottom: 16px;
  font-size: 20px;
}

.intro-section h3 {
  color: #606266;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.features-list {
  padding-left: 20px;
  margin-bottom: 16px;
}

.features-list li {
  margin-bottom: 8px;
  text-align: justify;
}

.user-groups {
  padding-left: 20px;
  margin-bottom: 16px;
}

.user-groups li {
  margin-bottom: 8px;
}

.disclaimer {
  padding: 12px;
  background-color: #f8f9fa;
  border-left: 4px solid #e6a23c;
  border-radius: 4px;
  font-size: 14px;
  color: #909399;
}
</style>