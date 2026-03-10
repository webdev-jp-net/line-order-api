import { createMiddleware } from "hono/factory";
import type { Env } from "../types";
import { verifyToken } from "@util/jwt";

/**
 * 認証ミドルウェア
 * Authorization: Bearer <JWT> ヘッダーを検証
 * 成功時は c.set("lineUserId", ...) でユーザーIDをセット
 */
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	const token = authHeader.slice(7);

	try {
		const lineUserId = await verifyToken(token, c.env.SESSION_SECRET);
		c.set("lineUserId", lineUserId);
		await next();
	} catch {
		return c.json({ message: "Unauthorized" }, 401);
	}
});
