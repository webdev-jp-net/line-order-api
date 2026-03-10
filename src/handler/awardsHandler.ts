import type { Context } from "hono";
import type { Env } from "../types";

/**
 * GET /awards
 * プレゼント受け取り状況取得（スタブ: 常に空配列を返す）
 */
export const getAwardsHandler = async (c: Context<Env>) => {
	return c.json({ awardList: [] });
};
