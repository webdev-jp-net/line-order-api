import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./types";
import rootRoute from "@routes/rootRoute";
import userTokenRoute from "@routes/userTokenRoute";
import profileRoute from "@routes/profileRoute";
import progressRoute from "@routes/progressRoute";
import awardsRoute from "@routes/awardsRoute";
import surveysRoute from "@routes/surveysRoute";

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
		allowMethods: ["GET", "PUT", "POST", "OPTIONS"],
	}),
);

// ルートの統合
app.route("/", rootRoute);
app.route("/user-token", userTokenRoute);
app.route("/profile", profileRoute);
app.route("/progress", progressRoute);
app.route("/awards", awardsRoute);
app.route("/surveys", surveysRoute);

export default app;
