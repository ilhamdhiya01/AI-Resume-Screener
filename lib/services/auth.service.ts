import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../db';
import { EmailNotFoundError, InvalidPasswordError } from '../errors/auth.error';
import { sendVerificationEmail } from '../resend';
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
      emailVerified: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  const verificationToken = await generateVerificationTokenByEmail(
    request.email
  );

  await sendVerificationEmail(
    verificationToken.identifier,
    verificationToken.token
  );

  return { user, verificationToken };
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

  if (!user) {
    throw new EmailNotFoundError();
  }

  const isValid = await bcrypt.compare(request.password, user.password!);

  if (!isValid) {
    throw new InvalidPasswordError();
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

/**
 * Gets a verification token by email
 * @param email - The email to search for
 * @returns The verification token if found, null otherwise
 */
export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await prisma.verificationRequest.findFirst({
      where: {
        identifier: email,
      },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

/**
 * Gets a verification token by token
 * @param token - The token to search for
 * @returns The verification token if found, null otherwise
 */
export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await prisma.verificationRequest.findUnique({
      where: {
        token,
      },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

/**
 * Generates a verification token for an email
 * @param email - The email to generate a verification token for
 * @returns The generated verification token
 */
export const generateVerificationTokenByEmail = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour from now

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await prisma.verificationRequest.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verificationToken = await prisma.verificationRequest.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
};
