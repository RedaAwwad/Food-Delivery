import { Express } from "express";
import { cartRouter } from "./cart.routes";
import { orderRouter } from "./order.routes";
import { authRouter } from "./auth.routes";
import { roleRouter } from "./role.routes";
import { userRouter } from "./user.routes";
import { restaurantRouter } from "./restaurant.routes";
import { menuRouter } from "./menu.routes";
import { menuCategoryRouter } from "./menuCategory.routes";
import menuItemRouter from "./menuItem.routes";
import { publicRouter } from "./public.routes";
import { dashboardRouter } from "./dashboard.routes";
import { customerRouter } from "./customer.routes";

const initAPIRoutes = (app: Express) => {
  const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

  app.use(`${apiPrefix}/public`, publicRouter);
  app.use(`${apiPrefix}/dashboard`, dashboardRouter);
  app.use(`${apiPrefix}/customers`, customerRouter);
  app.use(`${apiPrefix}/auth`, authRouter);
  app.use(`${apiPrefix}/roles`, roleRouter);
  app.use(`${apiPrefix}/users`, userRouter);
  app.use(`${apiPrefix}/cart`, cartRouter);
  app.use(`${apiPrefix}/orders`, orderRouter);
  app.use(`${apiPrefix}/restaurants`, restaurantRouter);
  app.use(`${apiPrefix}/menus`, menuRouter);
  app.use(`${apiPrefix}/menu-categories`, menuCategoryRouter);
  app.use(`${apiPrefix}/menu-items`, menuItemRouter);
};

export { initAPIRoutes };
