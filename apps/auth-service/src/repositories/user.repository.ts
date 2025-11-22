import { prisma } from '../lib/prisma';
import { User, UserRole } from '@creatorflow/types';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export class UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role || UserRole.USER,
      },
    }) as Promise<User>;
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    }) as Promise<User | null>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    }) as Promise<User | null>;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    }) as Promise<User>;
  }

  async verifyEmail(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    }) as Promise<User>;
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    }) as Promise<User>;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
