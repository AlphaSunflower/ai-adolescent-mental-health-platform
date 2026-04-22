<template>
  <div class="about-section">
    <div class="about-container">
      <!-- 标题 -->
      <div class="about-header">
        <h2 class="about-title">
          <span class="title-icon">💜</span>
          心愈智联
          <span class="title-icon">💜</span>
        </h2>
        <p class="about-subtitle">
          心愈智联旗下专业心理咨询师成长平台
        </p>
      </div>

      <!-- 介绍内容 -->
      <div class="about-content">
        <div class="intro-text">
          <p>
            「心愈智联」成立于2026年，作为专业心理咨询师成长平台，致力于提供心理咨询师终身成长教育服务。
            为想要成为专业心理咨询师的你，提供系统化的专业学习路径、执业通路和执业支持。
          </p>
          <p>
            我们汇集全球师资，在研发上，以专业需求的完备性为指针，各类优质课程能覆盖心理咨询师成长各个重要阶段，
            帮助学习者提高胜任力，应对执业过程中的各种挑战。
          </p>
        </div>
      </div>

      <!-- 特色模块 -->
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card"
          :class="feature.class"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.description }}</p>
          <div class="feature-glow"></div>
        </div>
      </div>

      <!-- 数据展示 -->
      <div class="stats-row">
        <div class="stat-item" v-for="(stat, index) in stats" :key="index">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    icon: '🎓',
    title: '系统化学习',
    description: '覆盖心理咨询师成长各个重要阶段的学习路径',
    class: 'feature-purple'
  },
  {
    icon: '🌍',
    title: '全球师资',
    description: '汇集全球优质师资力量，提供专业指导',
    class: 'feature-blue'
  },
  {
    icon: '💼',
    title: '执业支持',
    description: '提供执业通路和全方位支持服务',
    class: 'feature-green'
  },
  {
    icon: '🚀',
    title: '能力提升',
    description: '帮助学习者提高胜任力，应对各种挑战',
    class: 'feature-orange'
  }
]

const stats = [
  { value: '2026+', label: '成立年份' },
  { value: '100+', label: '专业课程' },
  { value: '50+', label: '全球导师' },
  { value: '10000+', label: '学员总数' }
]
</script>

<style scoped>
.about-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 60px auto 0;
  padding: 0 20px 60px;
}

.about-container {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 60px 50px;
  position: relative;
  overflow: hidden;
}

/* 装饰背景 */
.about-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(167, 139, 250, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(129, 140, 248, 0.08) 0%, transparent 50%);
  pointer-events: none;
  animation: bgRotate 30s linear infinite;
}

@keyframes bgRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 标题 */
.about-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.about-title {
  font-size: 42px;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 16px;
  letter-spacing: 8px;
  text-shadow: 0 4px 30px rgba(167, 139, 250, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.title-icon {
  font-size: 36px;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.about-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
  letter-spacing: 2px;
}

/* 介绍内容 */
.about-content {
  position: relative;
  z-index: 1;
  margin-bottom: 50px;
}

.intro-text {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.intro-text p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 2;
  margin: 0 0 20px;
}

.intro-text p:last-child {
  margin-bottom: 0;
}

/* 特色模块 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 50px;
  position: relative;
  z-index: 1;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  transition: all 0.4s ease;
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

.feature-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 255, 255, 0.25);
}

.feature-card:hover .feature-glow {
  opacity: 1;
}

.feature-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.feature-purple:hover {
  border-color: rgba(167, 139, 250, 0.5);
  box-shadow: 0 15px 35px rgba(167, 139, 250, 0.25);
}

.feature-blue:hover {
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 15px 35px rgba(96, 165, 250, 0.25);
}

.feature-green:hover {
  border-color: rgba(103, 232, 204, 0.5);
  box-shadow: 0 15px 35px rgba(103, 232, 204, 0.25);
}

.feature-orange:hover {
  border-color: rgba(255, 183, 77, 0.5);
  box-shadow: 0 15px 35px rgba(255, 183, 77, 0.25);
}

.feature-icon {
  font-size: 44px;
  margin-bottom: 16px;
  display: inline-block;
  transition: transform 0.4s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.15) rotate(-5deg);
}

.feature-title {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 10px;
}

.feature-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.6;
}

/* 数据展示 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  position: relative;
  z-index: 1;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 20px rgba(167, 139, 250, 0.3);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* 响应式 */
@media (max-width: 992px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .about-container {
    padding: 48px 36px;
  }
  
  .about-title {
    font-size: 34px;
    letter-spacing: 4px;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 36px 24px;
    border-radius: 24px;
  }
  
  .about-title {
    font-size: 28px;
    letter-spacing: 2px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .about-subtitle {
    font-size: 15px;
  }
  
  .intro-text p {
    font-size: 14px;
    line-height: 1.8;
  }
  
  .features-grid {
    gap: 14px;
  }
  
  .feature-card {
    padding: 22px 16px;
  }
  
  .feature-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }
  
  .feature-title {
    font-size: 15px;
  }
  
  .feature-desc {
    font-size: 12px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .stat-label {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .about-section {
    margin-top: 40px;
    padding: 0 12px 40px;
  }
  
  .about-container {
    padding: 28px 18px;
    border-radius: 20px;
  }
  
  .about-header {
    margin-bottom: 28px;
  }
  
  .about-title {
    font-size: 24px;
    letter-spacing: 1px;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 24px;
  }
  
  .about-subtitle {
    font-size: 13px;
    letter-spacing: 0;
  }
  
  .about-content {
    margin-bottom: 36px;
  }
  
  .intro-text p {
    font-size: 13px;
    line-height: 1.7;
    margin-bottom: 14px;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 36px;
  }
  
  .feature-card {
    padding: 18px 12px;
    border-radius: 16px;
  }
  
  .feature-icon {
    font-size: 30px;
    margin-bottom: 10px;
  }
  
  .feature-title {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .feature-desc {
    font-size: 11px;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding-top: 24px;
  }
  
  .stat-value {
    font-size: 24px;
    margin-bottom: 6px;
  }
  
  .stat-label {
    font-size: 12px;
  }
}
</style>
