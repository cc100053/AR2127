# 2127 遺物鑑定所 — Artifact Appraisal Shrine

即時 AR 展示裝置。觀眾把日常物品（鑰匙、悠遊卡、護唇膏）放上旋轉台座，
系統在直播影像上即時疊加 2127 年的全息分析介面，最後印出一張實體「遺物鑑定證書」。

- **展場**：HAL 東京 —— 主題「100 Years Later / 2127」
- **單次循環**：60 秒
- **形式**：Chrome kiosk（單機）+ 電動轉盤 + 熱感應印表機

---

# Part 1 — 規劃

## 1.1 核心設計決策

三個決定貫穿整份文件，其他所有東西都是它們的推論。

### 決策 A：Gemini 不在追蹤迴圈裡

Gemini 的往返是 2~6 秒，不可能做逐格追蹤。

- **Gemini 整場只跑一次** —— 負責命名、世界觀文案、主題分類（語意）
- **追蹤在本地端，每一格都做** —— 負責位置、輪廓、方位角（幾何）

兩者完全解耦。網路掛掉時幾何層照常運作，展品降級但不死。

### 決策 B：不「換掉」物體，用物體的剪影當生成素材

不做影像生成的「未來版本」替換。延遲會讓靜態生成圖與實體轉動脫節，AR 幻覺當場崩潰。

變身 = 把真實剪影當作 `clip-path`，對物體本體套用全息化濾鏡，
再由同一條輪廓長出光場、節點標記、體積投影。

**對任何物體自動成立，零預製素材。**

### 決策 C：暗箱是一塊還沒用到的綠幕

固定相機 + 受控 LED + 封閉台座 = 影像分割問題先天已解。
台座鋪色鍵材質（綠色絨布或壓克力），色相去背即可拿到乾淨遮罩。
不需要機器學習函式庫、不下載模型、不需要 WebGL。

---

## 1.2 資料流

```
                     [ 觀眾放上物品 ]
                            │
                            ▼
              [ USB 攝影機（固定俯拍）]
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                     ▼
 ── 幾何層（本地・60fps）──          ── 語意層（Gemini・單次）──
  色鍵去背 → 二值遮罩                 0° / 180° 兩格 JPEG
  影像矩 → 質心 / bbox / 主軸角        ↓
  Marching Squares → 輪廓 path        itemName / futureName
         │                            classification / powerLevel
         │                            archaeologistNotes
         │                            visualTheme (enum)
         └──────────────────┬──────────────────┘
                            ▼
              [ 合成層：SVG + CSS blend ]
       clip-path → 物體全息化 ｜ 同一 path → 發光外框
       主題查表 → 配色 / 粒子 / 字符組
                            │
                            ▼
        [ 本地 Node 服務 :7127 ]
          /api/scan  → Gemini 代理（金鑰不進前端）
          /api/print → ESC/POS 點陣圖出單
```

---

## 1.3 判斷分成三層

拆成三個獨立系統。任何一層失效，其他兩層照常運作。

| 層 | 執行位置 | 頻率 | 決定 | 失效時 |
|---|---|---|---|---|
| **語意** | Gemini 2.5 Flash | 單次 | 它是什麼 / 2127 年誤以為它是什麼 | 罐頭「異常讀數」證書 |
| **幾何** | 瀏覽器本地 | 每格 | 疊加物長在哪、什麼形式 | 置中固定尺寸準星 |
| **配色** | 硬編查表 | 單次 | palette / 粒子行為 / 字符組 | 預設 `UNKNOWN` 主題 |

**Gemini 決定意義，幾何決定形式，查表決定配色。**

### 幾何層自己會判斷形式

```
aspect = bbox 寬 / 高
complexity = perimeter² / area          （圓形 ≈ 12.6，越複雜越大）

細長（鑰匙、筆、護唇膏）  → 沿主軸的軸向能量束
圓胖（硬幣、瓶蓋）        → 同心環、反應爐處理
複雜（鑰匙圈、耳機）      → 高密度節點標記、電路感
```

形狀不同 → 視覺處理不同。觀眾會覺得系統「真的在看」。而且這一層完全不依賴 Gemini。

### `visualTheme` 必須是列舉

自由文字的主題 = 無法預測的算繪。六個固定值：

`CRYSTALLINE` ｜ `BIOMECH` ｜ `PLASMA` ｜ `ARCHIVE` ｜ `WEAPON` ｜ `UNKNOWN`

---

## 1.4 畫面編排：把「轉一圈」當成進度條

**一次完整旋轉 ≈ Gemini 的中位延遲。** 物理運動就是進度條 ——
觀眾看得懂，網路抖動永遠不會表現成一顆轉圈圈。

| 節拍 | 時長 | 畫面 | 觸發 |
|---|---|---|---|
| `IDLE` | — | 吸引迴圈、掃描網格 | `track()` 回 null |
| `DETECT` | 0.3s | 輪廓瞬間吸附成青色 | 遮罩面積穩定 |
| `SCAN` | 1 圈 | 掃描線由上而下掃過，輪廓逐段累積 | 送出 `/api/scan` |
| `MATERIALIZE` | 1s | `#holo` 淡入，節點沿輪廓 stagger 彈出 | Gemini 回應 |
| `REVEAL` | 10s | HUD 看板飛入，powerLevel 數字滾動 | — |
| `PRINT` | 4s | 出單 | 自動 |
| `RESET` | — | 淡出回 IDLE | 物體移走或 15s 閒置 |

Gemini 早回來 → 等這圈轉完。晚回來 → 多轉一圈。永遠對齊實體節奏。

---

## 1.5 硬體規格

| 項目 | 規格 | 備註 |
|---|---|---|
| 轉盤 | **20 RPM（3 秒 / 圈）** | 現場調校旋鈕：`RPM = 60 / 實測中位延遲` |
| 台座面 | 色鍵綠（絨布或壓克力） | 深色物體在黑台座上會去背失敗，所以用綠 |
| 相機 | USB UVC，**手動對焦** | 固定微距下自動對焦會來回拉風箱 |
| 曝光 / 白平衡 | **必須鎖死** | 承重項目：任何漂移都會讓去背門檻走位 |
| 燈光 | LED 環燈，俯照 | 避免側光造成陰影被算進遮罩 |
| 印表機 | ESC/POS 58mm，**須確認為 CDC / 虛擬 COM** | 見 §1.6 風險 1 |
| 主機 | 任何能跑 Chrome 的機器 | Chrome kiosk 模式，`--use-fake-ui-for-media-stream` |

物體在轉軸上 → **質心固定**。錨點校正一次永久有效，HUD 零抖動；輪廓照樣每格更新。
穩固錨點 + 活的外框，兩邊都拿到。

---

## 1.6 風險清單（依殺傷力排序）

### 1. Web Serial 很可能看不到印表機 ⚠️ 最高

多數 USB 熱感應印表機以 **USB Printer Class（bulk）** 列舉，Web Serial 完全碰不到。
只有暴露 CDC / 虛擬 COM Port 的機型可用。便宜的 58mm 中國製通常可以；
Epson TM-T20 / T88 通常不行。

→ **第 1 天就要買到並實測那一台**。永遠可行的退路：Node 常駐行程開著裝置，
對 localhost 開 `POST /api/print`。反正這個行程也要拿來代理 Gemini。

### 2. 日文會印成亂碼

58mm 印表機出廠字碼頁是片假名 / GB2312，**沒有漢字**。
任何日文輸出都必須用 `<canvas>` 算繪成點陣圖，走 `GS v 0`。
這跟 ESC/POS 純文字是不同的程式路徑。**現在就決定收據語言。**

### 3. 隱私 —— 最可能演變成真實事故

觀眾會把身分證、學生證、開著訊息的手機、自己的手放上打光台座，
而你會把模型讀到的內容**印在實體收據上**。

Prompt 必須明確：**絕不轉錄文件上的文字**、拒絕人物 / 身體部位、拒絕任何證件形狀物。
要有拒絕路徑與對應的畫面。

### 4. 自動曝光 / 白平衡漂移

在此架構下是承重結構，不是「最好有」。`applyConstraints` 設手動，或選有硬體鎖的攝影機。

### 5. 透明與鏡面物體去背失敗

玻璃、透明塑膠、手機螢幕。`area` 不穩定時退回置中固定準星 —— 與 Gemini 壞框共用同一條退路。

### 6. 紙張後勤

60 秒 × 8 小時 ≈ 每天 480 張。一卷 58mm 約 250 張短收據。
每天至少兩卷加備品。熱感應頭連續工作會過熱降速 —— 編列冷卻或第二台。

### 7. 離線 = 展品死亡

快取約 20 份預寫證書，對應通用分類。8 秒硬性逾時。

---

## 1.7 時程（7 天）

高風險、長前置的項目排在最前面。原始企劃把硬體放在第 5~6 天，那是反的。

| 天 | 工作 | 完成標準 |
|---|---|---|
| **1** | 印表機：確認列舉方式，跑通一張收據（日文則走點陣圖）。Node 服務骨架。 | 手動觸發能印出一張 |
| **2** | 相機 → 色鍵去背 → `track()` → 質心 / bbox / 角度以純文字上畫面。**不做視覺。** | 數字跟著物體轉動變化 |
| **3** | Marching Squares → path。clip-path 變身 + 發光外框。轉盤裝好並定速。 | 輪廓跟著實體轉 |
| **4** | Gemini 接上（兩格 0°/180°）。七節拍狀態機。退化保護。 | 端到端跑一次 |
| **5** | HUD 看板、GSAP、主題查表、音效。**這是安全區，可吸收落後。** | 好看 |
| **6** | 實體箱體、打光、對焦 / 白平衡鎖定、輪廓線稿出單、紙張後勤。 | 實體完成 |
| **7** | 閒置迴圈、失效模式、**連續 50 次無人介入運轉測試**。 | 沒人顧也能活 |

第 7 天不是「最佳化」，是那個 50 次測試。
一個每四位觀眾就要有人來救的展品，即使功能全都會動，它依然是失敗的。

---

# Part 2 — 實作

## 2.1 技術選型

| 用途 | 選擇 | 為什麼不選另一個 |
|---|---|---|
| 追蹤 | 自寫色鍵 + 影像矩（~40 行） | TF.js / MediaPipe：8MB 模型，只認 80 類，框會抖 |
| 變身 | `clip-path: path()` + CSS filter / blend | per-pixel JS 在 720p 只有 ~50fps；CSS 全 GPU |
| 外框 | SVG `<path>` + `feGaussianBlur` | — |
| 動畫 | GSAP | — |
| 3D | **不用 Three.js** | 所有元素都是螢幕空間 2D。唯一例外見下 |
| 樣式 | Tailwind（CDN） | — |
| 後端 | 單一 Node 行程 :7127 | 同時解決金鑰外洩與印表機兩件事 |

> **關於 Three.js**：唯一誠實的加入理由是**泛光（bloom）** —— `UnrealBloomPass`
> 在高熱度霓虹光暈上確實贏過 `feGaussianBlur`。那是第 5 天疊在能跑的 2D 系統之上的
> 附加層，不是地基。SVG 光暈投在展場投影機上看起來太平時再說。

## 2.2 追蹤核心

```js
// track.js —— 色鍵去背 → 質心 / bbox / 主軸角。160x120，每格約 0.5ms。
const W = 160, H = 120;
const c = new OffscreenCanvas(W, H), x = c.getContext('2d', { willReadFrequently: true });

function track(video, keyHue = 120, tol = 40) {          // 台座色相：綠色約 120°
  x.drawImage(video, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const mask = new Uint8Array(W * H);
  let m00 = 0, m10 = 0, m01 = 0, m20 = 0, m02 = 0, m11 = 0;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;

  for (let i = 0, p = 0; p < d.length; p += 4, i++) {
    if (hueDist(d[p], d[p+1], d[p+2], keyHue) < tol) continue;   // 是台座 → 背景
    const px = i % W, py = (i / W) | 0;
    mask[i] = 1;
    m00++; m10 += px; m01 += py; m20 += px*px; m02 += py*py; m11 += px*py;
    if (px < x0) x0 = px; if (px > x1) x1 = px;
    if (py < y0) y0 = py; if (py > y1) y1 = py;
  }
  if (m00 < 50) return null;                                     // 台座上沒東西

  const cx = m10/m00, cy = m01/m00;
  const a = m20/m00 - cx*cx, b = m11/m00 - cx*cy, cc = m02/m00 - cy*cy;
  return {
    cx: cx/W, cy: cy/H,                       // 正規化，與 Gemini 回傳同一座標空間
    bbox: [x0/W, y0/H, x1/W, y1/H],
    angle: 0.5 * Math.atan2(2*b, a - cc),     // 主軸角 —— 這就是「旋轉」
    area: m00 / (W*H),
    mask,
  };
}
```

**平滑不要做過頭。** USB 攝影機本身已有 60~120ms 端到端延遲。
只用輕度 EMA（α ≈ 0.5）。**延遲讀起來像「壞掉」，輕微抖動讀起來像「正在掃描」。**
寧可偏向抖動。

## 2.3 變身：一條路徑，兩個用途

```js
const path = contourToPath(t.mask, W, H);      // Marching Squares → "M12,4 L18,9 ..."

holo.style.clipPath = `path('${path}')`;       // 只有物體本體被未來化
outline.setAttribute('d', path);               // 同一條線 → 發光外框
```

```css
/* #holo 是疊在 <video> 上的同一路影像，被 clip-path 裁成物體形狀 */
#holo        { filter: grayscale(1) contrast(2.2) brightness(.75); mix-blend-mode: screen; }
#holo::after { background: linear-gradient(160deg, var(--theme-a), var(--theme-b));
               mix-blend-mode: color; }
#scanlines   { background: repeating-linear-gradient(0deg, #0000 0 2px, var(--theme-a) 2px 4px);
               opacity: .18; mix-blend-mode: overlay; }
```

`#holo` 的 `opacity` 由 0 → 1 補間，就是**實體 → 全息的 materialize 瞬間**。一行 GSAP。

### 從同一條輪廓再長出來的（全部免費）

- **外擴光場** —— 同一路徑畫三次，`stroke-width` 遞增、`opacity` 遞減
- **節點標記** —— 輪廓上等距取 12 點，各掛小括號 / 十字 / 編號，物體看起來「被儀器化」
- **體積投影** —— 輪廓複製數份，逐份上移數像素、透明度遞減 → 假立體光柱
- **能量通量** —— `d(area)/dt`。轉到側面時面積驟縮，數字跟著跳

因為輪廓每格重算，這些全部**跟著實體一起轉**。

## 2.4 API 契約

```jsonc
// POST /api/scan   body: { frames: [<b64 @0°>, <b64 @180°>] }
// 最長邊 1024px，JPEG q0.8。不要送 1080p。
{
  "itemName":          "黃銅家門鑰匙",
  "futureName":        "量子密鑰譯碼器",
  "classification":    "CLASS-IV ANCIENT HARDWARE",
  "powerLevel":        4127,                    // 1–9999
  "archaeologistNotes":"推測為古代人用於馴服門扉之儀式性金屬符信。",  // ≤25 字
  "visualTheme":       "ARCHIVE"                // enum，見 §1.3
}
```

**注意**：`boundingBox` 已從契約中移除 —— 幾何層每格自己算，比 Gemini 準且免費。

## 2.5 出單

**不要印照片。** 58mm 只有 384px 寬，抖色後的照片是一坨泥。

**印那條輪廓路徑。** 線稿在熱感應上銳利漂亮，而且它是這位觀眾的物體的真實剪影 ——
獨一無二，帶得走。canvas 畫 path → 1-bit → `GS v 0`。
跟日文點陣圖是同一條程式路徑，所以是免費的。

## 2.6 執行

```bash
npm i
cp .env.example .env      # 填 GEMINI_API_KEY
npm run dev               # Node :7127（Gemini 代理 + 印表機）+ 前端

npm run calibrate         # 校正：抓空台座色相、鎖曝光/白平衡、定質心錨點
npm run soak              # 第 7 天：連續 50 次循環，用假資料，不出紙
```

---

## 已知取捨

| 取捨 | 天花板 | 何時升級 |
|---|---|---|
| 色鍵去背而非 ML 分割 | 透明 / 鏡面物體失敗 | 失敗率 >10% 時換 MediaPipe Selfie-Seg |
| 逐格 CSS clip-path | 極複雜輪廓時路徑字串偏大 | 超過 ~500 點就先做 Douglas–Peucker 簡化 |
| 無 WebGL | 光暈偏平 | 展場投影機看起來不夠亮時加 UnrealBloomPass |
| Gemini 單次呼叫 | 物體換了不會重新辨識 | 面積變化 >40% 時重掃 |
