import { sign, verify } from "hono/jwt";

const TOKEN_EXPIRY_SECONDS = 60 * 60; // 1時間

/**
 * JWT を発行する
 * payload: { lineUserId, iat, exp }
 */
export const signToken = async (
	lineUserId: string,
	secret: string,
): Promise<string> => {
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		lineUserId,
		iat: now,
		exp: now + TOKEN_EXPIRY_SECONDS,
	};
	return await sign(payload, secret);
};

/**
 * JWT を検証し lineUserId を返す
 * 期限切れや改ざんがあれば例外をスロー
 */
export const verifyToken = async (
	token: string,
	secret: string,
): Promise<string> => {
	const payload = await verify(token, secret);
	return payload.lineUserId as string;
};
