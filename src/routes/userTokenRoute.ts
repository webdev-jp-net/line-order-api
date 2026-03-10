import { Hono } from "hono";
import type { Env } from "../types";
import { userTokenHandler } from "@handler/userTokenHandler";

const userTokenRoute = new Hono<Env>();
userTokenRoute.get("/", userTokenHandler);

export default userTokenRoute;
