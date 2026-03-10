import { Hono } from "hono";
import type { Env } from "../types";
import { authMiddleware } from "@middleware/authMiddleware";
import { getAwardsHandler } from "@handler/awardsHandler";

const awardsRoute = new Hono<Env>();
awardsRoute.use("*", authMiddleware);
awardsRoute.get("/", getAwardsHandler);

export default awardsRoute;
