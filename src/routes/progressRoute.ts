import { Hono } from "hono";
import type { Env } from "../types";
import { authMiddleware } from "@middleware/authMiddleware";
import { getProgressHandler } from "@handler/progressHandler";

const progressRoute = new Hono<Env>();
progressRoute.use("*", authMiddleware);
progressRoute.get("/", getProgressHandler);

export default progressRoute;
