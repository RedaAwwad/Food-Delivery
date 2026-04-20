import Jwt from "jsonwebtoken";

export type GenerateOpts = {
    payload?: string | object | Buffer;
    signature?: Jwt.Secret;
    expiresIn?: Jwt.SignOptions['expiresIn'];
}