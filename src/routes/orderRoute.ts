import { Hono } from "hono";
import type { Env } from "../types";
import { authMiddleware } from "@middleware/authMiddleware";
import { createOrderHandler } from "@handler/order/createOrderHandler";
import { getOrderHistoryHandler } from "@handler/order/getOrderHistoryHandler";

const orderRoute = new Hono<Env>();
orderRoute.use("*", authMiddleware);
orderRoute.post("/", createOrderHandler);
orderRoute.get("/history", getOrderHistoryHandler);

export default orderRoute;
