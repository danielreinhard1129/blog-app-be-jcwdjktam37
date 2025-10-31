import { App } from "../../../src/app";
import { PrismaService } from "../../../src/modules/prisma/prisma.service";
import { hashPassword } from "../../../src/utils/password";
import request from "supertest";

const prisma = new PrismaService();

describe("POST /auth/login", () => {
  const { app } = new App();

  it("should login successfully", async () => {
    // Arrange
    const hashedPassword = await hashPassword("Password123");
    await prisma.user.create({
      data: {
        email: "budi@mail.com",
        password: hashedPassword,
        role: "USER",
      },
    });

    // Act
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "budi@mail.com", password: "Password123" });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should return an error when the password is incorrect", async () => {
    // Arrange
    const hashedPassword = await hashPassword("Password123");
    await prisma.user.create({
      data: {
        email: "budi@mail.com",
        password: hashedPassword,
        role: "USER",
      },
    });

    // Act
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "budi@mail.com", password: "WrongPassword123" });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should return an error when the email is not found", async () => {
    // Arrange
    const email = "nonexistent@mail.com";

    // Act
    const response = await request(app)
      .post("/auth/login")
      .send({ email: email, password: "RandomPassword123" });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });
});
