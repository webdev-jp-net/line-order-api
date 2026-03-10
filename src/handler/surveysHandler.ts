import type { Context } from "hono";
import type { Env } from "../types";

/**
 * GET /surveys
 * アンケート回答状況取得（スタブ: 常に空配列を返す）
 */
export const getSurveysHandler = async (c: Context<Env>) => {
	return c.json({ surveyList: [] });
};
