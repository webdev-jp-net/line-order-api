import type { SessionData } from "../types";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7日間

/**
 * セッションを作成し、KV に保存
 * Key: session:<sessionId>
 * TTL 付きで自動期限切れ
 */
export const createSession = async (
	kv: KVNamespace,
	lineUserId: string,
): Promise<string> => {
	const sessionId = crypto.randomUUID();
	const now = new Date();

	const sessionData: SessionData = {
		lineUserId,
		createdAt: now.toISOString(),
		expiresAt: new Date(
			now.getTime() + SESSION_TTL_SECONDS * 1000,
		).toISOString(),
	};

	await kv.put(`session:${sessionId}`, JSON.stringify(sessionData), {
		expirationTtl: SESSION_TTL_SECONDS,
	});

	return sessionId;
};

/**
 * セッションIDからセッションデータを取得
 * KV の TTL で期限切れは自動管理される
 */
export const getSession = async (
	kv: KVNamespace,
	sessionId: string,
): Promise<SessionData | null> => {
	const raw = await kv.get(`session:${sessionId}`);
	if (!raw) return null;

	return JSON.parse(raw) as SessionData;
};

/**
 * セッション削除（ログアウト用）
 */
export const deleteSession = async (
	kv: KVNamespace,
	sessionId: string,
): Promise<void> => {
	await kv.delete(`session:${sessionId}`);
};
