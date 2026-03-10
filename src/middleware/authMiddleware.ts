import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import type { Env } from "../types";
import { getSession } from "@util/session";

/**
 * 認証ミドルウェア
 * Cookie からセッションIDを取得し、KV で検証
 * 成功時は c.set("lineUserId", ...) でユーザーIDをセット
 */
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	const sessionId = getCookie(c, "session_id");

	if (!sessionId) {
		return c.json({ error: "Unauthorized: no session" }, 401);
	}

	const session = await getSession(c.env.KV, sessionId);

	if (!session) {
		return c.json({ error: "Unauthorized: invalid or expired session" }, 401);
	}

	c.set("lineUserId", session.lineUserId);
	await next();
});
