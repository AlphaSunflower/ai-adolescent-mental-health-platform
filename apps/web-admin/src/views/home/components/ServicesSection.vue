<template>
  <div class="services-section">
    <!-- 标题区域 -->
    <div class="section-header">
      <h2 class="section-title">专业心理服务</h2>
      <p class="section-subtitle">针对 情绪压力 / 亲密关系 / 性心理 / 亲子教育 / 个人成长 等不同领域提供个性化专业定制服务</p>
    </div>

    <!-- 服务网格 -->
    <div class="services-grid">
      <div 
        v-for="(service, index) in services" 
        :key="index"
        class="service-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
        @click="goTo(service.path)"
      >
        <div class="card-glow"></div>
        <div class="card-content">
          <div class="service-icon" :class="service.iconClass">
            {{ service.icon }}
          </div>
          <h3 class="service-name">{{ service.name }}</h3>
          <p class="service-desc">{{ service.description }}</p>
        </div>
        <div class="card-hover-effect"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const services = [
  {
    icon: '📚',
    iconClass: 'icon-course',
    name: '心理课程',
    description: '全球精选针对性课程',
    path: '/courses'
  },
  {
    icon: '👨‍⚕️',
    iconClass: 'icon-consult',
    name: '心理咨询',
    description: '严选咨询师，高质量服务',
    path: '/consultation'
  },
  {
    icon: '🤖',
    iconClass: 'icon-ai',
    name: 'AI咨询助理',
    description: '24小时专业答疑',
    path: '/ai-consultation'
  },
  {
    icon: '💬',
    iconClass: 'icon-listen',
    name: '小爱倾听师',
    description: '随时随地的心理陪伴',
    path: '/xiaoai-listen'
  },
  {
    icon: '📊',
    iconClass: 'icon-test',
    name: '心理测试',
    description: '专业量表认识自我',
    path: '/assessments'
  },
  {
    icon: '📝',
    iconClass: 'icon-article',
    name: '心理文章',
    description: '全球分享互相改变',
    path: '/articles'
  },
  {
    icon: '🏥',
    iconClass: 'icon-doctor',
    name: '医生咨询',
    description: '各地医院挂号服务',
    path: '/consultation/doctor'
  },
  {
    icon: '📖',
    iconClass: 'icon-book',
    name: '心理书籍',
    description: '全球精选心理书籍',
    path: '/books'
  }
]

const goTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.services-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 60px auto 0;
  padding: 0 20px;
}

/* 标题区域 */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px;
  text-shadow: 0 2px 20px rgba(167, 139, 250, 0.5);
  letter-spacing: 4px;
  position: relative;
  display: inline-block;
}

.section-title::before,
.section-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #a78bfa);
  transform: translateY(-50%);
}

.section-title::before {
  right: 100%;
  margin-right: 20px;
  background: linear-gradient(90deg, transparent, #a78bfa);
}

.section-title::after {
  left: 100%;
  margin-left: 20px;
  background: linear-gradient(270deg, transparent, #a78bfa);
}

.section-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
}

/* 服务网格 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.service-card {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: rgba(167, 139, 250, 0.5);
  box-shadow: 0 20px 40px rgba(167, 139, 250, 0.2), 0 0 30px rgba(167, 139, 250, 0.1);
}

.service-card:hover .card-glow {
  opacity: 1;
}

.service-card:hover .card-hover-effect {
  transform: scale(3);
  opacity: 0.1;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(167, 139, 250, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-hover-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #a78bfa, #818cf8);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.5s ease;
  pointer-events: none;
  z-index: 0;
}

.card-content {
  position: relative;
  z-index: 1;
}

.service-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: inline-block;
  transition: transform 0.4s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.service-card:hover .service-icon {
  transform: scale(1.15) rotate(5deg);
}

.service-name {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 10px;
  transition: color 0.3s ease;
}

.service-card:hover .service-name {
  color: #a78bfa;
}

.service-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.service-card:hover .service-desc {
  color: rgba(255, 255, 255, 0.8);
}

/* 图标特定颜色 */
.icon-course:hover { filter: drop-shadow(0 0 15px rgba(255, 193, 7, 0.6)); }
.icon-consult:hover { filter: drop-shadow(0 0 15px rgba(64, 158, 255, 0.6)); }
.icon-ai:hover { filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.6)); }
.icon-listen:hover { filter: drop-shadow(0 0 15px rgba(103, 194, 58, 0.6)); }
.icon-test:hover { filter: drop-shadow(0 0 15px rgba(245, 108, 108, 0.6)); }
.icon-article:hover { filter: drop-shadow(0 0 15px rgba(230, 162, 60, 0.6)); }
.icon-doctor:hover { filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6)); }
.icon-book:hover { filter: drop-shadow(0 0 15px rgba(159, 122, 234, 0.6)); }

/* 响应式 */
@media (max-width: 992px) {
  .services-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .section-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  
  .service-card {
    padding: 20px 16px;
  }
  
  .service-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }
  
  .service-name {
    font-size: 15px;
  }
  
  .service-desc {
    font-size: 12px;
  }
  
  .section-title::before,
  .section-title::after {
    display: none;
  }
}

@media (max-width: 480px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .service-card {
    padding: 16px 12px;
  }
  
  .service-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }
  
  .section-title {
    font-size: 24px;
    letter-spacing: 2px;
  }
  
  .section-subtitle {
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
