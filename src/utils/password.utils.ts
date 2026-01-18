import bcrypt from "bcrypt";
import { CustomError } from "./errors/custom-error";
import { StatusCodes } from "http-status-codes";

class PasswordUtils {
  static generateSalt() {
    const salt = parseInt(process.env.SALT_ROUNDS ?? "10", 10);
    if (!Number.isFinite(salt) || salt <= 0) {
      throw new CustomError({
        message: "Invalid SALT_ROUNDS configuration",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    return salt;
  }

  static async hash(password: string) {
    try {
      return await bcrypt.hash(password, this.generateSalt());
    } catch (err: any) {
      throw new CustomError({
        message: "Failed to hash password",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        errors: err?.message,
      });
    }
  }

  static async compare(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (err: any) {
      throw new CustomError({
        message: "Failed to compare values",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        errors: err?.message,
      });
    }
  }
}

export { PasswordUtils };
