# item2127 — 給接手的 AI agent

**開工前先讀 `memory-bank/`**，由 `memory-bank/README.md` 入手。

## 一條唔可以破嘅規矩

呢個 project 係將一件現代物品**向前推一百年**，畀人睇到「你呢件嘢 2127 年會變成點」。

**唔係**「2127 年嘅考古學家點樣誤讀一件古代遺物」。

呢個偏離已經發生過一次，改返嗮好貴。所有文案、視覺、狀態命名、Gemini prompt
都必須係**前向**嘅：世代、演化路徑、保留咗乜、變成乜。
唔可以出現：遺物、古代人、考古、鑑定、歸檔、ANCIENT、RELIC、ARTIFACT。

詳情見 `memory-bank/00-intent.md`。

## 跑起佢

```bash
python3 -m http.server 8127 --bind 127.0.0.1  # 一定要 HTTP，file:// 會令 canvas 跨來源污染
open http://127.0.0.1:8127/demo.html           # 組員展示入口
open 'http://127.0.0.1:8127/?test=1'           # legacy 67 項自我檢查
```

`?cam=1` 真攝影機 ｜ `?synth=1` 合成物件 ｜ `?src=xx.mp4` ｜ 影片可直接拖入頁面

**要試「放張相入去睇一百年後」嘅 demo，開 `studies.html?object=banana`**，拖相入去即推演。
專屬配方：`?object=bottle` 茶瓶 ｜ `?object=bottle-b` 保溫樽 ｜ `?object=cup` 水杯 ｜
`?object=suica` 交通卡 ｜ `phone.html` 手機 ｜ `?lab=1` 去背實驗（手動修遮罩再試演化）。
每頁加 `&test=1` 跑該頁自我檢查；完整操作回歸 `node tests/browser.cjs`（見 `tests/README.md`）。

## 介面語言

**所有觀眾睇到嘅字一律日文**（`lang="ja"`）。新加嘅 UI 文案要用日文，而且照樣守前向原則：
用「次の世代」「継承」「推定」，唔可以出現遺物／考古／鑑定／ANCIENT／RELIC／ARTIFACT。
repo 文檔同程式碼註解維持中文；`index.html?test=1` 嗰 67 條檢查名亦保留中文（`memory-bank/` 用名引用緊）。

## 畫面美術

卡牌式舞台（背光／輪廓光／燙金／顆粒）喺共用檔 `stage.js`，由 `future` 剪影自動生成 ——
**加新 renderer 唔使理呢層**。`studies.html` 五個入口同 `phone.html` 共用同一盞燈。
自己寫 `draw()` 嘅頁要記住：主體同 `stageOverlay()` 必須喺同一個 transform 之內（見 gotchas）。物件本身用材質工具畫：部件範圍漸層、疊描邊管、接觸陰影、
管座、螺絲。管線圖見 `memory-bank/10-architecture.md`。

**動手改美術之前一定要睇 `memory-bank/40-gotchas.md` 嘅漸層 clamp 條目。**
`grad()` 係畫布座標漸層；部件喺範圍外會 clamp 成純色，彎曲部件連自己範圍都用唔得。
一個曲面部件睇落均勻單色、或者一條管有一段死黑，係 clamp，**唔好走去改 path**。

## 改完之後

### 1. 檢查要全綠

`?test=1` 必須全綠（studies 五個入口 + `phone.html` + legacy `index.html` 67 項）。
改咗幾何、模組或形態推演就要補檢查落該頁嘅 `selfTest()`。

### 2. 文檔要跟住更新 —— 呢個唔係可選

**每次改動或決策做完，即刻更新所有相關文檔，唔好等下一次。**
文檔同 code 分家係呢個 repo 最容易累積嘅債。照下表路由：

| 改咗乜 | 要更新 |
|---|---|
| 任何功能完成／驗證完 | `memory-bank/20-status.md`（直接改現況，唔好追加流水帳） |
| 選咗一個做法、或者**否決咗**一個做法 | `memory-bank/30-decisions.md`（一定要寫低點解否決，唔記低就會有人再試） |
| 踩到一個坑、修好一個靜態 bug | `memory-bank/40-gotchas.md`（症狀 → 成因 → 修法 → 點樣一眼認出） |
| 加咗模組、改咗資料流或渲染管線 | `memory-bank/10-architecture.md` |
| 加／改入口、依賴、setup | `README.md` 同呢一頁嘅「跑起佢」／「檔案」 |
| 改咗紅線本身 | `memory-bank/00-intent.md`（**要先問人**） |
| 改咗展場硬件或營運假設 | `docs/exhibition-plan.md` |
| 改咗測試覆蓋或數量 | `tests/README.md`；數量只喺實際跑過之後先更新 |
| 改咗展示流程 | `DEMO.md` |

順手做埋：如果改動令 `previews/` 入面嘅截圖過時，喺 `20-status.md` 標明佢過時，
或者重跑 `node tests/browser.cjs` 更新。**唔好留一批睇落係現況、其實唔係嘅圖。**

### 3. 誠實標記未跟上嘅嘢

如果改動只做咗一半（例如 `phone.html` 冇跟上 `studies.html` 嘅管線），
喺 `20-status.md` 用 ⚠️ 寫明邊度唔一致同點解。**唔好靜靜雞留低。**

## 檔案

| 檔 | 係乜 |
|---|---|
| `studies.html` | 現行主頁：各配方 renderer、畫面管線、材質工具、Lab（~920 行） |
| `phone.html` | 手機四角校準頁。**有自己嘅 `draw()`**，但美術已共用 `stage.js` |
| `demo.html` | 組員展示入口 |
| `stage.js` | 共用舞台層：背光／輪廓光／燙金／顆粒／卡面。studies + phone 一齊用 |
| `segmentation.js` | 共用去背、遮罩處理、幾何錨點 |
| `calibration.js` / `calibration.css` | 共用四角校準、透視映射 |
| `index.html` | legacy 旋轉／攝影機原型，單檔，~1540 行 |
| `tests/browser.cjs` | Playwright 全流程回歸（見 `tests/README.md`） |
| `AGENTS.md` | 呢一頁。agent 開工規則（`CLAUDE.md` 只係指過嚟） |
| `README.md` | 專案簡介、依賴、setup、入口、文檔索引 |
| `DEMO.md` | 三分鐘展示講稿 |
| `docs/exhibition-plan.md` | 未落地嘅展場硬件、營運要求同風險 |
| `memory-bank/` | 交接用：主旨、架構圖、進度、決策、陷阱 |
| `previews/` | 截圖證據。`input-tests/` 同 `demo-*.png` 由測試產生，其餘係手動快照 |
| `demo.mp4` | 綠幕旋轉籃球，測試素材（H.264） |
