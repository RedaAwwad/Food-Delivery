import e, { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.config";
import { compare, hash } from "../utils/HashAndCompare";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { v7 as uuidv7 } from 'uuid';
import { SignupDTO } from "../dto/signup.dto";
import { loginDTO } from "../dto/login.dto";
import { generateToken } from "../utils/generateAndVerifyToken";

export class UserRepository {
    async findUserWithRestaurant(userId: string, userRole: string) {
        return prisma.user.findUnique({
            where: { userId },
            include: {
                restaurant: userRole === "restaurant" ? true : false,
            },
        });
    }

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

        const returnedUser = {userId: newUser.userId, userName: newUser.userName, userEmail: newUser.userEmail};
        const returnedCustomer = {customerId: newCustomer.customerId, customerPhone: newCustomer.customerPhone, customerAvatar: newCustomer.customerAvatar};

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
        });

        if (!user) {
            throw new CustomError({
                message: "Invalid email or password",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const match = await compare(password, user.userPassword);
        if (!match) {
            throw new CustomError({
                message: "Invalid email or password",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        await prisma.customer.update({
            where: { userId: user.userId },
            data: { isActive: true },
        });

        const token = generateToken({
            payload: {
                userId: user.userId,
                userName: user.userName,
                userEmail: user.userEmail,
            },
        });

        const returnedUser = {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
            token
        };

        return returnedUser;
    }
}
export const userRepository = new UserRepository();