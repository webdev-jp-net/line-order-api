import { Hono } from "hono";
import type { Env } from "../types";
import { authMiddleware } from "@middleware/authMiddleware";
import { meHandler } from "@handler/api/meHandler";

const apiRoute = new Hono<Env>();
apiRoute.use("*", authMiddleware);
apiRoute.get("/me", meHandler);

export default apiRoute;
