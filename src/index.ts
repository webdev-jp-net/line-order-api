import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import rootRoute from "@routes/rootRoute";
import authRoute from "@routes/authRoute";
import apiRoute from "@routes/apiRoute";

const app = new Hono<Env>();

// CORS: LIFF アプリのオリジンを許可
app.use(
	"*",
	cors({
		origin: (origin, c) => {
			const allowed = c.env.FRONTEND_URL;
			return origin === allowed ? origin : "";
		},
		credentials: true,
	}),
);

// ルートの統合
app.route("/", rootRoute);
app.route("/auth", authRoute);
app.route("/api", apiRoute);

export default app;
