import type { Order, OrderStatus } from "../types";
import { formatOrderDetail, updateOrderStatus } from "@util/orderStore";
import { issueChannelAccessToken, sendServiceMessage } from "@util/lineApi";

/**
 * 注文状態を更新し、通知対象の状態（done）になったら
 * LINE サービスメッセージを送る。
 *
 * templateName は LINE Developers コンソールに登録したサービスメッセージの
 * 「API用テンプレート名」（`{template name}_{BCP 47 language tag}`、30文字以内）を
 * env から渡す。
 */
export const applyOrderStatus = async (
	deps: {
		kv: KVNamespace;
		channelId: string;
		channelSecret: string;
		frontendUrl: string;
		// status → 登録済みテンプレートの「API用テンプレート名」
		templates: Partial<Record<OrderStatus, string>>;
	},
	params: {
		userId: string;
		orderId: string;
		status: OrderStatus;
		now: string;
	},
): Promise<Order | null> => {
	const updated = await updateOrderStatus(deps.kv, {
		userId: params.userId,
		orderId: params.orderId,
		status: params.status,
		now: params.now,
	});

	if (!updated) return null;

	const templateName = deps.templates[updated.status];
	if (templateName) {
		const channelAccessToken = await issueChannelAccessToken({
			channelId: deps.channelId,
			channelSecret: deps.channelSecret,
		});
		await sendServiceMessage({
			notificationToken: updated.serviceNotificationToken,
			templateName,
			params: {
				number: updated.orderId,
				content: "受け取りカウンターへお越しください。",
				btn1_url: deps.frontendUrl,
				order_detail: formatOrderDetail(updated),
			},
			channelAccessToken,
		});
	}

	return updated;
};
