import { ObjectSchema } from "joi";

export type ValidationSchemas = {
    body?: ObjectSchema;
    params?: ObjectSchema;
    query?: ObjectSchema;
};