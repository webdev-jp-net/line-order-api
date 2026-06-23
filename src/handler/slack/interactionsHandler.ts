import type { Context } from "hono";
import type { Env, OrderStatus } from "../../types";
import { updateOrderMessage, verifySlackSignature } from "@util/slackApi";
import { applyOrderStatus } from "@util/orderStatus";

type SlackActionValue = {
	userId: string;
	orderId: string;
	status: OrderStatus;
};

// ボタンで遷移しうる状態（open は初期状態なので対象外）
const VALID_STATUS: OrderStatus[] = ["done", "closed"];

const isValidActionValue = (v: unknown): v is SlackActionValue => {
	const a = v as Partial<SlackActionValue> | null;
	return (
		typeof a?.userId === "string" &&
		a.userId.length > 0 &&
		typeof a?.orderId === "string" &&
		a.orderId.length > 0 &&
		typeof a?.status === "string" &&
		(VALID_STATUS as string[]).includes(a.status)
	);
};

/**
 * POST /slack/interactions
 * Slack のボタン操作を受け、署名検証のうえ注文状態を更新する。
 * ペイロードは application/x-www-form-urlencoded の `payload` に JSON で入る。
 */
export const interactionsHandler = async (c: Context<Env>) => {
	const rawBody = await c.req.text();

	const valid = await verifySlackSignature({
		signingSecret: c.env.SLACK_SIGNING_SECRET,
		signature: c.req.header("X-Slack-Signature") ?? "",
		timestamp: c.req.header("X-Slack-Request-Timestamp") ?? "",
		rawBody,
		now: Math.floor(Date.now() / 1000),
	});

	if (!valid) {
		return c.text("invalid signature", 401);
	}

	const params = new URLSearchParams(rawBody);
	const payloadRaw = params.get("payload");
	if (!payloadRaw) {
		return c.text("no payload", 400);
	}

	let value: SlackActionValue;
	let responseUrl: string | undefined;
	try {
		const payload = JSON.parse(payloadRaw) as {
			actions?: { value?: string }[];
			response_url?: string;
		};
		const actionValue = payload.actions?.[0]?.value;
		if (!actionValue) return c.text("no action", 400);
		const parsed = JSON.parse(actionValue);
		if (!isValidActionValue(parsed)) return c.text("invalid action value", 400);
		value = parsed;
		responseUrl = payload.response_url;
	} catch {
		return c.text("invalid payload", 400);
	}

	// 状態更新・LINE送信・メッセージ差し替えは時間がかかるため、
	// Slack には即 200 を返し、重い処理は waitUntil で実行する（3秒制限対策）。
	c.executionCtx.waitUntil(
		(async () => {
			try {
				const updated = await applyOrderStatus(
					{
						kv: c.env.KV,
						channelId: c.env.LINE_CHANNEL_ID,
						channelSecret: c.env.LINE_CHANNEL_SECRET,
						frontendUrl: c.env.FRONTEND_URL,
						templates: {
							done: c.env.LINE_TEMPLATE_DONE,
						},
					},
					{
						userId: value.userId,
						orderId: value.orderId,
						status: value.status,
						now: new Date().toISOString(),
					},
				);

				if (!updated) {
					console.error("slack-interactions: order not found", value.orderId);
					return;
				}

				// 元メッセージを最新状態で差し替える（replace_original）
				if (responseUrl) {
					await updateOrderMessage({ responseUrl, order: updated });
				}
			} catch (err) {
				console.error("slack-interactions error:", err);
			}
		})(),
	);

	return c.text("ok");
};
