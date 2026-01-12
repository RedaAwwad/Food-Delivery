import { Request, Response, NextFunction } from "express";
import { addressService } from "../services/address.service";
import { SuccessResponse } from "../utils/response/success-response";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";

export class AddressController {
  async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).user?.customerId

      if (!customerId) {
        throw new CustomError({
          message: "User ID not found in token",
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      }

      const address = await addressService.createAddress({
        ...req.body,
        customerId: customerId,
      });
      res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: address }));
    } catch (error) {
      next(error);
    }
  }

  async getMyAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).user?.customerId || (req as any).user?.userId;
      if (!customerId) {
        throw new CustomError({
          message: "User ID not found in token",
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      }
      const addresses = await addressService.getAddressesByCustomerId(customerId);
      res.status(StatusCodes.OK).json(new SuccessResponse({ data: addresses }));
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { addressId } = req.params;
      const customerId = (req as any).user?.customerId
      if (!customerId) {
        throw new CustomError({
          message: "User ID not found in token",
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      }

      const address = await addressService.updateAddress(
        addressId!,
        customerId,
        req.body
      );
      res.status(StatusCodes.OK).json(new SuccessResponse({ data: address }));
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { addressId } = req.params;
      const customerId = (req as any).user?.customerId
      if (!customerId) {
        throw new CustomError({
          message: "User ID not found in token",
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      }
      await addressService.deleteAddress(addressId!, customerId);
      res
        .status(StatusCodes.OK)
        .json(new SuccessResponse({ message: "Address deleted successfully" }));
    } catch (error) {
      next(error);
    }
  }
}

export const addressController = new AddressController();
