import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import type { Env } from "../../types";
import { issueToken, verifyIdToken } from "@util/lineApi";
import { createSession } from "@util/session";
import { upsertUser } from "@util/userStore";

/**
 * GET /auth/callback?code=xxx&state=xxx
 *
 * フロー:
 *   1. code を受け取る
 *   2. LINE にトークン発行リクエスト (code → access_token + id_token)
 *   3. id_token を LINE に検証リクエスト → LINE User ID 取得
 *   4. KV にユーザー upsert
 *   5. セッション作成 → Cookie にセット
 *   6. FE にリダイレクト
 */
export const callbackHandler = async (c: Context<Env>) => {
	const code = c.req.query("code");
	const error = c.req.query("error");

	if (error) {
		return c.redirect(`${c.env.FRONTEND_URL}?error=${error}`);
	}

	if (!code) {
		return c.json({ error: "Missing authorization code" }, 400);
	}

	try {
		const tokenRes = await issueToken({
			code,
			channelId: c.env.LINE_CHANNEL_ID,
			channelSecret: c.env.LINE_CHANNEL_SECRET,
			redirectUri: c.env.LINE_CALLBACK_URL,
		});

		const idTokenPayload = await verifyIdToken({
			idToken: tokenRes.id_token,
			channelId: c.env.LINE_CHANNEL_ID,
		});

		const lineUserId = idTokenPayload.sub;

		await upsertUser(c.env.KV, lineUserId);

		const sessionId = await createSession(c.env.KV, lineUserId);

		setCookie(c, "session_id", sessionId, {
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});

		return c.redirect(c.env.FRONTEND_URL);
	} catch (err) {
		console.error("Auth callback error:", err);
		return c.json({ error: "Authentication failed" }, 500);
	}
};
