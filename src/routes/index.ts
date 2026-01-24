import { Express } from "express";
import { cartRouter } from "./cart.routes";
import { orderRouter } from "./order.routes";
import { addressRouter } from "./address.routes";
import { authRouter } from "./auth.routes";
import { roleRouter } from "./role.routes";
import { userRouter } from "./user.routes";
import { restaurantRouter } from "./restaurant.routes";
import { menuRouter } from "./menu.routes";
import { menuCategoryRouter } from "./menuCategory.routes";
import menuItemRouter from "./menuItem.routes";

const initAPIRoutes = (app: Express) => {
  const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

  app.use(`${apiPrefix}/auth`, authRouter);
  app.use(`${apiPrefix}/roles`, roleRouter);
  app.use(`${apiPrefix}/users`, userRouter);
  app.use(`${apiPrefix}/cart`, cartRouter);
  app.use(`${apiPrefix}/orders`, orderRouter);
  app.use(`${apiPrefix}/addresses`, addressRouter);
  app.use(`${apiPrefix}/restaurant`, restaurantRouter);
  app.use(`${apiPrefix}/menu`, menuRouter);
  app.use(`${apiPrefix}/menuCategory`, menuCategoryRouter);
  app.use(`${apiPrefix}/menuItem`, menuItemRouter);
};

export { initAPIRoutes };
