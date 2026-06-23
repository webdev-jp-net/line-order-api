import { createMiddleware } from "hono/factory";
import type { Env } from "../types";
import { verifyToken } from "@util/jwt";

/**
 * 認証ミドルウェア
 * Authorization: Bearer <JWT> ヘッダーを検証
 * 成功時は c.set("lineUserId" / "name", ...) でユーザー情報をセット
 */
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	const token = authHeader.slice(7);

	try {
		const { lineUserId, name } = await verifyToken(token, c.env.SESSION_SECRET);
		c.set("lineUserId", lineUserId);
		c.set("name", name);
		await next();
	} catch (err) {
		console.error("JWT verify failed:", err);
		return c.json({ message: "Unauthorized" }, 401);
	}
});
