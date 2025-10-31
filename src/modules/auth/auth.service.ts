import { BASE_URL_FE, JWT_SECRET, JWT_SECRET_RESET } from "../../config/env";
import { ApiError } from "../../utils/api-error";
import { comparePassword, hashPassword } from "../../utils/password";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { sign } from "jsonwebtoken";
import { ResetPasswordDTO } from "./dto/reset-password.dto";

export class AuthService {
  private prisma: PrismaService;
  private mailService: MailService;

  constructor() {
    this.prisma = new PrismaService();
    this.mailService = new MailService();
  }

  register = async (body: RegisterDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (user) {
      throw new ApiError("email already exist!", 400);
    }

    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.create({
      data: { ...body, password: hashedPassword },
    });

    return { message: "register user success" };
  };

  login = async (body: LoginDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }

    const isPasswordValid = await comparePassword(body.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError("Invalid credentials", 400);
    }

    const payload = { id: user.id, role: user.role };

    const accessToken = sign(payload, JWT_SECRET!, { expiresIn: "2h" });

    const { password, ...userWithoutPassword } = user;

    return { ...userWithoutPassword, accessToken };
  };

  forgotPassword = async (body: ForgotPasswordDTO) => {
    // cek dulu usernya ada apa tidak di db berdasarkan email
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    // kalo tidak ada throw error
    if (!user) {
      throw new ApiError("invalid email address", 400);
    }

    // generate token
    const payload = { id: user.id, role: user.role };
    const token = sign(payload, JWT_SECRET_RESET!, { expiresIn: "15m" });

    // kirim email reset password + token
    await this.mailService.sendEmail(
      user.email,
      "Forgot Password",
      "reset-password",
      { link: `${BASE_URL_FE}/reset-password/${token}` }
    );

    return { message: "send email success" };
  };

  resetPassword = async (body: ResetPasswordDTO, authUserId: number) => {
    const user = await this.prisma.user.findFirst({
      where: { id: authUserId },
    });

    if (!user) {
      throw new ApiError("invalid user id", 400);
    }

    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: "reset password success" };
  };
}
