import { Hono } from "hono";
import type { Env } from "../types";
import { interactionsHandler } from "@handler/slack/interactionsHandler";

// Slack からのリクエストは独自の署名検証を行うため authMiddleware は使わない
const slackRoute = new Hono<Env>();
slackRoute.post("/interactions", interactionsHandler);

export default slackRoute;
