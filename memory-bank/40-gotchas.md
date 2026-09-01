# 40 · 陷阱

每一條都真係燒過時間。撞到先睇，可以慳你幾個鐘。

## 環境

### `file://` 會令 canvas 跨來源污染
Chrome 當每個本機檔案係獨立來源，`getImageData()` 直接掟例外，追蹤即死。
**一定要用 HTTP 伺服器。** 頁面已經會顯示對應提示。
```bash
python3 -m http.server 8127
```

### yt-dlp 預設攞到 AV1，部分環境解唔開
症狀：`readyState` 一直 0、`networkState` 2、冇 error。
```bash
ffmpeg -i in.mp4 -c:v libx264 -pix_fmt yuv420p -an demo.mp4
```

### 背景分頁測唔到嘢
`document.hidden === true` → `requestAnimationFrame` 停、媒體唔載入。
症狀：`present` 凍結喺某個數、`readyState` 0。
**Chrome 視窗一定要喺前面**，否則改用 Node harness 做數值驗證。

## 已經修好嘅 bug（唔好復辟）

### 四個 `<video>` 指住同一個檔案 → 卡死
四個並發請求 + 四個解碼器。已收窄到**一個** video，
全息化直接對 `#feed` 套 CSS filter，色差用原生 SVG `feColorMatrix` + `feOffset`。

### `await play()` 會鎖死 boot
媒體載唔到時 `play()` 個 promise **可以永遠唔 settle**。
`playAll()` 而家唔 await，`boot()` 有 try/catch，而且**來源失敗都照跑 `loop()`**
（唔係嘅話成塊畫面死黑，睇落好似壞咗）。

### `#stage > *` 包山包海嘅 CSS
`inset:0; width:100%; height:100%` 連 HUD 面板都拉成全螢幕。
影像層而家要標 `class="layer"`，規則收窄成 `#stage > .layer`。

### SVG `viewBox` 會過期
啟動時設一次，之後 stage 尺寸一變，成組 SVG 座標就歪。**每格對齊。**

### 追蹤畫布長寬比同來源唔一致 —— **靜到冇聲嘅幾何 bug**
160×120（4:3）配 16:9 影片 → 物體被壓扁 → **圓球量出離心率 0.28 而唔係 0**，
細長物嘅主軸角系統性歪。`fitTracker()` 按來源設 `CFG.H`（而家 160×90）。
`?test=1` 有守住呢條。

### `mix-blend-mode: screen` 會洗白
全息化係**取代**，唔係疊亮。灰階副本 screen 上去會變一片白。

### 影片 loop 重頭會掉格 → 整個循環被打斷
單格偵測唔到就 reset 係錯嘅。要連續 `CFG.goneFrames` 格。
展場都需要呢個：手掃過、對焦一下都會掉格。

### `if (since() < 20)` 呢種時間窗守衛
掉一格就永遠入唔到，`reveal()` 完全唔會被呼叫。用 `onEnter()` 旗標。

## 素材／校正

- `demo.mp4` 實測背景 **hue 120.2 / sat 0.99** → `CFG.keyHue:120, tol:42` 命中
- **籃球係圓嘅** —— 剪影係圓形，主軸角無定義。`minEcc` 守衛會顯示 `RADIAL SYM`。
  要示範旋轉追蹤請用細長物體。籃球係好嘅**健壯性**測試素材
- 曝光／白平衡漂移會令色鍵閾值走位。呢個架構下係**承重項**，唔係「最好有」
- 透明／鏡面物體（玻璃、透明膠、手機螢幕）去背會失敗 → 退回置中固定準星

## 測試

`?test=1` 19 項，涵蓋追蹤幾何、圓形守衛、模組可重現性與錨定、2127 形態推演。
**改咗幾何／模組／形態就要補檢查。** 純數值，唔使睇畫面，背景分頁都跑得。
