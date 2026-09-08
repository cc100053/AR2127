# 2127 形態推演 — 100 Years Later

將一件現代日常物品向前推一百年，展示「你呢件嘢喺 2127 年會變成點」。
目前係全離線、瀏覽器內運行嘅 2.5D 原型：用本地相片、可修正去背同幾個已設計好嘅演化配方，產生原型／未來形態比較及 PNG 世代卡。

> 呢個 project 講未來演化，唔係遺物鑑定。觀眾介面一律用日文；repo 文檔同程式碼註解用中文。

## 快速開始

需要：

- Python 3（只用嚟開本地靜態伺服器）
- 現代 Chrome 或 Chromium 瀏覽器

毋須安裝 npm package、後端服務、模型或雲端 API。

```bash
cd item2127
python3 -m http.server 8127 --bind 127.0.0.1
```

然後開 [http://127.0.0.1:8127/demo.html](http://127.0.0.1:8127/demo.html)。唔好用 `file://`，否則 Canvas 讀圖會受跨來源限制。

## 主要入口

| 入口 | 用途 |
|---|---|
| [`demo.html`](demo.html) | 組員展示：三件物品導覽、前後比較、PNG 世代卡 |
| [`studies.html?object=banana`](studies.html?object=banana) | 上載任意相片，使用通用剪影配方 |
| [`studies.html?lab=1`](studies.html?lab=1) | 去背、修正遮罩、匯出，再送入演化配方 |
| [`phone.html`](phone.html) | 手機相片四角校準及既有手機造型 |
| [`studies.html?object=suica`](studies.html?object=suica) | 卡片四角校準及既有腕環造型 |
| [`index.html`](index.html) | 保留嘅旋轉／攝影機 legacy 原型 |

專屬容器配方：`studies.html?object=bottle`（茶瓶）、`bottle-b`（保溫樽）、`cup`（闊身容器）。

## 驗證

每個入口加 `test=1` 可跑頁內自我檢查，例如：

```text
http://127.0.0.1:8127/studies.html?object=banana&test=1
http://127.0.0.1:8127/phone.html?test=1
```

完整瀏覽器操作回歸需要 Node.js、Chrome，同一個已存在嘅 Playwright 安裝；指令及覆蓋範圍見 [`tests/README.md`](tests/README.md)。Playwright 只係測試依賴，唔係應用程式依賴。

## 文檔地圖

| 文件 | 內容 |
|---|---|
| [`DEMO.md`](DEMO.md) | 三分鐘展示講稿及展示前檢查 |
| [`docs/exhibition-plan.md`](docs/exhibition-plan.md) | 未落地嘅展場硬件、營運要求及風險 |
| [`memory-bank/README.md`](memory-bank/README.md) | 開發交接入口；再分主旨、架構、現況、決策、陷阱 |
| [`tests/README.md`](tests/README.md) | 測試方法、依賴及覆蓋範圍 |
| [`previews/input-tests/README.md`](previews/input-tests/README.md) | 圖像測試證據同限制 |
| [`CLAUDE.md`](CLAUDE.md) | AI agent 開工規則 |

## 現有限制

- 通用配方按剪影生成，唔會辨識件物品係乜；專屬配方由人手選擇。
- 手機同卡片需要人工確認四角；現有檢查未證明任意實物都能自動校準。
- 透明、鏡面、亮色物件仍可能去背失敗，應轉入 Lab 手動修正。
- 後端、Gemini、相機擷取、第二視角、實體印刷及展場連續運作仍未實作或未驗證。
