<template>
  <div class="home-container">
    <!-- 星空背景 -->
    <div class="stars-background">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="planet planet-1"></div>
      <div class="planet planet-2"></div>
      <div class="planet planet-3"></div>
      <div class="comet"></div>
    </div>

    <!-- 鼓舞语句随机展示 -->
    <div class="quote-showcase" v-if="quotes.length > 0">
      <transition-group name="quote-fade" tag="div" class="quote-wrapper">
        <div class="quote-card" :key="currentQuote?.id">
          <div class="quote-glow"></div>
          <div class="quote-content">
            <span class="quote-icon">✨</span>
            <span class="quote-text">{{ currentQuote?.content }}</span>
            <span class="quote-author" v-if="currentQuote?.author">—— {{ currentQuote?.author }}</span>
          </div>
          <div class="quote-stars">
            <span class="mini-star" v-for="n in 5" :key="n">⭐</span>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 首页轮播图 -->
    <div class="banner-carousel">
      <el-carousel 
        :interval="5000" 
        arrow="always" 
        :height="carouselHeight" 
        trigger="click"
        :autoplay="true"
      >
        <!-- 第一张：AI 问诊 -->
        <el-carousel-item>
          <div class="banner-item banner-ai">
            <div class="banner-overlay"></div>
            <img src="/image/bannner/bg1.png" alt="AI 问诊" class="banner-bg" />
            <div class="banner-content">
              <h2 class="banner-title">AI 问诊</h2>
              <p class="banner-subtitle">24 小时 AI 智能问诊，快速获取专业建议</p>
              <el-button type="primary" size="large" class="banner-btn" @click="goTo('/ai-consultation')">
                立即体验
              </el-button>
            </div>
            <div class="banner-decoration">
              <div class="floating-star star-1">⭐</div>
              <div class="floating-star star-2">🌟</div>
              <div class="floating-star star-3">⭐</div>
            </div>
          </div>
        </el-carousel-item>

        <!-- 第二张：心理咨询 -->
        <el-carousel-item>
          <div class="banner-item banner-consult">
            <div class="banner-overlay"></div>
            <img src="/image/bannner/bg2.jpg" alt="心理咨询" class="banner-bg" />
            <div class="banner-content">
              <h2 class="banner-title">心理咨询</h2>
              <p class="banner-subtitle">全国优质医院信息，助您找到合适的心理医生</p>
              <el-button type="primary" size="large" class="banner-btn" @click="goTo('/consultation')">
                立即体验
              </el-button>
            </div>
            <div class="banner-decoration">
              <div class="floating-star star-4">🌙</div>
              <div class="floating-star star-5">⭐</div>
            </div>
          </div>
        </el-carousel-item>

        <!-- 第三张：心理测评 -->
        <el-carousel-item>
          <div class="banner-item banner-assess">
            <div class="banner-overlay"></div>
            <img src="/image/bannner/bg3.jpg" alt="心理测评" class="banner-bg" />
            <div class="banner-content">
              <h2 class="banner-title">心理测评</h2>
              <p class="banner-subtitle">为您快速定位，当前状态，当前心理，守护您，呵护您</p>
              <el-button type="primary" size="large" class="banner-btn" @click="goTo('/assessments')">
                立即体验
              </el-button>
            </div>
            <div class="banner-decoration">
              <div class="floating-star star-6">🪐</div>
              <div class="floating-star star-7">⭐</div>
            </div>
          </div>
        </el-carousel-item>

        <!-- 第四张：心理百科 -->
        <el-carousel-item>
          <div class="banner-item banner-wiki">
            <div class="banner-overlay"></div>
            <img src="/image/bannner/bg4.jpg" alt="心理百科" class="banner-bg" />
            <div class="banner-content">
              <h2 class="banner-title">心理百科</h2>
              <p class="banner-subtitle">为您拓展心理知识，了解心理，认识疾病</p>
              <el-button type="primary" size="large" class="banner-btn" @click="goTo('/articles')">
                立即体验
              </el-button>
            </div>
            <div class="banner-decoration">
              <div class="floating-star star-8">☁️</div>
              <div class="floating-star star-9">⭐</div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 专业心理服务模块 -->
    <ServicesSection />

    <!-- 入驻心理咨询师模块 -->
    <JoinSection />

    <!-- 平台介绍模块 -->
    <AboutSection />

    <!-- 响应式功能卡片（移动端显示） -->
    <div class="mobile-features mobile-visible">
      <div class="feature-grid">
        <div class="feature-card" @click="goTo('/ai-consultation')">
          <div class="feature-icon">🤖</div>
          <h3>AI 问诊</h3>
          <p>24小时智能咨询</p>
        </div>
        <div class="feature-card" @click="goTo('/consultation')">
          <div class="feature-icon">👨‍⚕️</div>
          <h3>心理咨询</h3>
          <p>专业心理医生</p>
        </div>
        <div class="feature-card" @click="goTo('/assessments')">
          <div class="feature-icon">📊</div>
          <h3>心理测评</h3>
          <p>快速心理评估</p>
        </div>
        <div class="feature-card" @click="goTo('/articles')">
          <div class="feature-icon">📚</div>
          <h3>心理百科</h3>
          <p>心理知识库</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getQuotes } from '@/api/quote'
import ServicesSection from './home/components/ServicesSection.vue'
import JoinSection from './home/components/JoinSection.vue'
import AboutSection from './home/components/AboutSection.vue'

const router = useRouter()
const quotes = ref<any[]>([])
const windowWidth = ref(window.innerWidth)
const currentIndex = ref(0)
let quoteTimer: ReturnType<typeof setInterval> | null = null

// 获取当前随机鼓舞语句
const currentQuote = computed(() => {
  if (quotes.value.length === 0) return null
  return quotes.value[currentIndex.value]
})

// 随机切换鼓舞语句
const switchQuote = () => {
  if (quotes.value.length <= 1) return
  let newIndex: number
  do {
    newIndex = Math.floor(Math.random() * quotes.value.length)
  } while (newIndex === currentIndex.value && quotes.value.length > 1)
  currentIndex.value = newIndex
}

// 开始定时切换
const startQuoteTimer = () => {
  if (quoteTimer) clearInterval(quoteTimer)
  quoteTimer = setInterval(switchQuote, 30000)
}

// 停止定时切换
const stopQuoteTimer = () => {
  if (quoteTimer) {
    clearInterval(quoteTimer)
    quoteTimer = null
  }
}

// 根据屏幕宽度计算轮播图高度
const carouselHeight = computed(() => {
  if (windowWidth.value < 576) {
    return '220px'
  } else if (windowWidth.value < 768) {
    return '280px'
  } else if (windowWidth.value < 992) {
    return '320px'
  } else {
    return '350px'
  }
})

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(async () => {
  try {
    // 使用 getQuotes 获取所有鼓舞语句
    const res = await getQuotes() as any
    console.log('鼓舞语句 API 响应:', res)

    if (res.code === 200 && res.data) {
      // 处理不同的数据结构
      if (Array.isArray(res.data)) {
        quotes.value = res.data
      } else if (res.data.records && Array.isArray(res.data.records)) {
        // 如果是分页数据
        quotes.value = res.data.records
      } else if (res.data.list && Array.isArray(res.data.list)) {
        // 如果是 list 格式
        quotes.value = res.data.list
      } else {
        // 单个对象转为数组
        quotes.value = [res.data]
      }
      console.log('处理后的鼓舞语句:', quotes.value)

      // 随机初始化索引
      if (quotes.value.length > 0) {
        currentIndex.value = Math.floor(Math.random() * quotes.value.length)
        // 启动定时切换
        startQuoteTimer()
      }
    }
  } catch (e) {
    console.error('Failed to load quotes', e)
    throw e // 抛出错误，不使用默认数据
  }

  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除监听
  window.removeEventListener('resize', handleResize)
  // 停止鼓舞语句定时器
  stopQuoteTimer()
})

const goTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
/* 不设 min-height:100vh，否则会占满一屏，把 Layout 里全局 el-footer 顶到首屏外难以发现 */
.home-container {
  padding: 0 20px 32px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow-x: hidden;
}

/* 星空背景样式 */
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

/* 行星样式 */
.planet {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
  opacity: 0.7;
  z-index: 0;
}

.planet-1 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 10%;
  background: radial-gradient(circle at 30% 30%, #ff9a9e, #fad0c4);
  box-shadow: 0 0 40px rgba(255, 154, 158, 0.5);
  animation: float 25s infinite ease-in-out;
}

.planet-2 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 5%;
  background: radial-gradient(circle at 30% 30%, #a1c4fd, #c2e9fb);
  box-shadow: 0 0 50px rgba(161, 196, 253, 0.5);
  animation: float 30s infinite ease-in-out reverse;
}

.planet-3 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 20%;
  background: radial-gradient(circle at 30% 30%, #ffecd2, #fcb69f);
  box-shadow: 0 0 30px rgba(252, 182, 159, 0.5);
  animation: float 20s infinite ease-in-out;
}

/* 彗星 */
.comet {
  position: absolute;
  top: 20%;
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

/* 鼓舞语句随机展示 */
.quote-showcase {
  max-width: 1000px;
  margin: 20px auto 30px;
  position: relative;
  z-index: 1;
}

.quote-wrapper {
  position: relative;
  min-height: 80px;
}

.quote-card {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(255, 233, 167, 0.15) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(64, 158, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.quote-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 233, 167, 0.1) 0%, transparent 60%);
  animation: glowPulse 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

.quote-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: relative;
  z-index: 2;
}

.quote-icon {
  font-size: 28px;
  animation: twinkle 2s infinite;
  filter: drop-shadow(0 0 8px rgba(255, 233, 167, 0.8));
  flex-shrink: 0;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.9); }
}

.quote-text {
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.6;
  flex: 1;
}

.quote-author {
  font-size: 14px;
  color: rgba(255, 233, 167, 0.9);
  font-style: italic;
  white-space: nowrap;
  flex-shrink: 0;
}

.quote-stars {
  position: absolute;
  top: 10px;
  right: 20px;
  display: flex;
  gap: 5px;
}

.mini-star {
  font-size: 12px;
  opacity: 0.6;
  animation: starTwinkle 2s infinite;
}

.mini-star:nth-child(1) { animation-delay: 0s; }
.mini-star:nth-child(2) { animation-delay: 0.3s; }
.mini-star:nth-child(3) { animation-delay: 0.6s; }
.mini-star:nth-child(4) { animation-delay: 0.9s; }
.mini-star:nth-child(5) { animation-delay: 1.2s; }

@keyframes starTwinkle {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* 过渡动画 */
.quote-fade-enter-active {
  animation: quoteIn 0.8s ease-out;
}

.quote-fade-leave-active {
  animation: quoteOut 0.5s ease-in;
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

@keyframes quoteIn {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes quoteOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}

/* 首页轮播图 */
.banner-carousel {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  filter: brightness(0.8);
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(10, 10, 40, 0.8) 0%, rgba(30, 30, 80, 0.7) 100%);
}

.banner-content {
  position: relative;
  z-index: 10;
  text-align: center;
  color: #fff;
  padding: 40px;
  animation: slideUp 0.8s ease-out;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-title {
  font-size: 56px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 4px;
  background: linear-gradient(to right, #a8edea, #fed6e3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: glow 3s infinite alternate;
}

@keyframes glow {
  from { filter: drop-shadow(0 0 5px rgba(168, 237, 234, 0.5)); }
  to { filter: drop-shadow(0 0 20px rgba(254, 214, 227, 0.8)); }
}

.banner-subtitle {
  font-size: 24px;
  margin-bottom: 40px;
  line-height: 1.6;
  font-weight: 300;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.banner-btn {
  padding: 15px 50px;
  font-size: 20px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.banner-btn:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.banner-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
  z-index: -1;
}

.banner-btn:hover:before {
  left: 100%;
}

/* 不同轮播项的渐变背景 */
.banner-ai .banner-overlay {
  background: linear-gradient(135deg, rgba(10, 10, 40, 0.8) 0%, rgba(30, 60, 114, 0.7) 100%);
}

.banner-consult .banner-overlay {
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.8) 0%, rgba(70, 40, 100, 0.7) 100%);
}

.banner-assess .banner-overlay {
  background: linear-gradient(135deg, rgba(70, 40, 100, 0.8) 0%, rgba(120, 30, 80, 0.7) 100%);
}

.banner-wiki .banner-overlay {
  background: linear-gradient(135deg, rgba(120, 30, 80, 0.8) 0%, rgba(160, 60, 40, 0.7) 100%);
}

/* 轮播图装饰 */
.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.floating-star {
  position: absolute;
  font-size: 24px;
  opacity: 0.8;
  animation: floatStar 8s infinite ease-in-out;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.7));
}

@keyframes floatStar {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.star-1 { top: 20%; left: 10%; animation-delay: 0s; }
.star-2 { top: 60%; right: 15%; animation-delay: 1s; font-size: 32px; }
.star-3 { bottom: 30%; left: 20%; animation-delay: 2s; }
.star-4 { top: 40%; right: 20%; animation-delay: 0.5s; font-size: 40px; }
.star-5 { bottom: 20%; left: 15%; animation-delay: 1.5s; }
.star-6 { top: 15%; right: 25%; animation-delay: 0.8s; font-size: 36px; }
.star-7 { bottom: 40%; left: 25%; animation-delay: 2.5s; }
.star-8 { top: 30%; left: 30%; animation-delay: 1.2s; font-size: 28px; }
.star-9 { bottom: 15%; right: 20%; animation-delay: 3s; }

/* 移动端功能卡片 */
.mobile-features {
  display: none;
  margin-top: 30px;
  position: relative;
  z-index: 1;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  max-width: 500px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px 15px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.feature-card h3 {
  color: #fff;
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin: 0;
}

/* 响应式样式 - 针对不同屏幕尺寸 */
/* 大屏幕（桌面端） */
@media (min-width: 1200px) {
  .home-container {
    max-width: 1140px;
  }

  .quote-showcase {
    margin-top: 30px;
  }
}

/* 中等屏幕（平板横屏/小桌面） */
@media (min-width: 992px) and (max-width: 1199.98px) {
  .home-container {
    max-width: 960px;
  }

  .quote-card {
    padding: 20px 25px;
  }

  .quote-text {
    font-size: 18px;
  }

  .banner-title {
    font-size: 48px;
  }

  .banner-subtitle {
    font-size: 22px;
  }
}

/* 小屏幕（平板竖屏） */
@media (min-width: 768px) and (max-width: 991.98px) {
  .home-container {
    padding: 0 15px;
    max-width: 720px;
  }

  .quote-showcase {
    margin-top: 20px;
  }

  .quote-card {
    padding: 18px 20px;
    border-radius: 16px;
  }

  .quote-text {
    font-size: 16px;
  }

  .quote-icon {
    font-size: 22px;
  }

  .quote-author {
    font-size: 12px;
  }

  .banner-title {
    font-size: 40px;
    letter-spacing: 2px;
  }

  .banner-subtitle {
    font-size: 20px;
    margin-bottom: 30px;
  }

  .banner-btn {
    padding: 12px 40px;
    font-size: 18px;
  }

  .planet-1, .planet-2, .planet-3 {
    display: none;
  }
}

/* 超小屏幕（手机横屏） */
@media (min-width: 576px) and (max-width: 767.98px) {
  .home-container {
    padding: 0 12px;
    max-width: 540px;
  }

  .quote-showcase {
    margin-top: 15px;
  }

  .quote-card {
    padding: 15px 18px;
    border-radius: 12px;
  }

  .quote-content {
    flex-direction: column;
    gap: 5px;
  }

  .quote-text {
    font-size: 14px;
  }

  .quote-icon {
    font-size: 18px;
  }

  .quote-author {
    font-size: 11px;
  }

  .quote-stars {
    display: none;
  }

  .quote-author {
    font-size: 12px;
    padding-right: 0;
  }

  .banner-carousel {
    border-radius: 12px;
  }
  
  .banner-title {
    font-size: 32px;
    letter-spacing: 1px;
    margin-bottom: 15px;
  }
  
  .banner-subtitle {
    font-size: 16px;
    margin-bottom: 20px;
    line-height: 1.4;
  }
  
  .banner-btn {
    padding: 10px 30px;
    font-size: 16px;
  }
  
  .banner-content {
    padding: 20px;
  }
  
  .stars-background {
    background: linear-gradient(to bottom, #0a0a2a, #1a1a4a);
  }
  
  .planet-1, .planet-2, .planet-3 {
    display: none;
  }
  
  .comet {
    display: none;
  }
}

/* 超小屏幕（手机竖屏） */
@media (max-width: 575.98px) {
  .home-container {
    padding: 0 10px;
  }

  .quote-showcase {
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .quote-card {
    padding: 12px 15px;
    border-radius: 12px;
  }

  .quote-content {
    flex-direction: column;
    gap: 3px;
  }

  .quote-icon {
    font-size: 16px;
  }

  .quote-text {
    font-size: 13px;
  }

  .quote-author {
    font-size: 10px;
    padding-right: 0;
  }

  .quote-stars {
    display: none;
  }

  .banner-carousel {
    display: none; /* 在小手机上隐藏大轮播图 */
  }
  
  .mobile-features {
    display: block;
  }
  
  .mobile-visible {
    display: block;
  }
  
  .banner-title {
    font-size: 24px;
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
  
  .banner-subtitle {
    font-size: 14px;
    margin-bottom: 15px;
    line-height: 1.3;
  }
  
  .banner-btn {
    padding: 8px 20px;
    font-size: 14px;
  }
  
  .banner-content {
    padding: 15px;
  }
  
  .stars-background {
    background: linear-gradient(to bottom, #0a0a2a, #1a1a4a);
  }
  
  .planet-1, .planet-2, .planet-3 {
    display: none;
  }
  
  .comet {
    display: none;
  }
  
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .feature-card {
    padding: 15px 10px;
  }
  
  .feature-icon {
    font-size: 24px;
  }
  
  .feature-card h3 {
    font-size: 14px;
  }
  
  .feature-card p {
    font-size: 10px;
  }
}

/* 特别小的手机屏幕 */
@media (max-width: 360px) {
  .quote-card {
    padding: 10px 12px;
  }

  .quote-text {
    font-size: 11px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .home-container {
    padding: 0 8px;
  }
}

/* 横屏模式 */
@media (max-height: 500px) and (orientation: landscape) {
  .quote-showcase {
    margin-top: 5px;
    margin-bottom: 15px;
  }

  .quote-card {
    padding: 10px 15px;
  }

  .quote-content {
    flex-direction: row;
    gap: 10px;
  }

  .quote-text {
    font-size: 14px;
  }

  .quote-icon {
    font-size: 18px;
  }

  .quote-stars {
    display: none;
  }

  .banner-carousel {
    margin-bottom: 20px;
  }
}

</style>