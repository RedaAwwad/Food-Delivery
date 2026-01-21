import { Response, Request } from "express";
import { addressService } from "../services/address.service";
import { SuccessResponse } from "../utils/response/success-response";
import { StatusCodes } from "http-status-codes";
import { CreateAddressDTO } from "../dto/address.dto";

export class AddressController {
  async createAddress(req: Request<unknown, unknown, CreateAddressDTO>, res: Response) {
    const customerId = req.user!.customerId!;
    const address = await addressService.createAddress({
      ...req.body,
      customerId: customerId,
    });

    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: address }));
  }

  async getMyAddresses(req: Request, res: Response) {
    const customerId = req.user!.customerId!;
    const addresses = await addressService.getAddressesByCustomerId(customerId);

    res.status(StatusCodes.OK).json(new SuccessResponse({ data: addresses }));
  }

  async updateAddress(req: Request<any, any, any>, res: Response) {
    const { addressId } = req.params;
    const customerId = req.user!.customerId!;

    const address = await addressService.updateAddress(addressId!, customerId, req.body);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: address }));
  }

  async deleteAddress(req: Request, res: Response) {
    const { addressId } = req.params;
    const customerId = req.user!.customerId!;

    await addressService.deleteAddress(addressId!, customerId);
    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Address deleted successfully" }));
  }
}

export const addressController = new AddressController();
