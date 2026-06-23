import type { Order, OrderItem, OrderStatus } from "../types";

const orderKey = (userId: string, orderId: string): string =>
	`order:${userId}:${orderId}`;

const userPrefix = (userId: string): string => `order:${userId}:`;

/** サービスメッセージ用の明細テキスト（例: "タコス × 2"） */
export const formatOrderDetail = (order: Order): string =>
	order.orderList.map((i) => `${i.name} × ${i.qty}`).join("\n");

/** 注文を保存（新規・更新共通） */
export const saveOrder = async (
	kv: KVNamespace,
	order: Order,
): Promise<void> => {
	await kv.put(orderKey(order.userId, order.orderId), JSON.stringify(order));
};

/** 注文を1件取得 */
export const getOrder = async (
	kv: KVNamespace,
	userId: string,
	orderId: string,
): Promise<Order | null> => {
	const raw = await kv.get(orderKey(userId, orderId));
	if (!raw) return null;
	return JSON.parse(raw) as Order;
};

/** ユーザーの注文一覧（前方一致 list） */
export const listOrdersByUser = async (
	kv: KVNamespace,
	userId: string,
): Promise<Order[]> => {
	const list = await kv.list({ prefix: userPrefix(userId) });
	const orders = await Promise.all(
		list.keys.map(async (k) => {
			const raw = await kv.get(k.name);
			return raw ? (JSON.parse(raw) as Order) : null;
		}),
	);
	return orders
		.filter((o): o is Order => o !== null)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

/** 新規注文を作成して保存 */
export const createOrder = async (
	kv: KVNamespace,
	params: {
		userId: string;
		name: string;
		orderList: OrderItem[];
		serviceNotificationToken: string;
		now: string;
	},
): Promise<Order> => {
	const order: Order = {
		orderId: crypto.randomUUID(),
		userId: params.userId,
		name: params.name,
		orderList: params.orderList,
		status: "open",
		serviceNotificationToken: params.serviceNotificationToken,
		createdAt: params.now,
		updatedAt: params.now,
	};
	await saveOrder(kv, order);
	return order;
};

/** 注文の状態を更新 */
export const updateOrderStatus = async (
	kv: KVNamespace,
	params: {
		userId: string;
		orderId: string;
		status: OrderStatus;
		now: string;
	},
): Promise<Order | null> => {
	const order = await getOrder(kv, params.userId, params.orderId);
	if (!order) return null;
	const updated: Order = {
		...order,
		status: params.status,
		updatedAt: params.now,
	};
	await saveOrder(kv, updated);
	return updated;
};
