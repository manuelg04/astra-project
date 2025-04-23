import jwt, { SignOptions, Secret } from "jsonwebtoken";

const SECRET: Secret = process.env.JWT_SECRET as Secret;

export interface JWTPayload {
  sub: string;
  email: string;
}

export const signJWT = (
  payload: JWTPayload,
  expires: string | number = "15m",
) => {
  const options: SignOptions = { expiresIn: expires };
  return jwt.sign(payload, SECRET, options);
};

export const verifyJWT = (token: string) =>
  jwt.verify(token, SECRET) as JWTPayload;