# 生活百科企业站 - 文章编辑器

为「生活百科企业站」内容运营后台打造的专业文章编辑器，支持图文混排的生活技巧文章创作，提供实时预览、块级编辑、拖拽排序等高效功能。

## 技术栈

- **前端框架**: React 18 + TypeScript + Vite
- **状态管理**: Zustand
- **样式方案**: Tailwind CSS
- **图标库**: Lucide React
- **测试框架**: Vitest + React Testing Library
- **部署方案**: Docker + Nginx

## 功能特性

### 核心编辑能力
- ✅ 标题、摘要、封面图编辑
- ✅ 6 种正文块类型（见下方块类型清单）
- ✅ 块级拖拽排序（HTML5 Drag and Drop）
- ✅ 右侧实时预览，与前台样式一致
- ✅ 300ms 输入防抖同步预览

### 数据与状态
- ✅ `ArticleDraft` JSON 数组存储块列表
- ✅ 撤销 / 重做历史栈（深度 ≥ 20 步）
- ✅ 离开页面前未保存变更确认（`beforeunload` + 路由守卫）
- ✅ 摘要字数实时统计（≤120 字变红）

### 跨模块集成
- ✅ 封面图 URL 输入与本地 Mock 上传（`FileReader` 转 base64）
- ✅ 图片加载失败自动显示占位图
- ✅ 空块列表时预览区展示默认引导文案

### 异常与边界
- ✅ 空标题禁止保存
- ✅ 单篇文章块数量上限 200，超出 Toast 提示
- ✅ tip/warning 块各类型正文上限 500 字

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Z` (macOS: `⌘ + Z`) | 撤销上一步操作 |
| `Ctrl + Y` (macOS: `⌘ + Y`) | 重做已撤销的操作 |

---

## 块类型清单

| 块类型 | 标识 | 说明 | 字符限制 |
|--------|------|------|----------|
| 二级标题 | `h2` | 章节级大标题 | - |
| 三级标题 | `h3` | 小节级小标题 | - |
| 正文段落 | `paragraph` | 普通正文文本，支持换行 | - |
| 有序列表 | `ordered-list` | 带数字编号的列表项 | - |
| 无序列表 | `unordered-list` | 带圆点的列表项 | - |
| 图片占位 | `image` | 支持 URL 或本地上传（base64） | - |
| 温馨提示 | `tip` | 蓝色背景提示框 | ≤ 500 字 |
| 注意事项 | `warning` | 橙色背景提示框 | ≤ 500 字 |

---

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行单元测试
npm run test

# 代码类型检查
npm run check

# 生产构建
npm run build
```

启动后访问 `http://localhost:5173/editor/draft_default` 进入编辑器。

---

## Docker 部署

### 前置要求
- Docker ≥ 20.10
- Docker Compose ≥ 2.0

### 启动步骤

```bash
# 1. 构建生产产物
npm run build

# 2. 启动 Nginx 容器
docker compose up -d

# 3. 访问应用
# 打开浏览器访问 http://localhost:8080
```

### 其他命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止并移除容器
docker compose down

# 重启服务
docker compose restart
```

容器内部署的 Nginx 已配置：
- SPA 路由回退（支持 React Router）
- Gzip 压缩
- 静态资源长期缓存
- 隐藏文件访问禁止

---

## 项目结构

```
src/
├── components/
│   ├── ArticleEditor/
│   │   ├── ArticleEditor.tsx      # 主编辑器组件
│   │   ├── BlockToolbar.tsx       # 块工具栏
│   │   └── ArticleRenderer.tsx    # 预览渲染组件
│   ├── blocks/
│   │   ├── BlockWrapper.tsx       # 块容器（拖拽/删除）
│   │   ├── HeadingBlock.tsx       # H2/H3 标题块
│   │   ├── ParagraphBlock.tsx     # 段落块
│   │   ├── ListBlock.tsx          # 有序/无序列表块
│   │   ├── ImageBlock.tsx         # 图片块
│   │   └── AlertBlock.tsx         # tip/warning 提示块
│   └── common/
│       ├── Toast.tsx              # Toast 提示组件
│       └── CoverUploader.tsx      # 封面图上传组件
├── hooks/
│   ├── useEditorHistory.ts        # 撤销/重做 Hook
│   └── useDebounce.ts             # 防抖 Hook
├── store/
│   └── editorStore.ts             # Zustand 状态管理
├── types/
│   └── article.ts                 # 类型定义
├── utils/
│   ├── blockUtils.ts              # 块操作工具函数
│   └── fileUtils.ts               # 文件处理工具
├── pages/
│   └── EditorPage.tsx             # 编辑器页面（含路由守卫）
└── App.tsx

public/
└── mock/
    └── articles/
        └── sample-draft.json      # 初始样例数据

docs/
└── api-contract.md                # API 契约文档

tests/
└── hooks/
    └── useEditorHistory.test.ts   # 单元测试
```

---

## 接口契约

详细 API 定义请查看 [docs/api-contract.md](./docs/api-contract.md)。

核心接口：
- `PUT /api/articles/:id/draft` - 保存文章草稿
- `GET /api/articles/:id/draft` - 获取文章草稿

---

## 许可证

MIT
