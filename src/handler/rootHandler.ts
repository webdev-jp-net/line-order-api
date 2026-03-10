import type { Context } from "hono";

export const rootHandler = (c: Context) => {
	const html = `
	<!DOCTYPE html>
	<html lang="ja">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>LINE Auth API</title>
		<style>
			body {
				font-family: 'Helvetica Neue', Arial, sans-serif;
				max-width: 800px;
				margin: 0 auto;
				padding: 20px;
				line-height: 1.6;
			}
			h1 {
				color: #00B900;
				border-bottom: 2px solid #00B900;
				padding-bottom: 10px;
			}
			h2 {
				color: #333;
				margin-top: 30px;
			}
			code {
				background-color: #f5f5f5;
				padding: 2px 5px;
				border-radius: 3px;
				font-family: monospace;
			}
			.endpoint {
				background-color: #f9f9f9;
				padding: 15px;
				border-left: 4px solid #00B900;
				margin: 10px 0;
			}
			.method {
				display: inline-block;
				padding: 2px 8px;
				border-radius: 3px;
				color: #fff;
				font-size: 0.85em;
				font-weight: bold;
				margin-right: 8px;
			}
			.get { background-color: #61affe; }
			.post { background-color: #49cc90; }
		</style>
	</head>
	<body>
		<h1>LINE Auth API</h1>
		<p>LINE Login + Cloudflare Workers + KV を使用した認証APIです。</p>

		<h2>認証エンドポイント</h2>
		<div class="endpoint">
			<p><span class="method get">GET</span><code>/auth/callback</code></p>
			<p>LINE OAuth コールバック。認可コードからトークン発行・検証・セッション作成を行います。</p>
		</div>
		<div class="endpoint">
			<p><span class="method post">POST</span><code>/auth/logout</code></p>
			<p>セッション削除・Cookie クリアを行います。</p>
		</div>

		<h2>API エンドポイント（要認証）</h2>
		<div class="endpoint">
			<p><span class="method get">GET</span><code>/api/me</code></p>
			<p>ログインユーザーの情報を取得します。</p>
		</div>

		<h2>ステータス</h2>
		<p>サーバーステータス: <strong style="color: #00B900;">稼働中</strong></p>
	</body>
	</html>
	`;

	return c.html(html);
};
