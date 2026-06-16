# 旅行日记 V2 — 设计文档

> 2026-06-16 · 方案 C：混合方案 · 时光线 + 纯文字日记 + 点击特效

---

## 一、数据层

### 1.1 Supabase 改动

```sql
-- 放宽约束：允许无图的纯文字记录
ALTER TABLE photos ALTER COLUMN image_url DROP NOT NULL;

-- 加类型字段
ALTER TABLE photos ADD COLUMN entry_type text NOT NULL DEFAULT 'photo'
  CHECK (entry_type IN ('photo', 'note'));
```

### 1.2 TypeScript 类型

```ts
export interface Photo {
  id: string
  trip_id: string
  city_name: string
  image_url: string | null          // 改为允许 null
  note: string
  author: '我' | '她'
  entry_type: 'photo' | 'note'     // 新增
  created_at: string
}
```

所有记录统一从 `photos` 表查询，按 `created_at` 排序即为时间线。

---

## 二、页面结构 & 导航

底部导航从 3 Tab → 4 Tab：

| Tab | 图标 | 路径 | 页面 |
|-----|------|------|------|
| 足迹 | 🗺️ | `/` | HomePage（不变） |
| 时光 | 📜 | `/timeline` | **新增 TimelinePage** |
| 记录 | ➕ | `/add` | AddRecordPage（扩展） |
| 我们 | 💌 | `/trips` | TripsPage（不变） |

### 2.1 首页（足迹）— 保持现有

地图 + 最近旅行卡片 + 天数计数器。只加点击特效和微动效，不做结构性改动。

### 2.2 时光 — 全量记录时间线

- 所有记录（照片 + 纯文字）按时间倒序排列
- 按月份分组，月份标签用虚线分隔
- 照片卡片：拍立得风格 + 留言
- 文字卡片：纸质便签风格（无图），背景略深
- 每张卡片显示：类型图标、内容、城市、作者、日期
- 支持无限滚动（加载更多）

### 2.3 记录（添加）— 扩展现有

AddRecordPage 顶部加类型切换：

```
[📸 照片记录] [📝 纯文字]

选择"纯文字"时：
  - PhotoUploader 隐藏
  - NoteInput 加大（textarea 多行）
  - entry_type = 'note'，image_url = null
```

### 2.4 我们（旅行列表）— 保持现有

不改结构，加点击特效。

### 2.5 旅行详情页 — 混合展示

TripDetailPage 的 PhotoGrid 改为混合时间线：
- 照片 + 文字记录混排，按时间排序
- 照片卡片 + 文字卡片两种样式

---

## 三、点击特效 & 微交互

### 3.1 Ripple 波纹

自定义 `useRipple` hook，无第三方依赖：
- `pointerdown` 时从触摸点扩散圆形波纹
- CSS `@keyframes` + `transform: scale()`（GPU 加速）
- 颜色使用 `currentColor`，自动适配主题
- 600ms 后自动消失

应用范围：底部导航、旅行卡片、照片卡片、时间线卡片、FAB、返回按钮。

### 3.2 点击缩放

所有可点击元素：`active:scale-[0.97]` + `transition duration-150`

### 3.3 FAB 呼吸动效

中间「+」按钮：柔光呼吸动画，2s 周期。

### 3.4 卡片入场动画

保留现有 `animate-fade-in-up` + stagger delay。时间线页面加 IntersectionObserver 触发出现在视口中的卡片。

### 3.5 页面切换

```
进入: opacity 0→1 + translateY(12px→0), 200ms ease-out
离开: opacity 1→0, 150ms
```

---

## 四、手机 UI 优化

### 4.1 底部导航

- 4 Tab 均匀分布 + FAB 嵌入导航中间
- 活跃 Tab：caramel 色高亮 + 顶部小圆点指示器
- 切换时 icon 弹性缩放（scale 1→0.85→1, 150ms）

### 4.2 安全区域

- `pt-safe` + `pb-safe` 适配 iPhone 灵动岛 / 底部横条
- 页面标题区域滚动时渐显毛玻璃背景

### 4.3 滚动体验

- 横向滑动卡片：momentum scroll
- 长列表：下拉刷新（手账风小动画）
- 地图区域保持现有配置

### 4.4 触控区域

- 最小触控区域 44×44px
- 卡片间距 12px
- 删除按钮确认延迟 0.3s

### 4.5 字体排版

- 标题：`clamp(1.25rem, 5vw, 1.75rem)`
- 正文：16px
- 时间线日期标签：12px italic

---

## 五、文件变更清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/hooks/useRipple.ts` | 点击波纹 hook |
| `src/pages/TimelinePage.tsx` | 时光线页面 |
| `src/components/timeline/TimelineCard.tsx` | 时间线卡片（照片/文字两种） |
| `src/components/timeline/MonthDivider.tsx` | 月份分隔线 |
| `src/components/ui/Ripple.tsx` | 波纹动画组件 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/types/index.ts` | Photo 类型加 `entry_type`，`image_url` 改为可 null |
| `src/App.tsx` | 加 `/timeline` 路由 |
| `src/components/layout/BottomNav.tsx` | 3 Tab → 4 Tab，FAB 嵌入 |
| `src/components/layout/PageShell.tsx` | 加页面过渡动画 |
| `src/pages/AddRecordPage.tsx` | 加类型切换（照片/文字） |
| `src/pages/TripDetailPage.tsx` | 混合展示照片+文字记录 |
| `src/components/trip/PhotoGrid.tsx` | 支持空图文字卡片 |
| `src/hooks/usePhotos.ts` | 支持 entry_type 过滤 |
| `src/index.css` | 波纹动画、呼吸动效、页面过渡 keyframes |

### 不需要改

- `useTrips.ts` — 不变
- `ChinaMap.tsx` — 不变
- `TripCard.tsx` — 不变
- `supabase.ts` — 不变
- 其他 UI 组件 — 不变

---

## 六、实施顺序

1. **数据层** — SQL migration + 类型更新
2. **点击特效** — useRipple hook + Ripple 组件 + 全局应用
3. **时光线页面** — TimelinePage + TimelineCard + MonthDivider
4. **底部导航改造** — 4 Tab + FAB 嵌入
5. **添加页扩展** — 类型切换（照片/文字）
6. **旅行详情页改造** — 混合展示
7. **手机 UI 优化** — 触控区域、间距、动画
8. **测试 & 验证** — 现有测试回归 + 新测试
