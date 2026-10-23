# Visible 先行登録ページ

https://visible-app.github.io/visible-lp/

1ページだけの静的なサイトです（GitHub Pages）。

## よく変えるところ

- **リリース後に App Store のボタンにする**：`main.js` の先頭にある `release.appStoreUrl` に App Store のリンクを入れる。ページ内の「11月11日、iPhoneでリリース」が、すべて App Store のボタンに変わります。
- **30秒の動画を差し替える**：`assets/visible-30s.mp4`（と、読み込み中に出す最初の1コマ `assets/visible-30s-poster.jpg`）を同じ名前で置き換える。
- **①②③のコマ送り**：`assets/flow/00.jpg …`。枚数を変えたら `main.js` の `flow.frames` も直す。
- **リンクのカードの画像**：`assets/og.jpg`（1200×630）。

素材（動画・コマ送り・カードの画像）は、アプリ側の宣伝動画のしくみ（非公開）から書き出しています。
