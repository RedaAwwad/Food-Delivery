import express from "express";
import { addressController } from "../controllers/address.controller";
import { isAuthorized } from "../middleware/auth.middleware";

const addressRouter = express.Router();

// Protect all address routes
addressRouter.use(isAuthorized(["customer"]));

addressRouter.post("/", addressController.createAddress);
addressRouter.get("/", addressController.getMyAddresses);
addressRouter.put("/:addressId", addressController.updateAddress);
addressRouter.delete("/:addressId", addressController.deleteAddress);

export { addressRouter };
