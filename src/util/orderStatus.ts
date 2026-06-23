import type { Order, OrderStatus } from "../types";
import { updateOrderStatus } from "@util/orderStore";
import { sendServiceMessage } from "@util/lineApi";

/**
 * 注文状態を更新し、通知対象の状態（progress / done）になったら
 * LINE サービスメッセージを送る。
 *
 * templateName は LINE Developers コンソールに登録したサービスメッセージの
 * 「API用テンプレート名」（`{template name}_{BCP 47 language tag}`、30文字以内）を
 * env から渡す。
 * params はテンプレートが定義する変数に一致させる。変数のないテンプレートは `{}`。
 */
export const applyOrderStatus = async (
	deps: {
		kv: KVNamespace;
		channelAccessToken: string;
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
		await sendServiceMessage({
			notificationToken: updated.serviceNotificationToken,
			templateName,
			// 登録テンプレートが変数を持つ場合はここで変数キーに合わせて設定する。
			params: {},
			channelAccessToken: deps.channelAccessToken,
		});
	}

	return updated;
};
