import { sign, verify } from "hono/jwt";

const TOKEN_EXPIRY_SECONDS = 60 * 60; // 1時間

export type JwtPayload = {
	lineUserId: string;
	name: string;
};

/**
 * JWT を発行する
 * payload: { lineUserId, name, iat, exp }
 */
export const signToken = async (
	payload: JwtPayload,
	secret: string,
): Promise<string> => {
	const now = Math.floor(Date.now() / 1000);
	return await sign(
		{
			lineUserId: payload.lineUserId,
			name: payload.name,
			iat: now,
			exp: now + TOKEN_EXPIRY_SECONDS,
		},
		secret,
	);
};

/**
 * JWT を検証し payload を返す
 * 期限切れや改ざんがあれば例外をスロー
 */
export const verifyToken = async (
	token: string,
	secret: string,
): Promise<JwtPayload> => {
	const payload = await verify(token, secret, "HS256");
	return {
		lineUserId: payload.lineUserId as string,
		name: (payload.name as string) ?? "",
	};
};
