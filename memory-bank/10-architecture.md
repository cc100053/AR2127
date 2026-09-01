# 10 · 架構

## 資料流

```
                  [ 觀眾放物品落旋轉台座 20 RPM ]
                                │
                       [ USB 攝影機 · 約 45° ]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼ 幾何層（本地 · 每格 60fps）        語意層（Gemini · 一次循環一次）▼
  色鍵去背 → 二值遮罩                        0° / 180° 兩格 JPEG
  影像矩 → 質心 / bbox / 主軸角 / 離心率        ↓
  放射取樣 → 64 點輪廓 → EMA 平滑            now / futureName / gen / form
  projectFuture() → 2127 形態輪廓            lineage / kept / visualTheme / modules
        └───────────────────────┬───────────────────────┘
                                ▼
              合成層：SVG + CSS blend + clip-path
    2026 原型（虛線）｜ 2127 形態（實線發光外殼）｜ 對應連線 ｜ 改造模組
                                │
                     [ 本地 Node :7127 ]  ← 一行都未寫
                       /api/project  → Gemini 代理（金鑰唔入前端）
                       /api/print    → ESC/POS 點陣圖出單
```

## 三層判斷（互相獨立，任何一層死咗其餘照跑）

| 層 | 邊度跑 | 頻率 | 決定 | 死咗點算 |
|---|---|---|---|---|
| 語意 | Gemini | 一次 | 叫咩名、演化路徑、裝咩模組 | 罐頭「推演失敗」 |
| 幾何 | 瀏覽器 | 每格 | 形狀、位置、2127 輪廓 | 置中固定準星 |
| 配色 | 硬編查表 | 一次 | palette | 預設 `UNKNOWN` |

## `index.html` 程式地圖

單檔，~880 行。行號會漂，用函式名搵。

| 區 | 關鍵符號 | 做乜 |
|---|---|---|
| 設定 | `CFG` | **所有現場調校旋鈕喺呢度**（色鍵、平滑、RPM、閾值） |
| 主題 | `THEMES` | 六個 `visualTheme` enum → 兩隻色 |
| 追蹤 | `hueDist` `analyze` `track` `fitTracker` | 色鍵 → 影像矩 → 質心/bbox/角度/離心率 |
| 輪廓 | `radialContour` `toPath` | 由質心放射取樣 64 點 → SVG path |
| 音效 | `ac` `tone` `chirp` `tick` `boom` `humOn/Off` | WebAudio 純振盪器，零音檔 |
| 文字 | `scramble` `typewrite` | 亂碼解碼、打字機 |
| 模組 | `rng` `anchorToIndex` `buildParts` `layoutParts` | mulberry32 + 位置提示換算 + CHIP/MONITOR/CONDUIT |
| **形態** | **`projectFuture`** | **由真實輪廓推演 2127 形態（主旨所在）** |
| 背景 | `drawVoid` | 2127 虛空：透視網格 + 塵埃 |
| 假來源 | `synthStream` | 冇素材時嘅程序生成鑰匙 |
| 假資料 | `MOCK_DB` `mockScan` | **要換成 `/api/project`** |
| 狀態機 | `loop` `go` `onEnter` `reveal` `resetView` | 七節拍 |
| 啟動 | `boot` `start` `useFile` `useStream` `setAR` | 來源可插拔 |
| 檢查 | `selfTest` | `?test=1`，19 項 |

## 七節拍

`IDLE → DETECT → PROJECT → MORPH → REVEAL → PRINT → RESET`

**轉盤轉一圈 = 進度條。** 一圈 3 秒（20 RPM）≈ Gemini 中位延遲。
資料早到 → 等呢圈轉完；晚到 → 多轉一圈。**物理節奏遮住網絡抖動，永遠唔會出轉圈圈。**

## 不可破嘅不變量

改 code 之前逐條核對。全部都有 `?test=1` 守住。

1. **追蹤畫布長寬比必須等於來源。** `fitTracker()` 按影片比例設 `CFG.H`。
   唔跟 → 物體被壓扁 → 圓球量出離心率 0.28、主軸角系統性歪。**呢個 bug 靜到冇聲。**
2. **輪廓第 i 點嘅法線 = 第 i 條射線方向**（`cos/sin(i/rays·2π)`）。免費，唔使另外算。
3. **模組只存輪廓索引，唔存座標。** 每格由當下 `smooth[i]` 重新投影 → 先會跟住實體轉。
   Gemini 嘅 `at:[x,y]`（0~1000 影像空間，**x 先**）由 `anchorToIndex()` 換算成索引，
   換算基準係**當格質心**，所以一定要喺有 `lastT` 之後先叫 `buildParts()`。
4. **同一個 seed 必須出同一個結果。** `rng` 係 mulberry32，`buildParts` / `projectFuture` 都靠佢。
   `projectFuture` **每格用同一個 seed 重跑**，唔係算一次就 cache。
5. **Gemini 一個循環只叫一次。** 佢唔可以入追蹤迴圈（2~6 秒延遲）。
6. **所有 SVG 座標係顯示 px**，`viewBox` 每格對齊 stage 尺寸（會變）。
7. **進入節拍用 `onEnter()` 旗標**，唔好用 `since() < 20` 呢種時間窗 —— 掉一格就永遠入唔到。
8. **單格偵測唔到 ≠ 物件拎走咗。** 要連續 `CFG.goneFrames` 格先當走（影片 loop、手掃過都會掉格）。

## 座標空間

```
追蹤空間  CFG.W × CFG.H（160×90，跟來源比例）   ← analyze / radialContour / projectFuture
   │ × sx = box.width/CFG.W,  sy = box.height/CFG.H
   ▼
顯示空間  stage 嘅 CSS px                        ← 所有 SVG、clip-path、模組
```

`#stage` 嘅 `aspect-ratio` 執行時設成來源比例，`object-fit:fill` →
兩個空間之間**只係純縮放**，冇 letterbox 位移。呢個設計消滅咗成類座標 bug。
