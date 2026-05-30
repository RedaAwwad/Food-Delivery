import express from "express";
import { orderController } from "../controllers/order.controller";
import { dashboardController } from "../controllers/dashboard.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";

const dashboardRouter = express.Router();

dashboardRouter.use(isAuthenticated, isAuthorized(["ADMIN", "RESTAURANT_MANAGER"]));

dashboardRouter.get("/stats", (req, res) => orderController.getAdminDashboardStats(req, res));
dashboardRouter.get("/orders", (req, res) => orderController.findAllOrdersForAdmin(req, res));
dashboardRouter.get("/branches", (req, res) => dashboardController.listBranches(req, res));
dashboardRouter.post("/branches", (req, res) => dashboardController.createBranch(req, res));
dashboardRouter.put("/branches", (req, res) => dashboardController.updateBranch(req, res));
dashboardRouter.patch("/branches/:restaurantId/toggle", (req, res) => dashboardController.toggleBranch(req, res));
dashboardRouter.delete("/branches", (req, res) => dashboardController.deleteBranch(req, res));

dashboardRouter.get("/menu/:restaurantId", (req, res) => dashboardController.getMenuByRestaurant(req, res));
dashboardRouter.post("/menu/:restaurantId/ensure", (req, res) => dashboardController.ensureMenu(req, res));
dashboardRouter.post("/menu/:restaurantId/categories", (req, res) => dashboardController.createMenuCategory(req, res));
dashboardRouter.delete("/menu/categories", (req, res) => dashboardController.deleteMenuCategory(req, res));
dashboardRouter.patch("/orders/:orderId/kitchen-status", (req, res) =>
  dashboardController.updateKitchenStatus(req, res)
);

export { dashboardRouter };
