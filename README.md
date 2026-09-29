# どこに立つ？ — 小便器選択ゲーム

Vite + TypeScript。フレームワークなし。30問の手作り配置から小便器を選び、実際の投票が30票以上ある問題のみ多数派を判定します。最多票が複数ならすべて「同率最多」。マナーの客観的な正誤を判定するゲームではありません。

## ローカルで起動

Node.js 22.12以降（推奨22 LTS）をインストールして実行します。WindowsでPowerShellの実行ポリシーに阻まれる場合は `npm` を `npm.cmd` に置き換えてください。

```sh
npm ci
npm run dev
```

PCで http://localhost:5173 を開きます。同じWi-Fiのスマホでは開発サーバーが表示するNetwork URLを開きます（必要ならPC側ファイアウォールで許可）。設定なしでも全30問を遊べます。初回回答をlocalStorageに保存し、再プレイで票を増やしません。今回の選択は初回投票と分けて扱い、図・コメント・多数派判定・最終結果には今回選んだ便器を反映します。保存できないブラウザではページ内メモリに切り替え、その旨を表示します。ローカル回答は全員の集計には含めず、架空の票や割合も表示しません。

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

## 構成と問題の追加

- `src/questions.ts`: 固有ID・状況文・便器・入口・手すり・仕切り・水濡れ・コメント。
- `src/room.ts`: 俯瞰図とタップ対象の表示。
- `src/votes.ts`: 保存処理。Supabase未設定時は端末内保存。
- `src/results.ts`: 集計判定。`MIN_VOTES = 30` が判定開始票数。
- `src/main.ts`: タイトル → 問題 → 結果 → 最終結果、共有。

`questions` にQuestionを追加します。図は幅360・高さ270を基準に、xには描画時に130を加えます。上段の便器はy=20、下段はy=220/facing='up'。状態はfree/occupied/broken。便器の `handrail: true` が手すり付きです（`make` のオプションでは `handrails: ['A']` のように指定）。手すりだけでは選択を禁止しません。入口はleft/right/bottom。座標を使って水濡れと仕切りを置けます。選択可能な台を2台以上用意してください。

**公開後の配置や選択肢の変更には新しい問題IDを使ってください。** 既存票と別の状況を混ぜないためです。問題を追加後、`npm run seed:sql` でSQLを生成し、オンライン環境ではそのSQLを実行してください。seedは既存IDを変更せず新規問題だけ追加します。画面と共有文の問題数はデータから自動反映します。index.htmlの紹介文は必要に応じて更新してください。

## Supabase（アカウント側の操作は所有者が実行）

1. Supabaseプロジェクトを作成。SQL Editorで `supabase/schema.sql` を一度実行し、次に `supabase/seed.sql` を実行します。サンプル票は投入しません。
2. Authentication設定の **Allow anonymous sign-ins** を有効にします。
3. `.env.example` を `.env` にコピーし、プロジェクトURLと **publishable key**（または旧anon key）を入力します。開発サーバーを再起動します。
4. 異なるブラウザで回答し、SQL Editorで `select question_id, count(*) from public.votes group by question_id;` を実行すれば実票を確認できます。

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`VITE_` の値はビルドに埋め込まれ閲覧者に公開されます。**service_roleキー、secret key、DBパスワードをここやGitに入れないでください。** 本実装に秘密キーは不要です。`.env` はGit対象外です。

RLSを有効にしてテーブルの直接操作を拒否し、匿名認証済みユーザーのみRPCを実行できます。RPCは問題ID・選択可能な台を検証し、DBの複合主キー(question_id,user_id)で1問1票を保証します。変更・削除APIは提供せず、再送では初回回答を返します。集計APIは自分の投票後のみ利用でき、他人のユーザーIDや投票行を返しません。ネットワーク障害時は未確認/集計取得失敗を区別し再試行できます。ローカル票を後から自動送信する機能はありません。

匿名認証は同一人物の完全な識別ではありません。別端末、ブラウザデータ削除、新しい匿名アカウントによる再投票は防げません。公開規模に応じてSupabase側のレート制限を調整してください。CAPTCHAを有効化する場合は、別途画面へのCAPTCHA組み込みと `signInAnonymously` のcaptchaToken対応が必要です。現状その連携は含みません。匿名ユーザーの整理・保持期間も所有者側で運用してください。

## GitHub Pages（所有者が実行）

1. 変更をコミットし、GitHubの `main` にpushします。
2. GitHubの Settings → Pages → Source を **GitHub Actions** にします。
3. オンライン投票を使う場合は Settings → Secrets and variables → Actions → **Variables** に `VITE_SUPABASE_URL` と `VITE_SUPABASE_PUBLISHABLE_KEY` を追加します。未設定ならローカルモードで公開されます。
4. Actionsの Deploy to GitHub Pages を実行（mainへのpushでも起動）。成功後、PagesのURLを開きます。このリポジトリなら通常 `https://arimanjirooo.github.io/toilet-game/` です。

GitHub Actions内では `GITHUB_REPOSITORY` からリポジトリ名を取り、Vite baseを `/toilet-game/` のように自動設定します。ユーザーサイト（*.github.io）なら `/`。独自ドメインを利用する場合はActions変数 `VITE_BASE_PATH=/` を設定し、Pagesのドメイン設定も行ってください。設定変更後は再ビルドが必要です。ローカルでサブパスを確認する場合は、環境変数 `VITE_BASE_PATH=/toilet-game/` を設定してbuild/previewします。

## 検証範囲と制約

`npm test` は閾値・同票・多数派/少数派・配置データの整合性を検証します。実環境のSupabase資格情報は同梱しないため、実DBへの接続、RLS/RPC、複数ユーザーによる投票は設定後に確認してください。集計は回答時点のスナップショットで、自動更新はありません。共有はWeb Share API、未対応ならリンクコピーを使用します。フォントの取得に失敗してもシステムフォントで遊べます。

公式資料: [Vite / GitHub Pages](https://vite.dev/guide/static-deploy)、[Supabase匿名認証](https://supabase.com/docs/guides/auth/auth-anonymous)、[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)。

### ブラウザ自動確認

```sh
npx playwright install chromium
npm run test:e2e
```

PC幅1440pxとスマホ幅390pxで全問の遷移・選択不可の台・架空集計がないこと・初回投票の保持と再プレイ時の新しい選択の反映・横スクロールがないことを確認し、`test-results/` にスクリーンショットを保存します。

## 問題セット第2版

手すりの有無を追加し、急いでいる設定を削除しました。最初の2問では同じ配置で手すりだけを変え、その後は入口、先客、仕切り、水濡れ、故障と組み合わせます。全問を新しい v2- IDに切り替えています。既にSupabaseを設定済みなら、更新した supabase/seed.sql だけを追加実行してください。旧問題と旧投票は保持され、新しい問題の集計には入りません。

各問題への回答直後に「この問題の投票結果」を表示します。実票を取得できた場合は合計・各選択肢の票数と割合を表示し、30票未満でも票数は見られます（多数派判定のみ保留）。未接続・通信失敗時は「票数未取得」と「—」を表示し、0票とは扱いません。最終画面は選択と多数派一致の振り返りです。

## 30問版の追加問題

既存10問に20問を追加。3〜10台、先客0〜8人の手作り配置を用意しています。1列は最大5台とし、多台数は向かい合う2列で表示します。`paired` のパターンは `.` が空き、`o` が使用中、`x` が故障中です。下段の人物は便器の上側（通路側）に表示します。

追加問題は `v3-` の新規IDです。Supabase利用中の場合は更新した `supabase/seed.sql` を実行してください。既存問題の投票は引き続き保持されます。

## 洗面台

30問のうち6問に洗面台を配置。位置の左右、1〜2台、空き／手洗い中を組み合わせています。`sinks` に `{ id: 'S1', x: -30, y: 216, occupied: true }` のように定義します。座標の基準は小便器と同じで、現在の洗面台は下側の壁に向けた表示です。洗面台は選択対象に含めず、手洗い中の人も小便器の使用者と区別して表示します。

配置が変わった6問は `v4-` IDに更新しました。Supabase利用中は更新した `supabase/seed.sql` を追加実行してください。旧問題の票を新しい配置に流用しません。
