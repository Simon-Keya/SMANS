import { prisma } from "@/lib/prisma";
import { AuthService } from "@/lib/services/auth.service";
import bcrypt from "bcryptjs";

describe("AuthService", () => {
  describe("register", () => {
    it("should create a new user with hashed password", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "STUDENT",
      };

      const user = await AuthService.register(input);

      expect(user).toHaveProperty("id");
      expect(user.email).toBe(input.email);
      expect(user.role).toBe(input.role);

      // Password should be hashed
      const isValid = await bcrypt.compare(input.password, user.password!);
      expect(isValid).toBe(true);
    });

    it("should throw error if email exists", async () => {
      await prisma.user.create({
        data: {
          email: "duplicate@example.com",
          password: "hashed",
          role: "STUDENT",
        },
      });

      await expect(
        AuthService.register({
          email: "duplicate@example.com",
          password: "pass",
          role: "STUDENT",
        })
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("login", () => {
    it("should return user on valid credentials", async () => {
      const password = "correctpass";
      const hashed = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          email: "login@example.com",
          password: hashed,
          role: "TEACHER",
        },
      });

      const user = await AuthService.login("login@example.com", password);
      expect(user).toHaveProperty("id");
      expect(user.role).toBe("TEACHER");
    });

    it("should throw on invalid password", async () => {
      await expect(
        AuthService.login("login@example.com", "wrongpass")
      ).rejects.toThrow("Invalid credentials");
    });
  });
});