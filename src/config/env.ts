import dotenv from "dotenv";

const envFile = process.env.TEST_TYPE === "integration" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

export const PORT = process.env.PORT;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_SECRET_RESET = process.env.JWT_SECRET_RESET;
export const BASE_URL_FE = process.env.BASE_URL_FE;
