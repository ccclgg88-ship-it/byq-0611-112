# 文章编辑器 API 契约文档

## 概述

本文档定义了生活百科企业站文章编辑器的后端接口规范。

## 基础信息

- Base URL: `/api`
- Content-Type: `application/json`
- 认证方式: Bearer Token (运营后台登录后获取)

---

## 1. 保存文章草稿

保存当前编辑中的文章草稿数据。

### 请求

```
PUT /api/articles/:id/draft
```

### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 文章草稿唯一标识 |

### 请求体

```typescript
interface ArticleDraftRequest {
  id: string;
  title: string;
  summary: string;
  coverImage: string;
  blocks: ArticleBlock[];
  updatedAt: string;
}

type BlockType =
  | 'h2'
  | 'h3'
  | 'paragraph'
  | 'ordered-list'
  | 'unordered-list'
  | 'image'
  | 'tip'
  | 'warning';

interface BlockMeta {
  alt?: string;
  items?: string[];
}

interface ArticleBlock {
  id: string;
  type: BlockType;
  content: string;
  meta: BlockMeta;
  order: number;
}
```

### 请求体字段说明

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| id | string | 是 | 非空 | 文章唯一标识 |
| title | string | 是 | 非空，最长200字 | 文章标题 |
| summary | string | 否 | 最长120字 | 文章摘要 |
| coverImage | string | 否 | URL 或 base64 | 封面图地址 |
| blocks | ArticleBlock[] | 否 | 最多200个 | 正文内容块列表 |
| blocks[].id | string | 是 | 非空 | 块唯一标识 |
| blocks[].type | BlockType | 是 | 枚举值 | 块类型 |
| blocks[].content | string | 是 | tip/warning 最长500字 | 块主内容 |
| blocks[].meta | BlockMeta | 是 | - | 块扩展元数据 |
| blocks[].meta.alt | string | 否 | - | 图片 alt 文本（仅 image 块） |
| blocks[].meta.items | string[] | 否 | - | 列表项数组（仅 ordered-list/unordered-list 块） |
| blocks[].order | number | 是 | ≥0 | 块排序序号 |
| updatedAt | string | 是 | ISO 8601 | 更新时间戳 |

### 请求示例

```json
{
  "id": "draft_001",
  "title": "居家生活小妙招",
  "summary": "10个超实用的居家生活小技巧",
  "coverImage": "https://example.com/cover.jpg",
  "blocks": [
    {
      "id": "block_001",
      "type": "h2",
      "content": "一、厨房清洁",
      "meta": {},
      "order": 0
    },
    {
      "id": "block_002",
      "type": "paragraph",
      "content": "厨房清洁其实很简单...",
      "meta": {},
      "order": 1
    },
    {
      "id": "block_003",
      "type": "ordered-list",
      "content": "",
      "meta": {
        "items": ["第一步", "第二步", "第三步"]
      },
      "order": 2
    }
  ],
  "updatedAt": "2026-06-12T10:00:00.000Z"
}
```

### 响应

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface SaveDraftResponse {
  id: string;
  savedAt: string;
  revision: number;
}
```

### 成功响应 (HTTP 200)

```json
{
  "code": 0,
  "message": "保存成功",
  "data": {
    "id": "draft_001",
    "savedAt": "2026-06-12T10:05:00.000Z",
    "revision": 5
  }
}
```

### 错误响应

| HTTP 状态码 | code | message | 说明 |
|-------------|------|---------|------|
| 400 | 40001 | 标题不能为空 | title 字段为空字符串