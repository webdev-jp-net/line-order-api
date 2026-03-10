// Cloudflare Workers Bindings
export type Bindings = {
	KV: KVNamespace;
	LINE_CHANNEL_ID: string;
	LINE_CHANNEL_SECRET: string;
	FRONTEND_URL: string;
	SESSION_SECRET: string;
};

// Hono の Env 型（全ルート共通）
export type Env = {
	Bindings: Bindings;
	Variables: {
		lineUserId: string;
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

// KV に保存するユーザープロフィール

export type UserProfile = {
	lineUserId: string;
	gender?: number;
	ageGroup?: number;
	residence?: string;
};

// エラーレスポンス（OpenAPI 仕様準拠）

export type ErrorResponse = {
	message: string;
	errorParams?: string[];
};
