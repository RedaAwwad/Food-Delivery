import { Router } from "express";
import { cartRouter } from "./cartRoutes";

const initAPIRoutes = (app: Router) => {
  const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

  app.use(`${apiPrefix}/cart`, cartRouter);
};

export { initAPIRoutes };
