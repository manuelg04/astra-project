import bcrypt from "bcrypt";

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);

export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);
