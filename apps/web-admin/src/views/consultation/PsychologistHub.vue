<template>
  <div class="psychologist-hub-container">
    <!-- 星空背景 -->
    <div class="stars-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="planet planet-1"></div>
      <div class="planet planet-2"></div>
      <div class="comet"></div>
    </div>

    <!-- 页面标题 -->
    <div class="hub-header">
      <h1 class="hub-title">心理咨询中心</h1>
      <p class="hub-subtitle">专业心理咨询师，为您排忧解难</p>
    </div>

    <!-- 入口卡片 -->
    <div class="entry-cards">
      <!-- 预约咨询心理师 -->
      <div class="entry-card cosmic-card" @click="goToPsychologist">
        <div class="card-glow"></div>
        <div class="card-icon">
          <span class="icon-emoji">🧠</span>
        </div>
        <div class="card-content">
          <h2 class="card-title">预约咨询心理师</h2>
          <p class="card-desc">与专业心理咨询师一对一交流，获取个性化心理支持</p>
          <div class="card-features">
            <span class="feature-tag cosmic-tag">
              <span class="tag-icon">✨</span> 智能匹配
            </span>
            <span class="feature-tag cosmic-tag">
              <span class="tag-icon">🎥</span> 视频咨询
            </span>
            <span class="feature-tag cosmic-tag">
              <span class="tag-icon">💬</span> 图文咨询
            </span>
          </div>
          <div class="card-action">
            <el-button type="primary" class="cosmic-btn-primary cosmic-btn">
              立即预约
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-decoration">
          <div class="floating-star star-1">⭐</div>
          <div class="floating-star star-2">🌟</div>
        </div>
      </div>

      <!-- 医院挂号 -->
      <div class="entry-card cosmic-card" @click="goToDoctor">
        <div class="card-glow gold"></div>
        <div class="card-icon gold">
          <span class="icon-emoji">🏥</span>
        </div>
        <div class="card-content">
          <h2 class="card-title">医院挂号</h2>
          <p class="card-desc">预约心理医生，到院就诊，获得专业诊疗服务</p>
          <div class="card-features">
            <span class="feature-tag cosmic-tag gold">
              <span class="tag-icon">📍</span> 附近医院
            </span>
            <span class="feature-tag cosmic-tag gold">
              <span class="tag-icon">👨‍⚕️</span> 专家号源
            </span>
            <span class="feature-tag cosmic-tag gold">
              <span class="tag-icon">📋</span> 病历管理
            </span>
          </div>
          <div class="card-action">
            <el-button class="cosmic-btn-secondary cosmic-btn">
              立即挂号
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="card-decoration">
          <div class="floating-star star-3">🌙</div>
          <div class="floating-star star-4">⭐</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

// 跳转到心理咨询师列表
const goToPsychologist = () => {
  router.push('/consultation/psychologist')
}

// 跳转到医院挂号
const goToDoctor = () => {
  router.push('/consultation/doctor')
}
</script>

<style scoped>
.psychologist-hub-container {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
}

/* 星空背景 */
.stars-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(to bottom, #0a0a2a, #1a1a4a, #2a2a6a);
  overflow: hidden;
}

.stars, .stars2, .stars3 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars:before, .stars:after,
.stars2:before, .stars2:after,
.stars3:before, .stars3:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars:before {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 100px 100px;
  animation: starsMove 200s linear infinite;
}

.stars:after {
  background-image: radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 150px 150px;
  animation: starsMove 150s linear infinite;
}

.stars2:before {
  background-image: radial-gradient(1px 1px at 90px 120px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: starsMove 100s linear infinite;
}

.stars3:before {
  background-image: radial-gradient(3px 3px at 150px 200px, #ddd, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 300px 300px;
  animation: starsMove 250s linear infinite;
}

@keyframes starsMove {
  from { transform: translateY(0px) }
  to { transform: translateY(-2000px) }
}

.planet {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  opacity: 0.7;
  z-index: 0;
}

.planet-1 {
  width: 120px;
  height: 120px;
  top: 15%;
  right: 8%;
  background: radial-gradient(circle at 30% 30%, #87ceeb, #4682b4);
  box-shadow: 0 0 50px rgba(135, 206, 235, 0.5);
  animation: float 25s infinite ease-in-out;
}

.planet-2 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 5%;
  background: radial-gradient(circle at 30% 30%, #dda0dd, #9370db);
  box-shadow: 0 0 40px rgba(218, 112, 214, 0.4);
  animation: float 30s infinite ease-in-out reverse;
}

.comet {
  position: absolute;
  top: 10%;
  left: -50px;
  width: 150px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  animation: cometMove 20s linear infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes cometMove {
  0% { transform: translateX(-100px) translateY(-100px) rotate(45deg); }
  100% { transform: translateX(calc(100vw + 100px)) translateY(calc(100vh + 100px)) rotate(45deg); }
}

/* 页面标题 */
.hub-header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
  z-index: 1;
}

.hub-title {
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #fff 0%, #87ceeb 50%, #dda0dd 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(135, 206, 235, 0.3);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from { filter: drop-shadow(0 0 10px rgba(135, 206, 235, 0.3)); }
  to { filter: drop-shadow(0 0 25px rgba(218, 112, 214, 0.4)); }
}

.hub-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 入口卡片 */
.entry-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
}

.entry-card {
  position: relative;
  padding: 40px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.entry-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(135, 206, 235, 0.15) 0%, transparent 60%);
  pointer-events: none;
  transition: opacity 0.3s;
}

.card-glow.gold {
  background: radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 60%);
}

.entry-card:hover .card-glow {
  opacity: 1.5;
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(135, 206, 235, 0.3) 0%, rgba(70, 130, 180, 0.2) 100%);
  border: 2px solid rgba(135, 206, 235, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 0 30px rgba(135, 206, 235, 0.3);
}

.card-icon.gold {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.2) 100%);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.icon-emoji {
  font-size: 40px;
}

.card-content {
  position: relative;
  z-index: 2;
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
}

.card-desc {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 20px;
  line-height: 1.6;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
}

.tag-icon {
  font-size: 14px;
}

.card-action {
  display: flex;
}

.arrow-icon {
  margin-left: 8px;
  transition: transform 0.3s;
}

.entry-card:hover .arrow-icon {
  transform: translateX(4px);
}

.card-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-star {
  position: absolute;
  font-size: 20px;
  opacity: 0.6;
  animation: floatStar 6s infinite ease-in-out;
}

.star-1 { top: 20%; right: 15%; animation-delay: 0s; }
.star-2 { top: 60%; right: 25%; animation-delay: 1.5s; font-size: 16px; }
.star-3 { top: 15%; right: 20%; animation-delay: 0.5s; }
.star-4 { top: 55%; right: 10%; animation-delay: 2s; font-size: 18px; }

@keyframes floatStar {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-15px) rotate(180deg); opacity: 1; }
}


/* 响应式 */
@media (max-width: 992px) {
  .entry-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .psychologist-hub-container {
    padding: 24px 16px;
  }
  
  .hub-title {
    font-size: 32px;
  }
  
  .hub-subtitle {
    font-size: 15px;
  }
  
  .entry-card {
    padding: 28px;
  }
  
  .card-title {
    font-size: 22px;
  }
}
</style>
