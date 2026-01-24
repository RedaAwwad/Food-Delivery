import express from "express";
import { addressController } from "../controllers/address.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";

const addressRouter = express.Router();

addressRouter.use([isAuthenticated, isAuthorized(["CUSTOMER"])]);

addressRouter.post("/", addressController.createAddress);
addressRouter.get("/", addressController.getMyAddresses);
addressRouter.put("/:addressId", addressController.updateAddress);
addressRouter.delete("/:addressId", addressController.deleteAddress);

export { addressRouter };
