import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { Env } from "../../types";
import { deleteSession } from "@util/session";

/**
 * POST /auth/logout
 * セッション削除 + Cookie クリア
 */
export const logoutHandler = async (c: Context<Env>) => {
	const sessionId = getCookie(c, "session_id");
	if (sessionId) {
		await deleteSession(c.env.KV, sessionId);
	}

	setCookie(c, "session_id", "", {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		path: "/",
		maxAge: 0,
	});

	return c.json({ ok: true });
};
