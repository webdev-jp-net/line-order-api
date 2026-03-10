import type { Context } from "hono";
import type { Env } from "../types";
import { verifyIdToken } from "@util/lineApi";
import { signToken } from "@util/jwt";
import { upsertUser } from "@util/userStore";

/**
 * GET /user-token
 * line-id-token ヘッダーから LINE ID Token を受取り、
 * LINE API で検証後 JWT (userToken) を発行して返す
 */
export const userTokenHandler = async (c: Context<Env>) => {
	const idToken = c.req.header("line-id-token");

	if (!idToken) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	try {
		const payload = await verifyIdToken({
			idToken,
			channelId: c.env.LINE_CHANNEL_ID,
		});

		const lineUserId = payload.sub;

		await upsertUser(c.env.KV, lineUserId);

		const userToken = await signToken(lineUserId, c.env.SESSION_SECRET);

		return c.json({ userToken, lineUserId });
	} catch (err) {
		console.error("user-token error:", err);
		return c.json({ message: "Unauthorized" }, 401);
	}
};
