# Visible のページ

https://visible-app.github.io/visible-lp/

1ページだけの静的なサイトです（GitHub Pages）。

## よく変えるところ

- **App Store のリンク**：`main.js` の先頭にある `release.appStoreUrl`。ヘッダーの「App Storeで配信中」と、動画の下の「App Storeで入手する」（`data-store`）が、このリンクに飛びます。空にすると、ヘッダーは文字だけ、ボタンはメール登録の欄（#signup）に飛びます。
- **期間限定の案内（年額プランの初年度2,200円など）**：`index.html` の動画の下のリスト（`hero-notes`）。期限のある行には `data-until="2026-11-24"` のように日付を付けると、その日の日本時間23:59:59を過ぎたら自動で隠れます。新しい案内に替えるときは、文と日付の両方を直す。
- **メールでのお知らせの欄**：見出し・ボタン・注意書きは `index.html` の `#signup`。登録後に出る文は `main.js` の `thanks`。登録先は Kit のフォーム（10083551）です。
- **ページのタイトルと説明（リンクのカードの文も）**：`index.html` の `<title>`、`description`、`og:title`・`og:description`、`twitter:title`・`twitter:description`。6つとも同じ文にそろえる。
- **30秒の動画を差し替える**：`assets/visible-30s.mp4`（と、読み込み中に出す最初の1コマ `assets/visible-30s-poster.jpg`）を同じ名前で置き換える。
- **①②③のコマ送り**：`assets/flow/00.jpg …`。枚数を変えたら `main.js` の `flow.frames` も直す。
- **リンクのカードの画像**：`assets/og.jpg`（1200×630）。

素材（動画・コマ送り・カードの画像）は、アプリ側の宣伝動画のしくみ（非公開）から書き出しています。
