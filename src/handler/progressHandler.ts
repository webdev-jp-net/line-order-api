import type { Context } from "hono";
import type { Env } from "../types";

/**
 * GET /progress
 * ゲーム進捗取得（スタブ: 常に初期状態を返す）
 */
export const getProgressHandler = async (c: Context<Env>) => {
	return c.json({
		isOnboardingCompleted: false,
		completedMissionList: [],
	});
};
