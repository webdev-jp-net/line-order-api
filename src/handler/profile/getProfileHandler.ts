import type { Context } from "hono";
import type { Env } from "../../types";
import { getUser } from "@util/userStore";

/**
 * GET /profile
 * ユーザープロフィール取得。未登録なら 404。
 */
export const getProfileHandler = async (c: Context<Env>) => {
	const lineUserId = c.get("lineUserId");
	const user = await getUser(c.env.KV, lineUserId);

	if (!user || user.gender === undefined) {
		return c.json({}, 404);
	}

	return c.json({
		lineUserId: user.lineUserId,
		gender: user.gender,
		ageGroup: user.ageGroup,
		residence: user.residence,
	});
};
