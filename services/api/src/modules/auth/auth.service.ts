import argon2 from 'argon2';
import prisma from '../../infrastructure/database.js';
import { SignupInput, LoginInput } from './auth.schema.js';

export class AuthService {
  async signup(input: SignupInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        settings: {
          create: {} // Default settings
        }
      },
      include: {
        settings: true
      }
    });

    return user;
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        settings: true
      }
    });

    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}

export const authService = new AuthService();
