import type { Context } from "hono";
import type { Env } from "../../types";
import { getUser } from "@util/userStore";

/**
 * GET /api/me
 * ユーザー情報 + 全進捗取得
 */
export const meHandler = async (c: Context<Env>) => {
	const lineUserId = c.get("lineUserId");
	const user = await getUser(c.env.KV, lineUserId);

	if (!user) {
		return c.json({ error: "User not found" }, 404);
	}

	return c.json(user);
};
