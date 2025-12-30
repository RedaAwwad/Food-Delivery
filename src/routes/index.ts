import { Router } from "express";
import { cartRouter } from "./cart.routes";
import { orderRouter } from "./order.routes";
import { addressRouter } from "./address.routes";

const initAPIRoutes = (app: Router) => {
  const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

  app.use(`${apiPrefix}/cart`, cartRouter);
  app.use(`${apiPrefix}/orders`, orderRouter);
  app.use(`${apiPrefix}/addresses`, addressRouter);
};

export { initAPIRoutes };
