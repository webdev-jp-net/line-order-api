// Cloudflare Workers Bindings
export type Bindings = {
	KV: KVNamespace;
	LINE_CHANNEL_ID: string;
	LINE_CHANNEL_ACCESS_TOKEN: string;
	SESSION_SECRET: string;
	FRONTEND_URL: string;
	SLACK_BOT_TOKEN: string;
	SLACK_SIGNING_SECRET: string;
	SLACK_CHANNEL_ID: string;
	// サービスメッセージの「API用テンプレート名」（コンソール登録値、`{name}_{BCP47}`）
	LINE_TEMPLATE_PROGRESS: string;
	LINE_TEMPLATE_DONE: string;
};

// Hono の Env 型（全ルート共通）
export type Env = {
	Bindings: Bindings;
	Variables: {
		lineUserId: string;
		name: string;
	};
};

// LINE API Types

/** POST /oauth2/v2.1/verify (IDトークン検証) レスポンス */
export type LineIdTokenPayload = {
	iss: string;
	sub: string;
	aud: string;
	exp: number;
	iat: number;
	nonce?: string;
	amr?: string[];
	name?: string;
	picture?: string;
	email?: string;
};

// 注文ドメイン

export type OrderStatus = "open" | "progress" | "done" | "closed";

export type OrderItem = {
	productId: string;
	// メニュー名。microCMS は FE がビルド時に取得するため、FE が注文時に渡す。
	name: string;
	qty: number;
};

// KV に保存する注文（Key: order:{userId}:{orderId}）
export type Order = {
	orderId: string;
	userId: string;
	name: string;
	orderList: OrderItem[];
	status: OrderStatus;
	serviceNotificationToken: string;
	createdAt: string;
	updatedAt: string;
};

// エラーレスポンス（OpenAPI 仕様準拠）

export type ErrorResponse = {
	message: string;
	errorParams?: string[];
};
