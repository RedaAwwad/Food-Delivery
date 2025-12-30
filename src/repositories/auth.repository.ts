import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.config";
import { SignupDTO } from "../dto/signup.dto";
import { CustomError } from "../utils/errors/custom-error";
import { compare, hash } from "../utils/HashAndCompare";
import { v7 as uuidv7 } from 'uuid';
import { loginDTO } from "../dto/login.dto";
import { Request } from "express";
import { generateAccessToken, generateTokenPair, verifyRefreshToken } from "../utils/generateAndVerifyToken";
import { refreshTokenRepository } from "./refresh-token.repository";
import { LoginResponse } from "../types/token";
import { TokenType } from "../generated/prisma";


class AuthRepository {
    async signup(signupDto: SignupDTO) {
        const { userName, userPassword, userEmail, userPhoneNumber } = signupDto;

        const userCheck = await prisma.user.findUnique({ where: { userEmail } });
        if (userCheck) {
            throw (new CustomError({ message: "Email already exists", statusCode: StatusCodes.CONFLICT }));
        }

        const hashedPassword = await hash(userPassword);

        const newUser = await prisma.user.create({
            data: {
                userId: uuidv7(),
                userName,
                userEmail,
                userPassword: hashedPassword,
            },
        });

        if (!newUser) {
            throw new CustomError({
                message: "Failed to Create User",
                statusCode: StatusCodes.BAD_REQUEST,
            });;
        }

        const newCustomer = await prisma.customer.create({
            data: {
                customerId: uuidv7(),
                userId: newUser.userId,
                customerPhone: String(userPhoneNumber || ""),
                customerAvatar: "",
                createdById: newUser.userId,
                updatedById: newUser.userId,
            },
        });

        if (!newCustomer) {
            throw new CustomError({
                message: "Failed to Create Customer",
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        const returnedUser = { userId: newUser.userId, userName: newUser.userName, userEmail: newUser.userEmail };
        const returnedCustomer = { customerId: newCustomer.customerId, customerPhone: newCustomer.customerPhone, customerAvatar: newCustomer.customerAvatar };

        return { user: returnedUser, customer: returnedCustomer };

        // const confirmationLink = `${req.protocol}://${req.headers.host}${process.env.BASE_URL}/auth/confirmLink/${token}`;
        // const message = `<a href = ${confirmationLink}>Click To Confirm Email</a>`;
        // const sent = await sendEmail({
        //     to: email,
        //     message,
        //     subject: "Email Confirmation",
        // });
        // if (!sent) {
        //     return next(new Error("Email Sending Failed", { cause: 400 }));
        // }

        // res.status(201).json({ message: "signed up, please confirm your email & Login" });
    };

    async login(loginDto: loginDTO) {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new CustomError({
                message: "Email and password are required",
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        const user = await prisma.user.findUnique({
            where: { userEmail: email },
            // select: { userId: true, userName: true, userEmail: true, userPassword: true, isActive: true }
        });

        if (!user) {
            throw new CustomError({
                message: "Invalid email or password",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        return user;

        // const match = await compare(password, user.userPassword);
        // if (!match) {
        //     throw new CustomError({
        //         message: "Invalid email or password",
        //         statusCode: StatusCodes.UNAUTHORIZED,
        //     });
        // }

        // await prisma.user.update({
        //     where: { userId: user.userId },
        //     data: { isActive: true },
        // });

        // const tokenPair = generateTokenPair({
        //     userId: user.userId,
        //     userName: user.userName,
        //     userEmail: user.userEmail,
        // });

        // Extract device info
        // const deviceInfo = req ? refreshTokenRepository.extractDeviceInfo(req) : {};

        // Store refresh token in separate table
        // await refreshTokenRepository.createRefreshToken({
        //     userId: user.userId,
        //     token: tokenPair.refreshToken,
        //     expiresAt: tokenPair.refreshTokenExpiresAt,
        //     userAgent: (deviceInfo as any)?.userAgent ?? null,
        //     ipAddress: (deviceInfo as any)?.ipAddress ?? null,
        //     deviceType: (deviceInfo as any)?.deviceType ?? null,
        // });

        // Optional: Revoke old tokens if you want single session
        // await refreshTokenRepository.revokeAllExceptCurrent(
        //     user.userId, 
        //     tokenPair.refreshToken,
        //     'new_login'
        // );

        // const loginResponse: LoginResponse = {
        //     accessToken: tokenPair.accessToken,
        //     accessTokenExpiresAt: tokenPair.accessTokenExpiresAt,
        //     refreshToken: tokenPair.refreshToken,
        //     refreshTokenExpiresAt: tokenPair.refreshTokenExpiresAt,
        //     user: {
        //         userId: user.userId,
        //         userName: user.userName,
        //         userEmail: user.userEmail,
        //     }
        // };

        // return loginResponse;
    }

    async validateRefreshToken(token: string) {
        const tokenData = await refreshTokenRepository.findByToken(token);

        if (!tokenData) return null;
        if (tokenData.isRevoked) return null;
        if (tokenData.expiresAt < new Date()) return null;

        return {
            userId: tokenData.userId,
            userName: tokenData.user.userName,
            userEmail: tokenData.user.userEmail,
            tokenData: {
                refreshTokenId: tokenData.userTokenId,
            }
        }
    }

    async refreshAccessToken(refreshToken: string) {
        // Verify JWT
        const decoded = verifyRefreshToken(refreshToken);

        if (typeof decoded === 'string' || !decoded.userId) {
            throw new CustomError({
                message: "Invalid refresh token",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        // Validate against database
        const isValid = await refreshTokenRepository.isValid(refreshToken);

        if (!isValid) {
            throw new CustomError({
                message: "Refresh token is invalid or expired",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: decoded.userId,
            userName: decoded.userName,
            userEmail: decoded.userEmail,
        });

        const accessTokenExpiresAt = new Date(Date.now() + (parseInt(process.env.ACCESS_TOKEN_EXPIRY || '15', 10) * 60 * 1000));

        return {
            accessToken,
            accessTokenExpiresAt,
            user: {
                userId: decoded.userId,
                userName: decoded.userName,
                userEmail: decoded.userEmail,
            }
        };
    }

    async logout(refreshToken: string) {
        await refreshTokenRepository.revokeToken(refreshToken, 'user_logout');
        return true;
    }

    async logoutAll(userId: string) {
        await refreshTokenRepository.revokeAllUserTokens(userId, 'logout_all');
        return true;
    }

    async getActiveSessions(userId: string) {
        return refreshTokenRepository.findByUserId(userId, {
            isRevoked: false,
            expired: false
        });
    }
}

export const authRepository = new AuthRepository();