# 20 · 現況

最後整理：2026-09-10

## 一句總結

目前係**全離線、限定幾類日用品、可接受新相同人工修正**嘅 2.5D 瀏覽器原型；唔係任意物件辨識／生成系統，亦未完成實體展場整合。

## 已完成

### 展示及互動

- `demo.html`：手機、保溫樽、交通卡三物件展示；支援自動導覽、手動前後比較及 2127 Object Card。
- Object Card 係同一張 750×1050 直向 canvas：畫面預覽有輕微 tilt／glare，PNG 同
  63×88mm browser print 使用同一個 neutral static design。三個 authored scene 分別用
  `INTERFACE`／`VESSEL`／`ACCESS` 功能主題，各自主導底紋、角位構件同 foil 色；未知物件唔會被假裝自動分類。
- 所有觀眾可見 UI 已改為日文；文案守住「向前推一百年」主旨。
- 手機版 390px 版面、reduced-motion、重播及頁面隱藏停止動畫已有處理。

### 相片輸入及去背

- `studies.html?object=banana`：新相預設使用通用剪影配方；唔會假裝辨識物件類別。
- `studies.html?lab=1`：最長邊 1200px 分析、遮罩編輯、8 步 undo、reset、透明 PNG／灰階遮罩匯出。
- 一般輸入去背失敗可直接將原 File 送入同頁 Lab，毋須重揀或上傳。
- 大相片先縮圖分析；request revision 防止較慢嘅舊解碼覆蓋新輸入。
- `segmentation.js` 共用背景估算、遮罩處理同幾何量度；來源 alpha 會保留。

### 演化配方

- 通用配方：沿物件長軸量剪影，保留兩端、移除中間外殼，加入跟輪廓嘅承力骨架同縮細內核；光色及部分比例由輸入量得，結果可重現。
- 專屬配方：茶瓶、保溫樽、闊身容器、手機、交通卡。
- 茶瓶／保溫樽／闊身容器由人手揀配方；幾何唔符合會拒絕並講明原因及建議配方。
- 編輯後遮罩可直接送入三個容器配方；更換相或改遮罩會令舊預覽失效。
- 各演化頁可保存目前比較位置嘅 1456×970 PNG。

### 畫面美術（2026-09-09）

- 卡牌式舞台：物件色相嘅背光、輪廓光、燙金、顆粒，加圓角卡面同幼邊框。
  四層全部由 `future` 剪影推出嚟，五個入口共用同一盞燈、各自色溫；
  加新 renderer 唔使另外處理。
- 材質工具：部件範圍漸層（凸／凹明暗軌）、疊描邊管、接觸陰影、管座、螺絲、顆粒。
  茶瓶 pod 同保溫樽鰭片已重畫；水杯本身寫法就啱，只補全域顆粒；
  手機同交通卡幾何未動。
- 舞台層已抽做共用檔 `stage.js`（`stageBuild` / `stageBackdrop` / `stageOverlay` / `stageEdge`），
  `studies.html` 同 `phone.html` 一齊用；`studies.html` 嘅輸出前後 byte 相同，純重構。
- `renderFuture()` 實測 5ms，即時生成負擔不變。
- 手法、取捨同陷阱見 `30-decisions.md` 同 `40-gotchas.md`；管線圖見 `10-architecture.md`。
- `phone.html`（2026-09-10）已經接上同一個舞台層。佢仍然有自己一個 `draw()`（主體整體縮 .84），
  但四層打光同卡面同五個 studies 入口一致 —— 而家係同一家人。幾何本身未動。
- `previews/*-future.png` 已於 2026-09-10 用現行畫面重新產生（1456×970，同「今の画面を保存」同一路徑）。
  `previews/demo-*.png` 同 `previews/input-tests/` 由 `tests/browser.cjs` 重跑產生。

### 校準

- `calibration.js`／`calibration.css` 共用手機及交通卡四角校準、透視映射、凸四邊形驗證同 alpha-aware 重採樣。
- 卡片 fixture 有本地四角候選；手機 fixture 會誠實拒絕不可靠候選，保留人工校準。
- 已用平移／加邊框嘅既有 fixture 驗證可重用性，未用另一件真實手機／卡片證明通用性。

### 驗證

- 139 項頁內自我檢查：legacy 67、Lab 12、茶瓶 11、保溫樽 13、闊身容器 10、通用 10、交通卡 7、手機 9。
  手機嗰 9 項有一項改咗寫法：合成底下有舞台，所以「螢幕真係冇咗」由 alpha 0 改成同背景比對（同 studies 一致）。
- `tests/browser.cjs` 覆蓋真實 UI 操作、輸出檔案、快速換相、失敗恢復、配方切換、校準、baseline restoration、三種卡片 metadata／theme、750×1050 PNG、63×88mm print、deterministic reopen、reduced-motion 同 390px 版面。
- 最新證據及限制見 [`../previews/input-tests/README.md`](../previews/input-tests/README.md)，重跑方法見 [`../tests/README.md`](../tests/README.md)。

## 未完成

- 冇 `package.json`、本地後端或 API endpoint；舊文檔提過嘅 `npm run dev` 等指令從未存在。
- 冇 Gemini／其他語意模型整合，所有敘事同專屬配方都係 authored content。
- 冇相機擷取、第二視角、實體印刷、燈帶、音效硬件或展場連續循環。
- 通用配方唔理解物件功能；食物、玩具等可能只會得到幾何上成立但語意錯嘅形態。
- 透明／鏡面／亮色物件去背仍然脆弱；玻璃亮面會被進取清色誤刪。
- 真實新手機／卡片、不同現場背景同長時間展場穩定性未驗證。

實體展場待辦集中喺 [`../docs/exhibition-plan.md`](../docs/exhibition-plan.md)。

## 下一步

1. 用幾張**新嘅真實日用品相片**驗證現有通用配方、手動修圖同專屬配方邊界，記錄失敗率。
2. 為值得支援嘅物件功能新增少量 authored recipe；唔好單靠外形比例自動判斷語意。
3. 靜態流程穩定後，先做一個受控攝影箱嘅單張擷取閉環。
4. 第二鏡頭、模型、印刷及完整展場循環逐項加入，每項都保留離線／失敗退路。

## 已知能力邊界

- 去背質素直接限制通用骨架質素；背景殘留會被當成物件輪廓。
- 配方由功能同未解決問題決定，唔係「相同類別永遠同一造型」。
- 兩視角轉場仍然只係 2.5D 近似，唔係 3D 重建。
- legacy `index.html` 嘅旋轉、捕捉環同七節拍只係舊原型；唔代表現行展場方案。

## 維護規則

- 完成功能或驗證後更新呢頁，直接改現況，唔好再追加逐日流水帳。
- 測試數量只喺實際跑過之後更新，並同步 `tests/README.md` 同測試證據。
- 其餘改動路由（決策／陷阱／架構／README／展場）見
  [`../AGENTS.md`](../AGENTS.md)「改完之後」嗰節嘅表，唔喺呢度重複。
