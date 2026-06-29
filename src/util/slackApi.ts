import type { Order, OrderStatus } from "../types";

const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

const SIGNATURE_TOLERANCE_SECONDS = 60 * 5; // 5分

/**
 * Slack リクエストの署名検証
 * v0:{timestamp}:{rawBody} を SLACK_SIGNING_SECRET で HMAC-SHA256
 * @see https://docs.slack.dev/authentication/verifying-requests-from-slack
 */
export const verifySlackSignature = async (params: {
	signingSecret: string;
	signature: string;
	timestamp: string;
	rawBody: string;
	now: number;
}): Promise<boolean> => {
	const ts = Number.parseInt(params.timestamp, 10);
	if (Number.isNaN(ts)) return false;
	if (Math.abs(params.now - ts) > SIGNATURE_TOLERANCE_SECONDS) return false;

	const base = `v0:${params.timestamp}:${params.rawBody}`;
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(params.signingSecret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(base));
	const expected = `v0=${Array.from(new Uint8Array(mac))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")}`;

	return timingSafeEqual(expected, params.signature);
};

/** 長さ非依存の定数時間比較 */
const timingSafeEqual = (a: string, b: string): boolean => {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
	open: "注文受付",
	done: "準備完了",
	closed: "受渡完了",
};

// 現在の状態に対する「次の操作」（線形フロー）。closed は終端。
const NEXT_ACTION: Partial<
	Record<OrderStatus, { label: string; status: OrderStatus }>
> = {
	open: { label: "準備完了", status: "done" },
	done: { label: "受渡完了", status: "closed" },
};

/** 注文内容の表示テキスト */
const orderSummary = (order: Order): string => {
	const items = order.orderList
		.map((i) => `・${i.name} x${i.qty} ¥${i.price.toLocaleString()}`)
		.join("\n");
	const total = order.orderList.reduce((sum, i) => sum + i.price * i.qty, 0);
	return `注文ID: ${order.orderId}\nユーザー: ${order.name}\n${items}\n合計: ¥${total.toLocaleString()}`;
};

/** 注文の現在状態に応じた Block Kit ブロックを組み立てる */
const buildOrderBlocks = (order: Order) => {
	const blocks: unknown[] = [
		{
			type: "section",
			text: { type: "mrkdwn", text: orderSummary(order) },
		},
		{
			type: "context",
			elements: [
				{ type: "mrkdwn", text: `状態: *${STATUS_LABEL[order.status]}*` },
			],
		},
	];

	const next = NEXT_ACTION[order.status];
	if (next) {
		blocks.push({
			type: "actions",
			elements: [
				{
					type: "button",
					text: { type: "plain_text", text: next.label },
					action_id: `order_${next.status}`,
					value: JSON.stringify({
						userId: order.userId,
						orderId: order.orderId,
						status: next.status,
					}),
				},
			],
		});
	}

	return blocks;
};

/**
 * 新規注文を Slack に通知（次操作のボタン付き）
 * @see https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks
 */
export const postOrderNotification = async (params: {
	botToken: string;
	channel: string;
	order: Order;
}): Promise<void> => {
	const res = await fetch(SLACK_POST_MESSAGE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${params.botToken}`,
		},
		body: JSON.stringify({
			channel: params.channel,
			text: `新しい注文\n${orderSummary(params.order)}`,
			blocks: buildOrderBlocks(params.order),
		}),
	});

	const data = (await res.json()) as { ok: boolean; error?: string };
	if (!data.ok) {
		throw new Error(`slack chat.postMessage failed: ${data.error}`);
	}
};

/**
 * ボタン押下後、元メッセージを最新状態で差し替える。
 * @see https://docs.slack.dev/interactivity/handling-user-interaction
 */
export const updateOrderMessage = async (params: {
	responseUrl: string;
	order: Order;
}): Promise<void> => {
	await fetch(params.responseUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			replace_original: true,
			text: orderSummary(params.order),
			blocks: buildOrderBlocks(params.order),
		}),
	});
};
