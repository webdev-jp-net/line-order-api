import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import rootRoute from "@routes/rootRoute";
import userTokenRoute from "@routes/userTokenRoute";
import orderRoute from "@routes/orderRoute";
import slackRoute from "@routes/slackRoute";

const app = new Hono<Env>();

// CORS: LIFF アプリのオリジンを許可
app.use(
	"*",
	cors({
		origin: (origin, c) => {
			const allowed = c.env.FRONTEND_URL;
			return origin === allowed ? origin : "";
		},
		allowHeaders: ["Content-Type", "Authorization", "line-id-token"],
		allowMethods: ["GET", "POST", "OPTIONS"],
	}),
);

// ルートの統合
app.route("/", rootRoute);
app.route("/user-token", userTokenRoute);
app.route("/orders", orderRoute);
app.route("/slack", slackRoute);

export default app;
