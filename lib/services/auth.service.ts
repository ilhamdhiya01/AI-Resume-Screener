import bcrypt from 'bcryptjs';

import prisma from '../db';
import { EmailNotFoundError } from '../errors/auth.error';
import { LoginInput, RegisterInput } from '../types/auth.types';

/**
 * Registers a new user
 * @param request - The registration request
 * @returns The created user
 */
export const registerUser = async (request: RegisterInput) => {
  const existingUser = await findUserByEmail(request.email);

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(request.password, 10);

  const user = await prisma.user.create({
    data: {
      email: request.email,
      password: hashedPassword,
      name: request.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Finds a user by email
 * @param email - The email to search for
 * @returns The user if found, null otherwise
 */
export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

/**
 * Verifies user credentials
 * @param request - The login request
 * @returns The user if credentials are valid, null otherwise
 */
export const verifyCredentials = async (request: LoginInput) => {
  const user = await findUserByEmail(request.email);

  if (!user || !user.password) {
    throw new EmailNotFoundError();
  }

  const isValid = await bcrypt.compare(request.password, user.password);

  if (!isValid) {
    return null;
  }

  return user;
};

/**
 * Gets a user by ID
 * @param id - The user ID
 * @returns The user if found, null otherwise
 */
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return user;
};
