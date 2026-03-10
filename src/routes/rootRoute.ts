import { Hono } from "hono";
import { rootHandler } from "@handler/rootHandler";

const rootRoute = new Hono();
rootRoute.get("/", rootHandler);

export default rootRoute;
