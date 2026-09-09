# Memory Bank — item2127

畀下一個接手嘅 agent／開發者用。**由呢頁開始，順住讀。**

| 檔 | 讀嘅時機 | 內容 |
|---|---|---|
| [`00-intent.md`](00-intent.md) | **最先，一定要讀** | 核心主旨、紅線、已經發生過嘅偏離 |
| [`10-architecture.md`](10-architecture.md) | 改任何 code 之前 | 資料流、程式地圖、不可破嘅不變量 |
| [`20-status.md`](20-status.md) | 決定做乜之前 | 完成了／未做／下一步優先次序 |
| [`30-decisions.md`](30-decisions.md) | 想改架構之前 | 決策同理由，**同埋已經否決咗嘅方案** |
| [`40-gotchas.md`](40-gotchas.md) | 撞牆嗰陣 | 已知陷阱同修法（省你幾個鐘） |

根目錄 [`README.md`](../README.md) 只負責專案簡介、依賴、setup 同入口。
未落地嘅實體展場計劃放喺 [`../docs/exhibition-plan.md`](../docs/exhibition-plan.md)。

## 三十秒版本

觀眾放入一件日常物品，系統推演並展示**呢件物品一百年後嘅形態**。

> **2026-09-06 暫定**：擷取由電動轉盤改為攝影箱 + 正面固定鏡頭，維持 2.5D。
> 目標唔係 360°，而係「正面 → 斜視」嘅仰角轉場。見 `30-decisions.md`「擷取硬件方向」。

- 現行入口：`demo.html`、`studies.html?lab=1`、`phone.html`、`studies.html?object=suica`；全部零建置、本地運算。
- 共用邏輯：`segmentation.js`（去背／遮罩錨點）、`calibration.js`（四角／透視對位）；流程已能接受檔案及人工修正。
- `studies.html` 除咗各配方 renderer，仲載住**畫面管線**（舞台／輪廓光／燙金／顆粒）同**材質工具**（部件範圍漸層、疊描邊管、接觸陰影）。改美術之前睇 `10-architecture.md` 嗰節同 `40-gotchas.md` 嘅漸層 clamp 陷阱。
- `index.html` 是保留的旋轉原型。後端、Gemini、印表機及實體展場驗證仍未完成；不要將舊規劃當成已實作功能。

## 維護呢個 memory bank

**邊種改動要更新邊份文檔，路由表喺 [`../AGENTS.md`](../AGENTS.md)「改完之後」嗰節**，
唔喺呢度重複。摘要：現況改 `20-status.md`（直接改，唔好追加流水帳）、
決策同**否決咗嘅方案**寫 `30-decisions.md`（唔記低就會有人再試一次）、
踩過嘅坑寫 `40-gotchas.md`、資料流同管線改動寫 `10-architecture.md`。
