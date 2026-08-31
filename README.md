# 好生活社區｜包裹通知系統

社區管委會網頁後台 + LINE 官方帳號通知。建議部署於 **Vercel**（免費 HTTPS 網域）。

## 角色

| 角色 | 功能 |
| --- | --- |
| 主委 | 住戶名單、管理員名單、LINE 串接設定與圖文選單 |
| 管理員 | 拍照新增包裹／郵件、未領取清單、戶號搜尋、勾選領取 |
| 住戶 | 加入官方 LINE、綁定門牌與戶號、接收通知、查詢未領取包裹 |

---

## 部署到 Vercel（建議）

### 1. 準備 GitHub

將專案推上 GitHub（若尚未建立 repo）。

### 2. 建立 Vercel 專案

1. 到 [vercel.com](https://vercel.com) 用 GitHub 登入  
2. **Add New → Project** → 選擇此 repo → **Deploy**  
3. 第一次部署可能因缺少資料庫而失敗，屬正常

### 3. 建立資料庫（二選一）

**方式 A：Vercel Postgres（最簡單）**

1. Vercel 專案 → **Storage** → **Create Database** → **Postgres**  
2. 連結到本專案，會自動注入 `POSTGRES_URL` 等變數  
3. 在 **Environment Variables** 新增：  
   `DATABASE_URL` = 複製 `POSTGRES_PRISMA_URL` 的值（或 Vercel 提供的 Prisma 連線字串）

**方式 B：Neon（免費、也常用）**

1. 到 [neon.tech](https://neon.tech) 建立專案  
2. 複製連線字串，在 Vercel 設為 `DATABASE_URL`

### 4. 建立 Blob 儲存（包裹照片）

1. Vercel 專案 → **Storage** → **Create Database** → **Blob**  
2. 連結到本專案，會自動注入 `BLOB_READ_WRITE_TOKEN`

### 5. 設定環境變數

在 Vercel → **Settings → Environment Variables**：

| 變數 | 說明 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 連線字串 |
| `SESSION_SECRET` | 至少 32 字元隨機字串 |
| `LINE_CHANNEL_SECRET` | LINE Developers |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers |
| `APP_BASE_URL` | 可留空；預設用 `https://你的專案.vercel.app` |

### 6. 重新部署

**Deployments** → 最新一次 → **Redeploy**

建置時會自動執行 `prisma migrate deploy` 建立資料表。

### 7. 建立預設帳號（種子資料）

在本機（需能連到雲端資料庫）：

```bash
# 把 Vercel 的 DATABASE_URL 貼到本機 .env
npm run db:seed
```

預設帳號：

- 主委：`chair` / `chair123`
- 管理員：`admin` / `admin123`

### 8. 設定 LINE

1. Webhook URL：`https://你的專案.vercel.app/api/line/webhook`  
2. 開啟 **Use webhook**，按 **Verify**  
3. 主委登入後台 → **LINE 設定** → **建立／更新圖文選單**

---

## 本機開發

需要 PostgreSQL 連線（可用 Neon 免費 DB）：

```bash
cp .env.example .env
# 編輯 .env 填入 DATABASE_URL、LINE 等
npm install
npm run db:migrate
npm run db:seed
npm run line:rich-menu:image
npm run dev
```

本機若未設定 `BLOB_READ_WRITE_TOKEN`，照片會暫存在 `public/uploads`。

---

## 環境變數總覽

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=至少32字元
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
APP_BASE_URL=          # Vercel 可留空
BLOB_READ_WRITE_TOKEN= # Vercel Blob 自動注入
```

---

## 其他指令

```bash
npm run line:rich-menu      # 建立 LINE 圖文選單
npm run db:migrate          # 套用資料庫 migration
```

## Docker（選用）

若不想用 Vercel，仍可用 `docker compose up` 自建主機，需自行設定 PostgreSQL 與對外網域。
