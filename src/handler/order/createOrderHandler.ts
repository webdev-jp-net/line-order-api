import type { Context } from "hono";
import type { Env, OrderItem } from "../../types";
import {
	issueChannelAccessToken,
	issueNotifierToken,
	sendServiceMessage,
} from "@util/lineApi";
import { createOrder, formatOrderDetail, saveOrder } from "@util/orderStore";
import { postOrderNotification } from "@util/slackApi";

type CreateOrderBody = {
	orderList?: OrderItem[];
	liffAccessToken?: string;
};

const isValidOrderList = (list: unknown): list is OrderItem[] =>
	Array.isArray(list) &&
	list.length > 0 &&
	list.every(
		(i) =>
			typeof i?.productId === "string" &&
			i.productId.length > 0 &&
			typeof i?.name === "string" &&
			i.name.length > 0 &&
			Number.isInteger(i?.qty) &&
			i.qty > 0,
	);

/**
 * POST /orders
 * 注文を作成し、サービス通知トークン発行・KV保存・Slack通知を行う。
 */
export const createOrderHandler = async (c: Context<Env>) => {
	const userId = c.get("lineUserId");
	const name = c.get("name");

	let body: CreateOrderBody;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ message: "Bad Request", errorParams: ["body"] }, 400);
	}

	const errorParams: string[] = [];
	if (!isValidOrderList(body.orderList)) errorParams.push("orderList");
	if (!body.liffAccessToken) errorParams.push("liffAccessToken");
	if (errorParams.length > 0) {
		return c.json({ message: "Bad Request", errorParams }, 400);
	}

	try {
		const channelAccessToken = await issueChannelAccessToken({
			channelId: c.env.LINE_CHANNEL_ID,
			channelSecret: c.env.LINE_CHANNEL_SECRET,
		});

		const serviceNotificationToken = await issueNotifierToken({
			liffAccessToken: body.liffAccessToken as string,
			channelAccessToken,
		});

		const order = await createOrder(c.env.KV, {
			userId,
			name,
			orderList: body.orderList as OrderItem[],
			serviceNotificationToken,
			now: new Date().toISOString(),
		});

		// 注文受付をユーザーへ通知（自動）。
		// 送信でトークンが更新されるため、次の送信（準備完了）に備えて保存する。
		const nextToken = await sendServiceMessage({
			notificationToken: serviceNotificationToken,
			templateName: c.env.LINE_TEMPLATE_OPEN,
			params: {
				number: order.orderId,
				btn1_url: c.env.FRONTEND_URL,
				order_detail: formatOrderDetail(order),
				how_to_receive: "受け取りカウンターへお越しください。",
			},
			channelAccessToken,
		});
		order.serviceNotificationToken = nextToken;
		await saveOrder(c.env.KV, order);

		await postOrderNotification({
			botToken: c.env.SLACK_BOT_TOKEN,
			channel: c.env.SLACK_CHANNEL_ID,
			order,
		});

		return c.json({ orderId: order.orderId, status: order.status });
	} catch (err) {
		console.error("create-order error:", err);
		return c.json({ message: "Internal Server Error" }, 500);
	}
};
