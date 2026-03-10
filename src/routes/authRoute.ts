import { Hono } from "hono";
import type { Env } from "../types";
import { callbackHandler } from "@handler/auth/callbackHandler";
import { logoutHandler } from "@handler/auth/logoutHandler";

const authRoute = new Hono<Env>();
authRoute.get("/callback", callbackHandler);
authRoute.post("/logout", logoutHandler);

export default authRoute;
