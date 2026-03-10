// Cloudflare Workers Bindings
export type Bindings = {
	KV: KVNamespace;
	LINE_CHANNEL_ID: string;
	LINE_CHANNEL_SECRET: string;
	LINE_CALLBACK_URL: string;
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

/** POST /oauth2/v2.1/token レスポンス */
export type LineTokenResponse = {
	access_token: string;
	expires_in: number;
	id_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
};

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

// KV に保存するユーザーデータ

export type UserData = {
	lineUserId: string;
	createdAt: string;
	updatedAt: string;
};

// Session: KV に保存するセッション

export type SessionData = {
	lineUserId: string;
	createdAt: string;
	expiresAt: string;
};
