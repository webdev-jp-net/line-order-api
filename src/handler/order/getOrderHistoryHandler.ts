import type { Context } from "hono";
import type { Env } from "../../types";
import { listOrdersByUser } from "@util/orderStore";

/**
 * GET /orders/history
 * ログイン中ユーザーの注文履歴を返す。
 */
export const getOrderHistoryHandler = async (c: Context<Env>) => {
	const userId = c.get("lineUserId");
	const orders = await listOrdersByUser(c.env.KV, userId);

	return c.json({
		orderList: orders.map((o) => ({
			orderId: o.orderId,
			status: o.status,
			orderList: o.orderList,
			createdAt: o.createdAt,
		})),
	});
};
