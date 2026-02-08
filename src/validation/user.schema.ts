import Joi from "joi";
import { RoleKey } from "../generated/prisma/client";

export const findAndUpdateUserSchema = Joi.object({
    userName: Joi.string().min(1).max(20).optional(),
    userEmail: Joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 4,
        tlds: { allow: ["com", "net"] },
    }).optional(),
}).required();

export const findUserByIdSchema = Joi.object({
    userId: Joi.string().uuid().required(),
}).required();

export const assignRoleSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    roleName: Joi.string().valid(...Object.values(RoleKey)).required(),
}).required();

export const removeRoleSchema = Joi.object({
    userId: Joi.string().uuid().required(),
    roleName: Joi.string().valid(...Object.values(RoleKey)).required(),
}).required();
