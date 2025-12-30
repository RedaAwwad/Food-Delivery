import { Express } from "express";
import { cartRouter } from "./cart.routes";
import { orderRouter } from "./order.routes";
import { authRouter } from "./auth.routes";
import { roleRouter } from "./role.routes";
import { userRouter } from "./user.routes";

const initAPIRoutes = (app: Express) => {
  const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

  app.use(`${apiPrefix}/cart`, cartRouter);
  app.use(`${apiPrefix}/orders`, orderRouter);
  app.use(`${apiPrefix}/auth`, authRouter);
  app.use(`${apiPrefix}/roles`, roleRouter);
  app.use(`${apiPrefix}/users`, userRouter);
};

export { initAPIRoutes };
