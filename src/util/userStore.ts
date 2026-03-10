import type { UserProfile } from "../types";

/**
 * ユーザープロフィール取得
 * Key: user:<lineUserId>
 */
export const getUser = async (
	kv: KVNamespace,
	lineUserId: string,
): Promise<UserProfile | null> => {
	const raw = await kv.get(`user:${lineUserId}`);
	if (!raw) return null;
	return JSON.parse(raw) as UserProfile;
};

/**
 * ユーザープロフィール保存
 */
const saveUser = async (
	kv: KVNamespace,
	data: UserProfile,
): Promise<void> => {
	await kv.put(`user:${data.lineUserId}`, JSON.stringify(data));
};

/**
 * ユーザー upsert（初回トークン取得時に作成、既存ならそのまま返す）
 */
export const upsertUser = async (
	kv: KVNamespace,
	lineUserId: string,
): Promise<UserProfile> => {
	const existing = await getUser(kv, lineUserId);
	if (existing) return existing;

	const newUser: UserProfile = { lineUserId };
	await saveUser(kv, newUser);
	return newUser;
};

/**
 * プロフィール登録・更新
 * gender, ageGroup, residence を保存
 */
export const updateProfile = async (
	kv: KVNamespace,
	lineUserId: string,
	profile: { gender: number; ageGroup: number; residence: string },
): Promise<UserProfile> => {
	const existing = await getUser(kv, lineUserId);
	const updated: UserProfile = {
		lineUserId,
		...existing,
		...profile,
	};
	await saveUser(kv, updated);
	return updated;
};
