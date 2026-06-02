import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../db';
import {
  EmailNotFoundError,
  InvalidPasswordError,
  UnverifiedEmailError,
} from '../errors/auth.error';
import { sendVerificationEmail } from '../resend';
import { LoginInput, RegisterInput } from '../types/auth.types';

/**
 * @description **[AUTH FLOW - REGISTRATION]** Orchestrates complete user registration
 * flow including password hashing, database persistence, token generation, and
 * email verification dispatch.
 *
 * **Data Flow:**
 * 1. Check if email already exists in database (prevent duplicates)
 * 2. Hash password using bcrypt (10 salt rounds) for secure storage
 * 3. Create user record in database with `emailVerified: null` (unverified state)
 * 4. Generate time-limited verification token (15 min expiry)
 * 5. Dispatch verification email via SMTP (Nodemailer)
 *
 * **Side Effects:**
 * - **Database Write:** Creates new `User` record in `users` table
 * - **Database Write:** Creates `VerificationRequest` record for email confirmation
 * - **External API Call:** Sends email via SMTP server (async, non-blocking)
 *
 * **Business Logic:**
 * - User cannot log in until email is verified (enforced in `verifyCredentials`)
 * - Verification token expires after 15 minutes (security measure)
 * - Password is never stored in plain text (bcrypt one-way hash)
 *
 * @param {RegisterInput} request - Registration payload containing email, password, and name
 * @returns {Promise<{ user: User; verificationToken: VerificationRequest }>}
 *          Created user object (without password) and verification token metadata
 * @throws {Error} If email already exists in database
 *
 * @example
 * const result = await registerUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   name: 'John Doe'
 * });
 * // User created, verification email sent to inbox
 */
export const registerUser = async (request: RegisterInput) => {
  // Step 1: Prevent duplicate email registration
  const existingUser = await getUserByEmail(request.email);

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Step 2: Hash password with bcrypt (10 salt rounds = 2^10 iterations)
  // Never store plain text passwords for security
  const hashedPassword = await bcrypt.hash(request.password, 10);

  // Step 3: Persist user to database with unverified email status
  const user = await prisma.user.create({
    data: {
      email: request.email,
      password: hashedPassword,
      name: request.name,
      emailVerified: null, // ← User cannot login until this is set
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Step 4: Generate time-limited verification token (UUID v4)
  const verificationToken = await generateVerificationTokenByEmail(
    request.email
  );

  // Step 5: Dispatch verification email asynchronously via SMTP
  // Email contains magic link: /verify-request?token=xxx&email=yyy
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
export const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

/**
 * @description **[AUTH FLOW - LOGIN]** Validates user credentials during login
 * attempt. Enforces email verification requirement before allowing access.
 *
 * **Data Flow:**
 * 1. Fetch user record from database by email
 * 2. Compare submitted password with stored bcrypt hash
 * 3. Check if email has been verified (emailVerified !== null)
 *
 * **Business Logic:**
 * - **Security:** Uses constant-time comparison via bcrypt to prevent timing attacks
 * - **Access Control:** Blocks login if email is unverified (even if password is correct)
 * - **Error Handling:** Throws specific errors for debugging (EmailNotFound, InvalidPassword, UnverifiedEmail)
 *
 * **Side Effects:**
 * - **Database Read:** Single query to `users` table
 * - **No writes:** This function is read-only (session creation happens in NextAuth callbacks)
 *
 * @param {LoginInput} request - Login payload containing email and password
 * @returns {Promise<User>} User object if credentials are valid and email is verified
 * @throws {EmailNotFoundError} If no user exists with provided email
 * @throws {InvalidPasswordError} If password does not match stored hash
 * @throws {UnverifiedEmailError} If user exists but email is not verified
 *
 * @example
 * try {
 *   const user = await verifyCredentials({ email: 'user@example.com', password: 'pass123' });
 *   // Proceed to create session (handled by NextAuth)
 * } catch (error) {
 *   if (error instanceof UnverifiedEmailError) {
 *     // Redirect to "check your email" page
 *   }
 * }
 */
export const verifyCredentials = async (request: LoginInput) => {
  // Step 1: Fetch user by email
  const user = await getUserByEmail(request.email);

  if (!user) {
    throw new EmailNotFoundError();
  }

  // Step 2: Verify password using bcrypt (constant-time comparison)
  const isValid = await bcrypt.compare(request.password, user.password!);

  if (!isValid) {
    throw new InvalidPasswordError();
  }

  // Step 3: Enforce email verification requirement
  // User cannot proceed to session creation if emailVerified is null
  if (!user.emailVerified) {
    throw new UnverifiedEmailError();
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
 * @description **[AUTH FLOW - TOKEN GENERATION]** Creates a time-limited
 * verification token for email confirmation. Implements token rotation by
 * deleting any existing tokens before creating a new one.
 *
 * **Data Flow:**
 * 1. Generate cryptographically secure UUID v4 token
 * 2. Calculate expiry timestamp (current time + 15 minutes)
 * 3. Check if user already has a pending verification token
 * 4. Delete old token if exists (prevents token accumulation)
 * 5. Create new token record in database
 *
 * **Business Logic:**
 * - **Token Rotation:** Only one active token per email (prevents abuse)
 * - **Time-Limited:** 15-minute expiry window (security vs UX balance)
 * - **Idempotent:** Safe to call multiple times (e.g., "resend email" feature)
 *
 * **Side Effects:**
 * - **Database Write:** Deletes old `VerificationRequest` if exists
 * - **Database Write:** Creates new `VerificationRequest` record
 *
 * @param {string} email - User email address to generate token for
 * @returns {Promise<VerificationRequest>} Token object with identifier, token, and expiry
 *
 * @example
 * const token = await generateVerificationTokenByEmail('user@example.com');
 * // token.token = 'a1b2c3d4-...' (UUID v4)
 * // token.expires = Date (15 minutes from now)
 */
export const generateVerificationTokenByEmail = async (email: string) => {
  // Step 1: Generate cryptographically secure random token (UUID v4)
  const token = uuidv4();

  // Step 2: Set expiry to 15 minutes from now (security measure)
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  // Step 3: Check for existing token (implements token rotation)
  const existingToken = await getVerificationTokenByEmail(email);

  // Step 4: Delete old token to prevent accumulation (only 1 active token per email)
  if (existingToken) {
    await prisma.verificationRequest.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // Step 5: Persist new token to database
  const verificationToken = await prisma.verificationRequest.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
};

/**
 * @description **[AUTH FLOW - EMAIL VERIFICATION]** Validates verification token
 * from email link and marks user's email as verified. This is the final step in
 * the registration flow that unlocks login capability.
 *
 * **Data Flow:**
 * 1. Fetch token record from database by token string
 * 2. Validate token exists and has not expired (15-min window)
 * 3. Fetch user associated with token's email identifier
 * 4. Update user record: set `emailVerified` to current timestamp
 * 5. Delete used token (one-time use, prevents replay attacks)
 *
 * **Business Logic:**
 * - **One-Time Use:** Token is deleted after successful verification (prevents reuse)
 * - **Time-Limited:** Rejects expired tokens (security measure)
 * - **State Transition:** User moves from "unverified" → "verified" state
 * - **Login Unlock:** After this, user can successfully call `verifyCredentials`
 *
 * **Side Effects:**
 * - **Database Write:** Updates `emailVerified` field in `users` table
 * - **Database Write:** Deletes `VerificationRequest` record (cleanup)
 * - **Session Impact:** User can now create authenticated sessions via NextAuth
 *
 * @param {string} token - UUID v4 token from email verification link
 * @returns {Promise<{ success: string; user: User }>} Success message and updated user object
 * @throws {Error} If token not found, expired, or associated user doesn't exist
 *
 * @example
 * // User clicks link: /verify-request?token=a1b2c3d4-...
 * const result = await verificationRequest('a1b2c3d4-...');
 * // User can now login with credentials
 */
export const verificationRequest = async (token: string) => {
  // Step 1: Fetch token record from database
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    throw new Error('Verification token not found');
  }

  // Step 2: Validate token has not expired (15-minute window)
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    throw new Error('Verification token has expired');
  }

  // Step 3: Fetch user associated with this token
  const user = await getUserByEmail(existingToken.identifier);

  if (!user) {
    throw new Error('User not found');
  }

  // Step 4: Mark email as verified (state transition: unverified → verified)
  // This unlocks login capability in verifyCredentials()
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerified: new Date(), // ← Critical: Enables login
      email: user.email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
    },
  });

  // Step 5: Delete token (one-time use, prevents replay attacks)
  await prisma.verificationRequest.delete({
    where: {
      id: existingToken.id,
    },
  });

  return { success: 'Email verified successfully', user: updatedUser };
};

export const resendVerificationEmail = async (email: string) => {
  const verificationToken = await generateVerificationTokenByEmail(email);

  await sendVerificationEmail(
    verificationToken.identifier,
    verificationToken.token
  );

  return { success: 'Verification email resent successfully' };
};
