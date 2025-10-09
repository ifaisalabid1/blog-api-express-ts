import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UserRepository } from "../repositories/userRepository";
import { CreateUserInput, LoginInput } from "../validations";
import logger from "../utils/logger";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData: CreateUserInput) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        role: user?.role,
      },
      token,
    };
  }

  async login(loginData: LoginInput) {
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  private generateToken(userId: number): string {
    return jwt.sign({ userId, type: "access" }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });
  }

  verifyToken(token: string): { userId: number } {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        userId: number;
      };
      return decoded;
    } catch (error) {
      logger.error("Token verification failed:", error);
      throw new Error("Invalid token");
    }
  }
}
