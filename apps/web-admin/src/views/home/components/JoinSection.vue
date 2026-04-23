<template>
  <div class="join-section">
    <div class="join-container">
      <div class="join-glow"></div>
      <div class="join-content">
        <div class="join-icon">
          <span class="icon-emoji">🌟</span>
          <div class="icon-ring"></div>
          <div class="icon-ring ring-2"></div>
        </div>
        
        <div class="join-text">
          <h2 class="join-title">入驻心理咨询师</h2>
          <p class="join-desc">
            加入心愈智联平台，与专业团队并肩，<br>
            为青少年心理健康事业贡献力量
          </p>
        </div>
        
        <el-button 
          type="primary" 
          size="large" 
          class="join-btn"
          @click="goToApply"
        >
          <span class="btn-text">立即入驻</span>
          <span class="btn-icon">→</span>
        </el-button>
      </div>
      
      <div class="floating-elements">
        <span class="float-star" style="--delay: 0s; --x: 10%; --y: 20%;">⭐</span>
        <span class="float-star" style="--delay: 0.5s; --x: 85%; --y: 15%;">✨</span>
        <span class="float-star" style="--delay: 1s; --x: 15%; --y: 70%;">🌙</span>
        <span class="float-star" style="--delay: 1.5s; --x: 90%; --y: 65%;">⭐</span>
        <span class="float-star" style="--delay: 2s; --x: 50%; --y: 10%;">💫</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToApply = () => {
  router.push('/apply-psychologist')
}
</script>

<style scoped>
.join-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 60px auto 0;
  padding: 0 20px;
}

.join-container {
  position: relative;
  background: linear-gradient(135deg, 
    rgba(167, 139, 250, 0.2) 0%, 
    rgba(129, 140, 248, 0.15) 50%, 
    rgba(167, 139, 250, 0.2) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 24px;
  padding: 48px 40px;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.join-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 200px;
  background: radial-gradient(ellipse at center, rgba(167, 139, 250, 0.3) 0%, transparent 70%);
  pointer-events: none;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.join-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 24px;
  text-align: center;
}

.join-icon {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-emoji {
  font-size: 48px;
  animation: iconFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  z-index: 3;
  position: relative;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(167, 139, 250, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ringExpand 2s ease-out infinite;
}

.icon-ring.ring-2 {
  animation-delay: 1s;
  border-color: rgba(129, 140, 248, 0.2);
}

@keyframes ringExpand {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.join-text {
  max-width: 600px;
}

.join-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
  text-shadow: 0 2px 20px rgba(167, 139, 250, 0.4);
  letter-spacing: 2px;
}

.join-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.8;
}

.join-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
  border: none;
  border-radius: 50px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 8px 24px rgba(167, 139, 250, 0.4);
  position: relative;
  overflow: hidden;
}

.join-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.join-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 32px rgba(167, 139, 250, 0.5);
}

.join-btn:hover::before {
  left: 100%;
}

.join-btn:active {
  transform: translateY(-2px) scale(1.02);
}

.btn-icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.join-btn:hover .btn-icon {
  transform: translateX(4px);
}

/* 漂浮元素 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.float-star {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: 20px;
  animation: floatStar 4s ease-in-out infinite;
  animation-delay: var(--delay);
  opacity: 0.6;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
}

@keyframes floatStar {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .join-container {
    padding: 36px 24px;
    border-radius: 20px;
  }
  
  .join-icon {
    width: 64px;
    height: 64px;
  }
  
  .icon-emoji {
    font-size: 40px;
  }
  
  .icon-ring {
    width: 64px;
    height: 64px;
  }
  
  .join-title {
    font-size: 26px;
  }
  
  .join-desc {
    font-size: 14px;
    line-height: 1.6;
  }
  
  .join-btn {
    padding: 14px 36px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .join-section {
    margin-top: 40px;
    padding: 0 12px;
  }
  
  .join-container {
    padding: 28px 20px;
  }
  
  .join-icon {
    width: 56px;
    height: 56px;
  }
  
  .icon-emoji {
    font-size: 32px;
  }
  
  .icon-ring {
    width: 56px;
    height: 56px;
  }
  
  .join-title {
    font-size: 22px;
    letter-spacing: 1px;
  }
  
  .join-desc {
    font-size: 13px;
    line-height: 1.5;
  }
  
  .join-btn {
    padding: 12px 28px;
    font-size: 15px;
  }
  
  .float-star {
    font-size: 16px;
  }
}
</style>
