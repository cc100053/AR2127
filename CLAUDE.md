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
python3 -m http.server 8127        # 一定要 HTTP，file:// 會令 canvas 跨來源污染
open http://localhost:8127         # demo.mp4 綠幕籃球
open http://localhost:8127/?test=1 # 67 項自我檢查
```

`?cam=1` 真攝影機 ｜ `?synth=1` 合成物件 ｜ `?src=xx.mp4` ｜ 影片可直接拖入頁面

## 改完之後

`?test=1` 必須全綠。改咗幾何、模組或形態推演就要補檢查落 `selfTest()`。

## 檔案

| 檔 | 係乜 |
|---|---|
| `index.html` | 成個前端，單檔，~1540 行 |
| `README.md` | 規劃 + 架構 + 風險 + 時程（權威文件） |
| `memory-bank/` | 交接用：主旨、架構圖、進度、決策、陷阱 |
| `demo.mp4` | 綠幕旋轉籃球，測試素材（H.264） |
