import { Express } from "express";
import * as Routers from "./index.routes";

const initAPIRoutes = (app: Express) => {
  const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

  app.use(`${apiPrefix}/cart`, Routers.cartRouter);
  app.use(`${apiPrefix}/orders`, Routers.orderRouter);
  app.use(`${apiPrefix}/addresses`, Routers.addressRouter);
  app.use(`${apiPrefix}/auth`, Routers.authRouter);
  app.use(`${apiPrefix}/roles`, Routers.roleRouter);
  app.use(`${apiPrefix}/users`, Routers.userRouter);
};

export { initAPIRoutes };
