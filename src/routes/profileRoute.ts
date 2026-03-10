import { Hono } from "hono";
import type { Env } from "../types";
import { authMiddleware } from "@middleware/authMiddleware";
import { getProfileHandler } from "@handler/profile/getProfileHandler";
import { putProfileHandler } from "@handler/profile/putProfileHandler";

const profileRoute = new Hono<Env>();
profileRoute.use("*", authMiddleware);
profileRoute.get("/", getProfileHandler);
profileRoute.put("/", putProfileHandler);

export default profileRoute;
