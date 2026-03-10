import { Hono } from "hono";
import type { Env } from "../types";
import { authMiddleware } from "@middleware/authMiddleware";
import { getSurveysHandler } from "@handler/surveysHandler";

const surveysRoute = new Hono<Env>();
surveysRoute.use("*", authMiddleware);
surveysRoute.get("/", getSurveysHandler);

export default surveysRoute;
