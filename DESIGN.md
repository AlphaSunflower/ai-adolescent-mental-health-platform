# 心愈智联 · DESIGN SPECIFICATION

> 青少年心理健康 AI 平台 — Design System & UI Guidelines

---

## 1. 品牌概述 / Brand Overview

| 属性 | 值 |
|------|-----|
| 产品名称 | 心愈智联 |
| 产品定位 | 青少年心理健康 AI 平台 |
| 设计风格 | 温暖自然、清新绿意、轻量安全感 |
| 目标用户 | 青少年（12–18 岁）及家长 |
| 设计基调 | Calm · Growth · Trust |

**品牌主张：** 每一次关注自己，都是成长的开始。

---

## 2. 色彩系统 / Color System

### 主色 Primary Colors

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-primary` | `#3DAD6F` | 主操作按钮、激活导航、关键强调 |
| `--color-primary-light` | `#E8F5EE` | 导航激活背景、卡片背景 |
| `--color-primary-dark` | `#2D8A55` | Hover 状态、深色强调 |

### 功能色 Functional Colors

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-accent-orange` | `#F5A623` | AI 咨询室图标、待确认 Badge |
| `--color-accent-purple` | `#8B5CF6` | 内容馆图标 |
| `--color-accent-coral` | `#F4836C` | 照护计划图标 |
| `--color-accent-yellow` | `#F6C84E` | 压力管理图标 |
| `--color-accent-teal` | `#5BC4BF` | 睡眠改善图标 |

### 中性色 Neutral Colors

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-bg-page` | `#F5F7F5` | 页面背景 |
| `--color-bg-card` | `#FFFFFF` | 卡片背景 |
| `--color-sidebar-bg` | `#FFFFFF` | 侧边栏背景 |
| `--color-text-primary` | `#1A2E1A` | 主标题、正文 |
| `--color-text-secondary` | `#6B7B6B` | 副文本、描述 |
| `--color-text-tertiary` | `#9EAD9E` | 标签、提示文字 |
| `--color-border` | `#E8EEE8` | 分隔线、边框 |
| `--color-error` | `#E74C3C` | 消息通知红点 |

### 渐变 Gradients

```css
/* 主渐变按钮 */
background: linear-gradient(135deg, #3DAD6F 0%, #52C27F 100%);

/* Banner 背景 */
background: linear-gradient(135deg, #EEF8F2 0%, #F5FAF7 100%);

/* 进度条 */
background: linear-gradient(90deg, #3DAD6F 0%, #5DD48A 100%);
```

---

## 3. 排版系统 / Typography

### 字体族 Font Family

```css
/* 中文主字体 */
font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;

/* 数字 / 英文辅助字体 */
font-family: "DM Sans", "SF Pro Text", sans-serif;
```

### 字体规格 Type Scale

| 用途 | Size | Weight | Line Height | Token |
|------|------|--------|-------------|-------|
| 页面大标题（问候语） | 28px | 600 | 1.3 | `--text-display` |
| 卡片标题 | 16px | 600 | 1.4 | `--text-title` |
| 导航菜单 | 14px | 500 | 1.5 | `--text-nav` |
| 正文 / 对话内容 | 14px | 400 | 1.6 | `--text-body` |
| 副标题 / 标签 | 12px | 400 | 1.5 | `--text-caption` |
| 小标注 | 11px | 400 | 1.4 | `--text-micro` |

---

## 4. 间距系统 / Spacing System

基础单位：`4px`

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-1` | 4px | 紧凑内间距 |
| `--space-2` | 8px | 图标与文字间距 |
| `--space-3` | 12px | 小组件内边距 |
| `--space-4` | 16px | 卡片内边距、行间距 |
| `--space-5` | 20px | 区块间距 |
| `--space-6` | 24px | 大卡片内边距 |
| `--space-8` | 32px | 区域间隔 |

---

## 5. 圆角系统 / Border Radius

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | 8px | 标签、Badge、小按钮 |
| `--radius-md` | 12px | 输入框、小卡片 |
| `--radius-lg` | 16px | 内容卡片、导航激活背景 |
| `--radius-xl` | 20px | 快捷入口大卡片 |
| `--radius-full` | 9999px | 头像、圆形按钮、Pill 标签 |

---

## 6. 阴影系统 / Shadow System

```css
/* 卡片默认阴影 */
--shadow-card: 0 2px 12px rgba(61, 173, 111, 0.06);

/* 卡片悬停阴影 */
--shadow-card-hover: 0 6px 24px rgba(61, 173, 111, 0.12);

/* 侧边栏右侧分隔 */
--shadow-sidebar: 2px 0 8px rgba(0, 0, 0, 0.04);

/* 下拉菜单 / 浮层 */
--shadow-dropdown: 0 8px 32px rgba(0, 0, 0, 0.10);
```

---

## 7. 布局结构 / Layout Structure

### 整体布局 Overall Layout

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar (全宽, height: 64px)                                 │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │           Main Content Area                  │
│   220px      │           flex: 1                           │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

### 顶部导航栏 Top Bar

- **高度**：64px
- **布局**：Logo 区（左）+ 搜索框（居中偏右）+ 通知 + 用户头像（右）
- **背景**：`#FFFFFF`
- **底部边框**：`1px solid var(--color-border)`

| 元素 | 规格 |
|------|------|
| Logo 图标 | 32×32px，圆角 8px，绿色主色 |
| 产品名称字体 | 16px / 600 / `--color-text-primary` |
| 副标题字体 | 11px / 400 / `--color-text-tertiary` |
| 搜索框宽度 | 240px，圆角 20px |
| 通知 Badge | 8px 红色圆点，绝对定位右上角 |
| 用户头像 | 36px 圆形 |

### 侧边栏 Sidebar

- **宽度**：220px，固定，不可折叠（桌面端）
- **背景**：`#FFFFFF`
- **内边距**：`16px 12px`

#### 导航项规格

```
激活状态：
  背景: var(--color-primary-light)  圆角: var(--radius-lg)
  文字: var(--color-primary)  Weight: 600
  左侧色块: 3px × 20px 竖线，color: var(--color-primary)

默认状态：
  背景: transparent
  文字: var(--color-text-secondary)  Weight: 400
  图标颜色: var(--color-text-tertiary)

悬停状态：
  背景: var(--color-primary-light) / 60%
  文字: var(--color-primary)
```

#### 底部激励卡片 Motivational Card

- 位置：Sidebar 底部，固定
- 背景：`linear-gradient(135deg, #E8F5EE, #F0FAF5)`
- 圆角：`var(--radius-lg)`
- 内容：每日激励文字 + 「记录心情」按钮 + 绿植装饰插图
- 按钮：白色背景，绿色文字，`border-radius: var(--radius-full)`

### 主内容区 Main Content

- **内边距**：`32px 28px`
- **最大宽度**：1200px（或铺满，配合三列栅格）

#### 网格系统 Grid

```
三列内容区（cards section）：
  columns: 420px  280px  1fr
  gap: 20px

五列快捷入口（shortcuts）：
  repeat(5, 1fr)
  gap: 12px
```

---

## 8. 组件规范 / Component Specifications

### 8.1 快捷入口卡片 Shortcut Card

```
尺寸：flex: 1，min-height: 88px
背景：#FFFFFF（默认）；激活/hover: 主色 10% 透明背景
圆角：var(--radius-xl)
内边距：16px 20px
阴影：var(--shadow-card)
边框：1px solid var(--color-border)（默认）；hover: 1px solid var(--color-primary) / 40%

图标区：
  尺寸: 48×48px
  背景: 对应功能色 15% 透明度
  圆角: var(--radius-md)
  图标大小: 24px

文字区：
  标题: 15px / 600 / --color-text-primary
  副标题: 12px / 400 / --color-text-secondary

右侧箭头：
  「›」字符或 ChevronRight 图标
  颜色: --color-text-tertiary
```

### 8.2 内容卡片 Content Card

```
背景：#FFFFFF
圆角：var(--radius-lg)
内边距：20px 24px
阴影：var(--shadow-card)
边框：无（或 1px solid var(--color-border)）
```

**卡片头部 Card Header：**

```
布局: space-between
左侧: 绿色竖线（3px）+ 标题文字（15px / 600）+ 在线状态点
右侧: 「查看全部」链接 + 「›」图标
```

### 8.3 AI 对话气泡 Chat Bubble

```
AI 消息气泡（左对齐）：
  背景: #F0FAF5
  圆角: 0 16px 16px 16px
  内边距: 12px 16px
  文字: 14px / 400 / --color-text-primary
  行高: 1.6

机器人头像：
  尺寸: 40×40px，圆形
  背景: var(--color-primary-light)
  图标: 机器人/AI 图标，24px，主色
```

### 8.4 预约卡片 Appointment Card

```
布局: 水平排列
咨询师头像: 44px 圆形，带绿色在线边框（2px）
主信息: 姓名（14px/600）+ 预约时间（13px/400/secondary）
副信息: 形式标签（线上咨询）+ 时长
状态 Badge: 「待确认」—— 背景: #FFF3E0，文字: #E67E22，圆角: var(--radius-sm)
```

### 8.5 进度条 Progress Bar

```
容器高度: 8px
背景色: #E8EEE8
圆角: var(--radius-full)
填充色: linear-gradient(90deg, #3DAD6F, #5DD48A)
动画: 页面加载时从 0 到目标值过渡，duration: 600ms，ease-out
百分比文字: 14px / 600 / --color-primary，右对齐
```

### 8.6 推荐内容条目 Recommendation Item

```
布局: 水平排列，gap: 12px
缩略图: 80×56px，圆角: var(--radius-md)，object-fit: cover
标题: 14px / 500 / --color-text-primary，最多两行
标签: 12px / --color-text-tertiary（「文章·8分钟阅读」格式）
收藏图标: 右侧，22px，默认 --color-text-tertiary，激活时填充主色
```

### 8.7 照护计划项 Care Plan Item

```
图标容器: 48×48px，圆形
  情绪觉察: 背景 #E8F5EE，图标绿色
  睡眠改善: 背景 #EDE9FF，图标紫色
  压力管理: 背景 #FFF8E1，图标黄色
  自信成长: 背景 #FFEEE8，图标橙红色

状态文字:
  进行中: color #3DAD6F，前置绿色圆点
  待开始: color #9EAD9E，前置灰色圆点
  已完成: color #9EAD9E，前置勾选图标
```

### 8.8 搜索框 Search Input

```
宽度: 240px（顶部栏）
高度: 36px
背景: #F5F7F5
边框: 1px solid var(--color-border)
圆角: var(--radius-full)
内边距: 0 16px 0 40px（左侧预留搜索图标空间）
占位文字: 「搜索文章、课程、练习等」，--color-text-tertiary
聚焦状态: border-color: var(--color-primary)，box-shadow: 0 0 0 3px rgba(61,173,111,0.15)
```

### 8.9 AI 输入框 AI Chat Input

```
背景: #F5F7F5
边框: 1px solid var(--color-border)
圆角: var(--radius-full)
高度: 44px
内边距: 0 52px 0 20px（右侧预留发送按钮）

发送按钮:
  尺寸: 32×32px，圆形
  背景: var(--color-primary)
  图标: 发送箭头，白色，16px
  绝对定位于输入框右侧内嵌
```

---

## 9. 图标系统 / Icon System

- **图标库**：推荐使用 Lucide Icons 或 Phosphor Icons（线性风格）
- **默认尺寸**：20px（导航）、24px（功能区）、16px（内联）
- **线条粗细**：1.5px（stroke-width）
- **颜色**：继承 `currentColor`

### 功能图标对应

| 功能 | 图标建议 | 色块背景 |
|------|----------|----------|
| AI 咨询室 | `message-circle` / `bot` | `#E8F5EE` |
| 心理咨询预约 | `calendar` | `#FFF8E1` |
| 心理评估 | `clipboard-list` | `#E8F5EE` |
| 内容馆 | `book-open` | `#EDE9FF` |
| 我的照护计划 | `heart` | `#FFEEE8` |
| 消息中心 | `bell` + 红点 | — |

---

## 10. 动效规范 / Motion & Animation

```css
/* 基础过渡 */
--transition-fast:   120ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow:   320ms ease-out;

/* 常用场景 */
卡片悬停上移:   transform: translateY(-2px);  transition: var(--transition-normal);
卡片阴影变深:   box-shadow: var(--shadow-card-hover); transition: var(--transition-normal);
进度条填充:     width 600ms ease-out（页面加载时触发）
导航切换:       背景色与文字色 200ms ease-in-out
按钮点击缩放:   transform: scale(0.97); transition: 100ms;
```

---

## 11. 页面状态规范 / States

| 状态 | 处理方式 |
|------|----------|
| Loading | 骨架屏（Skeleton），使用 `--color-border` 背景 + shimmer 动画 |
| Empty State | 绿植插图 + 鼓励文字 + CTA 按钮 |
| Error State | 浅红背景提示条，非全屏打断式 |
| Success | 绿色 Toast，出现在右上角，3s 后自动消失 |
| Hover | `translateY(-2px)` + 阴影加深 |
| Active/Pressed | `scale(0.97)` |
| Disabled | 透明度降至 40%，pointer-events: none |

---

## 12. 响应式断点 / Breakpoints

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| Desktop | ≥ 1280px | 全三列布局，侧边栏 220px 展开 |
| Laptop | 1024–1279px | 三列变两列，侧边栏收缩至 64px（仅图标） |
| Tablet | 768–1023px | 侧边栏隐藏，顶部 Tab 栏替代 |
| Mobile | < 768px | 单列，底部 Tab Bar 5 项 |

---

## 13. 文案风格 / Copywriting Style

- **语气**：温暖、平等、无评判；像朋友而非医生
- **称谓**：直呼用户名（如「林小雨」），增强亲切感
- **问候语**：结合时间、天气，体现平台的「陪伴感」
- **激励文案**：积极但不空洞，避免压迫感
- **状态文字**：使用自然语言而非纯代码状态（「进行中」非「IN_PROGRESS」）

---

## 14. 无障碍要求 / Accessibility

- 所有文字颜色对比度 ≥ 4.5:1（WCAG AA 标准）
- 可交互元素最小点击区域：44×44px
- 所有图标配备 `aria-label` 或 `title`
- 焦点状态：`outline: 2px solid var(--color-primary); outline-offset: 2px`
- 进度条使用 `role="progressbar"` + `aria-valuenow` / `aria-valuemax`
- 支持键盘导航（Tab 顺序合理）
