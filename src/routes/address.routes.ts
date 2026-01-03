import express from "express";
import { addressController } from "../controllers/address.controller";
import { isCustomer } from "../middleware/customer.middleware";

const addressRouter = express.Router();

// Protect all address routes
addressRouter.use(isCustomer);

addressRouter.post("/", addressController.createAddress);
addressRouter.get("/", addressController.getMyAddresses);
addressRouter.put("/:addressId", addressController.updateAddress);
addressRouter.delete("/:addressId", addressController.deleteAddress);

export { addressRouter };
