import type { UserData } from "../types";

/**
 * ユーザーデータ取得
 * Key: user:<lineUserId>
 */
export const getUser = async (
	kv: KVNamespace,
	lineUserId: string,
): Promise<UserData | null> => {
	const raw = await kv.get(`user:${lineUserId}`);
	if (!raw) return null;
	return JSON.parse(raw) as UserData;
};

/**
 * ユーザーデータ保存（作成 or 更新）
 */
const saveUser = async (kv: KVNamespace, data: UserData): Promise<void> => {
	await kv.put(`user:${data.lineUserId}`, JSON.stringify(data));
};

/**
 * ユーザー upsert（初回ログイン時に作成、既存なら updatedAt 更新）
 */
export const upsertUser = async (
	kv: KVNamespace,
	lineUserId: string,
): Promise<UserData> => {
	const existing = await getUser(kv, lineUserId);
	const now = new Date().toISOString();

	if (existing) {
		existing.updatedAt = now;
		await saveUser(kv, existing);
		return existing;
	}

	const newUser: UserData = {
		lineUserId,
		createdAt: now,
		updatedAt: now,
	};

	await saveUser(kv, newUser);
	return newUser;
};
